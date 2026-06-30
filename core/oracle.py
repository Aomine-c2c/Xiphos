import time
from loguru import logger as log
from storage.database import db
from core.llm import generate_oracle_rationale

class OracleEngine:
    def __init__(self):
        pass
        
    def _insert_decision(self, decision_type: str, query_text: str, data_core_event: str, 
                         data_core_details: str, mahoraga_reasoning: str, mahoraga_adjustment: str,
                         risk_check: str, risk_status: str, risk_details: str, 
                         xiphos_action: str, xiphos_latency: str):
        try:
            with db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("""
                    INSERT INTO oracle_decisions 
                    (decision_type, query_text, data_core_event, data_core_details, 
                     mahoraga_reasoning, mahoraga_adjustment, risk_check, risk_status, 
                     risk_details, xiphos_action, xiphos_latency)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (decision_type, query_text, data_core_event, data_core_details,
                      mahoraga_reasoning, mahoraga_adjustment, risk_check, risk_status,
                      risk_details, xiphos_action, xiphos_latency))
        except Exception as e:
            log.error(f"Oracle failed to record decision: {e}")

    def record_trade(self, symbol: str, direction: str, price: float, lot_size: float, phenomenon: str, exec_time_ms: float, ind_data: dict = None):
        query_text = f"Why did we take Trade on {symbol} ({direction})?"
        
        # Call LLM to generate organic reasoning based on indicators
        llm_decision = generate_oracle_rationale(symbol, direction, price, ind_data or {})
        
        self._insert_decision(
            decision_type="TRADE",
            query_text=query_text,
            data_core_event="LLM Multi-Factor Alignment",
            data_core_details=f"Trend and indicators aligned for {symbol}.",
            mahoraga_reasoning=llm_decision.mahoraga_reasoning,
            mahoraga_adjustment=llm_decision.mahoraga_adjustment,
            risk_check="Gate 1-5 Checks",
            risk_status="APPROVED",
            risk_details="Within risk limits and correlation constraints.",
            xiphos_action=f"Executed {direction} at {price}",
            xiphos_latency=f"{exec_time_ms:.1f}ms"
        )
        
    def record_adaptation(self, symbol: str, phenomenon: str, spins: int, old_lot: float, new_lot: float, exec_time_ms: float):
        query_text = f"Why did Mahoraga adapt {symbol} parameters?"
        is_full = "FULL ADAPTATION" if spins >= 4 else "PARTIAL ADAPTATION"
        
        self._insert_decision(
            decision_type="ADAPTATION",
            query_text=query_text,
            data_core_event="Performance Drop Detected",
            data_core_details=f"Win rate below 75% for {phenomenon}.",
            mahoraga_reasoning=f"{is_full}. Wheel rotated {spins * 45} degrees.",
            mahoraga_adjustment=f"Lot size shifted from {old_lot}x to {new_lot}x.",
            risk_check="Dynamic Parameter Bounds",
            risk_status="APPROVED",
            risk_details="New parameters satisfy max drawdown constraints.",
            xiphos_action="Updated live parameters",
            xiphos_latency=f"{exec_time_ms:.1f}ms"
        )
        
    def record_risk_rejection(self, symbol: str, gate_name: str, details: str, phenomenon: str):
        query_text = f"Why did Risk Guardian block {symbol}?"
        
        self._insert_decision(
            decision_type="RISK_REJECTION",
            query_text=query_text,
            data_core_event="Signal Generated",
            data_core_details=f"A valid signal was found for {symbol}.",
            mahoraga_reasoning=f"Regime {phenomenon} supported entry.",
            mahoraga_adjustment="Standard sizing proposed.",
            risk_check=gate_name,
            risk_status="REJECTED",
            risk_details=details,
            xiphos_action="Aborted execution",
            xiphos_latency="0.0ms"
        )

oracle_engine = OracleEngine()
