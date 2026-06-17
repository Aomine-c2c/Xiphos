import os
import yaml
import pytest
from pydantic import ValidationError
from core.config import Settings, load_settings

def test_load_valid_settings(tmp_path):
    valid_yaml = """
    execution:
      mode: "AUTO"
      bridge_host: "127.0.0.1"
      bridge_port: 8000
    trading:
      timeframe: "M30"
      max_risk_trades: 4
      lot_size: 0.01
    magic_numbers:
      scalper: 135001
      runner: 135002
    indicators:
      fast_ema: 13
      medium_ema: 50
      slow_sma: 200
    correlation_groups:
      group_1: ["EURUSD", "GBPUSD"]
      group_2: ["XAUUSD", "XAGUSD"]
    logging:
      level: "INFO"
      rotation: "10 MB"
      retention: "10 days"
    database:
      path: "storage/xiphos.sqlite"
    """
    p = tmp_path / "test_settings.yaml"
    p.write_text(valid_yaml)
    
    settings = load_settings(str(p))
    assert settings.trading.max_risk_trades == 4
    assert settings.magic_numbers.scalper == 135001
    assert "EURUSD" in settings.correlation_groups["group_1"]

def test_load_invalid_settings(tmp_path):
    invalid_yaml = """
    execution:
      mode: "AUTO"
      bridge_host: "127.0.0.1"
      bridge_port: 8000
    trading:
      timeframe: "M30"
      max_risk_trades: "four"  # Invalid type
      lot_size: 0.01
    magic_numbers:
      scalper: 135001
      runner: 135002
    indicators:
      fast_ema: 13
      medium_ema: 50
      slow_sma: 200
    correlation_groups: {}
    logging:
      level: "INFO"
      rotation: "10 MB"
      retention: "10 days"
    database:
      path: "storage/xiphos.sqlite"
    """
    p = tmp_path / "test_invalid_settings.yaml"
    p.write_text(invalid_yaml)
    
    with pytest.raises(ValidationError):
        load_settings(str(p))
