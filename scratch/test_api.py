import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_order_creation():
    # 1. Create a category
    cat_res = requests.post(f"{BASE_URL}/categories/", json={"name": "Test Category"})
    cat_id = cat_res.json()['id']
    print(f"Created category: {cat_id}")

    # 2. Create a menu item
    item_res = requests.post(f"{BASE_URL}/menu-items/", json={
        "name": "Test Burger",
        "price": "100.00",
        "category": cat_id,
        "item_type": "veg"
    })
    item_id = item_res.json()['id']
    print(f"Created menu item: {item_id}")

    # 3. Create an order with items
    order_data = {
        "customer_name": "Test Customer",
        "items": [
            {"menu_item": item_id, "quantity": 2}
        ]
    }
    order_res = requests.post(f"{BASE_URL}/orders/", json=order_data)
    order_json = order_res.json()
    print(f"Created order: {json.dumps(order_json, indent=2)}")
    
    # Check if total_amount is calculated (should be 200)
    total = order_json.get('total_amount')
    print(f"Total Amount: {total}")
    if float(total) == 200.0:
        print("SUCCESS: Total amount calculated correctly.")
    else:
        print("FAILURE: Total amount calculation incorrect.")

if __name__ == "__main__":
    try:
        test_order_creation()
    except Exception as e:
        print(f"Error: {e}")
