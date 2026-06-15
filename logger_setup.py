import logging
from logging.handlers import RotatingFileHandler

def setup_logger():
    logger = logging.getLogger("LiveBot")
    logger.setLevel(logging.INFO)
    
    # Prevent adding duplicate handlers if setup_logger is called multiple times
    if not logger.handlers:
        c_handler = logging.StreamHandler()
        f_handler = RotatingFileHandler('bot_activity.log', maxBytes=5000000, backupCount=5)
        
        c_handler.setLevel(logging.INFO)
        f_handler.setLevel(logging.INFO)

        c_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        f_format = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        c_handler.setFormatter(c_format)
        f_handler.setFormatter(f_format)

        logger.addHandler(c_handler)
        logger.addHandler(f_handler)
    
    return logger
