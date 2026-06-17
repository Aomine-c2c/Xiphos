import logging
from logging.handlers import RotatingFileHandler
import os
from core.paths import get_base_dir

def setup_logger():
    logger = logging.getLogger("LiveBot")
    logger.setLevel(logging.INFO)
    
    # Prevent adding duplicate handlers if setup_logger is called multiple times
    if not logger.handlers:
        base_dir = get_base_dir()
        log_dir = os.path.join(base_dir, "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_file = os.path.join(log_dir, "bot_activity.log")

        c_handler = logging.StreamHandler()
        f_handler = RotatingFileHandler(log_file, maxBytes=5000000, backupCount=5)
        
        c_handler.setLevel(logging.INFO)
        f_handler.setLevel(logging.INFO)

        c_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        f_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        c_handler.setFormatter(c_format)
        f_handler.setFormatter(f_format)

        if os.environ.get("XIPHOS_TUI") != "1":
            logger.addHandler(c_handler)
        logger.addHandler(f_handler)
    
    return logger
