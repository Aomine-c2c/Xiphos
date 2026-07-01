def update_existing_trades(i, current_time, open_trades, m30_data, trade_history):
    if i == 0:
        return
        
    trades_to_remove = []
    for t in open_trades:
        sym = t['symbol']
        df30 = m30_data[sym]
        if current_time not in df30.index:
            continue
        
        row = df30.loc[current_time]
        
        # Check SL using M30 High/Low
        if t['type'] == 'BUY' and row['low'] <= t['sl']:
            t['exit_price'] = t['sl']
            t['exit_time'] = current_time
            t['profit'] = (t['exit_price'] - t['entry_price']) / t['point'] * t['volume'] * 100000
            t['status'] = 'CLOSED_SL'
            trades_to_remove.append(t)
            continue
        elif t['type'] == 'SELL' and row['high'] >= t['sl']:
            t['exit_price'] = t['sl']
            t['exit_time'] = current_time
            t['profit'] = (t['entry_price'] - t['exit_price']) / t['point'] * t['volume'] * 100000
            t['status'] = 'CLOSED_SL'
            trades_to_remove.append(t)
            continue
            
        # Update MFE/MAE
        if t['type'] == 'BUY':
            curr_profit = (row['high'] - t['entry_price']) / t['point'] * t['volume'] * 100000
            t['mfe'] = max(t['mfe'], curr_profit)
            curr_loss = (row['low'] - t['entry_price']) / t['point'] * t['volume'] * 100000
            t['mae'] = min(t['mae'], curr_loss)
        else:
            curr_profit = (t['entry_price'] - row['low']) / t['point'] * t['volume'] * 100000
            t['mfe'] = max(t['mfe'], curr_profit)
            curr_loss = (t['entry_price'] - row['high']) / t['point'] * t['volume'] * 100000
            t['mae'] = min(t['mae'], curr_loss)
        
    for tr in trades_to_remove:
        if tr in open_trades:
            open_trades.remove(tr)
            trade_history.append(tr)
