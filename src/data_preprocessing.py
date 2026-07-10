import pandas as pd
import numpy as np
from datetime import datetime
import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.config import EXPECTED_FEATURES, LAGS, ROLLING_WINDOWS, DAY_NAMES_MAP
from src.utils import setup_logger

logger = setup_logger()

class PreprocessingPipeline:
    def __init__(self, sales_path, scheduled_menu_path, food_items_path, output_path, target_date=None):
        self.sales_path = sales_path
        self.scheduled_menu_path = scheduled_menu_path
        self.food_items_path = food_items_path
        self.output_path = output_path
        self.target_date = target_date
        
    def load_data(self):
        logger.info("Loading raw datasets...")
        df_sales = pd.read_csv(self.sales_path)
        df_schedule = pd.read_csv(self.scheduled_menu_path)
        df_items = pd.read_csv(self.food_items_path)
        return df_sales, df_schedule, df_items

    def aggregate_sales(self, df_sales):
        logger.info("Aggregating sales to daily level...")
        df_sales['timestamp'] = pd.to_datetime(df_sales['timestamp'])
        df_sales['date'] = df_sales['timestamp'].dt.date
        df_daily = df_sales.groupby(['date', 'item_id'])['quantity'].sum().reset_index()
        df_daily.rename(columns={'quantity': 'quantity_sold'}, inplace=True)
        return df_daily

    def generate_complete_grid(self, df_daily, df_items):
        logger.info("Generating complete date-item matrix and zero-filling...")
        if df_daily.empty:
            return df_daily
            
        min_date = df_daily['date'].min()
        max_date = df_daily['date'].max()
        
        if self.target_date:
            target_date_obj = pd.to_datetime(self.target_date).date()
            if target_date_obj > max_date:
                max_date = target_date_obj
                
        all_dates = pd.date_range(start=min_date, end=max_date, freq='D').date
        all_items = df_items['item_id'].unique()
        
        # Create full combinations of dates and items
        grid = pd.MultiIndex.from_product([all_dates, all_items], names=['date', 'item_id'])
        df_grid = pd.DataFrame(index=grid).reset_index()
        
        # Merge with aggregated sales
        df_merged = pd.merge(df_grid, df_daily, on=['date', 'item_id'], how='left')
        df_merged['quantity_sold'] = df_merged['quantity_sold'].fillna(0)
        return df_merged

    def engineer_calendar_features(self, df):
        logger.info("Engineering calendar features...")
        df['date'] = pd.to_datetime(df['date'])
        df['day_of_week'] = df['date'].dt.weekday  # 0=Monday, 6=Sunday
        df['month'] = df['date'].dt.month
        df['is_weekend'] = (df['day_of_week'] >= 5).astype(int)
        return df

    def merge_metadata_and_schedule(self, df, df_items, df_schedule):
        logger.info("Merging food metadata and scheduled menu features...")
        # Merge Category
        df = pd.merge(df, df_items[['item_id', 'category_id']], on='item_id', how='left')
        
        # Scheduled Menu Engineering
        # Calculate competition counts (total items scheduled per day_of_week)
        comp_count = df_schedule.groupby('day_of_week')['item_id'].count().reset_index()
        comp_count.rename(columns={'item_id': 'scheduled_item_count', 'day_of_week': 'day_of_week_comp'}, inplace=True)
        
        # Calculate item frequency (days per week an item is scheduled)
        freq_count = df_schedule.groupby('item_id')['day_of_week'].count().reset_index()
        freq_count.rename(columns={'day_of_week': 'item_scheduled_freq'}, inplace=True)
        
        # Map day_of_week string for merge
        df['day_of_week_name'] = df['day_of_week'].map(DAY_NAMES_MAP)
        
        # Merge scheduled items to check if 'is_scheduled'
        df_schedule['is_scheduled'] = 1
        df = pd.merge(df, df_schedule, left_on=['day_of_week_name', 'item_id'], right_on=['day_of_week', 'item_id'], how='left')
        df['is_scheduled'] = df['is_scheduled'].fillna(0).astype(int)
        
        # Merge comp_count and freq_count
        df = pd.merge(df, comp_count, left_on='day_of_week_name', right_on='day_of_week_comp', how='left')
        df['scheduled_item_count'] = df['scheduled_item_count'].fillna(0).astype(int)
        
        df = pd.merge(df, freq_count, on='item_id', how='left')
        df['item_scheduled_freq'] = df['item_scheduled_freq'].fillna(0).astype(int)
        
        # Drop temporary merge columns
        cols_to_drop = [c for c in df.columns if c in ['day_of_week_name', 'day_of_week_y', 'day_of_week_comp']]
        df.drop(columns=cols_to_drop, inplace=True, errors='ignore')
        
        # Rename back day_of_week_x if it exists
        if 'day_of_week_x' in df.columns:
            df.rename(columns={'day_of_week_x': 'day_of_week'}, inplace=True)
            
        return df

    def engineer_time_series_features(self, df):
        logger.info("Engineering historical lags and rolling averages...")
        df = df.sort_values(by=['item_id', 'date']).reset_index(drop=True)
        
        # Lags — shift per group to avoid cross-item leakage
        for lag in LAGS:
            df[f'quantity_lag_{lag}'] = df.groupby('item_id')['quantity_sold'].transform(lambda x: x.shift(lag))
            
        # Rolling stats — shift(1) inside the per-group transform to avoid target leakage
        for window in ROLLING_WINDOWS:
            df[f'quantity_roll_mean_{window}'] = (
                df.groupby('item_id')['quantity_sold']
                .transform(lambda x: x.shift(1).rolling(window, min_periods=window).mean())
            )
            
        # Rolling std
        df['quantity_roll_std_7'] = (
            df.groupby('item_id')['quantity_sold']
            .transform(lambda x: x.shift(1).rolling(7, min_periods=7).std())
        )
        
        return df

    def enforce_schema_and_clean(self, df, inference_mode=False):
        """
        Enforce schema and clean the dataframe.
        
        Args:
            df: Input dataframe.
            inference_mode: If True, explicitly drop quantity_sold from feature columns
                            to prevent accidental target leakage during prediction.
        """
        logger.info("Enforcing schema and dropping rows with incomplete historical data...")
        # Remove any duplicated columns caused by pandas merges
        df = df.loc[:, ~df.columns.duplicated()]
        
        # Filter strictly to expected features
        missing_cols = set(EXPECTED_FEATURES) - set(df.columns)
        if missing_cols:
            logger.warning(f"Missing expected features: {missing_cols}")
            for col in missing_cols:
                df[col] = np.nan
                
        df = df[EXPECTED_FEATURES]
        
        # In inference mode, explicitly drop quantity_sold to prevent target leakage.
        # For the target date, quantity_sold is always 0 (zero-filled), so feeding it
        # as a feature would be incorrect and potentially misleading.
        if inference_mode:
            df = df.drop(columns=['quantity_sold'], errors='ignore')
            logger.info("Inference mode: dropped 'quantity_sold' to prevent target leakage.")
        
        # Strict dropna policy for lag and rolling features
        initial_len = len(df)
        df = df.dropna()
        dropped_len = initial_len - len(df)
        logger.info(f"Dropped {dropped_len} rows containing NaNs (historical warmup period). Remaining: {len(df)}")
        
        return df

    def run(self):
        df_sales, df_schedule, df_items = self.load_data()
        df_daily = self.aggregate_sales(df_sales)
        df_base = self.generate_complete_grid(df_daily, df_items)
        df_cal = self.engineer_calendar_features(df_base)
        df_meta = self.merge_metadata_and_schedule(df_cal, df_items, df_schedule)
        df_ts = self.engineer_time_series_features(df_meta)
        df_final = self.enforce_schema_and_clean(df_ts)
        
        # Ensure date is string format YYYY-MM-DD for output
        df_final['date'] = df_final['date'].dt.strftime('%Y-%m-%d')
        
        logger.info(f"Saving preprocessed dataset to {self.output_path}...")
        df_final.to_csv(self.output_path, index=False)
        logger.info("Preprocessing complete.")
        return df_final
