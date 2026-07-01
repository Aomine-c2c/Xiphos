import time
import MetaTrader5 as mt5
from core.logger import log


import os

class MT5Connection:
    def __init__(self):
        self.connected = False

    def connect(self, max_retries=5, delay=5):
        login = os.getenv("MT5_LOGIN")
        password = os.getenv("MT5_PASSWORD")
        server = os.getenv("MT5_SERVER")

        for attempt in range(max_retries):
            # Attempt to initialize. If path is omitted, it finds the default MT5 installation.
            if mt5.initialize():
                # Attempt to login if credentials are provided in .env
                if login and password and server:
                    authorized = mt5.login(int(login), password=password, server=server)
                    if not authorized:
                        log.error(f"MT5 Login failed. Error code: {mt5.last_error()}")
                        time.sleep(delay)
                        continue
                
                log.info("Successfully connected to MetaTrader 5 terminal.")
                self.connected = True
                return True
            else:
                err = mt5.last_error()
                log.error(
                    f"MT5 Initialization failed. Error code: {err}. Attempt {attempt + 1}/{max_retries}"
                )
                time.sleep(delay)

        log.critical("Failed to connect to MT5 after maximum retries.")
        return False

    def check_health(self):
        # Quick check if terminal is responding and connected to broker
        info = mt5.terminal_info()
        if info is None or not info.connected:
            self.connected = False
            log.warning("Terminal connection lost or disconnected from broker. Attempting reconnect...")
            return self.connect()
        return True

    def disconnect(self):
        mt5.shutdown()
        self.connected = False
        log.info("Disconnected from MT5 terminal.")


mt5_conn = MT5Connection()
