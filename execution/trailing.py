from bridge.proxy import mt5

from core.logger import log
from indicators.moving_averages import get_m30_indicators
from execution.orders import modify_sl
from storage.database import db

def _get_new_sl(pos, ind_data, symbol_info):
    new_sl = None
    role_id = pos.magic % 10
    atr_buffer = 1.5 * ind_data.get('atr_14', 0)
    
    # Calculate base SL based on role
    if role_id == 1:
        base_sl = ind_data['ema_medium']
    elif role_id == 2:
        base_sl = ind_data['sma_slow']
    else:
        return None

    # Apply ATR Buffer to the trailing MA
    if pos.type == mt5.ORDER_TYPE_BUY:
        new_sl = base_sl - atr_buffer
    elif pos.type == mt5.ORDER_TYPE_SELL:
        new_sl = base_sl + atr_buffer

    # Breakeven overrides for Role 2
    if role_id == 2:
        if pos.type == mt5.ORDER_TYPE_BUY:
            if ind_data['ema_medium'] > pos.price_open:
                new_sl = ind_data['ema_medium'] - atr_buffer
            elif ind_data['ema_fast'] > pos.price_open:
                new_sl = pos.price_open
        elif pos.type == mt5.ORDER_TYPE_SELL:
            if ind_data['ema_medium'] < pos.price_open:
                new_sl = ind_data['ema_medium'] + atr_buffer
            elif ind_data['ema_fast'] < pos.price_open:
                new_sl = pos.price_open
                
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
        if pos.magic <= 0:
            continue

        # Sync missing trades and update MFE/MAE
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ticket FROM trades WHERE ticket = ?", (pos.ticket,))
            if not cursor.fetchone():
                conn.execute("""
                    INSERT INTO trades (
                        ticket, symbol, type, magic, volume, entry_price, sl_price, status,
                        mfe, mae, sma_200, fast_ema, medium_ema, distance_to_sma, projected_risk, latency_ms
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    pos.ticket, pos.symbol, "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL", 
                    pos.magic, float(pos.volume), pos.price_open, float(pos.sl), "OPEN",
                    pos.profit, pos.profit, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
                ))
            else:
                conn.execute("""
                    UPDATE trades 
                    SET mfe = MAX(mfe, ?), mae = MIN(mae, ?)
                    WHERE ticket = ?
                """, (pos.profit, pos.profit, pos.ticket))
            

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
