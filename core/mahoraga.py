from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from core.logger import log

class AdaptiveParameters:
    def __init__(self):
        # MAs
        self.fast_ema = 13
        self.medium_ema = 50
        self.slow_sma = 200
        
        # Risk & Volume
        self.lot_multiplier = 1.0
        self.sl_multiplier = 1.0
        
        # Filters
        self.filter_strictness = "NORMAL"
        self.trend_state = "UNKNOWN"
        self.momentum_state = "NEUTRAL"
        self.confidence_score = 50.0
        
        # Mahoraga Technique
        self.adaptation_spins = 0
        self._last_state_hash = ""
        self.adapter_source = "DEFAULT"

    def to_dict(self):
        return {
            "fast_ema": self.fast_ema,
            "medium_ema": self.medium_ema,
            "slow_sma": self.slow_sma,
            "lot_multiplier": self.lot_multiplier,
            "sl_multiplier": self.sl_multiplier,
            "filter_strictness": self.filter_strictness,
            "trend_state": self.trend_state,
            "momentum_state": self.momentum_state,
            "confidence_score": self.confidence_score,
            "adaptation_spins": self.adaptation_spins,
            "adapter_source": self.adapter_source
        }

class AdaptationStrategy(ABC):
    """Base interface for Mahoraga Adaptation Strategies."""
    @abstractmethod
    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float, params: AdaptiveParameters):
        pass

class AlgorithmicAdapter(AdaptationStrategy):
    """Legacy rules-based algorithm for Mahoraga adaptation."""
    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float, params: AdaptiveParameters):
        if not ind_data or "atr_14" not in ind_data or "atr_mean_100" not in ind_data:
            return

        atr = ind_data["atr_14"]
        atr_mean = ind_data["atr_mean_100"]
        if atr_mean <= 0:
            return
            
        volatility_ratio = atr / atr_mean
        
        adx = ind_data.get("adx_14", 0)
        rsi = ind_data.get("rsi_14", 50)
        bb_upper = ind_data.get("bb_upper", 0)
        bb_lower = ind_data.get("bb_lower", 0)
        close_price = ind_data.get("close", 1)

        # Momentum State
        if rsi > 70:
            params.momentum_state = "OVERBOUGHT"
        elif rsi < 30:
            params.momentum_state = "OVERSOLD"
        else:
            params.momentum_state = "NEUTRAL"

        # Trend State and Filter Strictness
        if adx < 25 and adx > 0:
            params.trend_state = "RANGING"
            params.filter_strictness = "EXTREME_STRICT"
            params.fast_ema = 13
        else:
            params.trend_state = "TRENDING"
            if volatility_ratio > 1.5:
                params.fast_ema = 17
                params.filter_strictness = "STRICT"
            elif volatility_ratio < 0.7:
                params.fast_ema = 9
                params.filter_strictness = "RELAXED"
            else:
                params.fast_ema = 13
                params.filter_strictness = "NORMAL"
        
        # Bollinger Band Squeeze
        band_width = (bb_upper - bb_lower) / close_price if close_price > 0 else 0
        if band_width > 0 and band_width < 0.002:
            params.trend_state = "SQUEEZE"
            params.filter_strictness = "RELAXED"
            
        # Adapt SL Margin
        params.sl_multiplier = min(max(volatility_ratio, 0.8), 1.5)

        # Adapt Lot Sizing
        if recent_win_rate > 60.0:
            params.lot_multiplier = 1.5
        elif recent_win_rate < 40.0:
            params.lot_multiplier = 0.5
        else:
            params.lot_multiplier = 1.0

        # Confidence Score
        vol_penalty = abs(1.0 - volatility_ratio) * 20
        win_bonus = (recent_win_rate - 50.0) * 0.5
        confidence = 50.0 - vol_penalty + win_bonus
        params.confidence_score = min(max(confidence, 0.0), 100.0)
        params.adapter_source = "ALGORITHMIC"

class MLAdapter(AdaptationStrategy):
    """Placeholder for the upcoming neural network adapter."""
    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float, params: AdaptiveParameters):
        # TODO: Implement Tensor inference for parameter prediction
        pass

class MahoragaAdaptationEngine:
    def __init__(self):
        self.state: Dict[str, AdaptiveParameters] = {}
        self.strategies: list[AdaptationStrategy] = [AlgorithmicAdapter()] # Will support ML Adapter later

    def get_parameters(self, symbol: str) -> AdaptiveParameters:
        if symbol not in self.state:
            self.state[symbol] = AdaptiveParameters()
        return self.state[symbol]

    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float):
        params = self.get_parameters(symbol)
        
        for strategy in self.strategies:
            strategy.evaluate(symbol, ind_data, recent_win_rate, params)

        # Mahoraga Wheel Spin Logic
        current_state_hash = f"{params.trend_state}_{params.momentum_state}_{params.filter_strictness}_{params.lot_multiplier:.1f}_{params.sl_multiplier:.1f}_{params.fast_ema}_{params.adapter_source}"
        if params._last_state_hash and params._last_state_hash != current_state_hash:
            params.adaptation_spins += 1
            log.info(f"[Mahoraga] {symbol} Wheel Clicked! Spin #{params.adaptation_spins} for {current_state_hash}")
        params._last_state_hash = current_state_hash

mahoraga_engine = MahoragaAdaptationEngine()
