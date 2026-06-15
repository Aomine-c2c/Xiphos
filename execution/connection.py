import time
import MetaTrader5 as mt5
from core.logger import log

class MT5Connection:
    def __init__(self):
        self.connected = False
        
    def connect(self, max_retries=5, delay=5):
        for attempt in range(max_retries):
            if mt5.initialize():
                log.info("Successfully connected to MetaTrader 5 terminal.")
                self.connected = True
                return True
            else:
                err = mt5.last_error()
                log.error(f"MT5 Initialization failed. Error code: {err}. Attempt {attempt+1}/{max_retries}")
                time.sleep(delay)
                
        log.critical("Failed to connect to MT5 after maximum retries.")
        return False
        
    def check_health(self):
        # Quick check if terminal is responding
        info = mt5.terminal_info()
        if info is None:
            self.connected = False
            log.warning("Terminal connection lost. Attempting reconnect...")
            return self.connect()
        return True
        
    def disconnect(self):
        mt5.shutdown()
        self.connected = False
        log.info("Disconnected from MT5 terminal.")

mt5_conn = MT5Connection()
