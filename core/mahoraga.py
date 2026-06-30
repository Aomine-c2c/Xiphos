from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
from loguru import logger as log
from core.oracle import oracle_engine
from core.llm import evaluate_adaptation

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
        self.phenomenon = "UNKNOWN"
        self.is_adapted = False
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
            "phenomenon": self.phenomenon,
            "is_adapted": self.is_adapted,
            "adaptation_spins": self.adaptation_spins,
            "adapter_source": self.adapter_source
        }

class AdaptationStrategy(ABC):
    """Base interface for Mahoraga Adaptation Strategies."""
    @abstractmethod
    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float, params: AdaptiveParameters):
        pass

class AdvancedMahoragaAdapter(AdaptationStrategy):
    """The true Mahoraga Technique implementation: Wheel Clicks, Memory, and Full Adaptation."""
    
    def __init__(self):
        # Memory matrix: phenomenon_string -> adaptation_level (int)
        # 4 clicks = Fully Adapted
        self.memory_matrix: Dict[str, int] = {}
        self.clicks_for_adaptation = 4

    def _determine_phenomenon(self, volatility_ratio: float, adx: float, rsi: float) -> str:
        vol_tag = "LOW_VOL"
        if volatility_ratio > 1.5:
            vol_tag = "HIGH_VOL"
        elif volatility_ratio > 0.8:
            vol_tag = "MED_VOL"
            
        trend_tag = "RANGING"
        if adx > 25:
            trend_tag = "TRENDING"
            
        mom_tag = "NEUTRAL"
        if rsi > 70:
            mom_tag = "OVERBOUGHT"
        elif rsi < 30:
            mom_tag = "OVERSOLD"
            
        return f"{vol_tag}_{trend_tag}_{mom_tag}"

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

        # 1. Determine Phenomenon (Regime)
        current_phenomenon = self._determine_phenomenon(volatility_ratio, adx, rsi)
        params.phenomenon = current_phenomenon
        
        # Initialize memory if unseen
        if current_phenomenon not in self.memory_matrix:
            self.memory_matrix[current_phenomenon] = 0
            
        # 2. Wheel Clicks (Taking Damage / Adapting)
        # If win rate is below 75%, we take "damage" and the wheel spins/clicks for this regime
        if recent_win_rate < 75.0 and self.memory_matrix[current_phenomenon] < self.clicks_for_adaptation:
            # Hash to limit spins to 1 per actual evaluation tick rather than spamming
            tick_hash = f"{int(ind_data.get('time', 0) / 1800)}" # Use M30 candle time roughly
            if params._last_state_hash != tick_hash:
                self.memory_matrix[current_phenomenon] += 1
                params.adaptation_spins += 1
                params._last_state_hash = tick_hash
                log.info(f"[Mahoraga] {symbol} took damage! Wheel clicks to {self.memory_matrix[current_phenomenon]}/{self.clicks_for_adaptation} in {current_phenomenon}")
                
        # LLM Adaptation Hook
        llm_decision = evaluate_adaptation(symbol, ind_data, params.lot_multiplier, params.sl_multiplier)
        
        # Merge LLM insight with baseline wheel mechanics
        if llm_decision.should_adapt or self.memory_matrix[current_phenomenon] >= self.clicks_for_adaptation:
            params.is_adapted = True
            
            # Use LLM values if provided logically, else fallback to standard scaling
            if llm_decision.should_adapt:
                params.lot_multiplier = llm_decision.new_lot_multiplier
                params.sl_multiplier = llm_decision.new_sl_multiplier
                log.info(f"LLM Adapted {symbol}: Lot {params.lot_multiplier}, SL {params.sl_multiplier}")
                reasoning = llm_decision.reasoning
            else:
                params.lot_multiplier = min(3.0, params.lot_multiplier * 1.5)
                params.sl_multiplier = min(2.0, params.sl_multiplier * 1.2)
                reasoning = f"Hard-click Adaptation Reached."

            params.filter_strictness = "DYNAMIC"
            params.adaptation_spins = self.memory_matrix[current_phenomenon]
            
            oracle_engine.record_adaptation(
                symbol=symbol,
                phenomenon=f"{current_phenomenon} + LLM Insight",
                spins=params.adaptation_spins,
                old_lot=params.lot_multiplier / 1.5 if not llm_decision.should_adapt else params.lot_multiplier,
                new_lot=params.lot_multiplier,
                exec_time_ms=0.0
            )


        # 4. State Application
        params.trend_state = "TRENDING" if adx > 25 else "RANGING"
        if rsi > 70: params.momentum_state = "OVERBOUGHT"
        elif rsi < 30: params.momentum_state = "OVERSOLD"
        else: params.momentum_state = "NEUTRAL"
        
        band_width = (bb_upper - bb_lower) / close_price if close_price > 0 else 0
        if band_width > 0 and band_width < 0.002:
            params.trend_state = "SQUEEZE"

        if params.is_adapted:
            # === FULLY ADAPTED STATE (The Counter-Attack) ===
            params.filter_strictness = "NORMAL" # Adapted to see through noise
            
            # Dynamic continuous trigger expansion (baseline 13)
            # Volatility ratio stretches the EMA to filter noise exactly.
            target_ema = int(13 * volatility_ratio)
            # Fully adapted state narrows the bounds slightly for extreme precision
            params.fast_ema = max(7, min(target_ema, 25)) 
            
            params.sl_multiplier = 0.9 # Optimized tighter stops, as we know the exact regime
            params.lot_multiplier = 1.5 # Aggressive counter-attack
            params.confidence_score = 95.0
            params.adapter_source = "MAHORAGA_ADAPTED"
        else:
            # === SUBOPTIMAL LEARNING STATE ===
            if params.trend_state == "RANGING":
                params.filter_strictness = "EXTREME_STRICT"
            elif params.trend_state == "SQUEEZE":
                params.filter_strictness = "RELAXED"
            else:
                if volatility_ratio > 1.5:
                    params.filter_strictness = "STRICT"
                elif volatility_ratio < 0.7:
                    params.filter_strictness = "RELAXED"
                else:
                    params.filter_strictness = "NORMAL"
            
            # Dynamic learning EMA (wilder bounds because it hasn't adapted)
            target_ema = int(13 * volatility_ratio)
            params.fast_ema = max(5, min(target_ema, 35))
            
            params.sl_multiplier = min(max(volatility_ratio, 0.8), 1.5)
            params.lot_multiplier = 0.5 # Defensive posture while learning
            
            vol_penalty = abs(1.0 - volatility_ratio) * 20
            win_bonus = (recent_win_rate - 50.0) * 0.5
            confidence = 50.0 - vol_penalty + win_bonus
            params.confidence_score = min(max(confidence, 0.0), 100.0)
            params.adapter_source = "LEARNING"

class MahoragaAdaptationEngine:
    def __init__(self):
        self.state: Dict[str, AdaptiveParameters] = {}
        self.strategies: list[AdaptationStrategy] = [AdvancedMahoragaAdapter()]

    def get_parameters(self, symbol: str) -> AdaptiveParameters:
        if symbol not in self.state:
            self.state[symbol] = AdaptiveParameters()
        return self.state[symbol]

    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float):
        params = self.get_parameters(symbol)
        for strategy in self.strategies:
            strategy.evaluate(symbol, ind_data, recent_win_rate, params)

mahoraga_engine = MahoragaAdaptationEngine()
