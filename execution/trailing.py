import MetaTrader5 as mt5
from core.config import settings
from core.logger import log
from indicators.moving_averages import get_m30_indicators
from execution.orders import modify_sl

def trail_positions():
    """
    Trails SL for active positions.
    Trade A (135001): Trails behind EMA50
    Trade B (135002): Trails behind SMA200
    Never widens risk.
    """
    positions = mt5.positions_get()
    if not positions:
        return
        
    for pos in positions:
        if pos.magic not in [settings.magic_numbers.scalper, settings.magic_numbers.runner]:
            continue
            
        ind_data = get_m30_indicators(pos.symbol, count=250)
        if not ind_data:
            continue
            
        new_sl = None
        
        if pos.magic == settings.magic_numbers.scalper:
            # Trail behind EMA50
            new_sl = ind_data['ema_medium']
        elif pos.magic == settings.magic_numbers.runner:
            # Trail behind SMA200
            new_sl = ind_data['sma_slow']
            
        if new_sl is None:
            continue
            
        # Get point sizes to avoid "Invalid Stops" errors (round to symbol digits)
        symbol_info = mt5.symbol_info(pos.symbol)
        if not symbol_info:
            continue
            
        new_sl = round(float(new_sl), symbol_info.digits)
        
        # Check direction and ensure risk never widens
        if pos.type == mt5.ORDER_TYPE_BUY:
            # Move SL upward only
            if new_sl > pos.sl:
                # Also ensure new_sl is below current price
                tick = mt5.symbol_info_tick(pos.symbol)
                if tick and new_sl < tick.bid:
                    log.info(f"Trailing SL for {pos.symbol} BUY (Magic {pos.magic}) upward to {new_sl}")
                    modify_sl(pos.ticket, pos.symbol, new_sl)
        elif pos.type == mt5.ORDER_TYPE_SELL:
            # Move SL downward only
            if pos.sl == 0.0 or new_sl < pos.sl:
                tick = mt5.symbol_info_tick(pos.symbol)
                if tick and new_sl > tick.ask:
                    log.info(f"Trailing SL for {pos.symbol} SELL (Magic {pos.magic}) downward to {new_sl}")
                    modify_sl(pos.ticket, pos.symbol, new_sl)
