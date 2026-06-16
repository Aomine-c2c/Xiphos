from rich.live import Live
from rich.table import Table
from rich.console import Console
import MetaTrader5 as mt5
from core.config import settings
from risk.RiskSlotManager import RiskSlotManager

console = Console()

def generate_dashboard() -> Table:
    table = Table(title="Xiphos Production Terminal", expand=True)
    
    table.add_column("Metric", justify="right", style="cyan", no_wrap=True)
    table.add_column("Value", style="magenta")
    
    # MT5 connection
    account_info = mt5.account_info()
    if account_info:
        table.add_row("Connection Status", "[green]Online[/green]")
        table.add_row("Account Balance", f"${account_info.balance:.2f}")
        table.add_row("Equity", f"${account_info.equity:.2f}")
    else:
        table.add_row("Connection Status", "[red]Offline[/red]")
        table.add_row("Account Balance", "N/A")
        table.add_row("Equity", "N/A")
        
    # Open trades
    positions = mt5.positions_total() if account_info else 0
    table.add_row("Open Positions", str(positions))
    
    # Risk slots
    if account_info:
        slots = RiskSlotManager.get_available_slots(magic_filter=[135001, 135002])
        used = settings.trading.max_risk_trades - slots
        table.add_row("Risk Slots Used", f"{used} / {settings.trading.max_risk_trades}")
        table.add_row("Risk Slots Available", str(slots))
    else:
        table.add_row("Risk Slots Used", "N/A")
        table.add_row("Risk Slots Available", "N/A")
    
    return table
