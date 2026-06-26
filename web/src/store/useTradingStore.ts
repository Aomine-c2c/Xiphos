import { create } from "zustand";

export interface AccountInfo {
  balance: number;
  equity: number;
  margin_free: number;
  margin_level: number;
  profit: number;
}

export interface Position {
  ticket: number;
  symbol: string;
  type: "BUY" | "SELL";
  volume: number;
  price_open: number;
  price_current: number;
  sl: number;
  tp: number;
  profit: number;
  role: string;
  risk_status: "FREE" | "RISK";
  scalper_pnl?: number;
  runner_pnl?: number;
  comment?: string;
}

export interface Order {
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  price_open: number;
  sl: number;
  tp: number;
  comment?: string;
}

export interface MarketWatchItem {
  symbol: string;
  price: number;
  e13_dist: number;
  e50_dist: number;
  s200_dist: number;
  signal: string;
  change?: string;
  history?: number[];
}

export interface GatesState {
  gate_1_risk_slot?: string;
  gate_1_details?: string;
  gate_2_correlation?: string;
  gate_2_details?: string;
  gate_3_fan_alignment?: string;
  gate_3_details?: string;
  gate_4_priority_filter?: string;
  gate_4_details?: string;
  gate_5_hard_sl?: string;
  gate_5_details?: string;
}

export interface RankedSignal {
  priority: number;
  symbol: string;
  direction: string;
  price: number;
  sma200: number;
  distance: number;
  projected_risk: number;
  status: string;
}

export interface PerformanceMetrics {
  total_trades: number;
  win_rate: number;
  total_profit: number;
  profit_factor: number;
  max_drawdown: number;
  sharpe_ratio: number;
  equity_curve: number[];
}

export interface LogItem {
  timestamp: string;
  level: string;
  message: string;
  formatted: string;
}

export interface ChatMessage {
  sender: "user" | "vincent";
  text: string;
  timestamp: string;
}

interface TradingStore {
  connected: boolean;
  botRunning: boolean;
  mt5Connected: boolean;
  apiLatency: number;
  wsRetries: number;

  account: AccountInfo;
  positions: Position[];
  orders: Order[];
  marketWatch: MarketWatchItem[];
  gates: GatesState;
  rankedSignals: RankedSignal[];
  lastCycleTime: string;
  systemStats: { cpu: number; memory: number };
  logs: LogItem[];
  chatMessages: ChatMessage[];
  correlationMatrix: Record<string, Record<string, string>>;
  performanceMetrics: PerformanceMetrics;

  ws: WebSocket | null;

  connectWebSocket: () => void;
  sendCommand: (type: string, data?: unknown) => void;
  sendChatMessage: (text: string) => void;
  modifySL: (ticket: number, symbol: string, newSL: number) => void;
  modifyTP: (ticket: number, symbol: string, newTP: number) => void;
  closePosition: (ticket: number, symbol: string) => void;
  breakeven: (ticket: number, symbol: string) => void;
  partialClose: (ticket: number, symbol: string) => void;
  placeOrder: (symbol: string, type: string, volume: number, price: number, sl: number, tp: number) => void;
  cancelOrder: (ticket: number) => void;
}

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────

const MOCK_ACCOUNT: AccountInfo = {
  balance: 48_320.00,
  equity: 49_105.42,
  margin_free: 44_210.18,
  margin_level: 1840.5,
  profit: 785.42,
};

const MOCK_POSITIONS: Position[] = [
  { ticket: 88301, symbol: "EURUSD", type: "BUY",  volume: 0.10, price_open: 1.08712, price_current: 1.08945, sl: 1.08300, tp: 1.09500, profit:  233.00, role: "RUNNER",  risk_status: "FREE" },
  { ticket: 88302, symbol: "XAUUSD", type: "BUY",  volume: 0.05, price_open: 2391.40, price_current: 2408.20, sl: 2375.00, tp: 2450.00, profit:  840.00, role: "SCALPER", risk_status: "FREE" },
  { ticket: 88303, symbol: "GBPUSD", type: "SELL", volume: 0.05, price_open: 1.27105, price_current: 1.26820, sl: 1.27500, tp: 1.26000, profit:  142.50, role: "SCALPER", risk_status: "FREE" },
  { ticket: 88304, symbol: "USDJPY", type: "BUY",  volume: 0.08, price_open: 157.620, price_current: 157.980, sl: 157.000, tp: 159.000, profit:  192.00, role: "RUNNER",  risk_status: "RISK" },
  { ticket: 88305, symbol: "XAGUSD", type: "BUY",  volume: 0.10, price_open:  29.142, price_current:  28.870, sl:  28.500, tp:  30.500, profit: -272.00, role: "SCALPER", risk_status: "RISK" },
];

const MOCK_ORDERS: Order[] = [
  { ticket: 77401, symbol: "EURUSD", type: "BUY LIMIT",  volume: 0.10, price_open: 1.08400, sl: 1.07980, tp: 1.09200, comment: "KRONOS-L1" },
  { ticket: 77402, symbol: "XAUUSD", type: "BUY STOP",   volume: 0.05, price_open: 2415.00, sl: 2398.00, tp: 2460.00, comment: "KRONOS-L2" },
  { ticket: 77403, symbol: "GBPJPY", type: "SELL LIMIT", volume: 0.03, price_open:  201.200, sl:  201.800, tp:  199.500, comment: "KRONOS-L3" },
];

const sparkline = (base: number, len = 20, drift = 0.001): number[] =>
  Array.from({ length: len }, (_, i) =>
    parseFloat((base + (Math.random() - 0.5) * drift * i).toFixed(5))
  );

const MOCK_MARKET_WATCH: MarketWatchItem[] = [
  { symbol: "EURUSD", price: 1.08945, e13_dist: 0.00121, e50_dist: 0.00340, s200_dist: 0.00712, signal: "BUY",  change: "+0.14%", history: sparkline(1.089,  20, 0.001) },
  { symbol: "GBPUSD", price: 1.26820, e13_dist: 0.00089, e50_dist: 0.00210, s200_dist: 0.00530, signal: "SELL", change: "-0.08%", history: sparkline(1.268,  20, 0.001) },
  { symbol: "USDJPY", price: 157.980, e13_dist: 0.21000, e50_dist: 0.54000, s200_dist: 1.20000, signal: "BUY",  change: "+0.22%", history: sparkline(157.8,  20, 0.1)   },
  { symbol: "XAUUSD", price: 2408.20, e13_dist: 3.14000, e50_dist: 8.92000, s200_dist: 24.3000, signal: "BUY",  change: "+0.70%", history: sparkline(2400,   20, 5)      },
  { symbol: "XAGUSD", price:  28.870, e13_dist: 0.21000, e50_dist: 0.61000, s200_dist: 1.82000, signal: "NONE", change: "-0.93%", history: sparkline(29.1,   20, 0.2)    },
  { symbol: "USDCHF", price: 0.89742, e13_dist: 0.00072, e50_dist: 0.00190, s200_dist: 0.00420, signal: "SELL", change: "-0.11%", history: sparkline(0.897,  20, 0.001) },
  { symbol: "AUDUSD", price: 0.65310, e13_dist: 0.00042, e50_dist: 0.00130, s200_dist: 0.00310, signal: "NONE", change: "+0.03%", history: sparkline(0.653,  20, 0.001) },
  { symbol: "NZDUSD", price: 0.60140, e13_dist: 0.00031, e50_dist: 0.00110, s200_dist: 0.00290, signal: "BUY",  change: "+0.06%", history: sparkline(0.601,  20, 0.001) },
];

const MOCK_GATES: GatesState = {
  gate_1_risk_slot:       "OPEN",
  gate_1_details:         "2 of 4 risk slots occupied. Capacity available.",
  gate_2_correlation:     "PASS",
  gate_2_details:         "EURUSD correlation coefficient 0.71 — within threshold.",
  gate_3_fan_alignment:   "PASS",
  gate_3_details:         "EMA13 > EMA50 > SMA200. Bullish fan structure confirmed.",
  gate_4_priority_filter: "APPROVED",
  gate_4_details:         "XAUUSD ranks #1 by projected risk score (1.23%).",
  gate_5_hard_sl:         "PASS",
  gate_5_details:         "SL at 2375.00 — 16 pips below SMA200. Within hard floor.",
};

const MOCK_SIGNALS: RankedSignal[] = [
  { priority: 1, symbol: "XAUUSD", direction: "BUY",  price: 2408.20, sma200: 2383.90, distance: 2430, projected_risk: 1.23, status: "APPROVED" },
  { priority: 2, symbol: "EURUSD", direction: "BUY",  price: 1.08945, sma200: 1.08233, distance:  712, projected_risk: 1.45, status: "STANDBY"  },
  { priority: 3, symbol: "USDJPY", direction: "BUY",  price: 157.980, sma200: 156.760, distance: 1220, projected_risk: 1.61, status: "STANDBY"  },
  { priority: 4, symbol: "GBPUSD", direction: "SELL", price: 1.26820, sma200: 1.27350, distance:  530, projected_risk: 1.88, status: "BLOCKED"  },
];

const MOCK_LOGS: LogItem[] = [
  { timestamp: "08:15:22", level: "INFO",     message: "M30 alignments show EURUSD and XAUUSD holding strong bullish momentum.", formatted: "" },
  { timestamp: "08:17:05", level: "WARN",     message: "Correlation coefficient for XAU/XAG group exceeds 89% safety threshold. Limiting new exposure.", formatted: "" },
  { timestamp: "08:21:40", level: "INFO",     message: "Global risk allocation at 50% (2 of 4 slots). Capacity available for high-conviction signals.", formatted: "" },
  { timestamp: "08:25:11", level: "WARN",     message: "GBPUSD execution blocked. EURUSD holds major risk allocation. Correlation limit breached.", formatted: "" },
  { timestamp: "08:30:00", level: "CRITICAL", message: "Market volatility spike detected across USD crosses. Widening dynamic trailing stops by 15%.", formatted: "" },
  { timestamp: "08:35:14", level: "INFO",     message: "XAUUSD Ticket #88302 moved to breakeven. SL adjusted to 2391.40.", formatted: "" },
  { timestamp: "08:40:02", level: "INFO",     message: "Cycle complete. 4 signals evaluated, 1 approved, 3 in standby.", formatted: "" },
];

const MOCK_PERFORMANCE: PerformanceMetrics = {
  total_trades:  142,
  win_rate:      68.3,
  total_profit:  8320.00,
  profit_factor: 2.14,
  max_drawdown:  4.2,
  sharpe_ratio:  1.87,
  equity_curve: [
    100.0, 100.8, 101.2, 100.9, 101.7, 102.5, 102.1, 103.0, 103.8, 104.2,
    103.6, 104.9, 105.3, 104.7, 105.8, 106.4, 106.1, 107.2, 107.9, 108.4,
  ],
};

const MOCK_CORRELATION: Record<string, Record<string, string>> = {
  EURUSD: { GBPUSD: "0.82", USDJPY: "-0.41", XAUUSD: "0.31" },
  GBPUSD: { EURUSD: "0.82", USDJPY: "-0.38", XAUUSD: "0.27" },
  USDJPY: { EURUSD: "-0.41", GBPUSD: "-0.38", XAUUSD: "-0.22" },
  XAUUSD: { EURUSD: "0.31",  GBPUSD: "0.27",  USDJPY: "-0.22" },
};

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────

export const useTradingStore = create<TradingStore>((set, get) => ({
  connected:    true,
  botRunning:   true,
  mt5Connected: true,
  apiLatency:   18,
  wsRetries:    0,

  account:            MOCK_ACCOUNT,
  positions:          MOCK_POSITIONS,
  orders:             MOCK_ORDERS,
  marketWatch:        MOCK_MARKET_WATCH,
  gates:              MOCK_GATES,
  rankedSignals:      MOCK_SIGNALS,
  lastCycleTime:      "08:40:02",
  systemStats:        { cpu: 12.4, memory: 38.7 },
  logs:               MOCK_LOGS,
  correlationMatrix:  MOCK_CORRELATION,
  performanceMetrics: MOCK_PERFORMANCE,

  chatMessages: [
    { sender: "vincent", text: "Welcome to the XIPHOS Command Core. I am Vincent, the system reasoning agent. Ask me about active setups, risk exposures, or skipped signals.", timestamp: "14:28" },
    { sender: "user",    text: "Why did you skip GBPUSD?", timestamp: "14:30" },
    { sender: "vincent", text: "GBPUSD is in the same correlation bucket as EURUSD. Opening another trade would violate the correlation guard rule and increase concentration risk beyond the 70% ceiling.", timestamp: "14:30" },
    { sender: "user",    text: "Why did you choose XAUUSD?", timestamp: "14:31" },
    { sender: "vincent", text: "XAUUSD ranked #1 by lowest projected risk (1.23%). Strong bullish fan alignment confirmed on M30. EMA13 > EMA50 > SMA200. High-probability institutional structure with low correlation load.", timestamp: "14:31" },
  ],

  ws: null,

  // No-op in mock mode
  connectWebSocket: () => {
    console.info("XIPHOS: Running in mock/demo mode. WebSocket disabled.");
  },

  sendCommand: (type, data = {}) => {
    console.info(`[MOCK] Command: ${type}`, data);
  },

  sendChatMessage: (text) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    set((state) => ({
      chatMessages: [...state.chatMessages, { sender: "user", text, timestamp: ts }],
    }));
    setTimeout(() => {
      const reply = "Vincent AI (Demo Mode): I'm running on mock data. Connect the XIPHOS api_server.py to enable live reasoning and real-time analysis.";
      set((state) => ({
        chatMessages: [...state.chatMessages, { sender: "vincent", text: reply, timestamp: ts }],
      }));
    }, 900);
  },

  modifySL: (ticket, symbol, newSL) => console.info("[MOCK] modifySL", { ticket, symbol, newSL }),
  modifyTP: (ticket, symbol, newTP) => console.info("[MOCK] modifyTP", { ticket, symbol, newTP }),

  closePosition: (ticket) => {
    set((state) => ({ positions: state.positions.filter((p) => p.ticket !== ticket) }));
  },

  breakeven: (ticket) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.ticket === ticket ? { ...p, sl: p.price_open, risk_status: "FREE" } : p
      ),
    }));
  },

  partialClose: (ticket) => {
    set((state) => ({
      positions: state.positions.map((p) =>
        p.ticket === ticket ? { ...p, volume: parseFloat((p.volume / 2).toFixed(2)) } : p
      ),
    }));
  },

  placeOrder: (symbol, type, volume, price, sl, tp) => {
    const ticket = Date.now();
    set((state) => ({
      orders: [...state.orders, { ticket, symbol, type, volume, price_open: price, sl, tp, comment: "MANUAL" }],
    }));
  },

  cancelOrder: (ticket) => {
    set((state) => ({ orders: state.orders.filter((o) => o.ticket !== ticket) }));
  },
}));
