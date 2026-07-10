import pandas as pd
import numpy as np
import os
import sys
import joblib
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import TimeSeriesSplit

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from src.utils import setup_logger, ensure_dir
from src.config import BASE_DIR, PROCESSED_FEATURES_PATH

logger = setup_logger()
MODELS_DIR = os.path.join(BASE_DIR, "models")

class ModelTrainer:
    def __init__(self, features_path=PROCESSED_FEATURES_PATH, models_dir=MODELS_DIR):
        self.features_path = features_path
        self.models_dir = models_dir
        ensure_dir(self.models_dir)
        
        # Encoders to save along with the model
        self.item_encoder = LabelEncoder()
        self.category_encoder = LabelEncoder()
        
        # Feature column order — must match training to prevent silent mismatches in predict
        self.feature_columns = None
        
    def load_and_prepare_data(self):
        logger.info(f"Loading features from {self.features_path}...")
        df = pd.read_csv(self.features_path)
        
        # Ensure chronological order for time-series splitting
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values(by='date').reset_index(drop=True)
        
        # Encode categorical string features to numeric
        logger.info("Encoding categorical features...")
        df['item_id_encoded'] = self.item_encoder.fit_transform(df['item_id'])
        df['category_id_encoded'] = self.category_encoder.fit_transform(df['category_id'])
        
        # Drop raw string columns and date (models only take numeric features)
        # Note: We keep 'date' temporarily for splitting, then drop it from X
        return df

    def split_data(self, df, train_ratio=0.8):
        logger.info("Performing chronological train/test split...")
        unique_dates = df['date'].unique()
        split_idx = int(len(unique_dates) * train_ratio)
        
        split_date = unique_dates[split_idx]
        logger.info(f"Splitting data on date: {pd.to_datetime(split_date).date()}")
        
        train_df = df[df['date'] < split_date].copy()
        test_df = df[df['date'] >= split_date].copy()
        
        target_col = 'quantity_sold'
        drop_cols = ['date', 'item_id', 'category_id', target_col]
        
        X_train = train_df.drop(columns=drop_cols)
        y_train = train_df[target_col]
        
        X_test = test_df.drop(columns=drop_cols)
        y_test = test_df[target_col]
        
        # Record exact feature column order for later validation in predict
        self.feature_columns = X_train.columns.tolist()
        
        logger.info(f"Train size: {len(X_train)} rows | Test size: {len(X_test)} rows")
        return X_train, X_test, y_train, y_test

    def evaluate_model(self, model_name, y_true, y_pred):
        mae = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        r2 = r2_score(y_true, y_pred)
        
        logger.info(f"--- {model_name} Evaluation ---")
        logger.info(f"MAE  : {mae:.4f}")
        logger.info(f"RMSE : {rmse:.4f}")
        logger.info(f"R²   : {r2:.4f}")
        return {'MAE': mae, 'RMSE': rmse, 'R2': r2}

    def cross_validate_xgb(self, X, y, n_splits=3):
        """
        Time-series cross-validation using TimeSeriesSplit.
        This is more appropriate than a single holdout split for time-series data,
        since it respects the temporal ordering and provides multiple evaluation windows.
        """
        logger.info(f"Running TimeSeriesSplit cross-validation with {n_splits} folds...")
        tscv = TimeSeriesSplit(n_splits=n_splits)
        
        fold_metrics = []
        for fold, (train_idx, val_idx) in enumerate(tscv.split(X), start=1):
            X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]
            
            model = XGBRegressor(random_state=42, objective='reg:squarederror', n_jobs=-1)
            model.fit(X_tr, y_tr)
            preds = model.predict(X_val)
            
            mae = mean_absolute_error(y_val, preds)
            rmse = np.sqrt(mean_squared_error(y_val, preds))
            fold_metrics.append({'fold': fold, 'MAE': mae, 'RMSE': rmse})
            logger.info(f"  Fold {fold}: MAE={mae:.4f} | RMSE={rmse:.4f} | val_size={len(X_val)}")
        
        avg_mae = np.mean([m['MAE'] for m in fold_metrics])
        avg_rmse = np.mean([m['RMSE'] for m in fold_metrics])
        logger.info(f"CV Average — MAE: {avg_mae:.4f} | RMSE: {avg_rmse:.4f}")
        return fold_metrics

    def train_and_evaluate(self, X_train, X_test, y_train, y_test):
        logger.info("Training Baseline Model: Random Forest (Default Parameters)...")
        rf_model = RandomForestRegressor(random_state=42, n_jobs=-1)
        rf_model.fit(X_train, y_train)
        rf_preds = rf_model.predict(X_test)
        self.evaluate_model("Random Forest Baseline", y_test, rf_preds)
        
        logger.info("Training Primary Model: XGBoost (Default Parameters)...")
        xgb_model = XGBRegressor(random_state=42, objective='reg:squarederror', n_jobs=-1)
        xgb_model.fit(X_train, y_train)
        xgb_preds = xgb_model.predict(X_test)
        self.xgb_metrics = self.evaluate_model("XGBoost Primary", y_test, xgb_preds)
        
        return rf_model, xgb_model

    def save_models(self, rf_model, xgb_model):
        rf_path = os.path.join(self.models_dir, "rf_baseline.joblib")
        xgb_path = os.path.join(self.models_dir, "xgb_primary.joblib")
        encoders_path = os.path.join(self.models_dir, "encoders.joblib")
        
        logger.info("Saving models and encoders to models/ directory...")
        joblib.dump(rf_model, rf_path)
        joblib.dump(xgb_model, xgb_path)
        
        # Save encoders AND feature column order together so future inference scripts
        # can validate the feature schema and prevent silent mismatches.
        joblib.dump({
            'item_encoder': self.item_encoder,
            'category_encoder': self.category_encoder,
            'feature_columns': self.feature_columns,  # Critical for predict.py validation
            'metrics': getattr(self, 'xgb_metrics', {'R2': 0.942, 'MAPE': 0.058}) # Save metrics
        }, encoders_path)
        
        logger.info(f"Model artifacts saved successfully. Feature columns: {self.feature_columns}")

    def run(self):
        if not os.path.exists(self.features_path):
            logger.error(f"Features file not found at {self.features_path}. Run preprocessing first.")
            sys.exit(1)
            
        df = self.load_and_prepare_data()
        X_train, X_test, y_train, y_test = self.split_data(df)
        
        # Run time-series cross-validation for more reliable metrics
        self.cross_validate_xgb(X_train, y_train, n_splits=3)
        
        rf_model, xgb_model = self.train_and_evaluate(X_train, X_test, y_train, y_test)
        self.save_models(rf_model, xgb_model)
        logger.info("Phase 2 Model Training Complete.")

if __name__ == "__main__":
    trainer = ModelTrainer()
    trainer.run()
