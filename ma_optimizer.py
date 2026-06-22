"""
XIPHOS FULL MARKET SCANNER
===========================
Pulls every available symbol from MT5, filters on spread cost and data quality,
then runs the asymmetrical 13/50 EMA crossover + 200 SMA strategy on each one.

Results are ranked by Profit Factor so you can see at a glance exactly which
instruments work with this strategy and which ones to ignore.

Strategy:
  - BUY:  13 EMA crosses above when 50 EMA > 200 SMA (macro uptrend)
  - SELL: 13 EMA crosses below when 50 EMA < 200 SMA (macro downtrend)
  - SL:   Candle extreme (low for BUY, high for SELL)
  - TP:   None — trail 13 EMA (scalper) and 50 EMA (runner) until trend dies
"""
import pandas as pd
import MetaTrader5 as mt5

# ── Configuration ────────────────────────────────────────────────────────────
LOT_SIZE              = 0.01
MAX_RISK_USD          = 10.0   # Hard risk cap per trade (matches live bot)
MAX_SPREAD_USD        = 2.0    # Skip symbols where spread > $2 per 0.01 lot
MIN_BARS_REQUIRED     = 300    # Skip symbols with too little history
M30_COUNT             = 2000   # Bars to download per symbol (~41 days of M30)
FAST, MED, SLOW       = 13, 50, 200
# ─────────────────────────────────────────────────────────────────────────────

def backtest_symbol(sym, df, contract_size, spread):
    """Run the full backtest on a single symbol's DataFrame. Returns a stats dict."""
    df = df.copy()
    df['ema_fast']      = df['close'].ewm(span=FAST, adjust=False).mean()
    df['ema_medium']    = df['close'].ewm(span=MED,  adjust=False).mean()
    df['sma_slow']      = df['close'].rolling(window=SLOW).mean()
    df['prev_close']    = df['close'].shift(1)
    df['prev_ema_fast'] = df['ema_fast'].shift(1)
    df['next_open']     = df['open'].shift(-1)
    df.dropna(inplace=True)

    if len(df) < MIN_BARS_REQUIRED:
        return None

    open_trades   = []
    trade_history = []
    pending       = []  # (entry_open, signal_sl, direction, role)

    for i, (ts, row) in enumerate(df.iterrows()):

        # Step 1: Execute pending entries at this bar's open
        new_pending = []
        for p in pending:
            entry     = row['open'] + spread if p['type'] == 'BUY' else row['open']
            signal_sl = p['sl']
            if p['type'] == 'BUY'  and signal_sl >= entry:
                continue
            if p['type'] == 'SELL' and signal_sl <= entry:
                continue
            risk = abs(entry - signal_sl) * contract_size * LOT_SIZE
            if risk > MAX_RISK_USD:
                continue
            open_trades.append({
                'type': p['type'], 'role': p['role'],
                'entry': entry, 'sl': signal_sl,
                'entry_ts': ts, 'spread': spread
            })
        pending = new_pending  # cleared — all fired or discarded

        # Step 2: Manage open trades
        remove = []
        for t in open_trades:
            low = row['low']
            high = row['high']
            e_med = row['ema_medium']
            sp = t['spread']

            # SL hit check with spread (SELL exit costs ask price)
            ask_high = high + sp
            hit = (t['type'] == 'BUY'  and low      <= t['sl']) or \
                  (t['type'] == 'SELL' and ask_high >= t['sl'])

            if hit:
                exit_px = t['sl']
                pnl = (exit_px - t['entry']) if t['type'] == 'BUY' else (t['entry'] - exit_px)
                pnl *= contract_size * LOT_SIZE
                trade_history.append({'pnl': pnl, 'exit': 'SL'})
                remove.append(t)
                continue

            # Trail stop (not on entry bar)
            if t['entry_ts'] != ts:
                if t['role'] == 'S':  # Scalper trails 50 EMA
                    if t['type'] == 'BUY' and e_med > t['sl']:
                        t['sl'] = e_med
                    elif t['type'] == 'SELL' and e_med < t['sl']:
                        t['sl'] = e_med
                else:  # Runner trails 200 SMA
                    sma = row['sma_slow']
                    if not pd.isna(sma):
                        if t['type'] == 'BUY' and sma > t['sl']:
                            t['sl'] = sma
                        elif t['type'] == 'SELL' and sma < t['sl']:
                            t['sl'] = sma

        for t in remove:
            open_trades.remove(t)

        # Step 3: Check for signal on this closed bar
        # Only one group at a time per symbol
        if len(open_trades) + len(pending) >= 2:
            continue

        prev_c = row['prev_close']
        c = row['close']
        e_f    = row['ema_fast']
        p_ef = row['prev_ema_fast']
        e_m    = row['ema_medium']
        s_s  = row['sma_slow']

        if pd.isna(s_s) or pd.isna(p_ef) or pd.isna(row['next_open']):
            continue

        signal = None
        if e_m > s_s and prev_c < p_ef and c > e_f:
            signal = 'BUY'
        elif e_m < s_s and prev_c > p_ef and c < e_f:
            signal = 'SELL'

        if signal is None:
            continue

        sl = row['low'] if signal == 'BUY' else row['high']
        nxt = row['next_open']
        adj_entry = nxt + spread if signal == 'BUY' else nxt
        if signal == 'BUY' and sl >= adj_entry:
            continue
        if signal == 'SELL' and sl <= adj_entry:
            continue
        if abs(adj_entry - sl) * contract_size * LOT_SIZE > MAX_RISK_USD:
            continue

        pending.append({'type': signal, 'role': 'S', 'sl': sl})
        pending.append({'type': signal, 'role': 'R', 'sl': sl})

    # Force-close open trades at last bar
    last = df.iloc[-1]
    for t in open_trades:
        exit_px = last['close']
        pnl = (exit_px - t['entry']) if t['type'] == 'BUY' else (t['entry'] - exit_px)
        pnl *= contract_size * LOT_SIZE
        trade_history.append({'pnl': pnl, 'exit': 'FORCE'})

    if len(trade_history) < 4:  # Not enough trades to be meaningful
        return None

    df_t  = pd.DataFrame(trade_history)
    wins  = df_t[df_t['pnl'] > 0]
    losses= df_t[df_t['pnl'] <= 0]

    total_pnl    = df_t['pnl'].sum()
    win_rate     = len(wins) / len(df_t) * 100
    avg_win      = wins['pnl'].mean()  if len(wins)   > 0 else 0
    avg_loss     = losses['pnl'].mean() if len(losses) > 0 else 0
    profit_factor= abs(wins['pnl'].sum() / losses['pnl'].sum()) if len(losses) > 0 and losses['pnl'].sum() != 0 else 99.0
    num_signals  = len(df_t) // 2

    return {
        'sym':           sym,
        'signals':       num_signals,
        'total_pnl':     total_pnl,
        'win_rate':      win_rate,
        'avg_win':       avg_win,
        'avg_loss':      avg_loss,
        'profit_factor': profit_factor,
        'largest_win':   df_t['pnl'].max(),
        'largest_loss':  df_t['pnl'].min(),
        'spread_cost':   spread * contract_size * LOT_SIZE,
    }


def run_scanner():
    if not mt5.initialize():
        print("MT5 Init Failed")
        return

    all_symbols = mt5.symbols_get()
    if all_symbols is None:
        print("Could not fetch symbols")
        mt5.shutdown()
        return

    print(f"MT5 has {len(all_symbols)} symbols available.")
    print(f"Filtering (spread < ${MAX_SPREAD_USD}/trade, min {MIN_BARS_REQUIRED} M30 bars)...\n", flush=True)

    raw_data = {}
    contract_sizes = {}
    spreads = {}
    skipped_spread = 0
    skipped_data   = 0

    for sym_info in all_symbols:
        sym = sym_info.name
        mt5.symbol_select(sym, True)

        info = mt5.symbol_info(sym)
        if not info or info.volume_min > 0.01:
            continue

        tick = mt5.symbol_info_tick(sym)
        if tick is None:
            continue

        spread = tick.ask - tick.bid
        contract_size = info.trade_contract_size
        spread_cost = spread * contract_size * LOT_SIZE

        if spread_cost > MAX_SPREAD_USD:
            skipped_spread += 1
            continue

        rates = mt5.copy_rates_from_pos(sym, mt5.TIMEFRAME_M30, 0, M30_COUNT)
        if rates is None or len(rates) < MIN_BARS_REQUIRED + SLOW:
            skipped_data += 1
            continue

        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        df.set_index('time', inplace=True)

        raw_data[sym]       = df
        contract_sizes[sym] = contract_size
        spreads[sym]        = spread

    mt5.shutdown()

    eligible = len(raw_data)
    print(f"Eligible symbols : {eligible}")
    print(f"Skipped (spread) : {skipped_spread}")
    print(f"Skipped (data)   : {skipped_data}")
    print(f"\nRunning strategy on {eligible} symbols...\n", flush=True)

    results = []
    for i, (sym, df) in enumerate(raw_data.items()):
        res = backtest_symbol(sym, df, contract_sizes[sym], spreads[sym])
        if res:
            results.append(res)
        if (i + 1) % 10 == 0:
            print(f"  Processed {i+1}/{eligible}...", flush=True)

    if not results:
        print("No tradeable results found.")
        return

    # Sort by profit factor descending
    results.sort(key=lambda x: x['profit_factor'], reverse=True)

    print("\n" + "="*90)
    print("FULL MARKET SCAN RESULTS — Ranked by Profit Factor")
    print(f"Strategy: 13/50 EMA Crossover | 200 SMA Macro Filter | {M30_COUNT} M30 Bars | 0.01 Lots")
    print("="*90)
    print(f"  {'Symbol':<28} {'Sigs':>5}  {'P&L':>8}  {'Win%':>6}  {'PF':>6}  {'AvgW':>7}  {'AvgL':>7}  {'Sprd$':>6}")
    print(f"  {'-'*28} {'-'*5}  {'-'*8}  {'-'*6}  {'-'*6}  {'-'*7}  {'-'*7}  {'-'*6}")

    profitable  = [r for r in results if r['profit_factor'] >= 1.0]
    unprofitable= [r for r in results if r['profit_factor'] < 1.0]

    print(f"\n  --- PROFITABLE ({len(profitable)} symbols) ---")
    for r in profitable:
        print(f"  {r['sym']:<28} {r['signals']:>5}  "
              f"${r['total_pnl']:>7.2f}  {r['win_rate']:>5.1f}%  "
              f"{r['profit_factor']:>6.2f}  ${r['avg_win']:>6.2f}  ${r['avg_loss']:>6.2f}  ${r['spread_cost']:>5.3f}")

    print(f"\n  --- NOT PROFITABLE ({len(unprofitable)} symbols) ---")
    for r in unprofitable[:20]:  # Show top 20 worst to avoid wall of text
        print(f"  {r['sym']:<28} {r['signals']:>5}  "
              f"${r['total_pnl']:>7.2f}  {r['win_rate']:>5.1f}%  "
              f"{r['profit_factor']:>6.2f}  ${r['avg_win']:>6.2f}  ${r['avg_loss']:>6.2f}  ${r['spread_cost']:>5.3f}")
    if len(unprofitable) > 20:
        print(f"  ... and {len(unprofitable) - 20} more unprofitable symbols")

    print("="*90)
    print(f"\nTOP 5 SYMBOLS TO TRADE:")
    for i, r in enumerate(profitable[:5], 1):
        print(f"  {i}. {r['sym']:<28} PF={r['profit_factor']:.2f}x | WinRate={r['win_rate']:.1f}% | Signals={r['signals']}")

    if not profitable:
        print("  None found — the strategy needs adjustment or different markets.")
    print()


if __name__ == "__main__":
    run_scanner()
