import requests
from types import SimpleNamespace
from core.config import settings

BASE_URL = f"http://{settings.execution.bridge_host}:{settings.execution.bridge_port}/api"

# MT5 Constants
TRADE_RETCODE_DONE = 10009
ORDER_TYPE_BUY = 0
ORDER_TYPE_SELL = 1
TRADE_ACTION_DEAL = 1
TRADE_ACTION_SLTP = 6
ORDER_TIME_GTC = 0
ORDER_FILLING_IOC = 1
DEAL_ENTRY_OUT = 1
TIMEFRAME_M30 = 30

_last_error = (0, "Success")

def _request(endpoint, method="GET", data=None, params=None):
    global _last_error
    url = f"{BASE_URL}/{endpoint}"
    try:
        if method == "GET":
            r = requests.get(url, params=params, timeout=5)
        else:
            r = requests.post(url, json=data, timeout=5)
            
        r.raise_for_status()
        res = r.json()
        
        if res.get("error"):
            _last_error = (1, res["error"])
            return None
            
        _last_error = (0, "Success")
        return res.get("data")
    except Exception as e:
        _last_error = (-1, str(e))
        return None

def initialize():
    return _request("initialize") is not None

def last_error():
    return _last_error

def shutdown():
    _request("shutdown")

def account_info():
    data = _request("account_info")
    return SimpleNamespace(**data) if data else None

def symbol_select(symbol, enable=True):
    return _request("symbol_select", method="POST", data={"symbol": symbol, "enable": enable})

def symbol_info(symbol):
    data = _request("symbol_info", params={"symbol": symbol})
    return SimpleNamespace(**data) if data else None

def symbol_info_tick(symbol):
    data = _request("symbol_info_tick", params={"symbol": symbol})
    return SimpleNamespace(**data) if data else None

def copy_rates_from_pos(symbol, timeframe, start_pos, count):
    data = _request("copy_rates_from_pos", params={
        "symbol": symbol,
        "timeframe": timeframe,
        "start_pos": start_pos,
        "count": count
    })
    return data # List of dicts, pandas can handle this

def positions_get(ticket=None):
    data = _request("positions_get", params={"ticket": ticket} if ticket else {})
    if data is None:
        return None
    return [SimpleNamespace(**p) for p in data]

def history_deals_get(position=None):
    data = _request("history_deals_get", params={"position": position} if position else {})
    if data is None:
        return None
    return [SimpleNamespace(**d) for d in data]

def order_send(request):
    data = _request("order_send", method="POST", data=request)
    if data is None:
        return None
    return SimpleNamespace(**data)
