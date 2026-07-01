from bridge.proxy import mt5

from core.logger import log
from indicators.moving_averages import get_m30_indicators
from execution.orders import modify_sl
from storage.database import db

def _get_new_sl(pos, ind_data, symbol_info):
    """
    Asymmetrical trailing stop logic:
      Scalper (role 1) — trails the 50 EMA: exits when intermediate trend breaks
      Runner  (role 2) — trails the 200 SMA: holds until macro trend completely reverses

    The SL only ever moves in the trade's favour (never widens).
    No ATR buffer. No breakeven override. Let it ride.
    """
    role_id = pos.magic % 10

    if role_id == 1:
        trail_level = ind_data['ema_medium']  # 50 EMA
    elif role_id == 2:
        trail_level = ind_data['sma_slow']    # 200 SMA
    else:
        return None

    new_sl = round(float(trail_level), symbol_info.digits)
    return new_sl


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

def _sync_position_to_db(pos):
    from core.database import Trade
    with db.get_session() as session:
        trade = session.query(Trade).filter(Trade.ticket == pos.ticket).first()
        if not trade:
            new_trade = Trade(
                ticket=pos.ticket,
                symbol=pos.symbol,
                type="BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL",
                magic=pos.magic,
                volume=float(pos.volume),
                entry_price=pos.price_open,
                sl_price=float(pos.sl),
                status="OPEN",
                mfe=pos.profit,
                mae=pos.profit
            )
            session.add(new_trade)
        else:
            if pos.profit > trade.mfe:
                trade.mfe = pos.profit
            if pos.profit < trade.mae:
                trade.mae = pos.profit

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

        _sync_position_to_db(pos)

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
