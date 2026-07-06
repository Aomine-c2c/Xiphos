from execution.retry import retry_mt5_call

import MetaTrader5 as mt5

from core.logger import log as logger



def execute_market_order(symbol, order_type, volume, sl_price, magic):

    type_mt5 = mt5.ORDER_TYPE_BUY if order_type == "BUY" else mt5.ORDER_TYPE_SELL

    price = mt5.symbol_info_tick(symbol).ask if order_type == "BUY" else mt5.symbol_info_tick(symbol).bid

    

    request = {

        "action": mt5.TRADE_ACTION_DEAL,

        "symbol": str(symbol),

        "volume": float(volume),

        "type": int(type_mt5),

        "price": float(price),

        "sl": float(sl_price),

        "deviation": 20,

        "magic": int(magic),

        "comment": "M30 Framework Bot",

    }

    

    return retry_mt5_call(mt5.order_send, request=request)



def modify_sl(ticket, symbol, new_sl):

    positions = mt5.positions_get(ticket=ticket)

    if not positions:

        return None

    position = positions[0]

        

    request = {

        "action": mt5.TRADE_ACTION_SLTP,

        "symbol": str(symbol),

        "sl": float(new_sl),

        "tp": float(position.tp) if position.tp else 0.0,

        "position": int(ticket)

    }

        

    return retry_mt5_call(mt5.order_send, request=request)



def get_open_positions():

    return mt5.positions_get()

