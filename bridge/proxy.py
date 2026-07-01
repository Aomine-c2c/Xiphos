from core.config import settings
from core.logger import log as logger
import os
import sys

mode = settings.execution.mode.upper()
if os.getenv("XIPHOS_MOCK_BROKER") == "1":
    mode = "MOCK"
elif mode == "AUTO":
    if os.name == 'nt':
        mode = "DIRECT"
    else:
        mode = "BRIDGE"

if mode == "MOCK":
    logger.info("Initializing MT5 in MOCK mode (Pytest / CI)")
    import tests.mocks.broker as mt5
elif mode == "BRIDGE":
    logger.info("Initializing MT5 in BRIDGE mode (Termux/Linux)")
    import bridge.client as mt5
else:
    logger.info("Initializing MT5 in DIRECT mode (Windows Native)")
    try:
        import MetaTrader5 as mt5
    except ImportError:
        logger.error("MetaTrader5 package not found. Are you on Windows?")
        if os.getenv("XIPHOS_TUI"):
            sys.exit(1)
