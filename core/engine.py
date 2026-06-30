import time
import datetime
import zlib
from loguru import logger as log

from bridge.proxy import mt5
from core.config import settings
from execution.connection import mt5_conn
from execution.orders import open_trade
from execution.trailing import trail_positions
from monitoring.scheduler import scheduler
from indicators.moving_averages import get_m30_indicators
from strategies.trend_following import evaluate_signal
from risk.RiskSlotManager import RiskSlotManager
from risk.CorrelationGuard import CorrelationGuard
from risk.SignalPriorityEngine import SignalPriorityEngine
from core.state_manager import StateManager
from core.mahoraga import mahoraga_engine
from core.oracle import oracle_engine

def generate_magic(symbol: str, role_id: int) -> int:
    bucket_id = 99
    for i, (name, symbols) in enumerate(settings.correlation_groups.items()):
        if symbol in symbols:
            bucket_id = i + 1
            break
            
    asset_id = zlib.crc32(symbol.encode('utf-8')) % 1000
    return int(f"13{bucket_id:02d}{asset_id:03d}{role_id}")

class XiphosEngine:
    def __init__(self):
        self.state_manager = StateManager()
        self.last_processed_candles = {}
        self.last_cycle_data = {
            "time": "",
            "ranked_signals": [],
            "gates": {
                "gate_1_risk_slot": "PASS", "gate_1_details": "0 / 4 USED",
                "gate_2_correlation": "PASS", "gate_2_details": "NO BLOCK",
                "gate_3_fan_alignment": "PASS", "gate_3_details": "VALID",
                "gate_4_priority_filter": "PASS", "gate_4_details": "0 SIGNALS RANKED",
                "gate_5_hard_sl": "PASS", "gate_5_details": "ENFORCED"
            }
        }

    def _evaluate_gate_1(self, slots_available, slots_used, slots_limit) -> bool:
        if slots_available <= 0:
            self.last_cycle_data["gates"]["gate_1_risk_slot"] = "FAIL"
            self.last_cycle_data["gates"]["gate_1_details"] = f"{slots_used} / {slots_limit} USED"
            self.last_cycle_data["gates"]["gate_2_correlation"] = "N/A"
            self.last_cycle_data["gates"]["gate_3_fan_alignment"] = "N/A"
            self.last_cycle_data["gates"]["gate_4_priority_filter"] = "N/A"
            self.last_cycle_data["gates"]["gate_4_details"] = "0 RANKED"
            self.last_cycle_data["ranked_signals"] = []
            log.info("Max risk slots reached. Skipping new signal evaluation.")
            return False
        
        self.last_cycle_data["gates"]["gate_1_risk_slot"] = "PASS"
        self.last_cycle_data["gates"]["gate_1_details"] = f"{slots_used} / {slots_limit} USED"
        return True

    def _evaluate_gate_2(self):
        blocked_count = 0
        for name, symbols in settings.correlation_groups.items():
            if symbols:
                blocking = CorrelationGuard.get_blocking_positions(symbols[0], magic_filter=[135001, 135002])
                if blocking:
                    blocked_count += 1
        self.last_cycle_data["gates"]["gate_2_correlation"] = "PASS"
        self.last_cycle_data["gates"]["gate_2_details"] = f"{blocked_count} BLOCKED" if blocked_count > 0 else "NO BLOCK"

    def _gather_signals(self, recent_win_rate: float) -> list:
        all_symbols = []
        for group_symbols in settings.correlation_groups.values():
            all_symbols.extend(group_symbols)
        
        signals = []
        for sym in all_symbols:
            info = mt5.symbol_info(sym)
            if not info or info.volume_min > 0.01:
                continue
                
            ind_data = get_m30_indicators(sym)
            if not ind_data:
                continue
                
            mahoraga_engine.evaluate(sym, ind_data, recent_win_rate)
            params = mahoraga_engine.get_parameters(sym)
            
            ind_data = get_m30_indicators(sym, fast=params.fast_ema, medium=params.medium_ema, slow=params.slow_sma)
            if not ind_data:
                continue
                
            ind_data["filter_strictness"] = params.filter_strictness
            ind_data["lot_multiplier"] = params.lot_multiplier
            ind_data["sl_multiplier"] = params.sl_multiplier
                
            candle_time = ind_data.get('time', 0)
            if candle_time <= self.last_processed_candles.get(sym, 0):
                continue
                
            signal = evaluate_signal(ind_data)
            if signal:
                signals.append({"symbol": sym, "type": signal, "ind_data": ind_data})
        return signals

    def _evaluate_gate_3(self, signals) -> bool:
        if not signals:
            self.last_cycle_data["gates"]["gate_3_fan_alignment"] = "FAIL"
            self.last_cycle_data["gates"]["gate_3_details"] = "NO SIGNAL"
            self.last_cycle_data["gates"]["gate_4_priority_filter"] = "N/A"
            self.last_cycle_data["gates"]["gate_4_details"] = "0 RANKED"
            self.last_cycle_data["ranked_signals"] = []
            return False
            
        self.last_cycle_data["gates"]["gate_3_fan_alignment"] = "PASS"
        self.last_cycle_data["gates"]["gate_3_details"] = f"{len(signals)} ALIGNED"
        return True

    def _build_ranked_signal_payload(self, ranked_signals) -> list:
        return [{
            "priority": i + 1,
            "symbol": sig["symbol"],
            "direction": sig["type"],
            "price": sig["ind_data"]["close"],
            "sma200": sig["ind_data"]["sma_slow"],
            "distance": int(sig["distance"] / (mt5.symbol_info(sig["symbol"]).point if mt5.symbol_info(sig["symbol"]) else 0.00001)),
            "projected_risk": sig["projected_risk"],
            "status": "PENDING"
        } for i, sig in enumerate(ranked_signals)]

    def _execute_signal(self, sig, slots_available, open_counts, session_blocked_buckets) -> int:
        ind = sig["ind_data"]
        typ = sig["type"]
        
        if typ == "BUY":
            sl_a = ind["low"]
            sl_b = ind["sma_slow"]
        else:
            sl_a = ind["high"]
            sl_b = ind["sma_slow"]
        
        sym = sig["symbol"]
        
        bucket_name = None
        for name, symbols in settings.correlation_groups.items():
            if sym in symbols:
                bucket_name = name
                break
                
        if bucket_name in session_blocked_buckets:
            oracle_engine.record_risk_rejection(sym, "Session Bucket Filter", "Bucket already processed in this cycle.", ind.get('phenomenon', 'UNKNOWN'))
            return 0
            
        sess = settings.session_filter
        if sess.enabled and bucket_name not in sess.exempt_groups:
            current_hour = datetime.datetime.now(datetime.timezone.utc).hour
            if not (sess.start_hour <= current_hour < sess.end_hour):
                return 0
        
        open_count = open_counts.get(sym, 0)
        if open_count >= 2:
            oracle_engine.record_risk_rejection(sym, "Max Open Trades", "Asset already has maximum allowed positions (2).", ind.get('phenomenon', 'UNKNOWN'))
            return 0
            
        if CorrelationGuard.is_bucket_blocked(sym):
            oracle_engine.record_risk_rejection(sym, "Correlation Guard", f"Bucket {bucket_name} is fully allocated.", ind.get('phenomenon', 'UNKNOWN'))
            return 0
            
        slots_consumed = 0
        magic_a = generate_magic(sym, 1)
        magic_b = generate_magic(sym, 2)
        
        tick = mt5.symbol_info_tick(sym)
        if tick:
            entry_price = tick.ask if typ == "BUY" else tick.bid
        else:
            entry_price = ind["close"]
        
        base_lot = settings.trading.lot_size
        lot_multiplier = ind.get("lot_multiplier", 1.0)
        sl_multiplier = ind.get("sl_multiplier", 1.0)
        
        adapted_lot = min(round(base_lot * lot_multiplier, 2), 0.05)
        
        order_type = mt5.ORDER_TYPE_BUY if typ == "BUY" else mt5.ORDER_TYPE_SELL
        
        if open_count < 2 and slots_available > 0:
            sl_raw_dist_a = entry_price - float(sl_a)
            sl_scalper = round(entry_price - (sl_raw_dist_a * sl_multiplier), 5)
            risk_a = mt5.order_calc_profit(order_type, sym, adapted_lot, entry_price, sl_scalper)
            if risk_a is None or abs(risk_a) <= 10.0:
                start_exec = time.time()
                res_a = open_trade(sym, typ, adapted_lot, sl_scalper, magic_a, sig=sig)
                if res_a:
                    exec_time = (time.time() - start_exec) * 1000
                    oracle_engine.record_trade(sym, typ, entry_price, adapted_lot, ind.get('phenomenon', 'UNKNOWN'), exec_time)
                    open_count += 1
                    slots_consumed += 1
        
        if open_count < 2 and slots_available > slots_consumed:
            sl_raw_dist_b = entry_price - float(sl_b)
            sl_runner = round(entry_price - (sl_raw_dist_b * sl_multiplier), 5)
            risk_b = mt5.order_calc_profit(order_type, sym, adapted_lot, entry_price, sl_runner)
            if risk_b is None or abs(risk_b) <= 10.0:
                start_exec = time.time()
                res_b = open_trade(sym, typ, adapted_lot, sl_runner, magic_b, sig=sig)
                if res_b:
                    exec_time = (time.time() - start_exec) * 1000
                    oracle_engine.record_trade(sym, typ, entry_price, adapted_lot, ind.get('phenomenon', 'UNKNOWN'), exec_time)
                    open_count += 1
                    slots_consumed += 1

        if slots_consumed > 0:
            self.last_processed_candles[sym] = sig['ind_data'].get('time', 0)
            if bucket_name:
                session_blocked_buckets.add(bucket_name)
            for rs in self.last_cycle_data["ranked_signals"]:
                if rs["symbol"] == sym:
                    rs["status"] = "APPROVED"
                    
        return slots_consumed

    def process_m30_cycle(self):
        log.info("M30 Candle Close Detected. Initiating Evaluation Cycle...")
        
        self.last_cycle_data["time"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.last_cycle_data["gates"]["gate_5_hard_sl"] = "PASS"
        self.last_cycle_data["gates"]["gate_5_details"] = "ENFORCED"
        
        if not mt5_conn.check_health():
            return
            
        slots_limit = settings.trading.max_risk_trades
        slots_available = RiskSlotManager.get_available_slots(magic_filter=[135001, 135002])
        slots_used = slots_limit - slots_available
        
        if not self._evaluate_gate_1(slots_available, slots_used, slots_limit):
            return

        self._evaluate_gate_2()
        
        positions = mt5.positions_get()
        self.state_manager.reconcile(positions)
        
        open_counts = {}
        if positions:
            for p in positions:
                open_counts[p.symbol] = open_counts.get(p.symbol, 0) + 1

        global_metrics = self.state_manager.get_performance_metrics()
        recent_win_rate = global_metrics.get("win_rate", 50.0)

        signals = self._gather_signals(recent_win_rate)
        
        if not self._evaluate_gate_3(signals):
            return

        ranked_signals = SignalPriorityEngine.rank_signals(signals)
        self.last_cycle_data["gates"]["gate_4_priority_filter"] = "PASS"
        self.last_cycle_data["gates"]["gate_4_details"] = f"{len(ranked_signals)} RANKED"
        self.last_cycle_data["ranked_signals"] = self._build_ranked_signal_payload(ranked_signals)
        
        session_blocked_buckets = set()
        
        for sig in ranked_signals:
            if slots_available <= 0:
                log.info("Risk slots exhausted during execution phase.")
                break
                
            slots_consumed = self._execute_signal(sig, slots_available, open_counts, session_blocked_buckets)
            
            if slots_consumed > 0:
                slots_available -= slots_consumed

xiphos_engine = XiphosEngine()
