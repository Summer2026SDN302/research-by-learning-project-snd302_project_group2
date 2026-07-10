import os
import logging

def setup_logger():
    """Sets up and returns a standard console logger."""
    logger = logging.getLogger("StallBoxAI")
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        console_handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "[%(asctime)s] %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
    return logger

def ensure_dir(dir_path):
    """Ensures that a directory exists, creating it if necessary."""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path, exist_ok=True)
        return True
    return False
