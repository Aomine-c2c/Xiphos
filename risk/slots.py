import MetaTrader5 as mt5
from core.config import settings
from core.logger import log
from storage.database import db

def calculate_available_slots():
    """ 
    Calculates how many slots are open out of max_risk_trades (4). 
    A trade is risk-bearing if BUY: SL < Entry, SELL: SL > Entry.
    """
    positions = mt5.positions_get()
    if positions is None:
        return 0
        
    risk_bearing_count = 0
    
    for pos in positions:
        # Only count trades managed by Xiphos
        if pos.magic in [settings.magic_numbers.scalper, settings.magic_numbers.runner]:
            # SL = 0.0 means naked trade, which shouldn't happen, but counts as risk-bearing
            if pos.sl == 0.0:
                risk_bearing_count += 1
            elif pos.type == mt5.ORDER_TYPE_BUY:
                if pos.sl < pos.price_open:
                    risk_bearing_count += 1
            elif pos.type == mt5.ORDER_TYPE_SELL:
                if pos.sl > pos.price_open:
                    risk_bearing_count += 1
                    
    available = settings.trading.max_risk_trades - risk_bearing_count
    
    # Ensure it doesn't go below 0
    available = max(0, available)
    
    with db.get_connection() as conn:
        conn.execute("INSERT INTO risk_events (event_type, description) VALUES (?, ?)",
                     ("SLOT_CALC", f"Risk-bearing trades: {risk_bearing_count}. Slots available: {available}"))
                     
    return available
