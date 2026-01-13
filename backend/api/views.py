from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from .models import Item, RepairTicket, DamagedItem, Sale, RepairPart
from .serializers import ItemSerializer, RepairTicketSerializer, DamagedItemSerializer, SaleSerializer, RepairPartSerializer
from django.db.models import Sum, F
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from decimal import Decimal
from datetime import date
from rest_framework.filters import OrderingFilter

# ==========================================
# 1. INVENTORY VIEWS
# ==========================================
class ItemListCreate(ListCreateAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    filter_backends = [OrderingFilter] 
    ordering_fields = ['created_at', 'price', 'stock', 'name'] 

class ItemDetail(RetrieveUpdateDestroyAPIView): 
    queryset = Item.objects.all()
    serializer_class = ItemSerializer

# ==========================================
# 2. REPAIR VIEWS
# ==========================================
class RepairListCreate(ListCreateAPIView):
    queryset = RepairTicket.objects.all().order_by('-created_at')
    serializer_class = RepairTicketSerializer

class RepairDetail(RetrieveUpdateDestroyAPIView):
    queryset = RepairTicket.objects.all()
    serializer_class = RepairTicketSerializer

    def perform_update(self, serializer):
        instance = self.get_object()
        old_status = instance.status
        new_status = serializer.validated_data.get('status', old_status)

        # Save the ticket update first
        ticket = serializer.save()

        # Logic: If Status changes to 'Done', deduct the used parts from stock
        if old_status != 'Done' and new_status == 'Done':
            parts = ticket.parts.all()
            for part in parts:
                item = part.item
                if item.stock >= part.quantity:
                    item.stock -= part.quantity
                    item.save()
                else:
                    # Allow negative stock or handle error if strict mode needed
                    pass 

class AddRepairPart(ListCreateAPIView):
    queryset = RepairPart.objects.all()
    serializer_class = RepairPartSerializer

    def perform_create(self, serializer):
        ticket_id = self.request.data.get('repair_id')
        ticket = RepairTicket.objects.get(id=ticket_id)
        serializer.save(repair=ticket)

# ==========================================
# 3. SALES VIEWS (CRM & Manual Price)
# ==========================================
class SaleListCreate(ListCreateAPIView):
    queryset = Sale.objects.all().order_by('-sale_date')
    serializer_class = SaleSerializer
    filter_backends = [OrderingFilter] 
    ordering_fields = ['sale_date', 'total_price', 'profit']

    def perform_create(self, serializer):
        item = serializer.validated_data['item']
        quantity = serializer.validated_data['quantity']
        
        # --- Capture Frontend Inputs ---
        imei = self.request.data.get('imei_number', '')
        payment = self.request.data.get('payment_method', 'Cash')
        sale_type = self.request.data.get('sale_type', 'Retail')
        input_price = self.request.data.get('unit_price')
        
        # CRM Fields (Customer Info)
        cust_name = self.request.data.get('customer_name', '')
        cust_phone = self.request.data.get('customer_phone', '')

        # --- Validations ---
        if item.stock < quantity:
            raise ValidationError(f"Not enough stock! Only {item.stock} left.")

        # --- Price Logic ---
        # If user typed a custom price, use it. Otherwise use DB price.
        if input_price and float(input_price) > 0:
            unit_price = Decimal(str(input_price))
        else:
            unit_price = item.price

        selling_total = unit_price * quantity
        
        if selling_total <= 0:
             raise ValidationError("Total price cannot be zero.")

        # --- Profit Calculation ---
        cost_total = item.cost_price * quantity
        sale_profit = selling_total - cost_total

        # --- Stock Deduction ---
        item.stock -= quantity
        item.save()

        # --- Save Everything ---
        serializer.save(
            total_price=selling_total, 
            profit=sale_profit, 
            imei_number=imei, 
            payment_method=payment,
            unit_price=unit_price,
            sale_type=sale_type,
            customer_name=cust_name,   # Save Name
            customer_phone=cust_phone  # Save Phone
        )

class SaleDetail(RetrieveUpdateDestroyAPIView):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer
    
    def perform_destroy(self, instance):
        # Restore stock if sale is deleted
        item = instance.item
        item.stock += instance.quantity
        item.save()
        instance.delete()

# ==========================================
# 4. DASHBOARD ANALYTICS (Charts & Profit)
# ==========================================
class DashboardStats(APIView):
    def get(self, request):
        # 1. Financials (Scalar Data)
        total_sales = Sale.objects.aggregate(t=Sum('total_price'))['t'] or 0
        
        # Calculate Total Inventory Asset Value (Price * Stock for every item)
        inventory_value = Item.objects.aggregate(t=Sum(F('price') * F('stock')))['t'] or 0
        
        # Net Profit (Sum of all individual sale profits)
        net_profit = Sale.objects.aggregate(t=Sum('profit'))['t'] or 0

        # 2. Operational Stats
        # Active Repairs (Everything except 'Done' or 'Delivered')
        active_repairs = RepairTicket.objects.exclude(status__in=['Done', 'Delivered']).count()
        
        # 3. Low Stock (Threshold <= 2)
        low_stock_queryset = Item.objects.filter(stock__lte=2)
        low_stock_count = low_stock_queryset.count()
        low_stock_data = ItemSerializer(low_stock_queryset, many=True).data

        # 4. Chart Data: Top 5 Items by Revenue
        sales_chart = Sale.objects.values('item__name').annotate(value=Sum('total_price')).order_by('-value')[:5]

        # 5. Recent Activity: Last 5 Repairs
        recent_repairs = RepairTicket.objects.order_by('-created_at')[:5]
        recent_serializer = RepairTicketSerializer(recent_repairs, many=True)

        return Response({
            "total_sales": total_sales,
            "inventory_value": inventory_value,
            "net_profit": net_profit,
            "active_repairs": active_repairs,
            "low_stock_count": low_stock_count,
            "low_stock_items": low_stock_data,
            "chart_data": sales_chart,
            "recent_repairs": recent_serializer.data
        })

# ==========================================
# 5. RETURN / DAMAGED VIEWS
# ==========================================
class DamagedItemListCreate(ListCreateAPIView):
    queryset = DamagedItem.objects.all()
    serializer_class = DamagedItemSerializer
    
    def perform_create(self, serializer):
        entry = serializer.save()
        item = entry.item
        # Deduct from healthy stock when reported as damaged
        if item.stock >= entry.quantity:
            item.stock -= entry.quantity
            item.save()