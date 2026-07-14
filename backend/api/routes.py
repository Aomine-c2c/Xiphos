import yaml

import asyncio

from pydantic import BaseModel

from typing import List

from fastapi import APIRouter, HTTPException

from loguru import logger



from bridge.proxy import mt5

from core.config import settings

from core.state_manager import StateManager

from core.mahoraga import mahoraga_engine

from storage.database import db

from core.llm import generate_chat_response

router = APIRouter()
state_manager = StateManager()
redis_client = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]


@router.post("/api/chat", responses={500: {"description": "Internal Server Error"}})
async def chat_with_vincent(request: ChatRequest):
    try:
        live_state = state_manager.get_performance_metrics()
        state_context = f"Win Rate: {live_state.get('win_rate')} | Equity: {live_state.get('total_equity')}"
        response_text = generate_chat_response([m.model_dump() for m in request.messages], state_context)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


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
    if "trading" in req_settings:
        settings.trading.max_risk_trades = int(req_settings["trading"].get("max_risk_trades", settings.trading.max_risk_trades))
        settings.trading.lot_size = float(req_settings["trading"].get("lot_size", settings.trading.lot_size))
    logger.info("Configuration updated dynamically via Web settings API.")
    return {"status": "success"}


@router.get("/api/state")
def get_system_state():
    global redis_client
    if redis_client is None:
        from core.redis_client import RedisClient
        redis_client = RedisClient()
    try:
        state = redis_client.get_state()
    except Exception:
        state = None
    if not state:
        return {"bot_running": False, "mt5_connected": False, "account": None}
    return state


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


TIMEFRAME_MAP = {
    "M5": mt5.TIMEFRAME_M5,
    "M15": mt5.TIMEFRAME_M15,
    "M30": mt5.TIMEFRAME_M30,
    "H1": mt5.TIMEFRAME_H1,
    "H4": mt5.TIMEFRAME_H4,
}


@router.get("/api/chart/{symbol}")
async def get_chart_data(symbol: str, timeframe: str = "M30"):
    import polars as pl
    tf = TIMEFRAME_MAP.get(timeframe.upper(), mt5.TIMEFRAME_M30)
    rates = mt5.copy_rates_from_pos(symbol, tf, 0, 250)
    if rates is None or len(rates) == 0:
        return {"error": "No data found for symbol", "data": []}
    df = pl.DataFrame(rates)
    df = df.with_columns([
        pl.col("close").ewm_mean(span=13, adjust=False).alias("ema_fast"),
        pl.col("close").ewm_mean(span=50, adjust=False).alias("ema_medium"),
        pl.col("close").rolling_mean(window_size=200).alias("sma_slow")
    ])
    df = df.with_columns([
        pl.col("ema_fast").fill_null(strategy="forward").fill_null(strategy="backward"),
        pl.col("ema_medium").fill_null(strategy="forward").fill_null(strategy="backward"),
        pl.col("sma_slow").fill_null(strategy="forward").fill_null(strategy="backward")
    ])
    df = df.select(["time", "open", "high", "low", "close", "ema_fast", "ema_medium", "sma_slow"])
    candles = df.to_dicts()
    return {"symbol": symbol, "data": candles}


@router.get("/api/oracle/decisions")
def get_oracle_decisions():
    from core.database import OracleDecision
    decisions = []
    try:
        with db.get_session() as session:
            rows = session.query(OracleDecision).order_by(OracleDecision.timestamp.desc()).limit(50).all()
            for row in rows:
                decisions.append({
                    "id": f"DEC-{row.id}",
                    "query": row.query_text,
                    "type": row.decision_type,
                    "timestamp": row.timestamp.isoformat() if row.timestamp else None,
                    "dataCore": {
                        "event": row.data_core_event,
                        "details": row.data_core_details
                    },
                    "mahoraga": {
                        "reasoning": row.mahoraga_reasoning,
                        "adjustment": row.mahoraga_adjustment
                    },
                    "riskGuardian": {
                        "check": row.risk_check,
                        "status": row.risk_status,
                        "details": row.risk_details
                    },
                    "xiphos": {
                        "action": row.xiphos_action,
                        "latency": row.xiphos_latency
                    }
                })
    except Exception as e:
        logger.error(f"Failed to fetch oracle decisions: {e}")
    return decisions
