import threading
from loguru import logger
from monitoring.scheduler import scheduler
from core.engine import xiphos_engine
from execution.trailing import trail_positions

_bot_running = False
_lock = threading.Lock()

def is_bot_running():
    with _lock:
        return _bot_running

def start_bot_execution():
    global _bot_running
    with _lock:
        if _bot_running:
            return
        _bot_running = True

    logger.info("Bot execution loop started via API command.")
    scheduler.add_m30_job(xiphos_engine.process_m30_cycle)
    scheduler.add_trailing_job(trail_positions)
    scheduler.start()
    
    try:
        xiphos_engine.process_m30_cycle()
    except Exception as e:
        logger.error(f"Immediate startup cycle error: {e}")

def stop_bot_execution():
    global _bot_running
    with _lock:
        if not _bot_running:
            return
        _bot_running = False

    scheduler.stop()
    logger.info("Bot execution loop stopped via API command.")
