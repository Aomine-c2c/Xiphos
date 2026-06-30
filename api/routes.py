import yaml
import asyncio
import pandas as pd
from fastapi import APIRouter
from loguru import logger

from bridge.proxy import mt5
from core.config import settings
from core.state_manager import StateManager
from core.mahoraga import mahoraga_engine

from core.state_manager import StateManager
from core.mahoraga import mahoraga_engine
from storage.database import db

router = APIRouter()
state_manager = StateManager()

@router.get("/api/settings")
def get_web_settings():
    with open("config/settings.yaml", "r") as f:
        return yaml.safe_load(f)

@router.post("/api/settings")
async def save_web_settings(req_settings: dict):
    def _write_yaml():
        with open("config/settings.yaml", "w") as f:
            yaml.dump(req_settings, f)
    await asyncio.to_thread(_write_yaml)
    # Update running config dynamically
    if "trading" in req_settings:
        settings.trading.max_risk_trades = int(req_settings["trading"].get("max_risk_trades", settings.trading.max_risk_trades))
        settings.trading.lot_size = float(req_settings["trading"].get("lot_size", settings.trading.lot_size))
    logger.info("Configuration updated dynamically via Web settings API.")
    return {"status": "success"}

@router.get("/api/history")
def get_web_history(limit: int = 50):
    return state_manager.get_trade_history(limit=limit)

@router.get("/api/performance")
def get_web_performance():
    return {
        "global": state_manager.get_performance_metrics(),
        "strategy": state_manager.get_strategy_performance_metrics()
    }

@router.get("/api/mahoraga/state")
def get_mahoraga_state():
    return {sym: params.to_dict() for sym, params in mahoraga_engine.state.items()}

@router.get("/api/chart/{symbol}")
async def get_chart_data(symbol: str):
    # Fetch 250 M30 candles
    rates = mt5.copy_rates_from_pos(symbol, mt5.TIMEFRAME_M30, 0, 250)
    if rates is None or len(rates) == 0:
        return {"error": "No data found for symbol"}
        
    df = pd.DataFrame(rates)
    df['time'] = pd.to_datetime(df['time'], unit='s')
    
    # Calculate MAs
    df['ema_fast'] = df['close'].ewm(span=13, adjust=False).mean()
    df['ema_medium'] = df['close'].ewm(span=50, adjust=False).mean()
    df['sma_slow'] = df['close'].rolling(window=200).mean()
    
    df.fillna(0, inplace=True)
    
    # Convert to TradingView format
    candles = []
    for _, row in df.iterrows():
        unix_time = int(row['time'].timestamp())
        candles.append({
            "time": unix_time,
            "open": row['open'],
            "high": row['high'],
            "low": row['low'],
            "close": row['close'],
            "ema_fast": row['ema_fast'],
            "ema_medium": row['ema_medium'],
            "sma_slow": row['sma_slow']
        })
        
    return {"symbol": symbol, "data": candles}

@router.get("/api/oracle/decisions")
def get_oracle_decisions():
    decisions = []
    try:
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM oracle_decisions ORDER BY timestamp DESC LIMIT 50")
            rows = cursor.fetchall()
            for row in rows:
                decisions.append({
                    "id": f"DEC-{row['id']}",
                    "query": row["query_text"],
                    "type": row["decision_type"],
                    "timestamp": row["timestamp"],
                    "dataCore": {
                        "event": row["data_core_event"],
                        "details": row["data_core_details"]
                    },
                    "mahoraga": {
                        "reasoning": row["mahoraga_reasoning"],
                        "adjustment": row["mahoraga_adjustment"]
                    },
                    "riskGuardian": {
                        "check": row["risk_check"],
                        "status": row["risk_status"],
                        "details": row["risk_details"]
                    },
                    "xiphos": {
                        "action": row["xiphos_action"],
                        "latency": row["xiphos_latency"]
                    }
                })
    except Exception as e:
        logger.error(f"Failed to fetch oracle decisions: {e}")
        
    return decisions
