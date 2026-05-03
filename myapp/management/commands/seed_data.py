from django.core.management.base import BaseCommand
from myapp.models import Category, MenuItem, InventoryItem
import decimal

class Command(BaseCommand):
    help = 'Seeds initial data for MINI Honey'

    def handle(self, *args, **options):
        # 1. Create Categories
        mains, _ = Category.objects.get_or_create(name='Mains')
        sides, _ = Category.objects.get_or_create(name='Sides')
        drinks, _ = Category.objects.get_or_create(name='Drinks')
        desserts, _ = Category.objects.get_or_create(name='Desserts')

        # 2. Create Menu Items
        menu_items = [
            {'category': mains, 'name': 'Honey Glazed Avocado', 'price': 12.50, 'description': 'Smashed organic avocado, chili flakes, and local wildflower honey.'},
            {'category': mains, 'name': 'Seared Honey Salmon', 'price': 24.00, 'description': 'Wild-caught salmon with a caramelized honey glaze and greens.'},
            {'category': sides, 'name': 'Pomegranate Bowl', 'price': 8.50, 'description': 'Fresh seasonal pomegranate seeds with goat cheese and nuts.'},
            {'category': desserts, 'name': 'Honey Dust Donut', 'price': 4.50, 'description': 'Hand-made brioche donut with pure honey glaze and silver leaf.'},
            {'category': mains, 'name': 'Honey Garlic Chicken', 'price': 18.00, 'description': 'Crispy chicken tossed in honey garlic sauce.'},
            {'category': drinks, 'name': 'Honey Lemonade', 'price': 5.00, 'description': 'Freshly squeezed lemons with a touch of organic honey.'},
        ]

        for item in menu_items:
            MenuItem.objects.get_or_create(
                name=item['name'],
                defaults={
                    'category': item['category'],
                    'price': decimal.Decimal(item['price']),
                    'description': item['description']
                }
            )

        # 3. Create Inventory Items
        inventory = [
            {'name': 'Honey', 'stock_level': 50, 'unit': 'liters'},
            {'name': 'Avocado', 'stock_level': 30, 'unit': 'pcs'},
            {'name': 'Salmon', 'stock_level': 15, 'unit': 'kg'},
            {'name': 'Pomegranate', 'stock_level': 20, 'unit': 'pcs'},
            {'name': 'Donuts', 'stock_level': 40, 'unit': 'pcs'},
        ]

        for item in inventory:
            InventoryItem.objects.get_or_create(
                name=item['name'],
                defaults={
                    'stock_level': item['stock_level'],
                    'unit': item['unit']
                }
            )

        self.stdout.write(self.style.SUCCESS('Successfully seeded MINI Honey data'))
