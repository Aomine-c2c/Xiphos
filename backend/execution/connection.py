import os

import time

import MetaTrader5 as mt5



from core.logger import log as logger







class MT5Connection:


    def __init__(self):

        self.connected = False



    def _apply_login(self, login, password, server) -> bool:

        if not (login and password and server):

            return True



        authorized = mt5.login(int(login), password=password, server=server)

        if not authorized:

            logger.error(f"MT5 Login failed. Error code: {mt5.last_error()}")

            return False



        return True



    def ensure_initialized(self) -> bool:

        if getattr(self, "connected", False):

            return True



        login = os.getenv("MT5_LOGIN")

        password = os.getenv("MT5_PASSWORD")

        server = os.getenv("MT5_SERVER")



        try:

            if mt5.initialize() and self._apply_login(login, password, server):

                logger.info("Successfully connected to MetaTrader 5 terminal.")

                self.connected = True

                return True



            err = mt5.last_error()

            logger.error(f"MT5 Initialization failed. Error code: {err}.")

            return False



        except Exception as e:

            logger.error(f"MT5 initialization exception: {e}")

            return False



    def connect(self, max_retries=5, delay=5) -> bool:

        if self.ensure_initialized():

            return True



        for attempt in range(max_retries):

            logger.warning(f"MT5 reconnect attempt {attempt + 1}/{max_retries}.")

            time.sleep(delay)



            if self.ensure_initialized():

                return True



        logger.critical("Failed to connect to MT5 after maximum retries.")

        return False



    def check_health(self) -> bool:

        try:

            info = mt5.terminal_info()

        except Exception:

            info = None



        if info is None or not getattr(info, "connected", False):

            self.connected = False

            logger.warning("Terminal connection lost or disconnected from broker. Attempting reconnect...")

            return self.connect()



        return True



    def disconnect(self) -> None:

        try:

            mt5.shutdown()

        except Exception:

            pass



        self.connected = False

        logger.info("Disconnected from MT5 terminal.")





mt5_conn = MT5Connection()

