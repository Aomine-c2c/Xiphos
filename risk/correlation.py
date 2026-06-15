import MetaTrader5 as mt5
from core.config import settings
from core.logger import log

def is_correlation_blocked(symbol: str) -> bool:
    """
    Checks if there is an active risk-bearing trade in the same correlation bucket.
    """
    positions = mt5.positions_get()
    if positions is None:
        return False
        
    # Find which group this symbol belongs to
    target_group = None
    for group_name, symbols in settings.correlation_groups.items():
        if symbol in symbols:
            target_group = symbols
            break
            
    if target_group is None:
        # If the symbol isn't defined in any correlation group, it trades freely
        return False
        
    # Check if any symbol in target_group currently has a risk-bearing trade
    for pos in positions:
        if pos.symbol in target_group and pos.symbol != symbol:
            if pos.magic in [settings.magic_numbers.scalper, settings.magic_numbers.runner]:
                if pos.sl == 0.0:
                     return True # Treat naked as risk
                if pos.type == mt5.ORDER_TYPE_BUY and pos.sl < pos.price_open:
                    log.info(f"Signal for {symbol} BLOCKED due to correlation with active risk-bearing {pos.symbol}")
                    return True
                elif pos.type == mt5.ORDER_TYPE_SELL and pos.sl > pos.price_open:
                    log.info(f"Signal for {symbol} BLOCKED due to correlation with active risk-bearing {pos.symbol}")
                    return True
                    
    return False
