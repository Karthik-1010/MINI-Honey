import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mini.settings')
django.setup()

from myapp.models import Category, MenuItem

data = [
    ("MAGGI", "Veg Maggi", "Wet", 49),
    ("MAGGI", "Veg Maggi", "Fried", 59),
    ("MAGGI", "Paneer Maggi", "Wet", 79),
    ("MAGGI", "Paneer Maggi", "Fried", 89),
    ("MAGGI", "Egg Maggi", "Wet", 59),
    ("MAGGI", "Egg Maggi", "Fried", 69),
    ("MAGGI", "Double Egg Maggi", "Wet", 69),
    ("MAGGI", "Double Egg Maggi", "Fried", 79),
    ("MAGGI", "Chicken Maggi", "Wet", 79),
    ("MAGGI", "Chicken Maggi", "Fried", 89),
    ("MAGGI", "Double Chicken Maggi", "Wet", 99),
    ("MAGGI", "Double Chicken Maggi", "Fried", 109),

    ("SNACKS", "Veg Fried Momos", "-", 79),
    ("SNACKS", "Paneer Fried Momos", "-", 89),
    ("SNACKS", "Chicken Fried Momos", "-", 89),
    ("SNACKS", "Salted French Fries", "-", 69),
    ("SNACKS", "Peri Peri Fries", "-", 79),
    ("SNACKS", "Veg Fingers", "-", 79),
    ("SNACKS", "Chicken Nuggets", "-", 79),
    ("SNACKS", "Crispy Chicken Popcorn", "-", 99),
    ("SNACKS", "Chicken Fingers", "-", 99),
    ("SNACKS", "Bread Omlet", "-", 59),
    ("SNACKS", "Omlet (Double Egg)", "-", 49),

    ("ROLLS", "Paneer Roll", "-", 99),
    ("ROLLS", "Egg Roll", "-", 89),
    ("ROLLS", "Double Egg Roll", "-", 99),
    ("ROLLS", "Chicken Roll", "-", 99),
    ("ROLLS", "Double Egg Chicken Roll", "-", 109),

    ("SANDWICHES", "Grill Veg Sandwich", "-", 79),
    ("SANDWICHES", "Grill Pickled Paneer Sandwich", "-", 99),
    ("SANDWICHES", "Grill Corn Cheese Sandwich", "-", 89),
    ("SANDWICHES", "Grill Chicken Sandwich", "-", 99),
    ("SANDWICHES", "Grill Tikka Chicken Sandwich", "-", 109),

    ("DESSERTS", "Apricot Delight", "-", 99),
    ("DESSERTS", "Arabian Pudding", "-", 99),
    ("DESSERTS", "Coconut Jelly", "-", 99),
    ("DESSERTS", "Choco Delight", "-", 99),
    ("DESSERTS", "Brownie with Ice Cream", "-", 99),
    ("DESSERTS", "Mango Malai (S)", "-", 119),
    ("DESSERTS", "Seethaphal Malai (S)", "-", 65),

    ("FRESH JUICES", "Banana", "-", 49),
    ("FRESH JUICES", "Mosambi", "-", 49),
    ("FRESH JUICES", "Papaya", "-", 59),
    ("FRESH JUICES", "Muskmelon", "-", 59),
    ("FRESH JUICES", "Watermelon", "-", 49),
    ("FRESH JUICES", "Mango", "-", 79),

    ("COLD COFFEE", "Classic Cold Coffee", "-", 109),
    ("COLD COFFEE", "Dark Cold Coffee", "-", 129),

    ("LASSI", "Classic Sweet Lassi", "-", 69),
    ("LASSI", "Dry Fruit Lassi", "-", 89),
    ("LASSI", "Mango Lassi", "-", 79),

    ("THICK SHAKES", "KitKat Thick Shake", "-", 149),
    ("THICK SHAKES", "Oreo Thick Shake", "-", 139),
    ("THICK SHAKES", "Brownie Thick Shake", "-", 139),
    ("THICK SHAKES", "Nuts Over Loaded", "-", 179),

    ("MILK SHAKES", "Mango Shake (S)", "-", 109),
    ("MILK SHAKES", "Banana Shake", "-", 89),
    ("MILK SHAKES", "Oreo Shake", "-", 99),
    ("MILK SHAKES", "KitKat Shake", "-", 99),
    ("MILK SHAKES", "Vanilla Shake", "-", 79),
    ("MILK SHAKES", "Chocolate Shake", "-", 99),
    ("MILK SHAKES", "Strawberry Shake", "-", 89),
    ("MILK SHAKES", "Butterscotch Shake", "-", 99),
    ("MILK SHAKES", "Black Current Shake", "-", 99),
    ("MILK SHAKES", "Kaju Banana Shake", "-", 100),

    ("BOBA BLISS", "Chocolate Boba Shake", "-", 119),
    ("BOBA BLISS", "KitKat Boba Shake", "-", 119),
    ("BOBA BLISS", "Oreo Boba Shake", "-", 119),

    ("MOJITOS", "Virgin Mojito", "-", 79),
    ("MOJITOS", "Blue Curacao", "-", 79),
    ("MOJITOS", "Green Apple", "-", 79),
]

def seed():
    MenuItem.objects.all().delete()
    Category.objects.all().delete()
    
    for cat_name, item_name, item_type, price in data:
        cat, created = Category.objects.get_or_create(name=cat_name)
        
        desc = ""
        if item_type != "-":
            desc = item_type
            
        MenuItem.objects.create(
            category=cat,
            name=item_name,
            description=desc,
            price=price,
            is_available=True,
            item_type='veg' if 'Chicken' not in item_name and 'Egg' not in item_name else 'nonveg'
        )
    print("Seeded successfully!")

if __name__ == '__main__':
    seed()
