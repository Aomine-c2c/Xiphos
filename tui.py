"""
Xiphos Trading Framework - Textual TUI
Run with: python tui.py
"""

import threading
import time
from datetime import datetime, timedelta
from loguru import logger

from textual import work
from textual.app import App, ComposeResult
from textual.containers import Horizontal
from textual.widgets import Header, Footer, DataTable, RichLog, Label, Button, Static

import MetaTrader5 as mt5

from core.config import settings
from core.logger import log
from execution.connection import mt5_conn
from execution.trailing import trail_positions
from indicators.moving_averages import get_m30_indicators
from monitoring.scheduler import scheduler
from risk.slots import calculate_available_slots
from strategies.trend_following import evaluate_signal
from main import process_m30_cycle

# ── Bot thread management ─────────────────────────────────────────────────────

_bot_running = False
_bot_thread: threading.Thread | None = None

def _bot_loop(log_cb):
    global _bot_running
    log_cb("[bold green]▶ Bot started.[/bold green]")
    scheduler.add_m30_job(process_m30_cycle)
    scheduler.add_trailing_job(trail_positions)
    scheduler.start()
    # Fire immediately — don't wait for the next M30 boundary
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

# ── Helpers ───────────────────────────────────────────────────────────────────

def _next_m30_str() -> str:
    now = datetime.now()
    if now.minute < 30:
        nxt = now.replace(minute=30, second=0, microsecond=0)
    else:
        nxt = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
    secs = max(0, int((nxt - now).total_seconds()))
    mm, ss = divmod(secs, 60)
    return f"{mm:02d}:{ss:02d}"

# ── Widgets ───────────────────────────────────────────────────────────────────

class StatusPanel(Static):
    DEFAULT_CSS = """
    StatusPanel {
        border: round $primary;
        padding: 1 2;
        height: 100%;
        width: 2fr;
    }
    """
    def compose(self) -> ComposeResult:
        yield Label("[dim]Loading...[/dim]", id="status-content")

    def update_display(self, text: str) -> None:
        self.query_one("#status-content", Label).update(text)


class SignalFeedPanel(Static):
    DEFAULT_CSS = """
    SignalFeedPanel {
        border: round $primary;
        padding: 1 2;
        height: 100%;
        width: 3fr;
        overflow-y: auto;
    }
    """
    def compose(self) -> ComposeResult:
        yield Label("[dim]Fetching signals...[/dim]", id="signal-content")

    def update_display(self, text: str) -> None:
        self.query_one("#signal-content", Label).update(text)


class PositionsTable(Static):
    DEFAULT_CSS = """
    PositionsTable {
        border: round $primary;
        padding: 0 1;
        height: 10;
    }
    """
    def compose(self) -> ComposeResult:
        t = DataTable(id="pos-table", zebra_stripes=True, cursor_type="none")
        t.add_columns("Symbol", "Type", "Entry", "Current", "SL", "P&L", "Role")
        yield t

    def update_rows(self, rows: list) -> None:
        t = self.query_one("#pos-table", DataTable)
        t.clear()
        for row in rows:
            t.add_row(*row)


class LogPanel(RichLog):
    DEFAULT_CSS = """
    LogPanel {
        border: round $primary;
        padding: 0 1;
        height: 1fr;
        scrollbar-gutter: stable;
    }
    """


class ControlsBar(Static):
    DEFAULT_CSS = """
    ControlsBar {
        height: 3;
        align: center middle;
    }
    Button { margin: 0 1; min-width: 14; }
    """
    def compose(self) -> ComposeResult:
        yield Button("▶  Start",        id="btn-start",  variant="success")
        yield Button("■  Stop",          id="btn-stop",   variant="error")
        yield Button("⏸  Pause",         id="btn-pause",  variant="warning")
        yield Button("⚡ Force Cycle",   id="btn-force",  variant="primary")


# ── App ───────────────────────────────────────────────────────────────────────

class XiphosApp(App):
    TITLE = "Xiphos"
    SUB_TITLE = "Algorithmic Trading Framework"
    BINDINGS = [
        ("q", "quit",        "Quit"),
        ("s", "start_bot",   "Start"),
        ("x", "stop_bot",    "Stop"),
        ("p", "pause_bot",   "Pause"),
        ("f", "force_cycle", "Force Cycle"),
    ]
    CSS = """
    Screen { background: $surface; }
    #top-row { height: 16; }
    .section-lbl {
        color: $accent;
        text-style: bold;
        padding: 0 2;
        height: 1;
    }
    """

    def compose(self) -> ComposeResult:
        yield Header()
        with Horizontal(id="top-row"):
            yield StatusPanel(id="status-panel")
            yield SignalFeedPanel(id="signal-panel")
        yield Label("  ▸ OPEN POSITIONS", classes="section-lbl")
        yield PositionsTable(id="positions-panel")
        yield Label("  ▸ LIVE LOG", classes="section-lbl")
        yield LogPanel(id="log-panel", highlight=True, markup=True, max_lines=500)
        yield ControlsBar()
        yield Footer()

    def on_mount(self) -> None:
        # Pipe loguru → log panel (non-blocking via call_from_thread)
        logger.add(
            self._loguru_sink,
            format="{time:HH:mm:ss} | {level:<8} | {message}",
            colorize=False,
        )

        # Connect MT5 in a worker so it doesn't block rendering
        self._connect_mt5()

        # Fast refresh: status + positions every 5s
        self.set_interval(5,  self._refresh_fast)
        # Slow refresh: signal scan every 30s (each symbol fetches candles)
        self.set_interval(30, self._refresh_signals)

    # ── MT5 connect worker ────────────────────────────────────────────────────

    @work(thread=True, exclusive=True)
    def _connect_mt5(self) -> None:
        if mt5_conn.connect():
            self.call_from_thread(self.log_msg, "[bold green]✔ Connected to MetaTrader 5.[/bold green]")
            self.call_from_thread(self._refresh_fast)
            self.call_from_thread(self._refresh_signals)
        else:
            self.call_from_thread(self.log_msg, "[bold red]✘ Failed to connect to MT5![/bold red]")

    # ── Fast refresh (status + positions) ────────────────────────────────────

    @work(thread=True)
    def _refresh_fast(self) -> None:
        # --- Status panel ---
        account = mt5.account_info()
        secs = _next_m30_str()
        if account:
            conn_str  = "[bold green]● ONLINE[/bold green]"
            bal_str   = f"[bold white]${account.balance:.2f}[/bold white]"
            eq_str    = f"[bold white]${account.equity:.2f}[/bold white]"
            mg_str    = f"[bold white]${account.margin_free:.2f}[/bold white]"
            pnl_c     = "green" if account.profit >= 0 else "red"
            pnl_str   = f"[bold {pnl_c}]${account.profit:+.2f}[/bold {pnl_c}]"
            slots_av  = calculate_available_slots()
            slots_us  = settings.trading.max_risk_trades - slots_av
            sl_c      = "green" if slots_av > 0 else "red"
        else:
            conn_str = "[bold red]● OFFLINE[/bold red]"
            bal_str = eq_str = mg_str = pnl_str = "[dim]N/A[/dim]"
            slots_us, slots_av, sl_c = 0, 0, "red"

        status_text = (
            f"  Connection   {conn_str}\n"
            f"  Balance      {bal_str}\n"
            f"  Equity       {eq_str}\n"
            f"  Free Margin  {mg_str}\n"
            f"  Float P&L    {pnl_str}\n"
            f"  Risk Slots   [{sl_c}]{slots_us}/{settings.trading.max_risk_trades}[/{sl_c}]\n"
            f"  Next M30     [cyan]{secs}[/cyan]"
        )
        self.call_from_thread(
            self.query_one("#status-panel", StatusPanel).update_display, status_text
        )

        # --- Positions table ---
        positions = mt5.positions_get() or []
        rows = []
        for pos in positions:
            pnl = pos.profit
            pnl_c = "green" if pnl >= 0 else "red"
            typ = "BUY" if pos.type == mt5.ORDER_TYPE_BUY else "SELL"
            typ_c = "green" if typ == "BUY" else "red"
            role = (
                "Scalper" if pos.magic == settings.magic_numbers.scalper
                else "Runner" if pos.magic == settings.magic_numbers.runner
                else str(pos.magic)
            )
            rows.append((
                pos.symbol,
                f"[{typ_c}]{typ}[/{typ_c}]",
                f"{pos.price_open:.5f}",
                f"{pos.price_current:.5f}",
                f"{pos.sl:.5f}",
                f"[{pnl_c}]${pnl:+.2f}[/{pnl_c}]",
                role,
            ))
        self.call_from_thread(
            self.query_one("#positions-panel", PositionsTable).update_rows, rows
        )

    # ── Slow refresh (signal scan) ────────────────────────────────────────────

    @work(thread=True)
    def _refresh_signals(self) -> None:
        lines = []
        for _group, symbols in settings.correlation_groups.items():
            for sym in symbols:
                info = mt5.symbol_info(sym)
                if not info or info.volume_min > 0.01:
                    continue
                ind = get_m30_indicators(sym)
                if not ind:
                    lines.append(f"  [dim]─ {sym:<28} NO DATA[/dim]")
                    continue
                sig = evaluate_signal(ind)
                if sig == "BUY":
                    lines.append(f"  [bold green]↑ {sym:<28} BUY[/bold green]")
                elif sig == "SELL":
                    lines.append(f"  [bold red]↓ {sym:<28} SELL[/bold red]")
                else:
                    lines.append(f"  [dim]─ {sym:<28} NONE[/dim]")

        text = "\n".join(lines) if lines else "[dim]No symbols available[/dim]"
        self.call_from_thread(
            self.query_one("#signal-panel", SignalFeedPanel).update_display, text
        )

    # ── Loguru sink ───────────────────────────────────────────────────────────

    def _loguru_sink(self, message) -> None:
        record = message.record
        level = record["level"].name
        colors = {"INFO": "cyan", "WARNING": "yellow", "ERROR": "red",
                  "CRITICAL": "bold red", "DEBUG": "dim"}
        c = colors.get(level, "white")
        ts = record["time"].strftime("%H:%M:%S")
        text = f"[{c}]{ts} {level:<8}[/{c}] {record['message']}"
        self.call_from_thread(self.log_msg, text)

    def log_msg(self, text: str) -> None:
        try:
            self.query_one("#log-panel", LogPanel).write(text)
        except Exception:
            pass

    # ── Button handling ───────────────────────────────────────────────────────

    def on_button_pressed(self, event: Button.Pressed) -> None:
        actions = {
            "btn-start": self.action_start_bot,
            "btn-stop":  self.action_stop_bot,
            "btn-pause": self.action_pause_bot,
            "btn-force": self.action_force_cycle,
        }
        action = actions.get(event.button.id)
        if action:
            action()

    def action_start_bot(self) -> None:
        global _bot_running, _bot_thread
        if _bot_running:
            self.log_msg("[yellow]Bot is already running.[/yellow]")
            return
        _bot_running = True
        _bot_thread = threading.Thread(
            target=_bot_loop, args=(self.log_msg,), daemon=True
        )
        _bot_thread.start()

    def action_stop_bot(self) -> None:
        global _bot_running
        if not _bot_running:
            self.log_msg("[yellow]Bot is not running.[/yellow]")
            return
        _bot_running = False

    def action_pause_bot(self) -> None:
        self.log_msg("[yellow]⏸ Pause toggles APScheduler jobs (coming soon).[/yellow]")

    @work(thread=True)
    def action_force_cycle(self) -> None:
        self.call_from_thread(self.log_msg, "[bold cyan]⚡ Force cycle triggered manually.[/bold cyan]")
        try:
            process_m30_cycle()
            self.call_from_thread(self.log_msg, "[cyan]⚡ Force cycle complete.[/cyan]")
        except Exception as e:
            self.call_from_thread(self.log_msg, f"[red]⚡ Force cycle error: {e}[/red]")
        self.call_from_thread(self._refresh_fast)

    def action_quit(self) -> None:
        global _bot_running
        _bot_running = False
        mt5_conn.disconnect()
        self.exit()


if __name__ == "__main__":
    XiphosApp().run()
