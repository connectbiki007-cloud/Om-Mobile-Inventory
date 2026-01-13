from rest_framework import serializers
from .models import Item, RepairTicket, DamagedItem, Sale, RepairPart

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        # Removed 'wholesale_price' as per your request
        fields = ['id', 'name', 'category', 'stock', 'cost_price', 'price', 'created_at']

# --- NEW: Serializer for Repair Parts ---
class RepairPartSerializer(serializers.ModelSerializer):
    item_name = serializers.ReadOnlyField(source='item.name')
    
    class Meta:
        model = RepairPart
        fields = ['id', 'item', 'item_name', 'quantity']

class RepairTicketSerializer(serializers.ModelSerializer):
    # This lets us see the parts used inside the Repair Ticket JSON
    parts = RepairPartSerializer(many=True, read_only=True)

    class Meta:
        model = RepairTicket
        fields = '__all__'

class DamagedItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='item.name', read_only=True)

    class Meta:
        model = DamagedItem
        fields = ['id', 'item', 'item_name', 'quantity', 'reason', 'reported_at']

class SaleSerializer(serializers.ModelSerializer):
    # Read-only fields for display
    item_name = serializers.CharField(source='item.name', read_only=True)
    item_category = serializers.CharField(source='item.category', read_only=True)

    class Meta:
        model = Sale
        fields = [
            'id', 
            'item', 
            'item_name', 
            'item_category', 
            'quantity', 
            'unit_price',   # Now points to the Model field (not read-only)
            'total_price', 
            'sale_type',    # New Field: Retail/Wholesale
            'payment_method', 
            'imei_number', 
            'customer_name', 'customer_phone',
            'profit', 
            'sale_date'
        ]