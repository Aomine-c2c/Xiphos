import os
from dotenv import load_dotenv

load_dotenv()
os.environ["XIPHOS_TUI"] = "1"

import time
import threading
from loguru import logger

from execution.connection import mt5_conn
from execution.queue import trade_worker
from core.bot_controller import start_bot_execution, stop_bot_execution
from core.state_compiler import state_publisher_loop
from core.command_handler import command_listener_loop
from data_pipeline.aggregator import data_aggregator_loop

if __name__ == "__main__":
    if mt5_conn.connect():
        logger.info("MT5 interface initialized in Worker Engine.")
    else:
        logger.warning("MT5 is not running! Please open your MetaTrader 5 terminal. Xiphos will automatically connect when it opens.")
        
    trade_worker.start()
    
    threading.Thread(target=state_publisher_loop, daemon=True).start()
    threading.Thread(target=command_listener_loop, daemon=True).start()
    threading.Thread(target=data_aggregator_loop, daemon=True).start()
    
    logger.info("Auto-starting trading execution loop...")
    start_bot_execution()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        logger.info("Worker Engine shutting down.")
    finally:
        stop_bot_execution()
        trade_worker.stop()
        mt5_conn.disconnect()
