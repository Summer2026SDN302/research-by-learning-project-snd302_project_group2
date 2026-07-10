import os
import sys
import json
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any

# Ensure AI source directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.config import (
    RAW_SALES_PATH,
    RAW_SCHEDULED_MENU_PATH,
    RAW_FOOD_ITEMS_PATH,
    RAW_DATA_DIR
)
from src.predict import InferenceEngine

app = FastAPI(
    title="StallBox AI Prediction API",
    description="Microservice providing demand forecasting and inventory suggestions",
    version="1.0.0"
)

# Enable CORS for communication from backend/frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictPayload(BaseModel):
    target_date: str
    sales: List[Dict[str, Any]]
    scheduled_menu: List[Dict[str, Any]]
    food_items: List[Dict[str, Any]]

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "StallBox AI Service"}

@app.post("/predict")
def predict_demand(payload: PredictPayload):
    try:
        # Create raw data directory if it doesn't exist
        os.makedirs(RAW_DATA_DIR, exist_ok=True)

        # Convert JSON payloads to CSV files as expected by the PreprocessingPipeline
        df_sales = pd.DataFrame(payload.sales)
        df_schedule = pd.DataFrame(payload.scheduled_menu)
        df_items = pd.DataFrame(payload.food_items)

        # Ensure correct column headers in CSVs matching what preprocessing expects
        df_sales.to_csv(RAW_SALES_PATH, index=False)
        df_schedule.to_csv(RAW_SCHEDULED_MENU_PATH, index=False)
        df_items.to_csv(RAW_FOOD_ITEMS_PATH, index=False)

        # Instantiate InferenceEngine and run prediction
        engine = InferenceEngine(payload.target_date)
        prediction_json_str = engine.predict()
        
        # Parse prediction output back to dictionary to return as proper JSON response
        prediction_result = json.loads(prediction_json_str)
        return prediction_result

    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Prediction error: {error_trace}")
        raise HTTPException(
            status_code=500,
            detail=f"AI inference failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    # Default local port is 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
