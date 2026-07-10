import os

# Base Directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_DIR = os.path.join(DATA_DIR, "raw")
PROCESSED_DATA_DIR = os.path.join(DATA_DIR, "processed")

# Raw Dataset Paths
RAW_SALES_PATH = os.path.join(RAW_DATA_DIR, "sales.csv")
RAW_SCHEDULED_MENU_PATH = os.path.join(RAW_DATA_DIR, "scheduled_menu.csv")
RAW_FOOD_ITEMS_PATH = os.path.join(RAW_DATA_DIR, "food_items.csv")

# Processed Feature Output Path
PROCESSED_FEATURES_PATH = os.path.join(PROCESSED_DATA_DIR, "features.csv")

# Time-Series Engineering Parameters
LAGS = [1, 2, 7]
ROLLING_WINDOWS = [3, 7]

# Calendar Configuration
DAY_NAMES_MAP = {
    0: "Monday",
    1: "Tuesday",
    2: "Wednesday",
    3: "Thursday",
    4: "Friday",
    5: "Saturday",
    6: "Sunday"
}

# Features List for output verification
EXPECTED_FEATURES = [
    "date",
    "item_id",
    "quantity_sold",
    "day_of_week",
    "month",
    "is_weekend",
    "category_id",
    "is_scheduled",
    "scheduled_item_count",
    "item_scheduled_freq",
    "quantity_lag_1",
    "quantity_lag_2",
    "quantity_lag_7",
    "quantity_roll_mean_3",
    "quantity_roll_mean_7",
    "quantity_roll_std_7"
]
