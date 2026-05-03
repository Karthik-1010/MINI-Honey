import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mini.settings')
django.setup()

from myapp.models import Category, MenuItem

def seed():
    # Clear existing data
    MenuItem.objects.all().delete()
    Category.objects.all().delete()
    
    # Create Categories
    maggi, _ = Category.objects.get_or_create(name='MAGGI')
    drinks, _ = Category.objects.get_or_create(name='DRINKS')
    desserts, _ = Category.objects.get_or_create(name='DESSERTS')
    
    # Create Menu Items
    items = [
        {
            'name': 'Veg Maggi',
            'description': 'Classic veg maggi with honey touch',
            'price': 49.00,
            'category': maggi,
            'is_available': True,
            'item_type': 'veg'
        },
        {
            'name': 'Chicken Maggi',
            'description': 'Double chicken maggi',
            'price': 79.00,
            'category': maggi,
            'is_available': True,
            'item_type': 'nonveg'
        },
        {
            'name': 'Honey Lemon Tea',
            'description': 'Refreshing tea with honey',
            'price': 35.00,
            'category': drinks,
            'is_available': True,
            'item_type': 'veg'
        },
        {
            'name': 'Apricot Delight',
            'description': 'Rich cream & dried apricot',
            'price': 180.00,
            'category': desserts,
            'is_available': True,
            'item_type': 'veg'
        },
        {
            'name': 'Coconut Jelly',
            'description': 'Refreshing tropical treat',
            'price': 140.00,
            'category': desserts,
            'is_available': True,
            'item_type': 'veg'
        }
    ]
    
    for item_data in items:
        MenuItem.objects.create(**item_data)

    print("Correct MINI Honey data seeded successfully!")

if __name__ == '__main__':
    seed()
