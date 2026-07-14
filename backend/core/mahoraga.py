from typing import Dict, Optional

from abc import ABC, abstractmethod

from loguru import logger as log

from core.oracle import oracle_engine

from core.llm import evaluate_adaptation



class AdaptiveParameters:

    def __init__(self):

        

        self.fast_ema = 13

        self.medium_ema = 50

        self.slow_sma = 200

        

        

        self.lot_multiplier = 1.0

        self.sl_multiplier = 1.0

        

        

        self.filter_strictness = "NORMAL"

        self.trend_state = "UNKNOWN"

        self.momentum_state = "NEUTRAL"

        self.confidence_score = 50.0

        

        

        self.phenomenon = "UNKNOWN"
        self.is_adapted = False
        self.adaptation_spins = 0
        self._last_state_hash = ""
        self.adapter_source = "DEFAULT"
        
        self.trading_halted = False
        self.active_strategy = "TREND_FOLLOWING"
        self.tp_multiplier = 1.0

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
            "adapter_source": self.adapter_source,
            "trading_halted": self.trading_halted,
            "active_strategy": self.active_strategy,
            "tp_multiplier": self.tp_multiplier
        }

class AdaptationStrategy(ABC):

    """Base interface for Mahoraga Adaptation Strategies."""

    @abstractmethod
    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float, params: AdaptiveParameters, news_data: dict = None, macro_data: dict = None, l2_data: dict = None):
        pass



class AdvancedMahoragaAdapter(AdaptationStrategy):

    """The true Mahoraga Technique implementation: Wheel Clicks, Memory, and Full Adaptation."""

    

    def __init__(self):

        

        

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

    def _apply_state(self, params, adx, rsi, bb_upper, bb_lower, close_price):
        if adx > 25:
            params.trend_state = "TRENDING"
        else:
            params.trend_state = "RANGING"
            
        if rsi > 70:
            params.momentum_state = "OVERBOUGHT"
        elif rsi < 30:
            params.momentum_state = "OVERSOLD"
        else:
            params.momentum_state = "NEUTRAL"


    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float, params: AdaptiveParameters, news_data: dict = None, macro_data: dict = None, l2_data: dict = None): # noqa: C901

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



        

        current_phenomenon = self._determine_phenomenon(volatility_ratio, adx, rsi)

        params.phenomenon = current_phenomenon

        

        

        if current_phenomenon not in self.memory_matrix:

            self.memory_matrix[current_phenomenon] = 0

            

        

        

        if recent_win_rate < 75.0 and self.memory_matrix[current_phenomenon] < self.clicks_for_adaptation:

            

            tick_hash = f"{int(ind_data.get('time', 0) / 1800)}" 

            if params._last_state_hash != tick_hash:

                self.memory_matrix[current_phenomenon] += 1

                params.adaptation_spins += 1

                params._last_state_hash = tick_hash

                log.info(f"[Mahoraga] {symbol} took damage! Wheel clicks to {self.memory_matrix[current_phenomenon]}/{self.clicks_for_adaptation} in {current_phenomenon}")

                

        

        llm_decision = evaluate_adaptation(
            symbol=symbol, 
            ind_data=ind_data, 
            current_lot=params.lot_multiplier, 
            current_sl=params.sl_multiplier,
            news_data=news_data,
            macro_data=macro_data,
            l2_data=l2_data
        )

        if llm_decision.should_adapt or self.memory_matrix[current_phenomenon] >= self.clicks_for_adaptation:

            params.is_adapted = True

            

            

            if llm_decision.should_adapt:
                params.lot_multiplier = llm_decision.new_lot_multiplier
                params.sl_multiplier = llm_decision.new_sl_multiplier
                params.tp_multiplier = llm_decision.new_tp_multiplier
                params.trading_halted = llm_decision.halt_trading
                params.active_strategy = llm_decision.strategy_override
                log.info(f"LLM Adapted {symbol}: Lot {params.lot_multiplier}, SL {params.sl_multiplier}, TP {params.tp_multiplier}, Halt {params.trading_halted}, Strat {params.active_strategy}")

            else:

                params.lot_multiplier = min(3.0, params.lot_multiplier * 1.5)

                params.sl_multiplier = min(2.0, params.sl_multiplier * 1.2)



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



        self._apply_state(params, adx, rsi, bb_upper, bb_lower, close_price)



        if params.is_adapted:

            

            

            

            target_ema = int(13 * volatility_ratio)

            

            params.fast_ema = max(7, min(target_ema, 25)) 

            

            

            if not llm_decision.should_adapt:

                params.sl_multiplier = 0.9 

                params.lot_multiplier = 1.5 

                params.adapter_source = "MAHORAGA_ADAPTED"

            else:

                params.adapter_source = "LLM_ADAPTED"

                

            params.confidence_score = 95.0

        else:

            

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

            

            

            target_ema = int(13 * volatility_ratio)

            params.fast_ema = max(5, min(target_ema, 35))

            

            params.sl_multiplier = min(max(volatility_ratio, 0.8), 1.5)

            params.lot_multiplier = 0.5 

            

            vol_penalty = abs(1.0 - volatility_ratio) * 20

            win_bonus = (recent_win_rate - 50.0) * 0.5

            confidence = 50.0 - vol_penalty + win_bonus

            params.confidence_score = min(max(confidence, 0.0), 100.0)

            params.adapter_source = "LEARNING"



import time



class MahoragaAdaptationEngine:

    def __init__(self):

        self.state: Dict[str, AdaptiveParameters] = {}

        self.last_evaluated: Dict[str, float] = {}

        self.strategies: list[AdaptationStrategy] = [AdvancedMahoragaAdapter()]

        self._last_cleanup = 0.0



    def _cleanup_stale_state(self):

        now = time.time()

        if now - self._last_cleanup < 3600:  

            return

        self._last_cleanup = now

        stale_symbols = [sym for sym, last_time in self.last_evaluated.items() if now - last_time > 172800] 

        for sym in stale_symbols:

            del self.state[sym]

            del self.last_evaluated[sym]

            log.info(f"[Mahoraga] Evicted stale state for {sym} to prevent memory leak.")



    def get_parameters(self, symbol: str) -> AdaptiveParameters:

        if symbol not in self.state:

            self.state[symbol] = AdaptiveParameters()

        return self.state[symbol]



    def evaluate(self, symbol: str, ind_data: dict, recent_win_rate: float, news_data: dict = None, macro_data: dict = None, l2_data: dict = None):
        self._cleanup_stale_state()
        self.last_evaluated[symbol] = time.time()
        params = self.get_parameters(symbol)
        for strategy in self.strategies:
            strategy.evaluate(symbol, ind_data, recent_win_rate, params, news_data, macro_data, l2_data)



mahoraga_engine = MahoragaAdaptationEngine()

