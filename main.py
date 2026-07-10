import argparse
import os
import sys

from src.config import (
    RAW_SALES_PATH,
    RAW_SCHEDULED_MENU_PATH,
    RAW_FOOD_ITEMS_PATH,
    PROCESSED_FEATURES_PATH,
    PROCESSED_DATA_DIR
)
from src.utils import setup_logger, ensure_dir
from src.data_preprocessing import PreprocessingPipeline
from src.generate_mock_data import generate_mock_data
from src.train import ModelTrainer
from src.predict import InferenceEngine

logger = setup_logger()

def main():
    parser = argparse.ArgumentParser(description="StallBox AI Pipeline")
    parser.add_argument(
        '--mode', 
        type=str, 
        choices=['mock', 'preprocess', 'train', 'predict'], 
        required=True, 
        help="Execution mode: 'mock', 'preprocess', 'train', or 'predict'."
    )
    parser.add_argument(
        '--date',
        type=str,
        help="Target date for prediction in YYYY-MM-DD format (used with --mode predict). Defaults to tomorrow."
    )
    
    args = parser.parse_args()
    
    if args.mode == 'mock':
        logger.info("Starting mock data generation...")
        generate_mock_data()
        logger.info("Mock data generation completed successfully.")
        
    elif args.mode == 'preprocess':
        logger.info("Starting data preprocessing pipeline...")
        
        # Verify inputs exist
        for p in [RAW_SALES_PATH, RAW_SCHEDULED_MENU_PATH, RAW_FOOD_ITEMS_PATH]:
            if not os.path.exists(p):
                logger.error(f"Required input file missing: {p}")
                logger.error("Please run `python main.py --mode mock` first to generate sample data.")
                sys.exit(1)
                
        ensure_dir(PROCESSED_DATA_DIR)
        
        pipeline = PreprocessingPipeline(
            sales_path=RAW_SALES_PATH,
            scheduled_menu_path=RAW_SCHEDULED_MENU_PATH,
            food_items_path=RAW_FOOD_ITEMS_PATH,
            output_path=PROCESSED_FEATURES_PATH
        )
        
        df_final = pipeline.run()
        logger.info(f"Pipeline executed successfully. Final shape: {df_final.shape}")
        
    elif args.mode == 'train':
        logger.info("Starting model training pipeline...")
        trainer = ModelTrainer()
        trainer.run()
        
    elif args.mode == 'predict':
        from datetime import datetime, timedelta
        target_date = args.date
        if not target_date:
            target_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
            
        # Suppress standard logging to ensure the only stdout is the JSON payload for the Backend
        import logging
        logger.setLevel(logging.ERROR)
        
        engine = InferenceEngine(target_date)
        print(engine.predict())

if __name__ == "__main__":
    main()
