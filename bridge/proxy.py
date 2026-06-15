from core.config import settings
from logger_setup import setup_logger
import os

logger = setup_logger()

mode = settings.execution.mode.upper()
if mode == "AUTO":
    if os.name == 'nt':
        mode = "DIRECT"
    else:
        mode = "BRIDGE"

if mode == "BRIDGE":
    logger.info("Initializing MT5 in BRIDGE mode (Termux/Linux)")
    import bridge.client as mt5
else:
    logger.info("Initializing MT5 in DIRECT mode (Windows Native)")
    import MetaTrader5 as mt5
