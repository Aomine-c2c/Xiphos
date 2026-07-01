import time
from bridge.proxy import mt5
from core.logger import log
from storage.database import db

MAX_RETRIES = 3
BASE_DELAY = 1.0

def _retry_wrapper(func, *args, **kwargs):
    for attempt in range(MAX_RETRIES):
        if func.__name__ == 'order_send' or func.__name__ == 'order_check':
            result = func(args[0])
        else:
            result = func(*args, **kwargs)
            
        if result is not None and getattr(result, "retcode", mt5.TRADE_RETCODE_DONE) == mt5.TRADE_RETCODE_DONE:
            return result
        elif result is not None:
            log.warning(f"MT5 order failed with retcode {result.retcode} ({result.comment}). Attempt {attempt+1}/{MAX_RETRIES}")
        else:
            err = mt5.last_error()
            log.warning(f"MT5 function returned None. Error: {err}. Attempt {attempt+1}/{MAX_RETRIES}")
            
        time.sleep(BASE_DELAY * (2 ** attempt))
        
    log.critical(f"MT5 Operation failed permanently after {MAX_RETRIES} attempts.")
    return None

def _validate_trade_safety(symbol, sl_price):
    if sl_price is None or sl_price <= 0:
        log.critical(f"BLOCKED: Attempted to place naked trade on {symbol}. Missing SL.")
        return False
    terminal = mt5.terminal_info()
    if terminal is None:
        log.critical("BLOCKED: MT5 connection lost. Terminal info is None.")
        return False
    if not terminal.trade_allowed:
        log.critical("BLOCKED: MT5 terminal has algo trading DISABLED.")
        return False
    if not terminal.connected:
        log.critical("BLOCKED: MT5 terminal is not connected to the broker.")
        return False
        
    if not mt5.symbol_select(symbol, True):
        log.warning(f"symbol_select failed for {symbol}.")
    return True

def _get_trade_price_and_stoplevel(symbol, type_str, sl_price):
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        return None, None
    price = tick.ask if type_str == "BUY" else tick.bid
    sym_info = mt5.symbol_info(symbol)
    if not sym_info:
        return None, None
    stoplevel = sym_info.trade_stops_level * sym_info.point
    if abs(price - sl_price) <= stoplevel:
        log.warning(f"BLOCKED: SL {sl_price} for {symbol} is too close. Min {stoplevel}.")
        return None, None
    return price, sym_info.filling_mode

def _get_supported_filling_modes(filling_bitmask, symbol):
    all_modes = [
        (mt5.ORDER_FILLING_FOK, "FOK", 1),
        (mt5.ORDER_FILLING_IOC, "IOC", 2),
        (mt5.ORDER_FILLING_RETURN, "RETURN", 4),
    ]
    supported = [(mode, name) for mode, name, bit in all_modes if filling_bitmask & bit]
    if not supported:
        log.warning(f"No supported filling modes found for {symbol}. Trying all.")
        supported = [(mode, name) for mode, name, _ in all_modes]
    return supported

def _record_trade_in_db(result, symbol, type_str, volume, sl_price, magic, sig, latency_ms):
    from core.database import Execution, Trade
    with db.get_session() as session:
        execution = Execution(
            ticket=result.order,
            action="OPEN",
            details=f"{type_str} {symbol} at {result.price} (SL: {sl_price})"
        )
        session.add(execution)
        
        sma_200 = float(sig['ind_data']['sma_slow']) if sig and 'ind_data' in sig else 0.0
        fast_ema = float(sig['ind_data']['ema_fast']) if sig and 'ind_data' in sig else 0.0
        medium_ema = float(sig['ind_data']['ema_medium']) if sig and 'ind_data' in sig else 0.0
        dist_sma = float(sig.get('distance', 0.0)) if sig else 0.0
        proj_risk = float(sig.get('projected_risk', 0.0)) if sig else 0.0

        trade = Trade(
            ticket=result.order,
            symbol=symbol,
            type=type_str,
            magic=magic,
            volume=float(volume),
            entry_price=result.price,
            sl_price=float(sl_price),
            status="OPEN",
            mfe=0.0,
            mae=0.0,
            sma_200=sma_200,
            fast_ema=fast_ema,
            medium_ema=medium_ema,
            distance_to_sma=dist_sma,
            projected_risk=proj_risk,
            latency_ms=latency_ms
        )
        session.add(trade)

def _execute_order_with_modes(request, supported_modes, symbol, type_str, volume, sl_price, magic, sig=None):
    for filling_mode, filling_name in supported_modes:
        request["type_filling"] = filling_mode
        check = mt5.order_check(request)
        if check is None or check.retcode != 0:
            continue

        start_time = time.perf_counter()
        result = _retry_wrapper(mt5.order_send, request)
        latency_ms = (time.perf_counter() - start_time) * 1000

        if result:
            _record_trade_in_db(result, symbol, type_str, volume, sl_price, magic, sig, latency_ms)
            log.info(f"Trade successfully opened! Ticket: {result.order} (Latency: {latency_ms:.2f}ms)")
            return result
    return None
def calculate_dynamic_lot(symbol: str, entry_price: float, sl_price: float, risk_percent: float) -> float:
    account = mt5.account_info()
    if not account:
        return 0.01
        
    risk_amount = account.equity * (risk_percent / 100.0)
    
    sym_info = mt5.symbol_info(symbol)
    if not sym_info:
        return 0.01
        
    order_type = mt5.ORDER_TYPE_BUY if sl_price < entry_price else mt5.ORDER_TYPE_SELL
    
    loss_for_1_lot = mt5.order_calc_profit(order_type, symbol, 1.0, entry_price, sl_price)
    
    if loss_for_1_lot is None or loss_for_1_lot >= 0:
        tick_value = sym_info.trade_tick_value
        tick_size = sym_info.trade_tick_size
        if tick_size == 0 or tick_value == 0:
            return 0.01
        price_diff = abs(entry_price - sl_price)
        loss_for_1_lot = -(price_diff / tick_size) * tick_value
        
    if loss_for_1_lot == 0:
        return 0.01
        
    calc_lots = risk_amount / abs(loss_for_1_lot)
    
    min_vol = sym_info.volume_min
    max_vol = sym_info.volume_max
    step_vol = sym_info.volume_step
    
    calc_lots = (calc_lots // step_vol) * step_vol
    
    if calc_lots < min_vol:
        calc_lots = min_vol
    if calc_lots > max_vol:
        calc_lots = max_vol
        
    return round(calc_lots, 2)

def open_trade(symbol: str, type_str: str, volume: float, sl_price: float, magic: int, sig: dict = None):
    if not _validate_trade_safety(symbol, sl_price):
        return None
    price, filling_bitmask = _get_trade_price_and_stoplevel(symbol, type_str, sl_price)
    if price is None:
        return None
    supported = _get_supported_filling_modes(filling_bitmask, symbol)
    
    order_type = mt5.ORDER_TYPE_BUY if type_str == "BUY" else mt5.ORDER_TYPE_SELL
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol, "volume": float(volume), "type": order_type,
        "price": price, "sl": float(sl_price), "deviation": 20,
        "magic": magic, "comment": "Xiphos Framework", "type_time": mt5.ORDER_TIME_GTC,
    }
    return _execute_order_with_modes(request, supported, symbol, type_str, volume, sl_price, magic, sig)


def modify_sl(ticket: int, symbol: str, new_sl: float):
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        log.warning(f"Attempted to modify SL for unknown ticket {ticket}")
        return None
    position = positions[0]
        
    request = {
        "action": mt5.TRADE_ACTION_SLTP,
        "symbol": symbol,
        "sl": float(new_sl),
        "tp": float(position.tp) if position.tp else 0.0,
        "position": ticket
    }
    
    result = _retry_wrapper(mt5.order_send, request)
    if result:
        from core.database import Execution
        with db.get_session() as session:
            execution = Execution(
                ticket=ticket,
                action="MODIFY_SL",
                details=f"SL moved to {new_sl}"
            )
            session.add(execution)
        return True
    return False
