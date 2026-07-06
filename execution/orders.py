import time

from bridge.proxy import mt5

from execution.connection import mt5_conn

from execution.retry import retry_mt5_call

from core.logger import log as logger







MAX_RETRIES = 3



BASE_DELAY = 2.0







def _validate_trade_safety(symbol, sl_price):

    try:

        info = mt5.symbol_info(symbol)

    except Exception as e:

        logger.error(f"MT5 IPC Error fetching symbol_info for {symbol}: {e}")

        return False



    if not info:

        logger.warning(f"Symbol info unavailable for {symbol}")

        return False



    point = info.point or 0.00001

    stop_level = info.trade_stops_level * point if info.trade_stops_level else 0.0

    dist = abs(info.ask - sl_price) if sl_price < info.ask else abs(info.bid - sl_price)



    if stop_level and dist < stop_level:

        logger.warning(f"SL for {symbol} violates stop level ({stop_level}).")

        return False



    return True







def _get_supported_filling_modes(filling_bitmask: int, symbol: str):

    by_bit = {

        1: [mt5.ORDER_FILLING_FOK],

        2: [mt5.ORDER_FILLING_IOC],

        3: [mt5.ORDER_FILLING_FOK, mt5.ORDER_FILLING_IOC],

    }



    support = by_bit.get(filling_bitmask, [mt5.ORDER_FILLING_FOK, mt5.ORDER_FILLING_IOC])



    if mt5.ORDER_FILLING_RETURN in dir(mt5):

        support += [mt5.ORDER_FILLING_RETURN]



    return [(mode, f"bitmask {filling_bitmask}") for mode in support]







def _get_trade_price_and_stoplevel(symbol, type_str, sl_price):

    info = mt5.symbol_info(symbol)

    if not info:

        logger.warning(f"Market data unavailable for {symbol}")

        return None, 0



    price = info.ask if type_str == "BUY" else info.bid

    return price, info.trade_filling_mode







def _record_trade_in_db(result, symbol, type_str, volume, sl_price, magic, sig, latency_ms):

    from core.database import db

    from core.database import Trade, Execution



    sma_200 = float(sig['ind_data']['sma_slow']) if sig and 'ind_data' in sig else 0.0

    fast_ema = float(sig['ind_data']['ema_fast']) if sig and 'ind_data' in sig else 0.0

    medium_ema = float(sig['ind_data']['ema_medium']) if sig and 'ind_data' in sig else 0.0

    dist_sma = float(sig.get('distance', 0.0)) if sig else 0.0

    proj_risk = float(sig.get('projected_risk', 0.0)) if sig else 0.0



    with db.get_session() as session:

        execution = Execution(

            ticket=result.order,

            action="OPEN",

            details=f"{type_str} {symbol} at {result.price} (SL: {sl_price})"

        )

        session.add(execution)

        

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

        result = retry_mt5_call(mt5.order_send, request=request)

        latency_ms = (time.perf_counter() - start_time) * 1000



        if result:

            _record_trade_in_db(result, symbol, type_str, volume, sl_price, magic, sig, latency_ms)

            log.info(f"Trade successfully opened! Ticket: {result.order} (Latency: {latency_ms:.2f}ms)")

            return result



    return None







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

    result = retry_mt5_call(mt5.order_send, request=request)

    if result:

        from core.database import db, Execution

        with db.get_session() as session:

            execution = Execution(

                ticket=ticket,

                action="MODIFY_SL",

                details=f"SL moved to {new_sl}"

            )

            session.add(execution)

        return True



    return False


