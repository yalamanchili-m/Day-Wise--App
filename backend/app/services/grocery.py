from collections import defaultdict

def generate_grocery_list(month_data: list):
    """
    Takes the month_data JSON and aggregates all ingredients.
    """
    grocery_map = defaultdict(lambda: {"amount": 0.0, "unit": "", "aisle": "Unknown", "name": ""})

    for day in month_data:
        for item in day.get("ingredients", []):
            name = str(item.get("name", "")).strip()
            if not name:
                continue

            unit = str(item.get("unit", "")).strip()
            key = f"{name.lower()}::{unit.lower()}"
            grocery_map[key]["name"] = name
            grocery_map[key]["amount"] += float(item.get("amount", 0) or 0)
            grocery_map[key]["unit"] = unit
            grocery_map[key]["aisle"] = item.get("aisle") or "Unknown"

    return sorted(grocery_map.values(), key=lambda item: (item["aisle"], item["name"].lower()))
