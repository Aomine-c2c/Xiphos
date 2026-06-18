from bridge.proxy import mt5

from core.logger import log
from indicators.moving_averages import get_m30_indicators
from execution.orders import modify_sl

def _get_new_sl(pos, ind_data, symbol_info):
    new_sl = None
    if pos.magic == 135001:
        new_sl = ind_data['ema_medium']
    elif pos.magic == 135002:
        new_sl = ind_data['sma_slow']
    if new_sl is None:
        return None
    return round(float(new_sl), symbol_info.digits)

def _trail_buy_position(pos, new_sl, stoplevel):
    if new_sl > pos.sl:
        tick = mt5.symbol_info_tick(pos.symbol)
        if tick and new_sl < (tick.bid - stoplevel):
            log.info(f"Trailing SL for {pos.symbol} BUY (Magic {pos.magic}) upward to {new_sl}")
            modify_sl(pos.ticket, pos.symbol, new_sl)

def _trail_sell_position(pos, new_sl, stoplevel):
    if pos.sl <= 0.0 or new_sl < pos.sl:
        tick = mt5.symbol_info_tick(pos.symbol)
        if tick and new_sl > (tick.ask + stoplevel):
            log.info(f"Trailing SL for {pos.symbol} SELL (Magic {pos.magic}) downward to {new_sl}")
            modify_sl(pos.ticket, pos.symbol, new_sl)

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
        if pos.magic not in [135001, 135002]:
            continue
            
        ind_data = get_m30_indicators(pos.symbol, count=250)
        if not ind_data:
            continue
            
        symbol_info = mt5.symbol_info(pos.symbol)
        if not symbol_info:
            continue

        new_sl = _get_new_sl(pos, ind_data, symbol_info)
        if new_sl is None:
            continue
            
        stoplevel = symbol_info.trade_stops_level * symbol_info.point
        
        if pos.type == mt5.ORDER_TYPE_BUY:
            _trail_buy_position(pos, new_sl, stoplevel)
        elif pos.type == mt5.ORDER_TYPE_SELL:
            _trail_sell_position(pos, new_sl, stoplevel)
