"""
Xiphos Trading Framework - Advanced Textual TUI
Run with: python tui.py
"""

import threading
import time
import yaml
from datetime import datetime, timedelta
from loguru import logger

from textual import work, on
from textual.app import App, ComposeResult
from textual.containers import Horizontal, Vertical, VerticalScroll
from textual.widgets import (
    Header, Footer, DataTable, RichLog, Label, Button, Static,
    TabbedContent, TabPane, Input, Markdown
)
from textual.screen import ModalScreen

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
from state_manager import StateManager
from mt5_executor import MT5Executor

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


# ── Widgets ───────────────────────────────────────────────────────────────────

class StatusPanel(Static):
    DEFAULT_CSS = "StatusPanel { border: round $primary; padding: 1 2; height: 100%; width: 2fr; }"
    def compose(self) -> ComposeResult:
        yield Label("[dim]Loading...[/dim]", id="status-content")
    def update_display(self, text: str) -> None:
        self.query_one("#status-content", Label).update(text)


class SignalFeedPanel(Static):
    DEFAULT_CSS = "SignalFeedPanel { border: round $primary; padding: 1 2; height: 100%; width: 3fr; overflow-y: auto; }"
    def compose(self) -> ComposeResult:
        yield Label("[dim]Fetching signals...[/dim]", id="signal-content")
    def update_display(self, text: str) -> None:
        self.query_one("#signal-content", Label).update(text)


class PositionsTable(Static):
    DEFAULT_CSS = "PositionsTable { border: round $primary; padding: 0 1; height: 10; }"
    def compose(self) -> ComposeResult:
        t = DataTable(id="pos-table", zebra_stripes=True, cursor_type="none")
        t.add_columns("Symbol", "Type", "Entry", "Current", "SL", "P&L", "Role")
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
    .section-lbl { color: $accent; text-style: bold; padding: 0 2; height: 1; }
    .metrics-panel { border: round $success; padding: 1 2; height: auto; margin-bottom: 1;}
    .config-panel { border: round $warning; padding: 1 2; height: auto; }
    .config-row { height: 3; align: left middle;}
    .config-label { padding-top: 1; width: 25; }
    """

    def compose(self) -> ComposeResult:
        yield Header()
        
        with TabbedContent(initial="tab-live"):
            
            # --- TAB 1: Live Trading ---
            with TabPane("Live Trading", id="tab-live"):
                with Horizontal(id="top-row"):
                    yield StatusPanel(id="status-panel")
                    yield SignalFeedPanel(id="signal-panel")
                yield Label("  ▸ OPEN POSITIONS", classes="section-lbl")
                yield PositionsTable(id="positions-panel")
                yield Label("  ▸ LIVE LOG", classes="section-lbl")
                yield LogPanel(id="log-panel", highlight=True, markup=True, max_lines=500)
                yield ControlsBar()
                
            # --- TAB 2: Performance Analytics ---
            with TabPane("Performance Analytics", id="tab-perf"):
                yield Label("  ▸ GLOBAL METRICS", classes="section-lbl")
                with Vertical(classes="metrics-panel"):
                    yield Label("[dim]Loading metrics...[/dim]", id="metrics-label")
                yield Label("  ▸ RECENT TRADE HISTORY", classes="section-lbl")
                yield TradeHistoryTable(id="history-panel")

            # --- TAB 3: Config & Controls ---
            with TabPane("Config & Controls", id="tab-config"):
                yield Label("  ▸ SYSTEM CONFIGURATION (settings.yaml)", classes="section-lbl")
                with VerticalScroll(classes="config-panel"):
                    with Horizontal(classes="config-row"):
                        yield Label("Max Risk Trades:", classes="config-label")
                        yield Input(value=str(settings.trading.max_risk_trades), id="cfg-max-risk")
                        
                    with Horizontal(classes="config-row"):
                        yield Label("Max Slots per Symbol:", classes="config-label")
                        yield Input(value="2", id="cfg-max-slots") # Hardcoded in live_bot, but good to display
                        
                    with Horizontal(classes="config-row"):
                        yield Button("💾 Save Configuration", variant="success", id="btn-save-config")
                
                yield Label("  ▸ MANUAL EXECUTION", classes="section-lbl")
                with Horizontal(classes="config-row"):
                    yield Button("⚠️ PANIC CLOSE ALL", variant="error", id="btn-panic")
                

        yield Footer()

    def on_mount(self) -> None:
        logger.add(self._loguru_sink, format="{time:HH:mm:ss} | {level:<8} | {message}", colorize=False)
        self._connect_mt5()
        self.set_interval(5,  self._refresh_fast)
        self.set_interval(30, self._refresh_signals)
        self.set_interval(10, self._refresh_performance) # Refresh perf every 10s

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

    @work(thread=True)
    def _refresh_fast(self) -> None:
        # Status panel
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
        self.call_from_thread(self.query_one("#status-panel", StatusPanel).update_display, status_text)

        # Positions table
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
                pos.symbol, f"[{typ_c}]{typ}[/{typ_c}]", f"{pos.price_open:.5f}",
                f"{pos.price_current:.5f}", f"{pos.sl:.5f}", f"[{pnl_c}]${pnl:+.2f}[/{pnl_c}]", role
            ))
        self.call_from_thread(self.query_one("#positions-panel", PositionsTable).update_rows, rows)

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
        self.call_from_thread(self.query_one("#signal-panel", SignalFeedPanel).update_display, text)
        
    @work(thread=True)
    def _refresh_performance(self) -> None:
        try:
            metrics = state_manager.get_performance_metrics()
            m_text = (
                f"  Total Trades:   [bold white]{metrics['total_trades']}[/bold white]\n"
                f"  Win Rate:       [bold cyan]{metrics['win_rate']:.1f}%[/bold cyan]\n"
                f"  Total Profit:   [bold {'green' if metrics['total_profit'] >= 0 else 'red'}]+${metrics['total_profit']:.2f}[/]\n"
            )
            self.call_from_thread(self.query_one("#metrics-label", Label).update, m_text)
            
            history = state_manager.get_trade_history(limit=50)
            rows = []
            for h in history:
                profit = h.get('profit', 0)
                pnl_c = "green" if profit >= 0 else "red"
                typ = h.get('type', 'UNK')
                typ_c = "green" if typ == "BUY" else "red"
                ts = h.get('close_time', '')
                if ts and len(ts) > 19:
                    ts = ts[:19] # trim microseconds
                rows.append((
                    ts,
                    h.get('symbol', ''),
                    f"[{typ_c}]{typ}[/{typ_c}]",
                    f"{h.get('entry_price', 0):.5f}",
                    f"[{pnl_c}]${profit:+.2f}[/{pnl_c}]"
                ))
            self.call_from_thread(self.query_one("#history-panel", TradeHistoryTable).update_rows, rows)
        except Exception as e:
            logger.error(f"Failed to fetch performance: {e}")

    # ── Loguru sink ───────────────────────────────────────────────────────────

    def _loguru_sink(self, message) -> None:
        record = message.record
        level = record["level"].name
        colors = {"INFO": "cyan", "WARNING": "yellow", "ERROR": "red", "CRITICAL": "bold red", "DEBUG": "dim"}
        c = colors.get(level, "white")
        ts = record["time"].strftime("%H:%M:%S")
        text = f"[{c}]{ts} {level:<8}[/{c}] {record['message']}"
        self.call_from_thread(self.log_msg, text)

    def log_msg(self, text: str) -> None:
        try:
            self.query_one("#log-panel", LogPanel).write(text)
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
            # Close trade using an opposite order
            tick = mt5.symbol_info_tick(pos.symbol)
            if not tick: continue
            
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
        self.call_from_thread(self.action_stop_bot) # Automatically stop bot loop to prevent immediate re-entry
        self.call_from_thread(self._refresh_fast)
        
    @work(thread=True)
    def save_configuration(self):
        try:
            max_risk = int(self.query_one("#cfg-max-risk", Input).value)
            
            # Update yaml
            with open("config/settings.yaml", "r") as f:
                data = yaml.safe_load(f)
                
            data['trading']['max_risk_trades'] = max_risk
            
            with open("config/settings.yaml", "w") as f:
                yaml.dump(data, f)
                
            # Update running config
            settings.trading.max_risk_trades = max_risk
            
            self.call_from_thread(self.log_msg, f"[bold green]✔ Config saved. max_risk_trades updated to {max_risk}.[/bold green]")
            self.call_from_thread(self._refresh_fast)
            
        except Exception as e:
            self.call_from_thread(self.log_msg, f"[bold red]✘ Failed to save config: {e}[/bold red]")

    def action_start_bot(self) -> None:
        global _bot_running, _bot_thread
        if _bot_running:
            self.log_msg("[yellow]Bot is already running.[/yellow]")
            return
        _bot_running = True
        _bot_thread = threading.Thread(target=_bot_loop, args=(self.log_msg,), daemon=True)
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
