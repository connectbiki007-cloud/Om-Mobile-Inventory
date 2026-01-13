from django.db import models

# --- 1. ITEM MODEL ---
class Item(models.Model):
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100) 
    stock = models.PositiveIntegerField()
    
    # Buying Price (Your Cost - used for profit calculation)
    cost_price = models.DecimalField(max_digits=10, decimal_places=2, default=0) 
    
    # Standard Selling Price (Can be overridden during sale)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# --- 2. REPAIR TICKET ---
class RepairTicket(models.Model):
    # New Feature: Customer ID
    customer_id = models.CharField(max_length=50, blank=True, null=True) 
    customer_name = models.CharField(max_length=100)
    device_model = models.CharField(max_length=100)
    issue_description = models.TextField()
    
    status = models.CharField(max_length=20, default='Received', choices=[
        ('Received', 'Received'), 
        ('In Progress', 'In Progress'), 
        ('Done', 'Done'), 
        ('Delivered', 'Delivered')
    ])
    
    estimated_cost = models.DecimalField(max_digits=10, decimal_places=2)
    
    payment_method = models.CharField(max_length=20, default='Cash', choices=[
        ('Cash', 'Cash'), 
        ('Fonepay', 'Fonepay'), 
        ('Bank', 'Bank Transfer'), 
        ('Credit', 'Credit')
    ])
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Repair: {self.customer_name} ({self.device_model})"

# --- 3. NEW: REPAIR PARTS (For Stock Deduction) ---
class RepairPart(models.Model):
    repair = models.ForeignKey(RepairTicket, related_name='parts', on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.item.name} used for {self.repair.customer_name}"

# --- 4. DAMAGED ITEMS (Returns) ---
class DamagedItem(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    reason = models.TextField()
    reported_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.quantity} x {self.item.name} (Damaged)"

# --- 5. SALES RECORD ---
class Sale(models.Model):
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    
    # Total Price (Unit Price * Quantity)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, blank=True)
    
    # NEW: The actual price per unit this item was sold at (Retail or Wholesale input)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # NEW: Type of Sale
    sale_type = models.CharField(max_length=20, default='Retail') # Retail or Wholesale
    # --- NEW FIELDS FOR CRM ---
    customer_name = models.CharField(max_length=100, blank=True, null=True)
    customer_phone = models.CharField(max_length=20, blank=True, null=True)

    payment_method = models.CharField(max_length=20, default='Cash', choices=[
        ('Cash', 'Cash'), ('Fonepay', 'Fonepay'), ('Bank', 'Bank Transfer'), ('Credit', 'Credit')
    ])
    
    imei_number = models.CharField(max_length=50, blank=True, null=True)
    profit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sale_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Sold {self.quantity} x {self.item.name}"