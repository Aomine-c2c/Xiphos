import { create } from "zustand";
import { listen, Event } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { MOCK_ACCOUNT, MOCK_POSITIONS, MOCK_ORDERS, MOCK_MARKET_WATCH, MOCK_GATES, MOCK_SIGNALS, MOCK_LOGS, MOCK_PERFORMANCE, MOCK_CORRELATION, MOCK_JOURNAL, MOCK_MAHORAGA_STATE } from './mockData';

export interface AccountInfo {
  balance: number;
  equity: number;
  margin_free: number;
  margin_level: number;
  profit: number;
  margin: number;
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
  swap?: number;
  commission?: number;
  ai_score?: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  asset: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  exitPrice: number;
  profit: number;
  strategy: string;
  session: string;
  winLoss: "WIN" | "LOSS";
  screenshotUrl: string;
  notes: string;
  ai_explanation: string;
  mistake_analysis: string;
  lessons_learned: string;
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
  category: string;
  price: number;
  e13_dist: number;
  e50_dist: number;
  s200_dist: number;
  signal: string;
  change?: string;
  history?: number[];
  spread: number;
  atr: number;
  trend: string;
  volatility: string;
  ai_bias: number;
  probability: number;
  support: number;
  resistance: number;
  liquidity: string;
  volume: string;
  smart_money_zones: number[];
  fair_value_gaps: boolean;
  order_blocks: number[];
  market_structure: string;
  is_favorite: boolean;
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

export interface MahoragaState {
  trend_state: string;
  momentum_state: string;
  filter_strictness: string;
  confidence_score: number;
  adaptation_spins: number;
  fast_ema: number;
  medium_ema: number;
  slow_sma: number;
  lot_multiplier: number;
  sl_multiplier: number;
  phenomenon: string;
  is_adapted: boolean;
  trading_halted: boolean;
  active_strategy: string;
  tp_multiplier: number;
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
  journal: JournalEntry[];
  lastCycleTime: string;
  systemStats: { cpu: number; memory: number };
  logs: LogItem[];
  chatMessages: ChatMessage[];
  isTyping: boolean;
  correlationMatrix: Record<string, Record<string, string>>;
  performanceMetrics: PerformanceMetrics;
  mahoragaState: Record<string, MahoragaState> | null;

  ws: WebSocket | null;

  connectWebSocket: () => void;
  fetchMahoragaState: () => Promise<void>;
  sendCommand: (type: string, data?: unknown) => void;
  sendChatMessage: (text: string) => void;
  modifySL: (ticket: number, symbol: string, newSL: number) => void;
  modifyTP: (ticket: number, symbol: string, newTP: number) => void;
  closePosition: (ticket: number, symbol: string) => void;
  breakeven: (ticket: number, symbol: string) => void;
  partialClose: (ticket: number, symbol: string) => void;
  placeOrder: (symbol: string, type: string, volume: number, price: number, sl: number, tp: number) => void;
  cancelOrder: (ticket: number) => void;
  toggleFavorite: (symbol: string) => void;
  simulateMahoraga: () => void;
}

// ─────────────────────────────────────────────
// STORE
// ─────────────────────────────────────────────


const isMockMode = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export const useTradingStore = create<TradingStore>((set, get) => ({
  connected:    false,
  botRunning:   false,
  mt5Connected: false,
  apiLatency:   0,
  wsRetries:    0,

  account: isMockMode ? MOCK_ACCOUNT : { balance: 0, equity: 0, margin_free: 0, margin_level: 0, profit: 0, margin: 0 },
  positions: isMockMode ? MOCK_POSITIONS : [],
  orders: isMockMode ? MOCK_ORDERS : [],
  marketWatch: isMockMode ? MOCK_MARKET_WATCH : [],
  gates: isMockMode ? MOCK_GATES : {},
  rankedSignals: isMockMode ? MOCK_SIGNALS : [],
  journal: isMockMode ? MOCK_JOURNAL : [],
  lastCycleTime:      "--:--:--",
  systemStats:        { cpu: 0, memory: 0 },
  logs: isMockMode ? MOCK_LOGS : [],
  correlationMatrix: isMockMode ? MOCK_CORRELATION : {},
  performanceMetrics: isMockMode ? MOCK_PERFORMANCE : { total_trades: 0, win_rate: 0, total_profit: 0, profit_factor: 0, max_drawdown: 0, sharpe_ratio: 0, equity_curve: [] },
  mahoragaState: isMockMode ? MOCK_MAHORAGA_STATE : null,

  chatMessages: [
    { sender: "vincent", text: "Welcome to the XIPHOS Command Core. I am Vincent, wielding the Mahoraga Technique. Ask me about active setups, risk exposures, or skipped signals.", timestamp: "14:28" }
  ],
  isTyping: false,

  ws: null,

  // No-op in mock mode
  // Connect to SSE stream via Tauri Events
  connectWebSocket: () => {
    if (isMockMode) return;

    if (get().connected) return; // Prevent double subscription
    
    set({ connected: true });
    console.info("XIPHOS Subscribed to Rust SSE Events");

    // Listen for state updates
    listen("state_update", (event: Event<any>) => {
      try {
        const data = event.payload;
        set({
          botRunning: data.bot_running,
          mt5Connected: data.mt5_connected,
          apiLatency: data.api_latency,
          account: data.account,
          positions: data.positions,
          orders: data.orders,
          marketWatch: data.market_watch,
          gates: data.gates,
          rankedSignals: data.ranked_signals,
          lastCycleTime: data.last_cycle_time,
          systemStats: data.system_stats,
          correlationMatrix: data.correlation_matrix,
          performanceMetrics: data.performance_metrics,
          mahoragaState: data.mahoraga_state || null,
        });
      } catch (e) {
        console.error("Event Parse Error", e);
      }
    });

    // Listen for log history (on connect)
    listen("log_history", (event: Event<any>) => {
      set({ logs: event.payload });
    });

    // Listen for new logs
    listen("log_event", (event: Event<any>) => {
      set((state) => ({ logs: [...state.logs, event.payload].slice(-1000) }));
    });

    // Listen for chat responses
    listen("chat_response", (event: Event<any>) => {
      const payload = event.payload;
      set((state) => ({ chatMessages: [...state.chatMessages, { sender: "vincent", text: payload.bot_response, timestamp: payload.timestamp }] }));
    });
  },

  fetchMahoragaState: async () => {
    try {
      const host = typeof window !== "undefined" ? window.location.host : "127.0.0.1:8001";
      const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${host}`;
      const res = await fetch(`${apiUrl}/api/mahoraga/state`);
      if (res.ok) {
        const data = await res.json();
        set({ mahoragaState: data });
      }
    } catch (e) {
      console.error("Failed to fetch Mahoraga state", e);
    }
  },

  // Backend Mahoraga streaming integration
  // Real state comes through the websocket connectWebSocket -> set({ mahoragaState: data })
  simulateMahoraga: () => {
    // Deprecated: Moving to live backend state stream
  },

  sendCommand: async (type, data = {}) => {
    try {
      await invoke("send_command", { cmdType: type, data });
    } catch (e) {
      console.warn(`Failed to send command via Tauri: ${type}`, e);
    }
  },

  sendChatMessage: async (text) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Optimistic UI update
    set((state) => ({
      chatMessages: [...state.chatMessages, { sender: "user", text, timestamp: ts }],
    }));

    try {
      await invoke("send_command", { cmdType: "chat_message", data: { text } });
    } catch (e) {
      setTimeout(() => {
        const reply = "Vincent AI (Offline): I cannot reach the backend API via Tauri. Please ensure it is running.";
        set((state) => ({
          chatMessages: [...state.chatMessages, { sender: "vincent", text: reply, timestamp: ts }],
        }));
      }, 900);
    }
  },

  modifySL: (ticket, symbol, newSL) => {
    get().sendCommand("modify_sl", { ticket, symbol, new_sl: newSL });
  },
  
  modifyTP: (ticket, symbol, newTP) => {
    get().sendCommand("modify_tp", { ticket, symbol, new_tp: newTP });
  },

  closePosition: (ticket) => {
    // We don't have the symbol directly in the args here, so we find it from state
    const pos = get().positions.find((p) => p.ticket === ticket);
    if (pos) {
      get().sendCommand("close_position", { ticket, symbol: pos.symbol });
    }
  },

  breakeven: (ticket) => {
    const pos = get().positions.find((p) => p.ticket === ticket);
    if (pos) {
      get().sendCommand("breakeven", { ticket, symbol: pos.symbol });
    }
  },

  partialClose: (ticket) => {
    const pos = get().positions.find((p) => p.ticket === ticket);
    if (pos) {
      get().sendCommand("partial_close", { ticket, symbol: pos.symbol });
    }
  },

  placeOrder: (symbol, type, volume, price, sl, tp) => {
    get().sendCommand("place_order", { symbol, type, volume, price, sl, tp });
  },

  cancelOrder: (ticket) => {
    get().sendCommand("cancel_order", { ticket });
  },

  toggleFavorite: (symbol) => {
    set((state) => ({
      marketWatch: state.marketWatch.map((m) =>
        m.symbol === symbol ? { ...m, is_favorite: !m.is_favorite } : m
      ),
    }));
  },
}));
