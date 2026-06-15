import yaml
import os
from pydantic import BaseModel
from typing import List, Dict

class TradingConfig(BaseModel):
    timeframe: str
    max_risk_trades: int
    lot_size: float

class MagicNumbersConfig(BaseModel):
    scalper: int
    runner: int

class IndicatorsConfig(BaseModel):
    fast_ema: int
    medium_ema: int
    slow_sma: int

class LoggingConfig(BaseModel):
    level: str
    rotation: str
    retention: str

class DatabaseConfig(BaseModel):
    path: str

class Settings(BaseModel):
    trading: TradingConfig
    magic_numbers: MagicNumbersConfig
    indicators: IndicatorsConfig
    correlation_groups: Dict[str, List[str]]
    logging: LoggingConfig
    database: DatabaseConfig

def load_settings(path: str = "config/settings.yaml") -> Settings:
    # Get absolute path relative to project root (assuming core/ is 1 level deep)
    if not os.path.isabs(path):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        path = os.path.join(base_dir, path)
        
    with open(path, "r") as f:
        data = yaml.safe_load(f)
    return Settings(**data)

# Singleton instance
settings = load_settings()
