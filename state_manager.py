from bridge.proxy import mt5
from datetime import datetime
from logger_setup import setup_logger
from storage.database import db

logger = setup_logger()

class StateManager:
    def __init__(self):
        pass

    def get_open_trades(self):
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

    def _mark_closed_trades(self, cursor, open_trades, mt5_tickets):
        for ticket in open_trades.keys():
            if ticket not in mt5_tickets:
                profit = 0.0
                close_time = datetime.now()
                deals = mt5.history_deals_get(position=int(ticket))
                if deals:
                    for d in deals:
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

    def _add_missing_mt5_trades(self, cursor, active_mt5_positions, open_trades):
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

    def reconcile(self, active_mt5_positions):
        mt5_tickets = {str(p.ticket) for p in active_mt5_positions} if active_mt5_positions else set()
        open_trades = self.get_open_trades()
        
        with db.get_connection() as conn:
            cursor = conn.cursor()
            self._mark_closed_trades(cursor, open_trades, mt5_tickets)
            self._add_missing_mt5_trades(cursor, active_mt5_positions, open_trades)

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

    def _calculate_metrics_from_rows(self, rows):
        total = len(rows)
        wins = 0
        gross_profit = 0.0
        gross_loss = 0.0
        peak = 0.0
        current_equity = 100.0
        max_dd = 0.0
        profits = []
        equity_curve = [100.0]
        
        for row in rows:
            p = row['profit'] or 0.0
            profits.append(p)
            current_equity += p
            
            if p > 0:
                wins += 1
                gross_profit += p
            else:
                gross_loss += abs(p)
                
            if current_equity > peak:
                peak = current_equity
            
            dd = peak - current_equity
            if dd > max_dd:
                max_dd = dd
                
            equity_curve.append(current_equity)
                
        total_profit = current_equity - 100.0
        win_rate = (wins / total * 100) if total > 0 else 0.0
        
        if gross_loss > 0:
            profit_factor = gross_profit / gross_loss
        elif gross_profit > 0:
            profit_factor = float('inf')
        else:
            profit_factor = 0.0
        
        sharpe = 0.0
        if total > 1:
            import math
            avg_profit = sum(profits) / total
            variance = sum((p - avg_profit) ** 2 for p in profits) / (total - 1)
            std_dev = math.sqrt(variance)
            if std_dev > 0:
                sharpe = (avg_profit / std_dev) * math.sqrt(504)

        return {
            "total_trades": total,
            "win_rate": win_rate,
            "total_profit": total_profit,
            "profit_factor": profit_factor,
            "max_drawdown": max_dd,
            "sharpe_ratio": sharpe,
            "equity_curve": equity_curve
        }

    def get_performance_metrics(self):
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT profit FROM trades WHERE status = 'CLOSED' ORDER BY close_time ASC")
            rows = cursor.fetchall()
            return self._calculate_metrics_from_rows(rows)

    def get_strategy_performance_metrics(self):
        metrics = {}
        with db.get_connection() as conn:
            cursor = conn.cursor()
            for magic, name in [(135001, "Scalper"), (135002, "Runner")]:
                cursor.execute("""
                    SELECT profit 
                    FROM trades 
                    WHERE status = 'CLOSED' AND magic = ? 
                    ORDER BY close_time ASC
                """, (magic,))
                rows = cursor.fetchall()
                total = len(rows)
                wins = 0
                gross_profit = 0.0
                gross_loss = 0.0
                total_profit = 0.0
                
                for row in rows:
                    p = row['profit'] or 0.0
                    total_profit += p
                    if p > 0:
                        wins += 1
                        gross_profit += p
                    else:
                        gross_loss += abs(p)
                        
                win_rate = (wins / total * 100) if total > 0 else 0.0
                if gross_loss > 0:
                    profit_factor = gross_profit / gross_loss
                elif gross_profit > 0:
                    profit_factor = float('inf')
                else:
                    profit_factor = 0.0
                
                metrics[name] = {
                    "total_trades": total,
                    "win_rate": win_rate,
                    "total_profit": total_profit,
                    "profit_factor": profit_factor
                }
        return metrics

    def get_trade_history(self, limit=50):
        with db.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT ticket, symbol, type, entry_price, close_time, profit 
                FROM trades 
                WHERE status = 'CLOSED' 
                ORDER BY close_time DESC 
                LIMIT ?
            """, (limit,))
            return [dict(row) for row in cursor.fetchall()]
