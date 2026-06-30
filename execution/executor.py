from bridge.proxy import mt5
import time
from core.logger import log as logger

MAX_RETRIES = 3
BASE_DELAY = 2.0

class MT5Executor:
    def __init__(self):
        if not mt5.initialize():
            logger.critical(f"MT5 initialization failed, error code = {mt5.last_error()}")
            raise Exception("MT5 Init Failed")
        logger.info("MT5 connection established.")
        
    def _retry_wrapper(self, func, *args, **kwargs):
        for attempt in range(MAX_RETRIES):
            if func == mt5.order_send:
                result = mt5.order_send(args[0])
            else:
                result = func(*args, **kwargs)
            if result is not None and getattr(result, "retcode", mt5.TRADE_RETCODE_DONE) == mt5.TRADE_RETCODE_DONE:
                return result
            elif result is not None:
                logger.warning(f"MT5 order failed with retcode {result.retcode} ({getattr(result, 'comment', 'No comment')}). Attempt {attempt+1}/{MAX_RETRIES}")
            else:
                err = mt5.last_error()
                logger.warning(f"MT5 function returned None. Error: {err}. Attempt {attempt+1}/{MAX_RETRIES}")
                
            time.sleep(BASE_DELAY * (2 ** attempt))
            
        logger.critical(f"Operation {func.__name__} failed after {MAX_RETRIES} attempts.")
        return None

    def execute_market_order(self, symbol, order_type, volume, sl_price, magic):
        type_mt5 = mt5.ORDER_TYPE_BUY if order_type == "BUY" else mt5.ORDER_TYPE_SELL
        price = mt5.symbol_info_tick(symbol).ask if order_type == "BUY" else mt5.symbol_info_tick(symbol).bid
        
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": str(symbol),
            "volume": float(volume),
            "type": int(type_mt5),
            "price": float(price),
            "sl": float(sl_price),
            "deviation": 20,
            "magic": int(magic),
            "comment": "M30 Framework Bot",
        }
        
        return self._retry_wrapper(mt5.order_send, request)

    def modify_sl(self, ticket, symbol, new_sl):
        positions = mt5.positions_get(ticket=ticket)
        if not positions:
            return None
        position = positions[0]
            
        request = {
            "action": mt5.TRADE_ACTION_SLTP,
            "symbol": str(symbol),
            "sl": float(new_sl),
            "tp": float(position.tp) if position.tp else 0.0,
            "position": int(ticket)
        }
        
        return self._retry_wrapper(mt5.order_send, request)

    def get_open_positions(self):
        return mt5.positions_get()
