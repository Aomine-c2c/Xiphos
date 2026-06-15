import MetaTrader5 as mt5
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import uvicorn
import argparse

app = FastAPI(title="Xiphos MT5 Bridge")

def success(data=None):
    return {"error": None, "data": data}

def error(msg):
    return {"error": msg, "data": None}

@app.get("/api/initialize")
def initialize():
    if not mt5.initialize():
        return error(f"MT5 Init Failed: {mt5.last_error()}")
    return success(True)

@app.get("/api/shutdown")
def shutdown():
    mt5.shutdown()
    return success(True)

@app.get("/api/account_info")
def account_info():
    info = mt5.account_info()
    return success(info._asdict() if info else None)

@app.post("/api/symbol_select")
async def symbol_select(req: Request):
    data = await req.json()
    res = mt5.symbol_select(data["symbol"], data.get("enable", True))
    return success(res)

@app.get("/api/symbol_info")
def symbol_info(symbol: str):
    info = mt5.symbol_info(symbol)
    return success(info._asdict() if info else None)

@app.get("/api/symbol_info_tick")
def symbol_info_tick(symbol: str):
    tick = mt5.symbol_info_tick(symbol)
    return success(tick._asdict() if tick else None)

@app.get("/api/copy_rates_from_pos")
def copy_rates_from_pos(symbol: str, timeframe: int, start_pos: int, count: int):
    rates = mt5.copy_rates_from_pos(symbol, timeframe, start_pos, count)
    if rates is None:
        return success([])
    # Convert numpy structured array to list of dicts
    return success([dict(zip(rates.dtype.names, r)) for r in rates])

@app.get("/api/positions_get")
def positions_get(ticket: int = None):
    if ticket is not None:
        pos = mt5.positions_get(ticket=ticket)
    else:
        pos = mt5.positions_get()
    
    if pos is None:
        return success([])
    return success([p._asdict() for p in pos])

@app.get("/api/history_deals_get")
def history_deals_get(position: int = None):
    if position is not None:
        deals = mt5.history_deals_get(position=position)
    else:
        # Avoid huge data dumps if no position specified, but API requires it usually
        return success([])
        
    if deals is None:
        return success([])
    return success([d._asdict() for d in deals])

@app.post("/api/order_send")
async def order_send(req: Request):
    data = await req.json()
    res = mt5.order_send(data)
    if res is None:
        return error(str(mt5.last_error()))
    return success(res._asdict())

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()
    
    uvicorn.run(app, host=args.host, port=args.port)
