from core.config import settings
from logger_setup import setup_logger

logger = setup_logger()

if settings.execution.mode == "BRIDGE":
    logger.info("Initializing MT5 in BRIDGE mode (Termux/Linux)")
    import bridge.client as mt5
else:
    logger.info("Initializing MT5 in DIRECT mode (Windows Native)")
    import MetaTrader5 as mt5
