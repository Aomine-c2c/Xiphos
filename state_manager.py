import json
import os
from logger_setup import setup_logger

logger = setup_logger()
STATE_FILE = "state.json"

class StateManager:
    def __init__(self):
        self.state = {"open_trades": {}}
        self.load_state()
        
    def load_state(self):
        if os.path.exists(STATE_FILE):
            with open(STATE_FILE, "r") as f:
                try:
                    self.state = json.load(f)
                    logger.info(f"Loaded {len(self.state['open_trades'])} trades from state file.")
                except json.JSONDecodeError:
                    logger.error("State file corrupted. Initializing fresh state.")
                    self.save_state()
        else:
            self.save_state()

    def save_state(self):
        with open(STATE_FILE, "w") as f:
            json.dump(self.state, f, indent=4)
            
    def reconcile(self, active_mt5_positions):
        """ Sync local state with actual MT5 active positions """
        mt5_tickets = {str(p.ticket) for p in active_mt5_positions} if active_mt5_positions else set()
        
        # Remove trades from local state that are no longer in MT5
        to_remove = []
        for ticket in self.state["open_trades"].keys():
            if ticket not in mt5_tickets:
                to_remove.append(ticket)
                logger.info(f"Trade {ticket} no longer in MT5. Removing from local state.")
                
        for t in to_remove:
            del self.state["open_trades"][t]
            
        # Add trades from MT5 that are missing in local state
        for pos in (active_mt5_positions or []):
            ticket = str(pos.ticket)
            if pos.magic in [135001, 135002] and ticket not in self.state["open_trades"]:
                self.state["open_trades"][ticket] = {
                    "symbol": pos.symbol,
                    "type": "BUY" if pos.type == 0 else "SELL", # 0 is BUY, 1 is SELL
                    "entry_price": pos.price_open,
                    "sl_price": pos.sl,
                    "magic": pos.magic
                }
                logger.info(f"Found orphaned MT5 trade {ticket}. Added to local state.")
                
        self.save_state()

    def add_trade(self, ticket, symbol, type_, entry, sl, magic):
        self.state["open_trades"][str(ticket)] = {
            "symbol": symbol,
            "type": type_,
            "entry_price": entry,
            "sl_price": sl,
            "magic": magic
        }
        self.save_state()
        
    def update_sl(self, ticket, new_sl):
        if str(ticket) in self.state["open_trades"]:
            self.state["open_trades"][str(ticket)]["sl_price"] = new_sl
            self.save_state()
