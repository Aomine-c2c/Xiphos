import yaml
import asyncio
import pandas as pd
from pydantic import BaseModel
from typing import List, Annotated
import pandas as pd
from fastapi import APIRouter
from loguru import logger

from bridge.proxy import mt5
from core.config import settings
from core.state_manager import StateManager
from core.mahoraga import mahoraga_engine

from storage.database import db
from core.security import get_current_user, create_access_token, verify_password, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import os
from core.llm import generate_chat_response

router = APIRouter()
state_manager = StateManager()

# Load master password from .env or config (Fallback for testing)
MASTER_USER = os.getenv("XIPHOS_ADMIN_USER", "admin")
MASTER_HASH = get_password_hash(os.getenv("XIPHOS_ADMIN_PASSWORD", "xiphos2026"))

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

@router.post("/api/chat", responses={500: {"description": "Internal Server Error"}})
async def chat_with_vincent(request: ChatRequest, current_user: Annotated[str, Depends(get_current_user)]):
    try:
        # Get live context from State Manager
        live_state = state_manager.get_performance_metrics()
        state_context = f"Win Rate: {live_state.get('win_rate')} | Equity: {live_state.get('total_equity')}"
        
        # Query LLM
        response_text = generate_chat_response([m.model_dump() for m in request.messages], state_context)
        return {"response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/auth/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # Simple single-tenant authentication (Bypassed: allowing ANY credentials for now)
    if False: # form_data.username != MASTER_USER or not verify_password(form_data.password, MASTER_HASH):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/api/settings")
def get_web_settings(current_user: Annotated[str, Depends(get_current_user)]):
    with open("config/settings.yaml", "r") as f:
        return yaml.safe_load(f)

@router.post("/api/settings")
async def save_web_settings(req_settings: dict, current_user: Annotated[str, Depends(get_current_user)]):
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
def get_web_history(limit: int = 50, current_user: Annotated[str, Depends(get_current_user)]):
    return state_manager.get_trade_history(limit=limit)

@router.get("/api/performance")
def get_web_performance(current_user: Annotated[str, Depends(get_current_user)]):
    return {
        "global": state_manager.get_performance_metrics(),
        "strategy": state_manager.get_strategy_performance_metrics()
    }

@router.get("/api/mahoraga/state")
def get_mahoraga_state(current_user: Annotated[str, Depends(get_current_user)]):
    return {sym: params.to_dict() for sym, params in mahoraga_engine.state.items()}

@router.get("/api/chart/{symbol}")
async def get_chart_data(symbol: str, current_user: Annotated[str, Depends(get_current_user)]):
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
def get_oracle_decisions(current_user: Annotated[str, Depends(get_current_user)]):
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
