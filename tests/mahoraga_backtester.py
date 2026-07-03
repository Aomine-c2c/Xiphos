import pytest

import math

from core.mahoraga import AdvancedMahoragaAdapter, AdaptiveParameters



def generate_synthetic_data(regime: str, tick_idx: int) -> dict:

    """Generates synthetic tick data for specific market regimes."""

    

    data = {

        "time": tick_idx * 1800,  

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

        data["atr_14"] = 2.0  

        data["adx_14"] = 30.0 

        data["rsi_14"] = 80.0 

    

    return data



def test_mahoraga_adaptation_trajectory():

    """Mathematically proves Mahoraga adapts to specific volatility regimes."""

    adapter = AdvancedMahoragaAdapter()

    params = AdaptiveParameters()

    symbol = "BTC/USD"

    

    

    

    for i in range(5):

        data = generate_synthetic_data("NORMAL", i)

        adapter.evaluate(symbol, data, recent_win_rate=80.0, params=params)

    

    assert params.is_adapted is False

    assert params.adaptation_spins == 0

    assert params.fast_ema == 13

    

    

    

    

    

    data = generate_synthetic_data("HIGH_VOL", 5)

    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)

    assert params.adaptation_spins == 1

    assert params.is_adapted is False

    

    

    data = generate_synthetic_data("HIGH_VOL", 6)

    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)

    assert params.adaptation_spins == 2

    

    

    data = generate_synthetic_data("HIGH_VOL", 7)

    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)

    assert params.adaptation_spins == 3

    

    

    data = generate_synthetic_data("HIGH_VOL", 8)

    adapter.evaluate(symbol, data, recent_win_rate=40.0, params=params)

    

    

    assert params.adaptation_spins == 4

    assert params.is_adapted is True

    assert params.phenomenon == "HIGH_VOL_TRENDING_OVERBOUGHT"

    

    

    

    

    assert params.fast_ema == 25

    assert params.sl_multiplier == 0.9  

    assert params.lot_multiplier == 1.5 

    assert params.trend_state == "TRENDING"

    assert params.momentum_state == "OVERBOUGHT"

    

    print("Mahoraga Adaptation Trajectory mathematically verified.")

