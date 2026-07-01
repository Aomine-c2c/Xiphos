
import json
import logging
from datetime import datetime, timezone
import os

class TelemetryLogger:
    def __init__(self, log_dir="logs/telemetry"):
        self.log_dir = log_dir
        if not os.path.exists(self.log_dir):
            os.makedirs(self.log_dir, exist_ok=True)
            
        self.logger = logging.getLogger("XiphosTelemetry")
        self.logger.setLevel(logging.INFO)
        
        # Ensure we don't duplicate handlers
        if not self.logger.handlers:
            handler = logging.FileHandler(f"{self.log_dir}/xiphos_telemetry.jsonl")
            handler.setFormatter(logging.Formatter('%(message)s'))
            self.logger.addHandler(handler)
            self.logger.propagate = False
            
    def _log_event(self, event_type: str, data: dict):
        payload = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "event_type": event_type,
            "data": data
        }
        self.logger.info(json.dumps(payload))
        
    def log_mahoraga_spin(self, symbol: str, spin_count: int, previous_state: str, new_state: str, adapter: str):
        self._log_event("MAHORAGA_SPIN", {
            "symbol": symbol,
            "spin_count": spin_count,
            "previous_state": previous_state,
            "new_state": new_state,
            "adapter": adapter
        })
        
    def log_gate_failure(self, gate_name: str, details: str):
        self._log_event("GATE_FAILURE", {
            "gate": gate_name,
            "details": details
        })
        
    def log_execution_latency(self, symbol: str, order_type: str, latency_ms: float):
        self._log_event("EXECUTION_LATENCY", {
            "symbol": symbol,
            "order_type": order_type,
            "latency_ms": latency_ms
        })

telemetry = TelemetryLogger()
