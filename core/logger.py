import sys
import os
from loguru import logger
from core.config import settings
from core.paths import get_base_dir

def setup_logger():
    # Remove default handler
    logger.remove()
    
    # Add console handler
    if os.environ.get("XIPHOS_TUI") != "1":
        logger.add(
            sys.stdout, 
            colorize=True, 
            format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>", 
            level=settings.logging.level
        )
    
    base_dir = get_base_dir()
    log_dir = os.path.join(base_dir, "logs")
    os.makedirs(log_dir, exist_ok=True)
    
    log_file = os.path.join(log_dir, "xiphos.log")
    
    # Add rotating file handler
    logger.add(
        log_file, 
        rotation=settings.logging.rotation, 
        retention=settings.logging.retention, 
        level=settings.logging.level, 
        format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
    )

    return logger

log = setup_logger()
