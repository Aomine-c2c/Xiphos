import yaml
import os
from pydantic import BaseModel
from typing import List, Dict
from core.paths import get_base_dir, ensure_config_exists

class ExecutionConfig(BaseModel):
    mode: str = "AUTO"
    bridge_host: str = "127.0.0.1"
    bridge_port: int = 8000

class TradingConfig(BaseModel):
    timeframe: str
    max_risk_trades: int
    lot_size: float
    risk_percent: float = 1.0

class MagicNumbersConfig(BaseModel):
    scalper: int
    runner: int

class IndicatorsConfig(BaseModel):
    fast_ema: int
    medium_ema: int
    slow_sma: int

class SessionFilterConfig(BaseModel):
    enabled: bool = True
    start_hour: int = 8
    end_hour: int = 16
    exempt_groups: List[str] = []

class LoggingConfig(BaseModel):
    level: str
    rotation: str
    retention: str

class DatabaseConfig(BaseModel):
    path: str
    url: str = os.getenv("DATABASE_URL", "postgresql://postgres:password@127.0.0.1:5432/xiphos")

class Settings(BaseModel):
    execution: ExecutionConfig
    trading: TradingConfig
    magic_numbers: MagicNumbersConfig
    indicators: IndicatorsConfig
    session_filter: SessionFilterConfig
    correlation_groups: Dict[str, List[str]]
    logging: LoggingConfig
    database: DatabaseConfig

def load_settings(path: str = "config/settings.yaml") -> Settings:
    ensure_config_exists()
    
    # Get absolute path relative to project root or AppData
    if not os.path.isabs(path):
        base_dir = get_base_dir()
        path = os.path.join(base_dir, path)
        
    with open(path, "r") as f:
        data = yaml.safe_load(f)
    return Settings(**data)

# Singleton instance
settings = load_settings()
