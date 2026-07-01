import collections
import time

ORDER_TYPE_BUY = 0
ORDER_TYPE_SELL = 1
ORDER_TYPE_BUY_LIMIT = 2
ORDER_TYPE_SELL_LIMIT = 3
ORDER_TYPE_BUY_STOP = 4
ORDER_TYPE_SELL_STOP = 5
TRADE_ACTION_DEAL = 1
TRADE_ACTION_PENDING = 5
TRADE_ACTION_SLTP = 6
TRADE_ACTION_REMOVE = 8
ORDER_TIME_GTC = 0
TRADE_RETCODE_DONE = 10009
TIMEFRAME_M30 = 16408

SymbolInfo = collections.namedtuple('SymbolInfo', ['point', 'volume_min'])
TickInfo = collections.namedtuple('TickInfo', ['bid', 'ask'])
PositionInfo = collections.namedtuple('PositionInfo', ['ticket', 'symbol', 'type', 'volume', 'price_open', 'price_current', 'sl', 'tp', 'profit', 'magic'])
OrderInfo = collections.namedtuple('OrderInfo', ['ticket', 'symbol', 'type', 'volume', 'price_open', 'sl', 'tp', 'comment'])
AccountInfo = collections.namedtuple('AccountInfo', ['balance', 'equity', 'margin_free', 'margin_level', 'profit'])
TerminalInfo = collections.namedtuple('TerminalInfo', [])
OrderSendResult = collections.namedtuple('OrderSendResult', ['retcode', 'comment'])

_positions = []
_orders = []

def initialize():
    return True

def copy_rates_from_pos(symbol, timeframe, start_pos, count):
    return []

def symbol_info(symbol):
    return SymbolInfo(point=0.00001, volume_min=0.01)

def symbol_info_tick(symbol):
    return TickInfo(bid=1.0000, ask=1.0001)

def positions_get(ticket=None, symbol=None):
    if ticket:
        return [p for p in _positions if p.ticket == ticket]
    return _positions

def orders_get():
    return _orders

def order_calc_profit(action, symbol, volume, price_open, price_close):
    return 50.0

def order_send(request):
    return OrderSendResult(retcode=TRADE_RETCODE_DONE, comment="Mock execution")

def account_info():
    return AccountInfo(balance=10000.0, equity=10000.0, margin_free=10000.0, margin_level=1000.0, profit=0.0)

def terminal_info():
    return TerminalInfo()
