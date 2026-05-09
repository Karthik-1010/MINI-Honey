from django.contrib import admin
from .models import Category, MenuItem, Order, OrderItem, InventoryItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'is_available', 'item_type')
    list_filter = ('category', 'is_available', 'item_type')
    search_fields = ('name', 'description')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'status', 'total_amount', 'is_group_order', 'created_at')
    list_filter = ('status', 'is_group_order', 'created_at')
    search_fields = ('customer_name',)
    inlines = [OrderItemInline]

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'stock_level', 'unit', 'min_threshold', 'last_updated')
    list_filter = ('unit',)
    search_fields = ('name', 'note')
