from bridge.proxy import mt5
from datetime import datetime
from core.logger import log as logger
from storage.database import db

class StateManager:
    def __init__(self):
        # No state initialization required; uses static DB connection
        pass

    def get_open_trades(self):
        from core.database import Trade
        open_trades = {}
        with db.get_session() as session:
            trades = session.query(Trade).filter(Trade.status == 'OPEN').all()
            for row in trades:
                open_trades[str(row.ticket)] = {
                    "symbol": row.symbol,
                    "type": row.type,
                    "entry_price": row.entry_price,
                    "sl_price": row.sl_price,
                    "magic": row.magic
                }
        return open_trades

    def _get_trade_closure_details(self, ticket):
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
        return profit, close_time

    def _mark_closed_trades(self, session, open_trades, mt5_tickets):
        from core.database import Trade
        for ticket in open_trades.keys():
            if ticket not in mt5_tickets:
                profit, close_time = self._get_trade_closure_details(ticket)
                trade = session.query(Trade).filter(Trade.ticket == int(ticket)).first()
                if trade:
                    trade.status = 'CLOSED'
                    trade.profit = profit
                    trade.close_time = close_time
                    logger.info(f"Trade {ticket} closed. Profit: {profit:.2f}. Updated in DB.")

    def _add_missing_mt5_trades(self, session, active_mt5_positions, open_trades):
        from core.database import Trade
        for pos in (active_mt5_positions or []):
            ticket = str(pos.ticket)
            if pos.magic in [135001, 135002] and ticket not in open_trades:
                new_trade = Trade(
                    ticket=pos.ticket,
                    symbol=pos.symbol,
                    type="BUY" if pos.type == 0 else "SELL",
                    magic=pos.magic,
                    volume=pos.volume,
                    entry_price=pos.price_open,
                    sl_price=pos.sl,
                    status='OPEN'
                )
                session.add(new_trade)
                logger.info(f"Found orphaned MT5 trade {ticket}. Added to DB.")

    def reconcile(self, active_mt5_positions):
        mt5_tickets = {str(p.ticket) for p in active_mt5_positions} if active_mt5_positions else set()
        open_trades = self.get_open_trades()
        
        with db.get_session() as session:
            self._mark_closed_trades(session, open_trades, mt5_tickets)
            self._add_missing_mt5_trades(session, active_mt5_positions, open_trades)

    def add_trade(self, ticket, symbol, type_, entry, sl, magic, volume=0.0):
        from core.database import Trade
        with db.get_session() as session:
            new_trade = Trade(
                ticket=ticket, symbol=symbol, type=type_, magic=magic,
                volume=volume, entry_price=entry, sl_price=sl, status='OPEN'
            )
            session.add(new_trade)
            logger.info(f"Trade {ticket} saved to DB.")
        
    def update_sl(self, ticket, new_sl):
        from core.database import Trade
        with db.get_session() as session:
            trade = session.query(Trade).filter(Trade.ticket == int(ticket), Trade.status == 'OPEN').first()
            if trade:
                trade.sl_price = new_sl

    def _calculate_sharpe(self, profits, total):
        if total <= 1:
            return 0.0
        import math
        avg_profit = sum(profits) / total
        variance = sum((p - avg_profit) ** 2 for p in profits) / (total - 1)
        std_dev = math.sqrt(variance)
        if std_dev > 0:
            return (avg_profit / std_dev) * math.sqrt(504)
        return 0.0

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
        
        sharpe = self._calculate_sharpe(profits, total)

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
        from core.database import Trade
        with db.get_session() as session:
            trades = session.query(Trade).filter(Trade.status == 'CLOSED').order_by(Trade.close_time.asc()).all()
            # Convert SQLAlchemy objects to dict-like for existing metrics calculation
            rows = [{'profit': t.profit} for t in trades]
            return self._calculate_metrics_from_rows(rows)

    def get_strategy_performance_metrics(self):
        from core.database import Trade
        metrics = {}
        with db.get_session() as session:
            for magic, name in [(135001, "Scalper"), (135002, "Runner")]:
                trades = session.query(Trade).filter(
                    Trade.status == 'CLOSED', Trade.magic == magic
                ).order_by(Trade.close_time.asc()).all()
                total = len(trades)
                wins = 0
                gross_profit = 0.0
                gross_loss = 0.0
                total_profit = 0.0
                
                for t in trades:
                    p = t.profit or 0.0
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
        from core.database import Trade
        with db.get_session() as session:
            trades = session.query(Trade).filter(Trade.status == 'CLOSED').order_by(Trade.close_time.desc()).limit(limit).all()
            return [{
                "ticket": t.ticket,
                "symbol": t.symbol,
                "type": t.type,
                "entry_price": t.entry_price,
                "close_time": t.close_time.isoformat() if t.close_time else None,
                "profit": t.profit
            } for t in trades]
