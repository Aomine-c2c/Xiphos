export const MOCK_ACCOUNT = { balance: 10000, equity: 10000, margin_free: 10000, margin_level: 0, profit: 0, margin: 0 };
export const MOCK_POSITIONS = [];
export const MOCK_ORDERS = [];
export const MOCK_GATES = {};
export const MOCK_SIGNALS = [];
export const MOCK_LOGS = [];
export const MOCK_PERFORMANCE = { total_trades: 0, win_rate: 0, total_profit: 0, profit_factor: 0, max_drawdown: 0, sharpe_ratio: 0, equity_curve: [] };
export const MOCK_CORRELATION = {};
export const MOCK_JOURNAL: any[] = [
  {
    id: "TRD-8392-A",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    asset: "EURUSD",
    direction: "BUY",
    entryPrice: 1.09245,
    exitPrice: 1.09650,
    profit: 405.00,
    strategy: "Momentum Breakout",
    session: "London",
    winLoss: "WIN",
    screenshotUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000",
    notes: "Caught the London open momentum. Spread was tight and the 15m candle closed strong above resistance. I held through the initial retest and it paid off.",
    ai_explanation: "The algorithm detected a high-probability volatility expansion at the London open. Order flow delta was heavily skewed towards the buy-side, confirming the breakout.",
    mistake_analysis: "Execution was solid. However, you took partial profits a bit too early at the 1.5R mark instead of holding the core position to the 2R target.",
    lessons_learned: "Trust the higher timeframe momentum during major session overlaps. Don't micromanage the trade when order flow is on your side."
  },
  {
    id: "TRD-7124-B",
    date: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    asset: "GBPUSD",
    direction: "SELL",
    entryPrice: 1.26500,
    exitPrice: 1.26750,
    profit: -250.00,
    strategy: "Mean Reversion",
    session: "NY",
    winLoss: "LOSS",
    screenshotUrl: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000",
    notes: "Tried to fade the NY session rally. Looked overextended on the 5m chart. Got chopped up and stopped out.",
    ai_explanation: "The market was in a strong intraday uptrend driven by macroeconomic news. The 'overextended' condition was a mirage in a high-momentum regime.",
    mistake_analysis: "Fading a strong trend without waiting for a structural shift or order flow divergence is a low-probability play. You fought the tape.",
    lessons_learned: "Do not fade high-momentum trends during the NY session without explicit structural confirmation on a higher timeframe."
  },
  {
    id: "TRD-9941-C",
    date: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    asset: "XAUUSD",
    direction: "BUY",
    entryPrice: 2035.50,
    exitPrice: 2038.00,
    profit: 250.00,
    strategy: "Liquidity Sweep",
    session: "NY",
    winLoss: "WIN",
    screenshotUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=1000",
    notes: "",
    ai_explanation: "",
    mistake_analysis: "",
    lessons_learned: ""
  }
];
export const MOCK_MAHORAGA_STATE = null;
