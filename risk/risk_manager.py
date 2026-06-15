import MetaTrader5 as mt5
from core.config import settings
from core.logger import log
from storage.database import db


class CorrelationGuard:
    @staticmethod
    def is_blocked(symbol: str) -> bool:
        """
        If any active risk-bearing trade exists inside a bucket:
        Block all new entries from the same bucket.
        """
        positions = mt5.positions_get()
        if positions is None:
            return False
            
        target_group = None
        for group_name, symbols in settings.correlation_groups.items():
            if symbol in symbols:
                target_group = symbols
                break
                
        if target_group is None:
            return False
            
        for pos in positions:
            if pos.symbol in target_group and pos.symbol != symbol:
                if pos.magic in [135001, 135002]:
                    if pos.sl == 0.0:
                        return True
                    if pos.type == mt5.ORDER_TYPE_BUY and pos.sl < pos.price_open:
                        log.info(f"Signal for {symbol} BLOCKED due to correlation with active risk-bearing {pos.symbol}")
                        return True
                    elif pos.type == mt5.ORDER_TYPE_SELL and pos.sl > pos.price_open:
                        log.info(f"Signal for {symbol} BLOCKED due to correlation with active risk-bearing {pos.symbol}")
                        return True
                        
        return False
