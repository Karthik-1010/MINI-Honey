from django.db import models
from django.core.validators import MinValueValidator

class Category(models.Model):
    """
    Categories for menu items (e.g., Maggi, Drinks, Desserts).
    """
    name = models.CharField(max_length=100)
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    """
    Individual items available in the menu.
    """
    ITEM_TYPES = [
        ('veg', 'Veg'),
        ('nonveg', 'Non-Veg'),
    ]
    
    category = models.ForeignKey(Category, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.01)])
    image_url = models.URLField(blank=True, max_length=500)
    is_available = models.BooleanField(default=True)
    item_type = models.CharField(max_length=10, choices=ITEM_TYPES, default='veg')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return self.name

class Order(models.Model):
    """
    Customer orders containing multiple items.
    """
    STATUS_CHOICES = [
        ('PENDING', 'Pending'),
        ('PREPARING', 'Preparing'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]
    
    customer_name = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_group_order = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - {self.customer_name}"

class OrderItem(models.Model):
    """
    Items within a specific order.
    """
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])
    assigned_to = models.CharField(max_length=100, blank=True, help_text="For group orders")

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name} (Order #{self.order.id})"

class InventoryItem(models.Model):
    """
    Back-end supplies and ingredients.
    """
    name = models.CharField(max_length=200)
    stock_level = models.IntegerField(default=0)
    unit = models.CharField(max_length=50, default='pcs')
    note = models.TextField(blank=True, null=True)
    min_threshold = models.IntegerField(default=10)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name

class StockItem(models.Model):
    """
    Front-end ready items/products.
    """
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0.00)])
    quantity = models.IntegerField(default=0)
    
    @property
    def status(self):
        return "In Stock" if self.quantity > 0 else "Out of Stock"

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


