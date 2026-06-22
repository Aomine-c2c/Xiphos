"""
Xiphos Trading Framework - Advanced Textual TUI Cockpit
Run with: python tui.py
"""

import os
os.environ["XIPHOS_TUI"] = "1"

import threading
import time
import yaml
import requests

from datetime import datetime, timedelta
from loguru import logger

from textual import work, on
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widgets import (
    Footer, DataTable, RichLog, Label, Button, Static,
    TabbedContent, TabPane, Input
)
from textual.screen import ModalScreen

from bridge.proxy import mt5

from core.config import settings

from execution.connection import mt5_conn
from execution.orders import modify_sl
from execution.trailing import trail_positions
from indicators.moving_averages import get_m30_indicators
from monitoring.scheduler import scheduler
from risk.RiskSlotManager import RiskSlotManager
from risk.CorrelationGuard import CorrelationGuard
from strategies.trend_following import evaluate_signal
from main import process_m30_cycle, last_cycle_data
from state_manager import StateManager
from mt5_executor import MT5Executor
from storage.database import db

import ctypes
import os

CURRENT_VERSION = "v2.0.0"

ID_POS_PANEL = "#positions-panel"
ID_DASH_POS_PANEL = "#dash-pos-panel"
ID_LOG_PANEL = "#log-panel"
ID_MW_PANEL = "#mw-panel"
ID_DASH_MW_PANEL = "#dash-mw-panel"
ID_DASH_LOG_PANEL = "#dash-log-panel"

# ── Process Resource Tracking ──────────────────────────────────────────────────

class CPUTracker:
    def __init__(self):
        self.last_time = time.perf_counter()
        self.last_cpu_time = time.process_time()
        
    def get_cpu_percent(self) -> float:
        now = time.perf_counter()
        cpu_now = time.process_time()
        time_diff = now - self.last_time
        cpu_diff = cpu_now - self.last_cpu_time
        
        self.last_time = now
        self.last_cpu_time = cpu_now
        
        if time_diff > 0:
            cores = os.cpu_count() or 1
            return (cpu_diff / time_diff) * 100.0 / cores
        return 0.0

def get_memory_usage_mb() -> float:
    try:
        if os.name == 'nt':
            class ProcessMemoryCounters(ctypes.Structure):
                _fields_ = [
                    ("cb", ctypes.c_ulong),
                    ("PageFaultCount", ctypes.c_ulong),
                    ("PeakWorkingSetSize", ctypes.c_size_t),
                    ("WorkingSetSize", ctypes.c_size_t),
                    ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                    ("PagefileUsage", ctypes.c_size_t),
                    ("PeakPagefileUsage", ctypes.c_size_t)
                ]
            counters = ProcessMemoryCounters()
            process = ctypes.windll.kernel32.GetCurrentProcess()
            if ctypes.windll.psapi.GetProcessMemoryInfo(process, ctypes.byref(counters), ctypes.sizeof(counters)):
                return counters.WorkingSetSize / (1024 * 1024)
        else:
            import resource
            return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024.0
    except Exception:
        pass
    return 0.0

# ── Cumulative Equity ASCII Chart ──────────────────────────────────────────────

def generate_ascii_chart(profits: list[float], height: int = 5, width: int = 40) -> str:
    if not profits:
        return "[No closed trade data available yet]"
        
    cum_sum = []
    current = 0.0
    for p in profits:
        current += p
        cum_sum.append(current)
        
    if len(cum_sum) > width:
        cum_sum = cum_sum[-width:]
        
    n = len(cum_sum)
    if n == 0:
        return "[No closed trade data available yet]"
        
    min_val = min(cum_sum)
    max_val = max(cum_sum)
    val_range = max_val - min_val
    if val_range == 0:
        val_range = 1.0
        
    grid = [[" " for _ in range(n)] for _ in range(height)]
    
    for col, val in enumerate(cum_sum):
        row = int((val - min_val) / val_range * (height - 1))
        row = max(0, min(height - 1, row))
        grid[height - 1 - row][col] = "●"
        
    lines = []
    for r in range(height):
        if r == 0:
            lbl = f"[green]+${max_val:6.2f}[/green] ┐ "
        elif r == height - 1:
            lbl = f"[red]${min_val:7.2f}[/red] ┘ "
        else:
            lbl = "         │ "
        lines.append(lbl + "".join(grid[r]))
        
    return "\n".join(lines)

# ── Bot thread management ─────────────────────────────────────────────────────

_bot_running = False
_bot_thread: threading.Thread | None = None
state_manager = StateManager()
mt5_executor = MT5Executor()

def _bot_loop(log_cb):
    global _bot_running
    log_cb("[bold green]▶ Bot started.[/bold green]")
    scheduler.add_m30_job(process_m30_cycle)
    scheduler.add_trailing_job(trail_positions)
    scheduler.start()
    
    log_cb("[cyan]Running immediate cycle on startup...[/cyan]")
    try:
        process_m30_cycle()
    except Exception as e:
        log_cb(f"[red]Immediate cycle error: {e}[/red]")
        
    try:
        while _bot_running:
            time.sleep(0.5)
    finally:
        scheduler.stop()
        log_cb("[bold red]■ Bot stopped.[/bold red]")

def _next_m30_str() -> str:
    now = datetime.now()
    if now.minute < 30:
        nxt = now.replace(minute=30, second=0, microsecond=0)
    else:
        nxt = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
    secs = max(0, int((nxt - now).total_seconds()))
    mm, ss = divmod(secs, 60)
    return f"{mm:02d}:{ss:02d}"

# ── Modals ────────────────────────────────────────────────────────────────────

class PanicModal(ModalScreen):
    CSS = """
    PanicModal { align: center middle; background: rgba(0, 0, 0, 0.8); }
    #dialog { padding: 1 2; width: 40; height: 11; border: thick $error; background: $surface; }
    """
    def compose(self) -> ComposeResult:
        with Vertical(id="dialog"):
            yield Label("[bold red]⚠️ PANIC ⚠️[/bold red]\nAre you sure you want to close ALL open positions? This action cannot be undone.", id="question")
            with Horizontal():
                yield Button("CLOSE ALL", variant="error", id="btn-confirm-panic")
                yield Button("Cancel", variant="primary", id="btn-cancel-panic")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-confirm-panic":
            self.dismiss(True)
        else:
            self.dismiss(False)


class SaveConfigModal(ModalScreen):
    CSS = """
    SaveConfigModal { align: center middle; background: rgba(0, 0, 0, 0.8); }
    #dialog { padding: 1 2; width: 40; height: 9; border: thick $success; background: $surface; }
    """
    def compose(self) -> ComposeResult:
        with Vertical(id="dialog"):
            yield Label("Apply new configuration?\nThis will update settings.yaml.", id="question")
            with Horizontal():
                yield Button("Apply", variant="success", id="btn-confirm-save")
                yield Button("Cancel", variant="primary", id="btn-cancel-save")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-confirm-save":
            self.dismiss(True)
        else:
            self.dismiss(False)


class PositionControlModal(ModalScreen):
    CSS = """
    PositionControlModal { align: center middle; background: rgba(0, 0, 0, 0.8); }
    #pos-dialog { padding: 1 2; width: 50; height: 21; border: thick $accent; background: $surface; }
    #input-new-sl, #input-new-tp { width: 15; margin-right: 1; }
    .pos-btn { min-width: 14; margin-right: 1; }
    """
    def __init__(self, ticket: int, symbol: str, current_sl: str, current_tp: str):
        super().__init__()
        self.ticket = ticket
        self.symbol = symbol
        self.current_sl = current_sl
        self.current_tp = current_tp

    def compose(self) -> ComposeResult:
        with Vertical(id="pos-dialog"):
            yield Label(f"[bold cyan]Manual Control for {self.symbol}[/bold cyan]\nTicket: {self.ticket}", id="pos-title")
            
            yield Label("\nModify Stop Loss:")
            with Horizontal():
                yield Input(value=self.current_sl, id="input-new-sl")
                yield Button("Update SL", variant="primary", id="btn-update-sl")
                
            yield Label("\nModify Take Profit:")
            with Horizontal():
                yield Input(value=self.current_tp, id="input-new-tp")
                yield Button("Update TP", variant="primary", id="btn-update-tp")
                
            yield Label("\nExecution Actions:")
            with Horizontal():
                yield Button("CLOSE NOW", variant="error", id="btn-close-pos", classes="pos-btn")
                yield Button("CLOSE 50%", variant="warning", id="btn-partial-pos", classes="pos-btn")
                yield Button("BREAKEVEN", variant="warning", id="btn-be-pos", classes="pos-btn")
            
            yield Button("Cancel", variant="default", id="btn-cancel-pos", classes="mt-1")

    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "btn-update-sl":
            try:
                new_sl = float(self.query_one("#input-new-sl", Input).value)
                self.dismiss({"action": "modify_sl", "ticket": self.ticket, "symbol": self.symbol, "new_sl": new_sl})
            except ValueError:
                pass
        elif event.button.id == "btn-update-tp":
            try:
                new_tp = float(self.query_one("#input-new-tp", Input).value)
                self.dismiss({"action": "modify_tp", "ticket": self.ticket, "symbol": self.symbol, "new_tp": new_tp})
            except ValueError:
                pass
        elif event.button.id == "btn-close-pos":
            self.dismiss({"action": "close", "ticket": self.ticket, "symbol": self.symbol})
        elif event.button.id == "btn-be-pos":
            self.dismiss({"action": "be", "ticket": self.ticket, "symbol": self.symbol})
        elif event.button.id == "btn-partial-pos":
            self.dismiss({"action": "partial", "ticket": self.ticket, "symbol": self.symbol})
        else:
            self.dismiss(None)


# ── Cockpit Headers & Panels ──────────────────────────────────────────────────

class DashboardHeader(Static):
    DEFAULT_CSS = """
    DashboardHeader {
        height: 3;
        background: #090d16;
        color: #e2e8f0;
        border-bottom: solid #1e293b;
        padding: 0 2;
    }
    #hdr-left {
        width: 35;
        margin-top: 1;
    }
    #hdr-stats {
        align: right middle;
        height: 3;
    }
    #hdr-stats Label {
        margin-left: 1;
        padding: 0 1;
        background: #111827;
        border: solid #1e293b;
        height: 1;
        margin-top: 1;
    }
    """
    def compose(self) -> ComposeResult:
        with Horizontal():
            with Vertical(id="hdr-left"):
                yield Label("[bold cyan]⚔️  XIPHOS ENGINE[/bold cyan]", id="hdr-title-text")
                yield Label("[dim green]M30 TREND FOLLOWING SYSTEM[/dim green]", id="hdr-subtitle-text")
            with Horizontal(id="hdr-stats"):
                yield Label("Status: [bold red]● STOPPED[/bold red]", id="hdr-bot")
                yield Label("Broker: [bold white]Deriv MT5[/bold white]", id="hdr-broker")
                yield Label("MT5: [bold red]● OFFLINE[/bold red]", id="hdr-mt5")
                yield Label("Time: [bold cyan]--:--:--[/bold cyan]", id="hdr-time")
                yield Label("TF: [bold white]M30[/bold white]", id="hdr-tf")
                yield Label("Bal: [bold white]--[/bold white]", id="hdr-bal")
                yield Label("Eq: [bold white]--[/bold white]", id="hdr-eq")
                yield Label("Margin: [bold white]--[/bold white]", id="hdr-margin")


class OverviewPanel(Static):
    DEFAULT_CSS = "OverviewPanel { border: round $primary; padding: 0 1; background: #111827; height: 10; }"
    def compose(self) -> ComposeResult:
        yield Label("[bold cyan]OVERVIEW[/bold cyan]")
        yield Label(id="overview-content")
    def update_data(self, uptime: str) -> None:
        last_eval = last_cycle_data["time"].split()[-1] if last_cycle_data["time"] else "--:--:--"
        text = (
            f"Bot Status:        {'[bold green]RUNNING[/bold green]' if _bot_running else '[bold red]STOPPED[/bold red]'}\n"
            f"Strategy:          [bold white]XIPHOS M30[/bold white]\n"
            f"Timeframe:         [bold white]M30[/bold white]\n"
            f"Last Candle:       [bold white]{last_eval}[/bold white]\n"
            f"Next Evaluation:   [bold white]{_next_m30_str()}[/bold white]\n"
            f"Uptime:            [bold white]{uptime}[/bold white]\n"
            f"Version:           [bold white]{CURRENT_VERSION}[/bold white]"
        )
        self.query_one("#overview-content", Label).update(text)


class RiskSummaryPanel(Static):
    DEFAULT_CSS = "RiskSummaryPanel { border: round $primary; padding: 0 1; background: #111827; height: 11; }"
    def compose(self) -> ComposeResult:
        yield Label("[bold cyan]RISK SUMMARY[/bold cyan]")
        yield Label(id="risk-summary-content")
    def update_data(self) -> None:
        slots_limit = settings.trading.max_risk_trades
        slots_av = RiskSlotManager.get_available_slots(magic_filter=[135001, 135002])
        slots_us = slots_limit - slots_av
        
        # Generate progress bar
        pct = int((slots_us / slots_limit) * 100) if slots_limit > 0 else 0
        bar_len = 12
        filled = int((slots_us / slots_limit) * bar_len) if slots_limit > 0 else 0
        bar = "█" * filled + "░" * (bar_len - filled)
        
        text = (
            f"Max Risk Trades:    [bold white]{slots_limit}[/bold white]\n"
            f"Current Risk:       [bold white]{slots_us}[/bold white]\n"
            f"Risk-Free:          [bold green]{RiskSlotManager.get_risk_free_count(magic_filter=[135001, 135002])}[/bold green]\n"
            f"Available Slots:    [bold green]{slots_av}[/bold green]\n\n"
            f"  [bold cyan]{pct}%[/bold cyan]  [bold green][{bar}][/bold green]\n"
            f"        [bold white]{slots_us} / {slots_limit} SLOTS USED[/bold white]"
        )
        self.query_one("#risk-summary-content", Label).update(text)


class CorrelationGuardPanel(Static):
    DEFAULT_CSS = "CorrelationGuardPanel { border: round $primary; padding: 0 1; background: #111827; height: 13; overflow-y: auto; }"
    def compose(self) -> ComposeResult:
        yield Label("[bold cyan]CORRELATION GUARD[/bold cyan]")
        yield Label(id="corr-guard-content")
    def update_data(self) -> None:
        text = ""
        for group_name, symbols in settings.correlation_groups.items():
            clean_name = group_name.replace("_", " ").upper()
            text += f"[bold yellow]{clean_name}[/bold yellow]:\n"
            
            blocking = CorrelationGuard.get_blocking_positions(symbols[0] if symbols else "", magic_filter=[135001, 135002])
            
            for sym in symbols[:4]:
                positions = mt5.positions_get(symbol=sym) or []
                has_rb = False
                has_rf = False
                for p in positions:
                    if p.magic in [135001, 135002]:
                        if p.sl <= 0.0 or (p.type == mt5.ORDER_TYPE_BUY and p.sl < p.price_open) or (p.type == mt5.ORDER_TYPE_SELL and p.sl > p.price_open):
                            has_rb = True
                        else:
                            has_rf = True
                            
                if has_rb:
                    status = "[bold red]RISK-BEARING[/bold red]"
                elif has_rf:
                    status = "[bold green]RISK-FREE[/bold green]"
                elif blocking and sym not in [p.symbol for p in blocking]:
                    status = "[bold orange3]BLOCKED[/bold orange3]"
                else:
                    status = "[dim green]ALLOWED[/dim green]"
                    
                text += f"  {sym:<8} {status}\n"
            text += "\n"
        self.query_one("#corr-guard-content", Label).update(text.rstrip())


class QuickActionsPanel(Static):
    DEFAULT_CSS = """
    QuickActionsPanel { border: round $primary; padding: 0 1; background: #111827; height: 14; }
    QuickActionsPanel Button { width: 100%; margin-bottom: 1; height: 3; }
    """
    def compose(self) -> ComposeResult:
        yield Label("[bold cyan]QUICK ACTIONS[/bold cyan]\n")
        yield Button("⏸ PAUSE BOT", id="btn-pause", variant="warning")
        yield Button("❌ CLOSE ALL", id="btn-panic", variant="error")
        yield Button("🔄 FORCE CYCLE", id="btn-force", variant="primary")


class SystemHealthPanel(Static):
    DEFAULT_CSS = """
    SystemHealthPanel { height: 6; margin-bottom: 1; }
    .gate-card {
        width: 1fr;
        height: 100%;
        border: round #1e293b;
        background: #111827;
        margin-right: 1;
        content-align: center middle;
        text-align: center;
    }
    .gate-card.pass { border: round #10b981; }
    .gate-card.fail { border: round #ef4444; }
    """
    def compose(self) -> ComposeResult:
        with Horizontal():
            with Vertical(classes="gate-card", id="gate-card-1"):
                yield Label("[bold white]GATE 1[/bold white]\n[dim]RISK SLOT[/dim]\n[bold green]✔ PASS[/bold green]\n[dim]0/4 USED[/dim]", id="lbl-gate-1")
            with Vertical(classes="gate-card", id="gate-card-2"):
                yield Label("[bold white]GATE 2[/bold white]\n[dim]CORRELATION[/dim]\n[bold green]✔ PASS[/bold green]\n[dim]NO BLOCK[/dim]", id="lbl-gate-2")
            with Vertical(classes="gate-card", id="gate-card-3"):
                yield Label("[bold white]GATE 3[/bold white]\n[dim]FAN ALIGNMENT[/dim]\n[bold green]✔ PASS[/bold green]\n[dim]VALID[/dim]", id="lbl-gate-3")
            with Vertical(classes="gate-card", id="gate-card-4"):
                yield Label("[bold white]GATE 4[/bold white]\n[dim]PRIORITY FILTER[/dim]\n[bold green]✔ PASS[/bold green]\n[dim]0 RANKED[/dim]", id="lbl-gate-4")
            with Vertical(classes="gate-card", id="gate-card-5"):
                yield Label("[bold white]GATE 5[/bold white]\n[dim]HARD SL[/dim]\n[bold green]✔ PASS[/bold green]\n[dim]ENFORCED[/dim]", id="lbl-gate-5")
                
    def update_gates(self) -> None:
        gates = last_cycle_data.get("gates", {})
        for i in range(1, 6):
            if i == 1:
                suffix = "risk_slot"
            elif i == 2:
                suffix = "correlation"
            elif i == 3:
                suffix = "fan_alignment"
            elif i == 4:
                suffix = "priority_filter"
            else:
                suffix = "hard_sl"
            gate_key = f"gate_{i}_{suffix}"
            status = gates.get(gate_key, "PASS")
            details = gates.get(f"gate_{i}_details", "ENFORCED" if i==5 else "")
            
            try:
                card = self.query_one(f"#gate-card-{i}", Vertical)
                card.remove_class("pass", "fail")
                if status == "PASS":
                    card.add_class("pass")
                    status_str = "[bold green]✔ PASS[/bold green]"
                elif status == "FAIL":
                    card.add_class("fail")
                    status_str = "[bold red]✘ FAIL[/bold red]"
                else:
                    status_str = "[bold yellow]─ N/A[/bold yellow]"
                    
                lbl = self.query_one(f"#lbl-gate-{i}", Label)
                gate_names = ["RISK SLOT", "CORRELATION", "FAN ALIGNMENT", "PRIORITY FILTER", "HARD SL"]
                lbl.update(f"[bold white]GATE {i}[/bold white]\n[dim]{gate_names[i-1]}[/dim]\n{status_str}\n[dim]{details}[/dim]")
            except Exception:
                pass


class PriorityEnginePanel(Static):
    DEFAULT_CSS = "PriorityEnginePanel { border: round $primary; padding: 0 1; background: #111827; height: 10; }"
    def compose(self) -> ComposeResult:
        yield Label("[bold cyan]MULTI-SIGNAL PRIORITY ENGINE (GATE 4)[/bold cyan]")
        t = DataTable(id="prior-table", zebra_stripes=True, cursor_type="none")
        t.add_columns("Rank", "Symbol", "Direction", "Price", "SMA200", "Distance", "Proj Risk", "Status")
        yield t
    def update_data(self) -> None:
        try:
            t = self.query_one("#prior-table", DataTable)
            t.clear()
            for sig in last_cycle_data.get("ranked_signals", []):
                status_c = "green" if sig["status"] == "APPROVED" else "yellow"
                dir_c = "green" if sig["direction"] == "BUY" else "red"
                arrow = "↑ BUY" if sig["direction"] == "BUY" else "↓ SELL"
                
                t.add_row(
                    str(sig["priority"]),
                    sig["symbol"],
                    f"[{dir_c}]{arrow}[/{dir_c}]",
                    f"{sig['price']:.5f}",
                    f"{sig['sma200']:.5f}",
                    f"{sig['distance']}",
                    f"${sig['projected_risk']:.2f}",
                    f"[{status_c}]{sig['status']}[/{status_c}]"
                )
        except Exception:
            pass


class TradeManagerPanel(Static):
    DEFAULT_CSS = """
    TradeManagerPanel { border: round $primary; padding: 0 1; background: #111827; height: 11; }
    .strat-card { width: 1fr; height: 100%; padding: 0 1; }
    """
    def compose(self) -> ComposeResult:
        yield Label("[bold cyan]TRADE MANAGER[/bold cyan]")
        with Horizontal():
            with Vertical(classes="strat-card"):
                yield Label("[bold yellow]TRADE A - SCALPER[/bold yellow] (135001)")
                yield Label(
                    "Initial SL:  [cyan]SMA200[/cyan]\n"
                    "Trailing:    [cyan]EMA50[/cyan]\n"
                    "Direction:   Trend Following\n"
                    "Purpose:     Capture momentum\n"
                    "SL Behavior: Never widen"
                )
            with Vertical(classes="strat-card"):
                yield Label("[bold yellow]TRADE B - RUNNER[/bold yellow] (135002)")
                yield Label(
                    "Initial SL:  [cyan]SMA200[/cyan]\n"
                    "Trailing:    [cyan]SMA200[/cyan]\n"
                    "Direction:   Trend Following\n"
                    "Purpose:     Capture macro trend\n"
                    "SL Behavior: Never widen"
                )


class SystemPerformancePanel(Static):
    DEFAULT_CSS = "SystemPerformancePanel { border: round $primary; padding: 0 1; background: #111827; height: 9; }"
    def compose(self) -> ComposeResult:
        yield Label("[bold cyan]SYSTEM PERFORMANCE[/bold cyan]")
        yield Label(id="perf-gauges-content")
    def update_data(self, cpu_pct: float, mem_mb: float) -> None:
        try:
            import shutil
            total, used, _ = shutil.disk_usage("/")
            disk_pct = (used / total) * 100.0
            total_gb = total / (1024**3)
            used_gb = used / (1024**3)
        except Exception:
            disk_pct = 0.0
            total_gb = used_gb = 0.0
            
        def make_bar(p):
            return "█" * int(p/10) + "░" * (10 - int(p/10))
        
        text = (
            f"CPU Usage:      {make_bar(cpu_pct)} [bold cyan]{cpu_pct:.1f}%[/bold cyan]\n"
            f"Memory Usage:   {make_bar((mem_mb/1600.0)*100.0)} [bold cyan]{mem_mb:.1f} MB[/bold cyan] / 1.6 GB\n"
            f"Disk Usage:     {make_bar(disk_pct)} [bold cyan]{disk_pct:.1f}%[/bold cyan] ({used_gb:.1f} GB / {total_gb:.1f} GB)"
        )
        try:
            self.query_one("#perf-gauges-content", Label).update(text)
        except Exception:
            pass

# ── Base Panels ───────────────────────────────────────────────────────────────

class StatusPanel(Static):
    DEFAULT_CSS = "StatusPanel { border: round $primary; padding: 1 2; height: 100%; width: 100%; }"
    def compose(self) -> ComposeResult:
        yield Label("[dim]Loading...[/dim]", id="status-content")
    def update_display(self, text: str) -> None:
        self.query_one("#status-content", Label).update(text)


def generate_sparkline(history: list[float]) -> str:
    if not history:
        return ""
    if len(history) == 1:
        return "▄"
    bars = " ▂▃▄▅▆▇█"
    min_val = min(history)
    max_val = max(history)
    rng = max_val - min_val
    if rng == 0:
        return "▄" * len(history)
    return "".join(bars[int(7 * (v - min_val) / rng)] for v in history)


class MarketWatchTable(Static):
    DEFAULT_CSS = "MarketWatchTable { border: round $primary; padding: 0 1; height: 100%; width: 100%; overflow-y: auto; }"
    def compose(self) -> ComposeResult:
        t = DataTable(id="mw-table", zebra_stripes=True, cursor_type="none")
        t.add_columns("Symbol", "Price", "Trend", "E13 Dist", "E50 Dist", "S200 Dist", "Bucket", "Signal")
        yield t
    def update_rows(self, rows: list) -> None:
        t = self.query_one("#mw-table", DataTable)
        t.clear()
        for row in rows:
            t.add_row(*row)


class PositionsTable(Static):
    DEFAULT_CSS = "PositionsTable { border: round $primary; padding: 0 1; height: 100%; }"
    def compose(self) -> ComposeResult:
        t = DataTable(id="pos-table", zebra_stripes=True, cursor_type="none")
        t.add_columns("Ticket", "Symbol", "Type", "Entry", "Current", "SL", "TP", "P&L", "Role")
        yield t
    def update_rows(self, rows: list) -> None:
        t = self.query_one("#pos-table", DataTable)
        t.clear()
        for row in rows:
            t.add_row(*row)


class TradeHistoryTable(Static):
    DEFAULT_CSS = "TradeHistoryTable { border: round $accent; padding: 0 1; height: 1fr; }"
    def compose(self) -> ComposeResult:
        t = DataTable(id="hist-table", zebra_stripes=True, cursor_type="none")
        t.add_columns("Time", "Symbol", "Type", "Entry", "P&L")
        yield t
    def update_rows(self, rows: list) -> None:
        t = self.query_one("#hist-table", DataTable)
        t.clear()
        for row in rows:
            t.add_row(*row)


class LogPanel(RichLog):
    DEFAULT_CSS = "LogPanel { border: round $primary; padding: 0 1; height: 1fr; scrollbar-gutter: stable; }"


class ControlsBar(Static):
    DEFAULT_CSS = "ControlsBar { height: 3; align: center middle; } Button { margin: 0 1; min-width: 14; }"
    def compose(self) -> ComposeResult:
        yield Button("■  Stop",          id="btn-stop",   variant="error")
        yield Button("⏸  Pause",         id="btn-pause",  variant="warning")
        yield Button("⚡ Force Cycle",   id="btn-force",  variant="primary")


class NotificationBanner(Static):
    DEFAULT_CSS = """
    NotificationBanner {
        height: 3;
        content-align: center middle;
        background: #1e1b4b;
        color: #e0e7ff;
        border-bottom: solid #312e81;
        display: none;
        text-style: bold;
    }
    NotificationBanner.info {
        background: #1e1b4b;
        color: #e0e7ff;
        border-bottom: solid #312e81;
    }
    NotificationBanner.success {
        background: #064e3b;
        color: #d1fae5;
        border-bottom: solid #047857;
    }
    NotificationBanner.warn {
        background: #78350f;
        color: #fef3c7;
        border-bottom: solid #b45309;
    }
    NotificationBanner.error {
        background: #7f1d1d;
        color: #fee2e2;
        border-bottom: solid #b91c1c;
    }
    """
    def show_message(self, message: str, level: str = "info") -> None:
        self.update(message)
        self.remove_class("info", "success", "warn", "error")
        self.add_class(level)
        self.styles.display = "block"
        
    def clear_message(self) -> None:
        self.styles.display = "none"

# ── App ───────────────────────────────────────────────────────────────────────

class XiphosApp(App):
    TITLE = "Xiphos"
    SUB_TITLE = "Algorithmic Trading Framework"
    BINDINGS = [
        ("q", "quit",            "Quit"),
        ("s", "start_bot",       "Start"),
        ("x", "stop_bot",        "Stop"),
        ("p", "pause_bot",       "Pause"),
        ("f", "force_cycle",     "Force Cycle"),
        ("1", "select_tab('tab-dash')",   "Dashboard"),
        ("2", "select_tab('tab-live')",   "Markets"),
        ("3", "select_tab('tab-pos')",    "Positions"),
        ("4", "select_tab('tab-risk')",   "Risk Manager"),
        ("5", "select_tab('tab-perf')",   "Analytics"),
        ("6", "select_tab('tab-logs')",   "Logs"),
        ("7", "select_tab('tab-config')", "Settings"),
        ("ctrl+p", "pause_bot", "Pause Bot"),
        ("ctrl+x", "prompt_panic", "Panic Close"),
    ]
    CSS = """
    Screen { background: #0b0f19; }
    
    /* Dashboard Grid layout */
    #dash-workspace {
        height: 100%;
    }
    #dash-col-left {
        width: 1fr;
        height: 100%;
        overflow-y: auto;
        margin-right: 1;
    }
    #dash-col-center {
        width: 2fr;
        height: 100%;
        overflow-y: auto;
        margin-right: 1;
    }
    #dash-col-right {
        width: 2fr;
        height: 100%;
        overflow-y: auto;
    }
    #risk-col-left {
        width: 2fr;
        margin-right: 1;
    }
    #risk-col-right {
        width: 3fr;
    }
    
    OverviewPanel, RiskSummaryPanel, CorrelationGuardPanel, QuickActionsPanel, SystemHealthPanel, PriorityEnginePanel, TradeManagerPanel, SystemPerformancePanel {
        margin-bottom: 1;
    }

    #top-row { height: 15; }
    #mw-container { width: 3fr; height: 100%; }
    #mw-search-input { height: 3; margin-bottom: 0; border: round #1e293b; background: #111827; }
    .section-lbl { color: #38bdf8; text-style: bold; padding: 0 2; height: 1; margin-top: 1; }
    
    /* Metrics and Config Panel styles */
    .metrics-panel { border: round #10b981; padding: 1 2; height: auto; margin-bottom: 1; background: #111827; }
    #diagnostics-panel { border: round #38bdf8; }
    #strategy-panel { border: round #f59e0b; }
    .config-panel { border: round #f59e0b; padding: 1 2; height: auto; background: #111827; }
    .config-row { height: 3; align: left middle; }
    .config-label { padding-top: 1; width: 25; color: #94a3b8; }
    
    /* Log Panel & Toolbar styles */
    #log-container { height: 1fr; }
    #log-toolbar { height: 3; align: left middle; margin-bottom: 0; padding: 0 1; }
    #log-search-input { width: 2fr; height: 3; margin-right: 1; border: round #1e293b; background: #111827; }
    .log-filter-btn { min-width: 8; height: 3; margin-right: 1; }
    
    /* Performance Tab layout styles */
    #perf-left-col { width: 2fr; height: 100%; margin-right: 1; }
    #perf-right-col { width: 3fr; height: 100%; }
    .chart-panel { border: round #10b981; padding: 1 2; height: 9; background: #111827; margin-bottom: 1; }
    #equity-chart { color: #10b981; }
    
    /* Custom controls layout styles */
    ControlsBar { height: 3; align: center middle; margin-top: 1; }
    ControlsBar Button { margin: 0 1; min-width: 14; }
    """

    def compose(self) -> ComposeResult:
        yield DashboardHeader()
        yield NotificationBanner(id="notification-banner")
        
        with TabbedContent(initial="tab-dash"):
            
            # --- TAB 1: Cockpit Dashboard ---
            with TabPane("Dashboard", id="tab-dash"):
                with Horizontal(id="dash-workspace"):
                    # Left Column
                    with Vertical(id="dash-col-left"):
                        yield OverviewPanel(id="dash-overview")
                        yield RiskSummaryPanel(id="dash-risk")
                        yield CorrelationGuardPanel(id="dash-corr")
                        yield QuickActionsPanel(id="dash-actions")
                        
                    # Center Column
                    with Vertical(id="dash-col-center"):
                        yield SystemHealthPanel(id="dash-health")
                        yield PriorityEnginePanel(id="dash-priority")
                        yield Label("  ▸ MARKET WATCH (M30)", classes="section-lbl")
                        yield MarketWatchTable(id="dash-mw-panel")
                        yield Label("  ▸ LIVE LOG", classes="section-lbl")
                        yield LogPanel(id="dash-log-panel", highlight=True, markup=True, max_lines=150)
                        
                    # Right Column
                    with Vertical(id="dash-col-right"):
                        yield Label("  ▸ ACTIVE POSITIONS", classes="section-lbl")
                        yield PositionsTable(id="dash-pos-panel")
                        yield Label("  ▸ EQUITY CURVE (LAST 30 TRADES)", classes="section-lbl")
                        with Vertical(classes="chart-panel"):
                            yield Label("[dim]Generating equity curve...[/dim]", id="dash-equity-chart")
                        yield TradeManagerPanel(id="dash-trade-mgr")
                        yield SystemPerformancePanel(id="dash-performance")

            # --- TAB 2: Detailed Markets ---
            with TabPane("Markets", id="tab-live"):
                with Vertical(id="mw-container-detailed"):
                    yield Input(placeholder="🔍 Search symbols...", id="mw-search-input")
                    yield MarketWatchTable(id="mw-panel")
                yield ControlsBar()
                
            # --- TAB 3: Positions Control ---
            with TabPane("Positions", id="tab-pos"):
                yield Label("  ▸ OPEN POSITIONS", classes="section-lbl")
                yield PositionsTable(id="positions-panel")
                
            # --- TAB 4: Risk Manager ---
            with TabPane("Risk Manager", id="tab-risk"):
                with Horizontal():
                    with Vertical(id="risk-col-left"):
                        yield Label("  ▸ DYNAMIC RISK SLOTS", classes="section-lbl")
                        yield RiskSummaryPanel(id="risk-mgr-slots")
                    with Vertical(id="risk-col-right"):
                        yield Label("  ▸ CORRELATION GUARD STATUS", classes="section-lbl")
                        yield CorrelationGuardPanel(id="risk-mgr-corr")

            # --- TAB 5: Performance Analytics ---
            with TabPane("Analytics", id="tab-perf"):
                with Horizontal():
                    with Vertical(id="perf-left-col"):
                        yield Label("  ▸ DIAGNOSTICS & RESOURCES", classes="section-lbl")
                        with Vertical(classes="metrics-panel", id="diagnostics-panel"):
                            yield Label("[dim]Gathering diagnostics...[/dim]", id="diagnostics-label")
                            
                        yield Label("  ▸ STRATEGY PERFORMANCE", classes="section-lbl")
                        with Vertical(classes="metrics-panel", id="strategy-panel"):
                            yield Label("[dim]Loading strategy performance...[/dim]", id="strategy-label")
                            
                        yield Label("  ▸ GLOBAL METRICS", classes="section-lbl")
                        with Vertical(classes="metrics-panel"):
                            yield Label("[dim]Loading metrics...[/dim]", id="metrics-label")
                            
                    with Vertical(id="perf-right-col"):
                        yield Label("  ▸ EQUITY CURVE (LAST 30 TRADES)", classes="section-lbl")
                        with Vertical(classes="chart-panel"):
                            yield Label("[dim]Generating equity curve...[/dim]", id="equity-chart")
                            
                        yield Label("  ▸ RECENT TRADE HISTORY", classes="section-lbl")
                        yield TradeHistoryTable(id="history-panel")

            # --- TAB 6: System Logs ---
            with TabPane("Logs", id="tab-logs"):
                with Vertical(id="log-container"):
                    with Horizontal(id="log-toolbar"):
                        yield Input(placeholder="🔍 Search logs...", id="log-search-input")
                        yield Button("ALL", variant="primary", classes="log-filter-btn", id="log-filter-all")
                        yield Button("INFO", variant="default", classes="log-filter-btn", id="log-filter-info")
                        yield Button("WARN", variant="default", classes="log-filter-btn", id="log-filter-warn")
                        yield Button("ERROR", variant="default", classes="log-filter-btn", id="log-filter-error")
                    yield LogPanel(id="log-panel", highlight=True, markup=True, max_lines=1000)

            # --- TAB 7: Settings & Controls ---
            with TabPane("Settings", id="tab-config"):
                yield Label("  ▸ SYSTEM CONFIGURATION (settings.yaml)", classes="section-lbl")
                with VerticalScroll(classes="config-panel"):
                    with Horizontal(classes="config-row"):
                        yield Label("Max Risk Trades:", classes="config-label")
                        yield Input(value=str(settings.trading.max_risk_trades), id="cfg-max-risk")
                        
                    with Horizontal(classes="config-row"):
                        yield Label("Lot Size:", classes="config-label")
                        yield Input(value=str(settings.trading.lot_size), id="cfg-lot-size")
                        
                    with Horizontal(classes="config-row"):
                        yield Label("Max Slots per Symbol:", classes="config-label")
                        yield Input(value="2", id="cfg-max-slots")
                        
                    with Horizontal(classes="config-row"):
                        yield Button("💾 Save Configuration", variant="success", id="btn-save-config")
                
                yield Label("  ▸ MANUAL EXECUTION", classes="section-lbl")
                with Horizontal(classes="config-row"):
                    yield Button("⚠️ PANIC CLOSE ALL", variant="error", id="btn-panic")
                

        yield Footer()

    def on_mount(self) -> None:
        logger.add(self._loguru_sink, format="{time:HH:mm:ss} | {level:<8} | {message}", colorize=False)
        self.mw_search_query = ""
        self.log_history = []
        self.current_log_search = ""
        self.current_log_level = "ALL"
        self.cpu_tracker = CPUTracker()
        self.start_time = time.time()
        
        self.market_watch_data = {}
        for _group, symbols in settings.correlation_groups.items():
            for sym in symbols:
                self.market_watch_data[sym] = {"price": 0.0, "history": [], "signal": "NONE"}
                
        self._connect_mt5()
        self.set_interval(1,  self._refresh_seconds_timer)
        self.set_interval(5,  self._refresh_fast)
        self.set_interval(30, self._refresh_signals)
        self.set_interval(10, self._refresh_performance)
        self.set_interval(3600, self._check_for_updates)
        self._check_for_updates()
        
        # Auto-start trading execution loop
        self.action_start_bot()
        
        self.last_position_tickets = None
        self.last_mt5_connected = None

    def trigger_alert(self, message: str, level: str = "info") -> None:
        try:
            banner = self.query_one("#notification-banner", NotificationBanner)
            banner.show_message(message, level)
            
            # Cancel any previous clear timer
            if hasattr(self, "_clear_banner_timer") and self._clear_banner_timer:
                try:
                    self._clear_banner_timer.stop()
                except Exception:
                    pass
            
            self._clear_banner_timer = self.set_timer(3.0, banner.clear_message)
        except Exception as e:
            import sys
            sys.stderr.write(f"Error triggering alert: {e}\n")

    def flash_widget_border(self, widget_id: str, color: str, duration: float = 1.5) -> None:
        try:
            widget = self.query_one(widget_id)
            default_color = "$accent" if "history" in widget_id or "hist" in widget_id or "chart" in widget_id else "$primary"
            widget.styles.border = ("round", color)
            
            def revert_border():
                try:
                    widget.styles.border = ("round", default_color)
                except Exception:
                    pass
            self.set_timer(duration, revert_border)
        except Exception as e:
            import sys
            sys.stderr.write(f"Error flashing border for {widget_id}: {e}\n")

    # ── Release check worker ──────────────────────────────────────────────────

    @work(thread=True)
    def _check_for_updates(self) -> None:
        try:
            resp = requests.get("https://api.github.com/repos/Aomine-c2c/Xiphos/releases/latest", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                latest = data.get("tag_name", "")
                if latest and latest != CURRENT_VERSION:
                    self.call_from_thread(
                        self.log_msg, 
                        f"[bold magenta]🔔 NEW UPDATE AVAILABLE: {latest}![/bold magenta] (Current: {CURRENT_VERSION})\nRun Xiphos installation script to update."
                    )
        except Exception:
            pass

    def _refresh_seconds_timer(self) -> None:
        try:
            secs = _next_m30_str()
            # Try updating both timer labels if mounted
            try:
                self.query_one("#hdr-candle", Label).update(f"Next Cycle: [bold cyan]{secs}[/bold cyan]")
            except Exception:
                pass
        except Exception:
            pass

    # ── MT5 connect worker ────────────────────────────────────────────────────

    @work(thread=True, exclusive=True)
    def _connect_mt5(self) -> None:
        if mt5_conn.connect():
            self.call_from_thread(self.log_msg, "[bold green]✔ Connected to MetaTrader 5.[/bold green]")
            self.call_from_thread(self._refresh_fast)
            self.call_from_thread(self._refresh_signals)
        else:
            self.call_from_thread(self.log_msg, "[bold red]✘ Failed to connect to MT5![/bold red]")

    # ── Background Refreshes ──────────────────────────────────────────────────

    @work(thread=True, exclusive=True)
    def _refresh_fast(self) -> None:
        account = mt5.account_info()
        secs = _next_m30_str()
        
        is_connected = account is not None
        if self.last_mt5_connected is not None:
            if is_connected and not self.last_mt5_connected:
                self.call_from_thread(self.trigger_alert, "✔ Connected to MetaTrader 5.", "success")
            elif not is_connected and self.last_mt5_connected:
                self.call_from_thread(self.trigger_alert, "✘ MetaTrader 5 Connection Lost!", "error")
                # Flash status panel on detailed tab
                self.call_from_thread(self.flash_widget_border, "#status-panel", "red")
        self.last_mt5_connected = is_connected

        if account:
            conn_str  = "[bold green]● ONLINE[/bold green]"
            bal_str   = f"[bold white]${account.balance:.2f}[/bold white]"
            eq_str    = f"[bold white]${account.equity:.2f}[/bold white]"
            mg_str    = f"[bold white]${account.margin_free:.2f}[/bold white]"
            pnl_c     = "green" if account.profit >= 0 else "red"
            pnl_str   = f"[bold {pnl_c}]${account.profit:+.2f}[/bold {pnl_c}]"
            slots_av  = RiskSlotManager.get_available_slots(magic_filter=[135001, 135002])
            slots_us  = settings.trading.max_risk_trades - slots_av
            sl_c      = "green" if slots_av > 0 else "red"
        else:
            DIM_NA = "[dim]N/A[/dim]"
            conn_str = "[bold red]● OFFLINE[/bold red]"
            bal_str = DIM_NA
            eq_str = DIM_NA
            mg_str = DIM_NA
            pnl_str = DIM_NA
            slots_us = 0
            slots_av = 0
            sl_c = "red"

        status_text = (
            f"  Connection   {conn_str}\n"
            f"  Balance      {bal_str}\n"
            f"  Equity       {eq_str}\n"
            f"  Free Margin  {mg_str}\n"
            f"  Float P&L    {pnl_str}\n"
            f"  Risk Slots   [{sl_c}]{slots_us}/{settings.trading.max_risk_trades}[/{sl_c}]\n"
            f"  Next M30     [cyan]{secs}[/cyan]"
        )
        try:
            self.call_from_thread(self.query_one("#status-panel", StatusPanel).update_display, status_text)
        except Exception:
            pass

        # Positions tables (both detailed and dashboard)
        positions = mt5.positions_get() or []
        current_tickets = {pos.ticket for pos in positions}
        
        if self.last_position_tickets is not None:
            new_tickets = current_tickets - self.last_position_tickets
            closed_tickets = self.last_position_tickets - current_tickets
            
            if new_tickets:
                for ticket in new_tickets:
                    pos_obj = next((p for p in positions if p.ticket == ticket), None)
                    sym = pos_obj.symbol if pos_obj else "Unknown"
                    self.call_from_thread(self.trigger_alert, f"📈 Opened position: {sym} (Ticket {ticket})", "success")
                self.call_from_thread(self.flash_widget_border, ID_POS_PANEL, "green")
                self.call_from_thread(self.flash_widget_border, ID_DASH_POS_PANEL, "green")
                
            if closed_tickets:
                for ticket in closed_tickets:
                    self.call_from_thread(self.trigger_alert, f"📉 Closed position: Ticket {ticket}", "info")
                self.call_from_thread(self.flash_widget_border, ID_POS_PANEL, "red")
                self.call_from_thread(self.flash_widget_border, ID_DASH_POS_PANEL, "red")
                
        self.last_position_tickets = current_tickets

        rows = []
        for pos in positions:
            pnl = pos.profit
            pnl_c = "green" if pnl >= 0 else "red"
            typ = "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL"
            typ_c = "green" if typ == "BUY" else "red"
            if pos.magic == settings.magic_numbers.scalper:
                role = "Scalper"
            elif pos.magic == settings.magic_numbers.runner:
                role = "Runner"
            else:
                role = str(pos.magic)
            risk_label = "[bold green]FREE[/bold green]" if pos.sl > 0 and ((pos.type == mt5.ORDER_TYPE_BUY and pos.sl >= pos.price_open) or (pos.type == mt5.ORDER_TYPE_SELL and pos.sl <= pos.price_open)) else "[bold red]RISK[/bold red]"
            rows.append((
                pos.ticket, pos.symbol, f"[{typ_c}]{typ}[/{typ_c}]", f"{pos.price_open:.5f}",
                f"{pos.price_current:.5f}", f"{pos.sl:.5f}", f"{pos.tp:.5f}", f"[{pnl_c}]${pnl:+.2f}[/{pnl_c}]", risk_label if "dash" in self.query_one(TabbedContent).active else role
            ))
            
        try:
            self.call_from_thread(self.query_one(ID_POS_PANEL, PositionsTable).update_rows, rows)
        except Exception:
            pass
        try:
            self.call_from_thread(self.query_one(ID_DASH_POS_PANEL, PositionsTable).update_rows, rows)
        except Exception:
            pass

        # Market watch tables
        mw_rows = []
        search_query = self.mw_search_query
        for sym, data in self.market_watch_data.items():
            bkt = data.get("bucket", "N/A")
            if search_query and (search_query not in sym.lower() and search_query not in bkt.lower()):
                continue
            info = mt5.symbol_info_tick(sym)
            if info:
                new_price = info.bid
                old_price = data["price"]
                data["price"] = new_price
                data["history"].append(new_price)
                if len(data["history"]) > 15:
                    data["history"].pop(0)
                
                price_c = "white"
                if old_price > 0:
                    if new_price > old_price:
                        price_c = "green"
                    elif new_price < old_price:
                        price_c = "red"
                
                spark_raw = generate_sparkline(data["history"])
                spark_c = "green" if data["history"][-1] >= data["history"][0] else "red"
                spark = f"[{spark_c}]{spark_raw}[/{spark_c}]"
                
                sig = data["signal"]
                if sig == "BUY":
                    sig_str = "[bold green]↑ BUY[/bold green]"
                elif sig == "SELL":
                    sig_str = "[bold red]↓ SELL[/bold red]"
                else:
                    sig_str = "[dim]─ NONE[/dim]"
                    
                e13 = data.get("e13_dist", 0)
                e50 = data.get("e50_dist", 0)
                s200 = data.get("s200_dist", 0)
                
                def fmt_d(d):
                    if d > 0:
                        return f"[green]+{d:.0f}[/]"
                    if d < 0:
                        return f"[red]{d:.0f}[/]"
                    return "0"
                
                mw_rows.append((
                    sym, 
                    f"[bold {price_c}]{new_price:.5f}[/bold {price_c}]", 
                    spark,
                    fmt_d(e13), fmt_d(e50), fmt_d(s200), bkt,
                    sig_str
                ))
                
        try:
            self.call_from_thread(self.query_one(ID_MW_PANEL, MarketWatchTable).update_rows, mw_rows)
        except Exception:
            pass
        try:
            self.call_from_thread(self.query_one(ID_DASH_MW_PANEL, MarketWatchTable).update_rows, mw_rows)
        except Exception:
            pass

    @work(thread=True)
    def _refresh_signals(self) -> None:
        for sym, data in self.market_watch_data.items():
            info = mt5.symbol_info(sym)
            if not info or info.volume_min > 0.01:
                continue
            ind = get_m30_indicators(sym)
            if ind:
                sig = evaluate_signal(ind)
                data["signal"] = sig
                
                price = info.bid
                point = info.point
                if point > 0:
                    data["e13_dist"] = (price - ind['ema_fast']) / point
                    data["e50_dist"] = (price - ind['ema_medium']) / point
                    data["s200_dist"] = (price - ind['sma_slow']) / point
                    
                bucket_name = "N/A"
                for name, symbols in settings.correlation_groups.items():
                    if sym in symbols:
                        bucket_name = name
                        break
                data["bucket"] = bucket_name
        
    @work(thread=True)
    def _refresh_performance(self) -> None:
        try:
            # 1. System diagnostics & latency
            start_ping = time.perf_counter()
            terminal_info = mt5.terminal_info()
            latency = (time.perf_counter() - start_ping) * 1000.0
            
            mem_mb = get_memory_usage_mb()
            cpu_pct = self.cpu_tracker.get_cpu_percent()
            
            if terminal_info:
                algo_str = "[bold green]ENABLED[/bold green]" if terminal_info.trade_allowed else "[bold red]DISABLED[/bold red]"
                mt5_str = "[bold green]ONLINE[/bold green]"
                ping_str = f"[bold green]{latency:.1f} ms[/bold green]"
            else:
                algo_str = "[dim]N/A[/dim]"
                mt5_str = "[bold red]OFFLINE[/bold red]"
                ping_str = "[bold red]-- ms[/bold red]"
                
            db_ok = "✔ OK"
            try:
                with db.get_connection() as conn:
                    conn.execute("SELECT 1")
            except Exception:
                db_ok = "✘ ERR"
                
            diag_text = (
                f"  MT5 Terminal:    {mt5_str}\n"
                f"  Algo Trading:    {algo_str}\n"
                f"  DB Status:       [bold cyan]{db_ok}[/bold cyan]\n"
                f"  API Latency:     {ping_str}\n"
                f"  Process Memory:  [bold white]{mem_mb:.1f} MB[/bold white]\n"
                f"  Process CPU:     [bold white]{cpu_pct:.1f}%[/bold white]\n"
            )
            try:
                self.call_from_thread(self.query_one("#diagnostics-label", Label).update, diag_text)
            except Exception:
                pass
            
            # Update DashboardHeader
            self.call_from_thread(self._update_header, terminal_info, latency)
            
            # Update Dashboard static panels
            uptime_str = self._get_uptime_str()
            try:
                self.call_from_thread(self.query_one("#dash-overview", OverviewPanel).update_data, uptime_str)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#dash-risk", RiskSummaryPanel).update_data)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#risk-mgr-slots", RiskSummaryPanel).update_data)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#dash-corr", CorrelationGuardPanel).update_data)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#risk-mgr-corr", CorrelationGuardPanel).update_data)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#dash-health", SystemHealthPanel).update_gates)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#dash-priority", PriorityEnginePanel).update_data)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#dash-performance", SystemPerformancePanel).update_data, cpu_pct, mem_mb)
            except Exception:
                pass
            
            # 2. Strategy Performance breakdown
            strat_metrics = state_manager.get_strategy_performance_metrics()
            s_text = ""
            for name, m in strat_metrics.items():
                pf = m['profit_factor']
                pf_str = f"{pf:.2f}" if pf != float('inf') else "INF"
                pnl_c = "green" if m['total_profit'] >= 0 else "red"
                s_text += (
                    f"[bold yellow]{name}[/bold yellow] ({settings.magic_numbers.scalper if name == 'Scalper' else settings.magic_numbers.runner}):\n"
                    f"  Trades: [bold white]{m['total_trades']}[/bold white] | Win Rate: [bold cyan]{m['win_rate']:.1f}%[/bold cyan]\n"
                    f"  Profit Factor: [bold cyan]{pf_str}[/bold cyan]\n"
                    f"  Total P&L: [{pnl_c}]+${m['total_profit']:.2f}[/{pnl_c}]\n\n"
                )
            try:
                self.call_from_thread(self.query_one("#strategy-label", Label).update, s_text)
            except Exception:
                pass

            # 3. Global metrics
            metrics = state_manager.get_performance_metrics()
            pf = metrics.get('profit_factor', 0)
            pf_str = f"{pf:.2f}" if pf != float('inf') else "INF"
            sr = metrics.get('sharpe_ratio', 0)
            dd = metrics.get('max_drawdown', 0)
            
            m_text = (
                f"  Total Trades:   [bold white]{metrics['total_trades']}[/bold white]\n"
                f"  Win Rate:       [bold cyan]{metrics['win_rate']:.1f}%[/bold cyan]\n"
                f"  Profit Factor:  [bold cyan]{pf_str}[/bold cyan]\n"
                f"  Max Drawdown:   [bold red]${dd:.2f}[/bold red]\n"
                f"  Sharpe Ratio:   [bold cyan]{sr:.2f}[/bold cyan]\n"
                f"  Total Profit:   [bold {'green' if metrics['total_profit'] >= 0 else 'red'}]+${metrics['total_profit']:.2f}[/]\n"
            )
            try:
                self.call_from_thread(self.query_one("#metrics-label", Label).update, m_text)
            except Exception:
                pass
            time.sleep(3) # Initial delay to let MT5 connect
            # Trigger an immediate trade cycle on startup so it trades right away
            try:
                process_m30_cycle()
            except Exception as e:
                self.call_from_thread(self.log_msg, f"[bold red]Startup cycle failed: {e}[/bold red]")
            
            # 4. Cumulative P&L chart
            history_30 = state_manager.get_trade_history(limit=30)
            profits_chrono = [h.get('profit', 0.0) for h in reversed(history_30)]
            chart_text = generate_ascii_chart(profits_chrono, height=5, width=40)
            try:
                self.call_from_thread(self.query_one("#equity-chart", Label).update, chart_text)
            except Exception:
                pass
            try:
                self.call_from_thread(self.query_one("#dash-equity-chart", Label).update, chart_text)
            except Exception:
                pass
            
            # 5. History Table
            history = state_manager.get_trade_history(limit=50)
            rows = []
            for h in history:
                profit = h.get('profit', 0)
                pnl_c = "green" if profit >= 0 else "red"
                typ = h.get('type', 'UNK')
                typ_c = "green" if typ == "BUY" else "red"
                ts = h.get('close_time', '')
                if ts and len(ts) > 19:
                    ts = ts[:19]
                rows.append((
                    ts,
                    h.get('symbol', ''),
                    f"[{typ_c}]{typ}[/{typ_c}]",
                    f"{h.get('entry_price', 0):.5f}",
                    f"[{pnl_c}]${profit:+.2f}[/{pnl_c}]"
                ))
            try:
                self.call_from_thread(self.query_one("#history-panel", TradeHistoryTable).update_rows, rows)
            except Exception:
                pass
        except Exception as e:
            logger.error(f"Failed to fetch performance: {e}")

    def _update_header(self, terminal_info, latency) -> None:
        try:
            bot_lbl = self.query_one("#hdr-bot", Label)
            if _bot_running:
                bot_lbl.update("Status: [bold green]● RUNNING[/bold green]")
            else:
                bot_lbl.update("Status: [bold red]● STOPPED[/bold red]")
                
            mt5_lbl = self.query_one("#hdr-mt5", Label)
            if terminal_info:
                mt5_lbl.update("MT5: [bold green]● CONNECTED[/bold green]")
            else:
                mt5_lbl.update("MT5: [bold red]● OFFLINE[/bold red]")
                
            time_lbl = self.query_one("#hdr-time", Label)
            server_time_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            time_lbl.update(f"Time: [bold cyan]{server_time_str}[/bold cyan]")
            
            # Balance/Equity/Margin
            account = mt5.account_info()
            if account:
                self.query_one("#hdr-bal", Label).update(f"Bal: [bold white]${account.balance:.2f}[/bold white]")
                self.query_one("#hdr-eq", Label).update(f"Eq: [bold white]${account.equity:.2f}[/bold white]")
                self.query_one("#hdr-margin", Label).update(f"Margin: [bold white]${account.margin_free:.2f}[/bold white]")
        except Exception:
            pass

    def _get_uptime_str(self) -> str:
        uptime_secs = int(time.time() - self.start_time)
        d = uptime_secs // 86400
        h = (uptime_secs % 86400) // 3600
        m = (uptime_secs % 3600) // 60
        s = uptime_secs % 60
        if d > 0:
            return f"{d}d {h}h {m}m {s}s"
        return f"{h}h {m}m {s}s"

    # ── Loguru sink ───────────────────────────────────────────────────────────

    def _loguru_sink(self, message) -> None:
        record = message.record
        level = record["level"].name
        colors = {"INFO": "cyan", "WARNING": "yellow", "ERROR": "red", "CRITICAL": "bold red", "DEBUG": "dim"}
        c = colors.get(level, "white")
        ts = record["time"].strftime("%H:%M:%S")
        text = f"[{c}]{ts} {level:<8}[/{c}] {record['message']}"
        
        self.log_history.append({
            "text": text,
            "level": level,
            "message": record['message'].lower()
        })
        if len(self.log_history) > 1000:
            self.log_history.pop(0)
            
        try:
            if self._should_display_log(level, record['message']):
                self.call_from_thread(self.log_msg, text)
                
            if level in ("ERROR", "CRITICAL"):
                self.call_from_thread(self.trigger_alert, f"❌ Error: {record['message']}", "error")
                self.call_from_thread(self.flash_widget_border, ID_LOG_PANEL, "red")
                self.call_from_thread(self.flash_widget_border, ID_DASH_LOG_PANEL, "red")
        except RuntimeError:
            pass  # App is no longer running

    def _should_display_log(self, level: str, message_text: str) -> bool:
        if self.current_log_level != "ALL":
            if self.current_log_level == "WARN" and level not in ("WARNING", "CRITICAL"):
                return False
            elif self.current_log_level == "ERROR" and level not in ("ERROR", "CRITICAL"):
                return False
            elif self.current_log_level == "INFO" and level != "INFO":
                return False
                
        search_query = self.current_log_search.strip().lower()
        if search_query and search_query not in message_text.lower():
            return False
            
        return True

    def _reapply_log_filters(self) -> None:
        try:
            log_panel = self.query_one(ID_LOG_PANEL, LogPanel)
            log_panel.clear()
            for item in self.log_history:
                if self._should_display_log(item["level"], item["message"]):
                    log_panel.write(item["text"])
        except Exception:
            pass
        try:
            dash_panel = self.query_one("#dash-log-panel", LogPanel)
            dash_panel.clear()
            for item in self.log_history:
                if self._should_display_log(item["level"], item["message"]):
                    dash_panel.write(item["text"])
        except Exception:
            pass

    def log_msg(self, text: str) -> None:
        try:
            self.query_one(ID_LOG_PANEL, LogPanel).write(text)
        except Exception:
            pass
        try:
            self.query_one("#dash-log-panel", LogPanel).write(text)
        except Exception:
            pass

    # ── Button & Modal handling ───────────────────────────────────────────────

    def on_button_pressed(self, event: Button.Pressed) -> None:
        actions = {
            "btn-start": self.action_start_bot,
            "btn-stop":  self.action_stop_bot,
            "btn-pause": self.action_pause_bot,
            "btn-force": self.action_force_cycle,
            "btn-panic": self.action_prompt_panic,
            "btn-save-config": self.action_prompt_save_config,
        }
        action = actions.get(event.button.id)
        if action:
            action()

    @on(DataTable.RowSelected, "#pos-table")
    def handle_position_selected(self, event: DataTable.RowSelected) -> None:
        table = event.data_table
        row_key = event.row_key
        row_data = table.get_row(row_key)
        ticket = int(row_data[0])
        symbol = row_data[1]
        sl_str = str(row_data[5])
        tp_str = str(row_data[6])
        
        def handle_pos_action(result):
            if result:
                action = result["action"]
                if action == "close":
                    self._execute_single_close(result["ticket"], result["symbol"])
                elif action == "modify_sl":
                    self._execute_single_modify_sl(result["ticket"], result["symbol"], result["new_sl"])
                elif action == "modify_tp":
                    self._execute_single_modify_tp(result["ticket"], result["symbol"], result["new_tp"])
                elif action == "be":
                    self._execute_single_be(result["ticket"], result["symbol"])
                elif action == "partial":
                    self._execute_partial_close(result["ticket"], result["symbol"])
        
        self.push_screen(PositionControlModal(ticket, symbol, sl_str, tp_str), handle_pos_action)

    @work(thread=True)
    def _execute_single_close(self, ticket: int, symbol: str) -> None:
        pos = mt5.positions_get(ticket=ticket)
        if not pos:
            self.call_from_thread(self.log_msg, f"[red]Ticket {ticket} not found.[/red]")
            return
        pos = pos[0]
        tick = mt5.symbol_info_tick(symbol)
        if not tick:
            return
        
        action = mt5.TRADE_ACTION_DEAL
        if pos.type == mt5.ORDER_TYPE_BUY:
            type_mt5 = mt5.ORDER_TYPE_SELL
            price = tick.bid
        else:
            type_mt5 = mt5.ORDER_TYPE_BUY
            price = tick.ask
            
        req = {
            "action": action,
            "symbol": pos.symbol,
            "volume": pos.volume,
            "type": type_mt5,
            "position": pos.ticket,
            "price": price,
            "deviation": 20,
            "magic": pos.magic,
            "comment": "Manual Close via TUI",
        }
        res = mt5_executor._retry_wrapper(mt5.order_send, req)
        if res and res.retcode == mt5.TRADE_RETCODE_DONE:
            self.call_from_thread(self.log_msg, f"[bold green]✔ Ticket {ticket} closed manually.[/bold green]")
            self.call_from_thread(self._refresh_fast)
        else:
            self.call_from_thread(self.log_msg, f"[red]✘ Failed to close ticket {ticket}.[/red]")

    @work(thread=True)
    def _execute_single_modify_sl(self, ticket: int, symbol: str, new_sl: float) -> None:
        res = modify_sl(ticket, symbol, new_sl)
        if res:
            self.call_from_thread(self.log_msg, f"[bold green]✔ Ticket {ticket} SL manually modified to {new_sl}.[/bold green]")
            self.call_from_thread(self._refresh_fast)
        else:
            self.call_from_thread(self.log_msg, f"[red]✘ Failed to modify SL for ticket {ticket}.[/red]")

    @work(thread=True)
    def _execute_single_modify_tp(self, ticket: int, symbol: str, new_tp: float) -> None:
        positions = mt5.positions_get(ticket=ticket)
        if not positions:
            self.call_from_thread(self.log_msg, f"[red]Ticket {ticket} not found.[/red]")
            return
        position = positions[0]
        request = {
            "action": mt5.TRADE_ACTION_SLTP,
            "symbol": symbol,
            "sl": float(position.sl) if position.sl else 0.0,
            "tp": float(new_tp),
            "position": ticket
        }
        res = mt5_executor._retry_wrapper(mt5.order_send, request)
        if res and res.retcode == mt5.TRADE_RETCODE_DONE:
            self.call_from_thread(self.log_msg, f"[bold green]✔ Ticket {ticket} TP manually modified to {new_tp}.[/bold green]")
            self.call_from_thread(self._refresh_fast)
        else:
            self.call_from_thread(self.log_msg, f"[red]✘ Failed to modify TP for ticket {ticket}.[/red]")

    @work(thread=True)
    def _execute_single_be(self, ticket: int, symbol: str) -> None:
        positions = mt5.positions_get(ticket=ticket)
        if not positions:
            self.call_from_thread(self.log_msg, f"[red]Ticket {ticket} not found.[/red]")
            return
        pos = positions[0]
        entry = pos.price_open
        res = modify_sl(ticket, symbol, entry)
        if res:
            self.call_from_thread(self.log_msg, f"[bold green]✔ Ticket {ticket} moved to Breakeven at {entry:.5f}.[/bold green]")
            self.call_from_thread(self._refresh_fast)
        else:
            self.call_from_thread(self.log_msg, f"[red]✘ Failed to move ticket {ticket} to Breakeven.[/red]")

    @work(thread=True)
    def _execute_partial_close(self, ticket: int, symbol: str) -> None:
        positions = mt5.positions_get(ticket=ticket)
        if not positions:
            self.call_from_thread(self.log_msg, f"[red]Ticket {ticket} not found.[/red]")
            return
        pos = positions[0]
        half_vol = round(pos.volume / 2.0, 2)
        if half_vol < 0.01:
            self.call_from_thread(self.log_msg, f"[red]Ticket {ticket} volume {pos.volume} too small for partial close.[/red]")
            return
            
        tick = mt5.symbol_info_tick(symbol)
        if not tick:
            return
        
        action = mt5.TRADE_ACTION_DEAL
        if pos.type == mt5.ORDER_TYPE_BUY:
            type_mt5 = mt5.ORDER_TYPE_SELL
            price = tick.bid
        else:
            type_mt5 = mt5.ORDER_TYPE_BUY
            price = tick.ask
            
        req = {
            "action": action,
            "symbol": pos.symbol,
            "volume": half_vol,
            "type": type_mt5,
            "position": pos.ticket,
            "price": price,
            "deviation": 20,
            "magic": pos.magic,
            "comment": "Manual Partial Close via TUI",
        }
        res = mt5_executor._retry_wrapper(mt5.order_send, req)
        if res and res.retcode == mt5.TRADE_RETCODE_DONE:
            self.call_from_thread(self.log_msg, f"[bold green]✔ Ticket {ticket} partially closed (50% = {half_vol} lots).[/bold green]")
            self.call_from_thread(self._refresh_fast)
        else:
            self.call_from_thread(self.log_msg, f"[red]✘ Failed to partially close ticket {ticket}.[/red]")

    def action_prompt_panic(self):
        def check_panic(result: bool):
            if result:
                self.execute_panic()
        self.push_screen(PanicModal(), check_panic)
        
    def action_prompt_save_config(self):
        def check_save(result: bool):
            if result:
                self.save_configuration()
        self.push_screen(SaveConfigModal(), check_save)
        
    @work(thread=True)
    def execute_panic(self):
        self.call_from_thread(self.log_msg, "[bold red]⚠️ PANIC ACTIVATED! Closing all trades...[/bold red]")
        positions = mt5.positions_get()
        if not positions:
            self.call_from_thread(self.log_msg, "[cyan]No open positions to close.[/cyan]")
            return
            
        closed = 0
        for pos in positions:
            tick = mt5.symbol_info_tick(pos.symbol)
            if not tick:
                continue
            
            action = mt5.TRADE_ACTION_DEAL
            if pos.type == mt5.ORDER_TYPE_BUY:
                type_mt5 = mt5.ORDER_TYPE_SELL
                price = tick.bid
            else:
                type_mt5 = mt5.ORDER_TYPE_BUY
                price = tick.ask
                
            req = {
                "action": action,
                "symbol": pos.symbol,
                "volume": pos.volume,
                "type": type_mt5,
                "position": pos.ticket,
                "price": price,
                "deviation": 20,
                "magic": pos.magic,
                "comment": "Panic Close",
            }
            res = mt5_executor._retry_wrapper(mt5.order_send, req)
            if res and res.retcode == mt5.TRADE_RETCODE_DONE:
                closed += 1
                
        self.call_from_thread(self.log_msg, f"[bold green]✔ Panic close completed. {closed}/{len(positions)} trades closed.[/bold green]")
        self.call_from_thread(self.trigger_alert, f"⚠️ Panic Close completed: {closed}/{len(positions)} trades closed.", "warn")
        self.call_from_thread(self.action_stop_bot)
        self.call_from_thread(self._refresh_fast)
        
    @work(thread=True)
    def save_configuration(self):
        try:
            max_risk = int(self.query_one("#cfg-max-risk", Input).value)
            lot_size = float(self.query_one("#cfg-lot-size", Input).value)
            
            with open("config/settings.yaml", "r") as f:
                data = yaml.safe_load(f)
                
            data['trading']['max_risk_trades'] = max_risk
            data['trading']['lot_size'] = lot_size
            
            with open("config/settings.yaml", "w") as f:
                yaml.dump(data, f)
                
            settings.trading.max_risk_trades = max_risk
            settings.trading.lot_size = lot_size
            
            self.call_from_thread(self.log_msg, f"[bold green]✔ Config saved. max_risk_trades={max_risk}, lot_size={lot_size}.[/bold green]")
            self.call_from_thread(self.trigger_alert, "💾 Configuration saved to settings.yaml", "success")
            self.call_from_thread(self._refresh_fast)
            
        except Exception as e:
            self.call_from_thread(self.log_msg, f"[bold red]✘ Failed to save config: {e}[/bold red]")
            self.call_from_thread(self.trigger_alert, f"✘ Failed to save config: {e}", "error")

    def action_start_bot(self) -> None:
        global _bot_running, _bot_thread
        if _bot_running:
            self.log_msg("[yellow]Bot is already running.[/yellow]")
            return
        _bot_running = True
        _bot_thread = threading.Thread(target=_bot_loop, args=(self.log_msg,), daemon=True)
        _bot_thread.start()
        self.trigger_alert("▶ Bot execution loop started.", "success")

    def action_stop_bot(self) -> None:
        global _bot_running
        if not _bot_running:
            self.log_msg("[yellow]Bot is not running.[/yellow]")
            return
        _bot_running = False
        self.trigger_alert("■ Bot execution loop stopped.", "warn")

    def action_pause_bot(self) -> None:
        self.log_msg("[yellow]⏸ Pause toggles APScheduler jobs (coming soon).[/yellow]")

    @work(thread=True)
    def action_force_cycle(self) -> None:
        self.call_from_thread(self.log_msg, "[bold cyan]⚡ Force cycle triggered manually.[/bold cyan]")
        try:
            process_m30_cycle()
            self.call_from_thread(self.log_msg, "[cyan]⚡ Force cycle complete.[/cyan]")
            self.call_from_thread(self.trigger_alert, "⚡ Force cycle completed successfully.", "success")
        except Exception as e:
            self.call_from_thread(self.log_msg, f"[red]⚡ Force cycle error: {e}[/red]")
            self.call_from_thread(self.trigger_alert, f"⚡ Force cycle error: {e}", "error")
        self.call_from_thread(self._refresh_fast)

    @on(Input.Changed, "#mw-search-input")
    def handle_mw_search_changed(self, event: Input.Changed) -> None:
        self.mw_search_query = event.value.strip().lower()
        self._refresh_fast()

    @on(Input.Changed, "#log-search-input")
    def handle_log_search_changed(self, event: Input.Changed) -> None:
        self.current_log_search = event.value
        self._reapply_log_filters()

    @on(Button.Pressed, ".log-filter-btn")
    def handle_log_filter_pressed(self, event: Button.Pressed) -> None:
        for btn in self.query(".log-filter-btn"):
            btn.variant = "default"
        event.button.variant = "primary"
        self.current_log_level = event.button.label.plain.strip()
        self._reapply_log_filters()

    def action_select_tab(self, tab_id: str) -> None:
        try:
            self.query_one(TabbedContent).active = tab_id
        except Exception:
            pass

    def action_quit(self) -> None:
        global _bot_running
        _bot_running = False
        mt5_conn.disconnect()
        self.exit()


if __name__ == "__main__":
    XiphosApp().run()
