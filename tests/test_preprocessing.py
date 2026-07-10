import pytest
import pandas as pd
import numpy as np
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.data_preprocessing import PreprocessingPipeline
from src.config import EXPECTED_FEATURES

@pytest.fixture
def mock_pipeline():
    return PreprocessingPipeline("dummy_sales", "dummy_menu", "dummy_items", "dummy_out")

def test_aggregate_sales(mock_pipeline):
    df_sales = pd.DataFrame({
        'timestamp': ['2026-06-20 12:00:00', '2026-06-20 13:00:00', '2026-06-21 08:00:00'],
        'item_id': ['food_01', 'food_01', 'food_02'],
        'quantity': [2, 3, 1]
    })
    
    df_daily = mock_pipeline.aggregate_sales(df_sales)
    
    assert len(df_daily) == 2
    # Verify aggregation
    agg_food_01 = df_daily[df_daily['item_id'] == 'food_01']['quantity_sold'].values[0]
    assert agg_food_01 == 5

def test_generate_complete_grid_zero_filling(mock_pipeline):
    df_daily = pd.DataFrame({
        'date': [pd.to_datetime('2026-06-20').date(), pd.to_datetime('2026-06-22').date()],
        'item_id': ['food_01', 'food_02'],
        'quantity_sold': [5, 10]
    })
    
    df_items = pd.DataFrame({
        'item_id': ['food_01', 'food_02']
    })
    
    df_grid = mock_pipeline.generate_complete_grid(df_daily, df_items)
    
    # 3 days (20th to 22nd) * 2 items = 6 combinations
    assert len(df_grid) == 6
    # 20th food_02 should be 0
    missing_entry = df_grid[(df_grid['date'] == pd.to_datetime('2026-06-20').date()) & (df_grid['item_id'] == 'food_02')]['quantity_sold'].values[0]
    assert missing_entry == 0.0

def test_engineer_time_series_features_strict_dropna(mock_pipeline):
    df = pd.DataFrame({
        'date': pd.date_range(start='2026-06-01', periods=10, freq='D').date,
        'item_id': ['food_01'] * 10,
        'quantity_sold': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    })
    
    # Add calendar and schedule columns to avoid KeyError
    for col in EXPECTED_FEATURES:
        if col not in df.columns:
            df[col] = 1 # dummy values
            
    df_ts = mock_pipeline.engineer_time_series_features(df)
    df_clean = mock_pipeline.enforce_schema_and_clean(df_ts)
    
    # The max rolling window is 7, and max lag is 7. 
    # Therefore, the first 7 days (index 0 to 6) cannot produce valid 7-day lags/rolling stats.
    # The first valid day should be index 7 (the 8th day).
    # Since we have 10 days, 10 - 7 = 3 valid days left.
    assert len(df_clean) == 3
    
    # Verify rolling mean avoids data leakage. 
    # For index 7 (day 8), previous 3 days are index 4, 5, 6 (qty: 50, 60, 70).
    # Mean of 50, 60, 70 is 60.
    assert df_clean.iloc[0]['quantity_roll_mean_3'] == 60.0


def test_rolling_features_are_independent_per_item(mock_pipeline):
    """
    Critical regression test: verify rolling/lag features are calculated
    per-group (per item_id) and do NOT bleed across different items.

    With the old buggy code (shift before transform), item boundaries were
    ignored and quantities from food_01 could leak into food_02's lag features.
    This test catches that exact regression.
    
    Setup: food_01 has qty [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
           food_02 has qty [1,  1,  1,  1,  1,  1,  1,  1,  1,  1]
    
    After processing, food_02's lag_1 should always be 1.0.
    If item boundaries were not respected, lag_1 for the first row of food_02
    would incorrectly pick up the last value of food_01's block = 100.
    """
    n_days = 10
    dates = pd.date_range(start='2026-06-01', periods=n_days, freq='D').date
    
    # Two items interleaved: when sorted by [item_id, date] this will be
    # [food_01 * 10 rows, then food_02 * 10 rows]
    df = pd.DataFrame({
        'date': list(dates) * 2,
        'item_id': ['food_01'] * n_days + ['food_02'] * n_days,
        'quantity_sold': list(range(10, 110, 10)) + [1] * n_days  # food_01: 10-100, food_02: all 1s
    })
    
    # Add required columns
    for col in EXPECTED_FEATURES:
        if col not in df.columns:
            df[col] = 1
            
    df_ts = mock_pipeline.engineer_time_series_features(df)
    
    # Filter to food_02 rows with valid lag_1 (non-NaN)
    food_02_rows = df_ts[df_ts['item_id'] == 'food_02'].dropna(subset=['quantity_lag_1'])
    
    # Every lag_1 for food_02 must be 1.0 (its own previous value),
    # not 100 (the last value of food_01 if group boundaries were violated)
    for lag_val in food_02_rows['quantity_lag_1'].values:
        assert lag_val == 1.0, (
            f"Cross-item leakage detected! food_02's lag_1 = {lag_val}, expected 1.0. "
            "The rolling feature fix for per-group transform may have regressed."
        )
    
    # Also verify rolling mean for food_02 only contains its own values (1.0)
    food_02_valid = df_ts[df_ts['item_id'] == 'food_02'].dropna(subset=['quantity_roll_mean_3'])
    for mean_val in food_02_valid['quantity_roll_mean_3'].values:
        assert mean_val == 1.0, (
            f"Cross-item leakage in rolling mean! food_02's roll_mean_3 = {mean_val}, expected 1.0."
        )


def test_enforce_schema_drops_quantity_sold_in_inference_mode(mock_pipeline):
    """
    Verify that inference_mode=True explicitly removes quantity_sold from output.
    This prevents the zero-filled target date quantity from being fed as a feature.
    """
    df = pd.DataFrame({
        'date': pd.date_range(start='2026-06-01', periods=10, freq='D').date,
        'item_id': ['food_01'] * 10,
        'quantity_sold': [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
    })
    
    for col in EXPECTED_FEATURES:
        if col not in df.columns:
            df[col] = 1
            
    df_ts = mock_pipeline.engineer_time_series_features(df)
    
    # Training mode: quantity_sold should be present
    df_train = mock_pipeline.enforce_schema_and_clean(df_ts.copy(), inference_mode=False)
    assert 'quantity_sold' in df_train.columns, "quantity_sold must be present in training mode"
    
    # Inference mode: quantity_sold must be dropped
    df_infer = mock_pipeline.enforce_schema_and_clean(df_ts.copy(), inference_mode=True)
    assert 'quantity_sold' not in df_infer.columns, "quantity_sold must be dropped in inference mode"
