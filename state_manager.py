from bridge.proxy import mt5
from datetime import datetime, timedelta
from logger_setup import setup_logger
from storage.database import db

logger = setup_logger()

class StateManager:
    def __init__(self):
        # We no longer need to load a JSON file, DB handles it dynamically.
        pass

    def get_open_trades(self):
        """Returns a dict mirroring the old JSON structure for compatibility."""
        open_trades = {}
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ticket, symbol, type, entry_price, sl_price, magic FROM trades WHERE status = 'OPEN'")
            rows = cursor.fetchall()
            for row in rows:
                open_trades[str(row['ticket'])] = {
                    "symbol": row['symbol'],
                    "type": row['type'],
                    "entry_price": row['entry_price'],
                    "sl_price": row['sl_price'],
                    "magic": row['magic']
                }
        return open_trades

    def reconcile(self, active_mt5_positions):
        """Sync local SQLite state with actual MT5 active positions"""
        mt5_tickets = {str(p.ticket) for p in active_mt5_positions} if active_mt5_positions else set()
        
        open_trades = self.get_open_trades()
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            
            # 1. Mark trades as CLOSED if no longer in MT5
            for ticket in open_trades.keys():
                if ticket not in mt5_tickets:
                    profit = 0.0
                    close_time = datetime.now()
                    
                    # Fetch deal history to get exact profit/time
                    deals = mt5.history_deals_get(position=int(ticket))
                    if deals:
                        for d in deals:
                            # DEAL_ENTRY_OUT signifies the closing of a position
                            if d.entry == mt5.DEAL_ENTRY_OUT:
                                profit += d.profit
                                close_time = datetime.fromtimestamp(d.time)
                    else:
                        logger.warning(f"No history found for closed trade {ticket}. Defaulting profit to 0.")
                        
                    cursor.execute("""
                        UPDATE trades 
                        SET status = 'CLOSED', profit = ?, close_time = ? 
                        WHERE ticket = ?
                    """, (profit, close_time, int(ticket)))
                    logger.info(f"Trade {ticket} closed. Profit: {profit:.2f}. Updated in DB.")
                    
            # 2. Add trades from MT5 that are missing in local DB state
            for pos in (active_mt5_positions or []):
                ticket = str(pos.ticket)
                if pos.magic in [135001, 135002] and ticket not in open_trades:
                    cursor.execute("""
                        INSERT INTO trades (ticket, symbol, type, magic, volume, entry_price, sl_price, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')
                    """, (
                        pos.ticket, pos.symbol, "BUY" if pos.type == 0 else "SELL",
                        pos.magic, pos.volume, pos.price_open, pos.sl
                    ))
                    logger.info(f"Found orphaned MT5 trade {ticket}. Added to DB.")

    def add_trade(self, ticket, symbol, type_, entry, sl, magic, volume=0.0):
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO trades (ticket, symbol, type, magic, volume, entry_price, sl_price, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')
            """, (ticket, symbol, type_, magic, volume, entry, sl))
            logger.info(f"Trade {ticket} saved to DB.")
        
    def update_sl(self, ticket, new_sl):
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE trades SET sl_price = ? WHERE ticket = ? AND status = 'OPEN'
            """, (new_sl, int(ticket)))
