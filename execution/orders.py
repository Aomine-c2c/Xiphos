import time
import MetaTrader5 as mt5
from core.logger import log
from storage.database import db

MAX_RETRIES = 3
BASE_DELAY = 1.0

def _retry_wrapper(func, *args, **kwargs):
    for attempt in range(MAX_RETRIES):
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

def open_trade(symbol: str, type_str: str, volume: float, sl_price: float, magic: int):
    # HARD SAFETY RULES: Never place naked trades.
    if sl_price is None or sl_price <= 0:
        log.critical(f"BLOCKED: Attempted to place naked trade on {symbol}. Missing SL.")
        return None

    # Check terminal allows algo trading for this script
    terminal = mt5.terminal_info()
    if terminal and not terminal.trade_allowed:
        log.critical("BLOCKED: MT5 terminal has algo trading DISABLED. Enable: Tools > Options > Expert Advisors > Allow Automated Trading.")
        return None

    order_type = mt5.ORDER_TYPE_BUY if type_str == "BUY" else mt5.ORDER_TYPE_SELL

    # Ensure symbol is subscribed and available for trading
    if not mt5.symbol_select(symbol, True):
        log.warning(f"symbol_select failed for {symbol}. MT5 error: {mt5.last_error()}")

    # Get current price
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        log.error(f"Could not get tick for {symbol}. MT5 error: {mt5.last_error()}")
        return None

    price = tick.ask if type_str == "BUY" else tick.bid

    # Determine supported filling modes from broker's symbol info (bitmask)
    # Bit 1 = FOK, Bit 2 = IOC, Bit 4 = RETURN
    sym_info = mt5.symbol_info(symbol)
    if sym_info is None:
        log.error(f"Could not get symbol_info for {symbol}.")
        return None
    filling_bitmask = sym_info.filling_mode

    # Build list of only the modes this broker+symbol actually supports
    all_modes = [
        (mt5.ORDER_FILLING_FOK,    "FOK",    1),
        (mt5.ORDER_FILLING_IOC,    "IOC",    2),
        (mt5.ORDER_FILLING_RETURN, "RETURN", 4),
    ]
    supported = [(mode, name) for mode, name, bit in all_modes if filling_bitmask & bit]

    if not supported:
        log.warning(f"No supported filling modes found for {symbol} (bitmask={filling_bitmask}). Trying all as fallback.")
        supported = [(mode, name) for mode, name, _ in all_modes]

    for filling_mode, filling_name in supported:
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": float(volume),
            "type": order_type,
            "price": price,
            "sl": float(sl_price),
            "deviation": 20,
            "magic": magic,
            "comment": "Xiphos Framework",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": filling_mode,
        }

        # Pre-validate with order_check.
        # NOTE: order_check uses retcode=0 for success (not TRADE_RETCODE_DONE/10009)
        check = mt5.order_check(request)
        if check is None:
            log.debug(f"order_check returned None for {symbol} [{filling_name}] — proceeding anyway.")
        elif check.retcode != 0:
            log.warning(f"order_check REJECTED [{filling_name}] {symbol}: retcode={check.retcode} | {check.comment}")
            continue
        else:
            log.debug(f"order_check OK [{filling_name}] {symbol}: retcode=0")

        log.info(f"Sending {type_str} order for {symbol} | Vol: {volume} | SL: {sl_price} | Filling: {filling_name}")

        result = _retry_wrapper(mt5.order_send, request)

        if result:
            with db.get_connection() as conn:
                conn.execute("""
                    INSERT INTO executions (ticket, action, details)
                    VALUES (?, ?, ?)
                """, (result.order, "OPEN", f"{type_str} {symbol} at {result.price} (SL: {sl_price})"))
            log.info(f"Trade successfully opened! Ticket: {result.order} | Filling: {filling_name}")
            return result
        else:
            err = mt5.last_error()
            log.warning(f"order_send failed [{filling_name}] {symbol}. MT5 error: {err}.")

    log.critical(f"FATAL: All filling modes failed for {type_str} {symbol}. Giving up.")
    return None


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
        with db.get_connection() as conn:
            conn.execute("""
                INSERT INTO executions (ticket, action, details)
                VALUES (?, ?, ?)
            """, (ticket, "MODIFY_SL", f"SL moved to {new_sl}"))
        return True
    return False
