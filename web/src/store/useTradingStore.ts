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

export const useTradingStore = create<TradingStore>((set, get) => ({
  connected: false,
  botRunning: true, // Default to true to match mockup
  mt5Connected: true, // Default to true to match mockup
  apiLatency: 18, // 18 ms to match mockup
  
  account: {
    balance: 0.0,
    equity: 0.0,
    margin_free: 0.0,
    margin_level: 0.0,
    profit: 0.0
  },
  
  positions: [],

  orders: [],

  marketWatch: [],

  gates: {},

  rankedSignals: [],

  lastCycleTime: "--:--:--",
  systemStats: { cpu: 0.0, memory: 0.0 },
  logs: [],

  // Chat conversation matching mockup
  chatMessages: [
    {
      sender: "vincent",
      text: "Welcome to the XIPHOS Command Core. I am Vincent, the system reasoning agent. Ask me about active setups, risk exposures, or skipped signals.",
      timestamp: "14:28"
    },
    {
      sender: "user",
      text: "Why did you skip GBPUSD?",
      timestamp: "14:30"
    },
    {
      sender: "vincent",
      text: "GBPUSD is in the same correlation bucket as EURUSD. Opening another trade would violate the correlation guard rule and increase concentration risk.",
      timestamp: "14:30"
    },
    {
      sender: "user",
      text: "Why did you choose XAUUSD?",
      timestamp: "14:30"
    },
    {
      sender: "vincent",
      text: "XAUUSD ranked #1 by lowest projected risk. Strong bullish fan alignment on M30 timeframe. Trend strength is high and correlation risk is low. High probability setup.",
      timestamp: "14:30"
    }
  ],
  
  correlationMatrix: {},
  
  performanceMetrics: {
    total_trades: 0,
    win_rate: 0,
    total_profit: 0,
    profit_factor: 0,
    max_drawdown: 0,
    sharpe_ratio: 0,
    equity_curve: [100.0]
  },
  
  ws: null,
  
  connectWebSocket: () => {
    if (get().ws) return;
    
    const socket = new WebSocket("ws://127.0.0.1:8001/ws");
    
    socket.onopen = () => {
      set({ connected: true, ws: socket });
    };
    
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const { type, data } = payload;
        
        // Merge incoming websocket data, but preserve mockup-styled fields if desired
        switch (type) {
          case "state_update":
            set({
              botRunning: data.bot_running,
              mt5Connected: data.mt5_connected,
              apiLatency: data.api_latency || get().apiLatency,
              account: data.account || get().account,
              positions: data.positions || [],
              orders: data.orders || [],
              marketWatch: data.market_watch && data.market_watch.length > 0
                ? data.market_watch.map((m: MarketWatchItem) => {
                    const existing = get().marketWatch.find((x) => x.symbol === m.symbol);
                    const oldHistory = existing?.history || [m.price];
                    const newHistory = [...oldHistory, m.price].slice(-20);
                    const startPrice = newHistory[0] || m.price;
                    const diff = m.price - startPrice;
                    const changePct = startPrice > 0 ? (diff / startPrice) * 100 : 0.0;
                    const change = (changePct >= 0 ? "+" : "") + changePct.toFixed(2) + "%";
                    return {
                      symbol: m.symbol,
                      price: m.price,
                      e13_dist: m.e13_dist,
                      e50_dist: m.e50_dist,
                      s200_dist: m.s200_dist,
                      signal: m.signal || "NONE",
                      change,
                      history: newHistory
                    };
                  })
                : get().marketWatch,
              rankedSignals: data.ranked_signals || [],
              gates: data.gates || {},
              lastCycleTime: data.last_cycle_time || get().lastCycleTime,
              systemStats: data.system_stats || get().systemStats,
              correlationMatrix: data.correlation_matrix || get().correlationMatrix,
              performanceMetrics: data.performance_metrics || get().performanceMetrics
            });
            break;
            
          case "log_history":
            if (data && data.length > 0) set({ logs: data });
            break;
            
          case "log_event":
            set((state) => {
              const updatedLogs = [...state.logs, data];
              if (updatedLogs.length > 500) updatedLogs.shift();
              return { logs: updatedLogs };
            });
            break;
            
          case "chat_response":
            set((state) => ({
              chatMessages: [
                ...state.chatMessages,
                { sender: "user", text: data.user_message, timestamp: data.timestamp },
                { sender: "vincent", text: data.bot_response, timestamp: data.timestamp }
              ]
            }));
            break;
        }
      } catch (err) {
        console.error("Failed to parse websocket message", err);
      }
    };
    
    socket.onclose = () => {
      set({ connected: false, ws: null });
      setTimeout(() => {
        get().connectWebSocket();
      }, 3000);
    };
    
    socket.onerror = () => {
      socket.close();
    };
  },
  
  sendCommand: (type, data = {}) => {
    const socket = get().ws;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type, data }));
    }
  },
  
  sendChatMessage: (text) => {
    if (!text.trim()) return;
    
    // Add user message locally first to show immediately
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    set((state) => ({
      chatMessages: [
        ...state.chatMessages,
        { sender: "user", text, timestamp: ts }
      ]
    }));

    const socket = get().ws;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "chat_message", data: { text } }));
    } else {
      // Simulate Vincent response offline for mockup demo stability!
      setTimeout(() => {
        const reply = "Vincent AI (Standby): I'm currently running in offline demonstration mode. When api_server.py is running, I'll analyze live tick and gate variables to explain decisions.";
        set((state) => ({
          chatMessages: [
            ...state.chatMessages,
            { sender: "vincent", text: reply, timestamp: ts }
          ]
        }));
      }, 1000);
    }
  },
  
  modifySL: (ticket, symbol, newSL) => {
    get().sendCommand("modify_sl", { ticket, symbol, new_sl: newSL });
  },
  
  modifyTP: (ticket, symbol, newTP) => {
    get().sendCommand("modify_tp", { ticket, symbol, new_tp: newTP });
  },
  
  closePosition: (ticket, symbol) => {
    get().sendCommand("close_position", { ticket, symbol });
  },
  
  breakeven: (ticket, symbol) => {
    get().sendCommand("breakeven", { ticket, symbol });
  },
  
  partialClose: (ticket, symbol) => {
    get().sendCommand("partial_close", { ticket, symbol });
  },

  placeOrder: (symbol, type, volume, price, sl, tp) => {
    get().sendCommand("place_order", { symbol, type, volume, price, sl, tp });
  },

  cancelOrder: (ticket) => {
    get().sendCommand("cancel_order", { ticket });
  }
}));
