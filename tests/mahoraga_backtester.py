import pytest
import math
from core.mahoraga import AdvancedMahoragaAdapter, AdaptiveParameters

def generate_synthetic_data(regime: str, tick_idx: int) -> dict:
    """Generates synthetic tick data for specific market regimes."""
    # Base normal params
    data = {
        "time": tick_idx * 1800,  # 30 minute ticks
        "close": 100.0,
        "atr_14": 1.0,
        "atr_mean_100": 1.0,
        "adx_14": 20.0,
        "rsi_14": 50.0,
        "bb_upper": 102.0,
        "bb_lower": 98.0
    }
    
    if regime == "NORMAL":
        pass
    elif regime == "HIGH_VOL":
        data["atr_14"] = 2.0  # volatility ratio 2.0
        data["adx_14"] = 30.0 # Trending
        data["rsi_14"] = 80.0 # Overbought
    
    return data

def test_mahoraga_adaptation_trajectory():
    """Mathematically proves Mahoraga adapts to specific volatility regimes."""
    adapter = AdvancedMahoragaAdapter()
    params = AdaptiveParameters()
    symbol = "BTC/USD"
    
    # Phase 1: Normal Regime. Win rate 80%.
    # Expectation: No clicks, no adaptation. fast_ema should stay 13.
    for i in range(5):
        data = generate_synthetic_data("NORMAL", i)
        adapter.evaluate(symbol, data, recent_win_rate=80.0, params=params)
    
    assert params.is_adapted is False
    assert params.adaptation_spins == 0
    assert params.fast_ema == 13
    
    # Phase 2: Black Swan Event (HIGH_VOL). Strategy starts losing (win rate drops to 40%).
    # Wheel needs 4 clicks to adapt. Since we process 1 tick per 1800s, it takes 4 ticks.
    
    # Tick 1 - Click 1
    data = generate_synthetic_data("HIGH_VOL", 5)
    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)
    assert params.adaptation_spins == 1
    assert params.is_adapted is False
    
    # Tick 2 - Click 2
    data = generate_synthetic_data("HIGH_VOL", 6)
    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)
    assert params.adaptation_spins == 2
    
    # Tick 3 - Click 3
    data = generate_synthetic_data("HIGH_VOL", 7)
    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)
    assert params.adaptation_spins == 3
    
    # Tick 4 - Click 4 (FULL ADAPTATION)
    data = generate_synthetic_data("HIGH_VOL", 8)
    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)
    
    # Assert Trajectory State
    assert params.adaptation_spins == 4
    assert params.is_adapted is True
    assert params.phenomenon == "HIGH_VOL_TRENDING_OVERBOUGHT"
    
    # Mathematical proof of parameter scaling
    # target_ema = 13 * (2.0 / 1.0) = 26
    # bounded by max 25.
    assert params.fast_ema == 25
    assert params.sl_multiplier == 0.9  # tight stop
    assert params.lot_multiplier == 1.5 # aggressive counter attack
    assert params.trend_state == "TRENDING"
    assert params.momentum_state == "OVERBOUGHT"
    
    print("Mahoraga Adaptation Trajectory mathematically verified.")
