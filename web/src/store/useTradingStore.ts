import { create } from "zustand";
import { MOCK_ACCOUNT, MOCK_POSITIONS, MOCK_ORDERS, MOCK_MARKET_WATCH, MOCK_GATES, MOCK_SIGNALS, MOCK_LOGS, MOCK_PERFORMANCE, MOCK_CORRELATION, MOCK_JOURNAL } from './mockData';

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
  mahoragaState:      null,

  chatMessages: [
    { sender: "vincent", text: "Welcome to the XIPHOS Command Core. I am Vincent, wielding the Mahoraga Technique. Ask me about active setups, risk exposures, or skipped signals.", timestamp: "14:28" }
  ],
  isTyping: false,

  ws: null,

  // No-op in mock mode
  // Connect to websocket with exponential backoff and heartbeat
  connectWebSocket: () => {
    if (isMockMode) return;

    // Avoid double connections
    if (get().ws?.readyState === WebSocket.OPEN || get().ws?.readyState === WebSocket.CONNECTING) return;

    const host = typeof window !== "undefined" ? window.location.host : "127.0.0.1:8001";
    const wsProtocol = typeof window !== "undefined" && window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `${wsProtocol}//${host}/ws`;
    const ws = new WebSocket(wsUrl);
    let pingInterval: NodeJS.Timeout;

    ws.onopen = () => {
      set({ connected: true, wsRetries: 0, ws });
      console.info("XIPHOS WebSocket Connected to", wsUrl);

      // Start ping/pong heartbeat every 30 seconds
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.type === "state_update") {
          const data = payload.data;
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
        } else if (payload.type === "log_history") {
          set({ logs: payload.data });
        } else if (payload.type === "log_event") {
          set((state) => ({ logs: [...state.logs, payload.data].slice(-1000) }));
        } else if (payload.type === "chat_response") {
          set((state) => ({ chatMessages: [...state.chatMessages, { sender: "vincent", text: payload.data.bot_response, timestamp: payload.data.timestamp }] }));
        }
      } catch (e) {
        console.error("WS Parse Error", e);
      }
    };

    ws.onclose = () => {
      clearInterval(pingInterval);
      set(() => ({ connected: false, ws: null }));
      
      const { wsRetries } = get();
      if (wsRetries < 7) {
        const nextRetry = wsRetries + 1;
        // Exponential backoff: 2s, 4s, 8s, 16s, 32s, 64s
        const backoffMs = Math.min(1000 * Math.pow(2, nextRetry), 60000);
        console.warn(`WebSocket closed. Reconnecting in ${backoffMs}ms... (Attempt ${nextRetry})`);
        
        setTimeout(() => {
          set({ wsRetries: nextRetry });
          get().connectWebSocket();
        }, backoffMs);
      } else {
        console.error("WebSocket connection failed permanently after 7 retries.");
      }
    };
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

  sendCommand: (type, data = {}) => {
    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn(`[WS Offline] Cannot send command: ${type}`, data);
    }
  },

  sendChatMessage: (text) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    
    // Optimistic UI update
    set((state) => ({
      chatMessages: [...state.chatMessages, { sender: "user", text, timestamp: ts }],
    }));

    const ws = get().ws;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "chat_message", data: { text } }));
    } else {
      // Fallback if WS is down
      setTimeout(() => {
        const reply = "Vincent AI (Offline): I cannot reach the backend api_server.py. Please ensure it is running.";
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
