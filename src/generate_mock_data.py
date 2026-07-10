import os
import csv
import random
from datetime import datetime, timedelta
import sys

# Ensure parent directory is in path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.config import (
    RAW_DATA_DIR,
    RAW_SALES_PATH,
    RAW_SCHEDULED_MENU_PATH,
    RAW_FOOD_ITEMS_PATH,
    DAY_NAMES_MAP
)
from src.utils import ensure_dir

def generate_mock_data(num_days=60):
    """
    Generate mock sales data for testing the AI pipeline.
    
    Improvements over v1:
    - 10 items (up from 5) to expose cross-item groupby edge cases
    - Realistic demand patterns: spikes, seasonal dips, and zero-sales days
    - Category-aware demand simulation: drinks sell differently from food
    - Consistent random seed for reproducibility
    """
    print("Initializing mock data generation...")
    ensure_dir(RAW_DATA_DIR)

    # 1. Generate Food Items Catalog — 10 items across 4 categories
    food_items = [
        {"item_id": "food_01", "item_name": "Phở Bò",        "category_id": "cat_noodles", "category_name": "Noodles"},
        {"item_id": "food_02", "item_name": "Cơm Sườn",       "category_id": "cat_rice",    "category_name": "Rice"},
        {"item_id": "food_03", "item_name": "Bánh Mì Thịt",   "category_id": "cat_bread",   "category_name": "Bread"},
        {"item_id": "food_04", "item_name": "Trà Sữa Thái",   "category_id": "cat_drinks",  "category_name": "Drinks"},
        {"item_id": "food_05", "item_name": "Cà Phê Đen",     "category_id": "cat_drinks",  "category_name": "Drinks"},
        {"item_id": "food_06", "item_name": "Bún Bò Huế",     "category_id": "cat_noodles", "category_name": "Noodles"},
        {"item_id": "food_07", "item_name": "Cơm Gà",         "category_id": "cat_rice",    "category_name": "Rice"},
        {"item_id": "food_08", "item_name": "Bánh Mì Trứng",  "category_id": "cat_bread",   "category_name": "Bread"},
        {"item_id": "food_09", "item_name": "Sinh Tố Bơ",     "category_id": "cat_drinks",  "category_name": "Drinks"},
        {"item_id": "food_10", "item_name": "Cơm Chiên",      "category_id": "cat_rice",    "category_name": "Rice"},
    ]

    with open(RAW_FOOD_ITEMS_PATH, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["item_id", "item_name", "category_id", "category_name"])
        writer.writeheader()
        writer.writerows(food_items)
    print(f"Created food item catalog: {RAW_FOOD_ITEMS_PATH} ({len(food_items)} items)")

    # 2. Generate Scheduled Menu — varied weekly schedule covering all items
    schedule = {
        "Monday":    ["food_01", "food_02", "food_05", "food_06", "food_09"],
        "Tuesday":   ["food_01", "food_03", "food_04", "food_05", "food_07"],
        "Wednesday": ["food_02", "food_03", "food_05", "food_08", "food_10"],
        "Thursday":  ["food_01", "food_02", "food_04", "food_06", "food_09"],
        "Friday":    ["food_01", "food_02", "food_03", "food_05", "food_07", "food_10"],
        "Saturday":  ["food_03", "food_04", "food_08", "food_09"],
        "Sunday":    ["food_05", "food_09"],
    }

    scheduled_menu_rows = []
    for day, items in schedule.items():
        for item_id in items:
            scheduled_menu_rows.append({"day_of_week": day, "item_id": item_id})

    with open(RAW_SCHEDULED_MENU_PATH, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["day_of_week", "item_id"])
        writer.writeheader()
        writer.writerows(scheduled_menu_rows)
    print(f"Created weekly scheduled menu: {RAW_SCHEDULED_MENU_PATH}")

    # 3. Generate Transactional Sales — with realistic edge cases
    start_date = datetime.now() - timedelta(days=num_days)
    prices = {
        "food_01": 35000.0, "food_02": 30000.0, "food_03": 20000.0,
        "food_04": 25000.0, "food_05": 15000.0, "food_06": 38000.0,
        "food_07": 32000.0, "food_08": 18000.0, "food_09": 28000.0,
        "food_10": 27000.0,
    }

    # Category-specific demand modifier — drinks sell more units but lower price
    category_multiplier = {
        "cat_noodles": 1.0,
        "cat_rice":    1.2,
        "cat_bread":   0.9,
        "cat_drinks":  1.5,  # High-volume, low-ticket
    }

    # Build item → category lookup for multiplier
    item_category = {f["item_id"]: f["category_id"] for f in food_items}

    random.seed(42)  # For reproducibility
    transaction_id_counter = 1
    sales_rows = []

    for d in range(num_days):
        current_date = start_date + timedelta(days=d)
        day_of_week_name = DAY_NAMES_MAP[current_date.weekday()]
        is_wknd = current_date.weekday() >= 5

        # Edge case: simulate 2 random "slow days" per month (eg. rainy, holiday)
        # This tests that the pipeline handles zero-sale and near-zero days correctly
        is_slow_day = random.random() < 0.07  # ~7% of days

        scheduled_items = schedule[day_of_week_name]
        all_items = [f["item_id"] for f in food_items]

        for item_id in all_items:
            is_sched = item_id in scheduled_items
            cat_id = item_category[item_id]
            multiplier = category_multiplier[cat_id]

            if is_slow_day:
                # On slow days, all sales are reduced significantly
                base_qty = int(5 * multiplier) if is_sched else 0
            elif is_sched:
                # Weekday scheduled items get higher traffic
                base_qty = int((15 if not is_wknd else 6) * multiplier)
            else:
                # Edge case: ~8% chance of small off-schedule sales (special requests, leftover stock)
                base_qty = int(2 * multiplier) if random.random() < 0.08 else 0

            if base_qty == 0:
                continue

            # Add random variation to total daily quantity (normal distribution around base)
            daily_qty = int(max(0, random.normalvariate(base_qty, base_qty * 0.25)))
            if daily_qty == 0:
                continue

            # Distribute daily quantity into individual transactions
            remaining_qty = daily_qty
            while remaining_qty > 0:
                txn_qty = random.randint(1, min(remaining_qty, 3))
                remaining_qty -= txn_qty

                hour = random.randint(8, 19)
                minute = random.randint(0, 59)
                second = random.randint(0, 59)
                timestamp = current_date.replace(hour=hour, minute=minute, second=second)

                sales_rows.append({
                    "transaction_id": f"TX_{transaction_id_counter:06d}",
                    "timestamp": timestamp.strftime("%Y-%m-%d %H:%M:%S"),
                    "item_id": item_id,
                    "quantity": txn_qty,
                    "unit_price": prices[item_id]
                })
                transaction_id_counter += 1

    # Shuffle sales to represent natural order of transactions
    random.shuffle(sales_rows)

    with open(RAW_SALES_PATH, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["transaction_id", "timestamp", "item_id", "quantity", "unit_price"])
        writer.writeheader()
        writer.writerows(sales_rows)
    print(f"Created transactional sales history: {RAW_SALES_PATH} ({len(sales_rows)} transactions)")

if __name__ == "__main__":
    generate_mock_data()
