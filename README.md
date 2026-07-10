# StallBox AI Prediction Service - Preprocessing Pipeline

This directory contains the data preprocessing and feature engineering library for the **StallBox Food Demand Forecasting Service**, designed as part of a university capstone project.

The goal of this service is to ingest transactional canteen sales data, menu item lists, and weekly schedule definitions, and output a high-quality, preprocessed tabular feature matrix (`data/processed/features.csv`) ready for machine learning models (XGBoost/Random Forest).

---

## Folder Structure

```
.
├── data/
│   ├── raw/                      # Raw input CSV data dumps
│   │   ├── sales.csv             # Raw transactional sales history
│   │   ├── scheduled_menu.csv    # Raw weekly scheduled menu definitions
│   │   └── food_items.csv        # Food items catalog mapping category ID
│   └── processed/                # Preprocessed output features
│       └── features.csv          # Final preprocessed feature matrix
├── models/                       # Serialized trained models (.joblib)
├── src/
│   ├── __init__.py
│   ├── config.py                 # Paths, calendar configuration, feature lists
│   ├── data_preprocessing.py     # Main preprocessing & feature engineering pipeline class
│   ├── train.py                  # Model training and evaluation logic
│   └── utils.py                  # Directory validation and logging helpers
├── tests/
│   └── test_preprocessing.py     # Unit test suite verifying logic
├── main.py                       # CLI script to execute the pipeline
└── requirements.txt              # Package list (pandas, numpy, scikit-learn, xgboost, joblib, pytest)
```

---

## Features Generated

The preprocessing pipeline aggregates sales at a **daily** granularity per **food item** and generates:
1. **Temporal Features**: Day of week, month, weekend indicators.
2. **Food Item Metadata**: Category mapping.
3. **Scheduled Menu Features**:
   - `is_scheduled`: Binary flag denoting if the item is scheduled for sale on that day of week.
   - `scheduled_item_count`: Total items scheduled on that day of the week (models menu variety/competition).
   - `item_scheduled_freq`: Number of days in the week this item is scheduled (staple vs specialty).
4. **Historical Lags**: Demand 1, 2, and 7 days ago.
5. **Rolling Window Statistics**: 3-day and 7-day rolling mean, and 7-day rolling standard deviation.

---

## Execution Instructions

To generate the processed feature dataset and train the models:

1. **Generate Mock Data:**
   ```powershell
   python main.py --mode mock
   ```
2. **Run Preprocessing (Feature Engineering):**
   ```powershell
   python main.py --mode preprocess
   ```
3. **Train Models:**
   ```powershell
   python main.py --mode train
   ```
   This will train both Random Forest and XGBoost models, print out MAE, RMSE, and R² scores, and save the artifacts to the `models/` folder.

---

## Running Unit Tests

Verify the correctness of the pipeline and feature computations:
```powershell
pytest tests/
```
