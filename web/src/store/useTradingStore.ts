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
  
  ws: WebSocket | null;
  
  connectWebSocket: () => void;
  sendCommand: (type: string, data?: any) => void;
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
    balance: 100.00,
    equity: 127.45,
    margin_free: 95.50,
    margin_level: 540.0,
    profit: 27.45
  },
  
  // Open Positions populated matching the mockup exactly
  positions: [
    {
      ticket: 108530,
      symbol: "EURUSD",
      type: "BUY",
      volume: 0.01,
      price_open: 1.08530,
      price_current: 1.08945,
      sl: 1.08230,
      tp: 1.09200,
      profit: 4.95,
      role: "Scalper/Runner",
      risk_status: "RISK",
      scalper_pnl: 3.10,
      runner_pnl: 1.85,
      comment: "EMA50 / SMA200"
    },
    {
      ticket: 240820,
      symbol: "XAUUSD",
      type: "BUY",
      volume: 0.01,
      price_open: 2408.20,
      price_current: 2412.65,
      sl: 2350.80,
      tp: 2450.00,
      profit: 9.39,
      role: "Scalper/Runner",
      risk_status: "FREE",
      scalper_pnl: 5.92,
      runner_pnl: 3.47,
      comment: "SMA200"
    },
    {
      ticket: 108230,
      symbol: "EURUSD",
      type: "BUY",
      volume: 0.01,
      price_open: 1.08230,
      price_current: 1.08945,
      sl: 1.08310,
      tp: 1.09200,
      profit: 0.00,
      role: "Scalper/Runner",
      risk_status: "FREE",
      scalper_pnl: 0.00,
      runner_pnl: 0.00,
      comment: "BE"
    },
    {
      ticket: 31620,
      symbol: "XAGUSD",
      type: "BUY",
      volume: 0.01,
      price_open: 31.620,
      price_current: 31.845,
      sl: 30.120,
      tp: 33.000,
      profit: 1.80,
      role: "Scalper/Runner",
      risk_status: "FREE",
      scalper_pnl: 1.12,
      runner_pnl: 0.68,
      comment: "SMA200"
    }
  ],

  orders: [
    { ticket: 509210, symbol: "EURUSD", type: "BUY_LIMIT", volume: 0.02, price_open: 1.08120, sl: 1.07800, tp: 1.09000, comment: "Core Limit" },
    { ticket: 509211, symbol: "XAUUSD", type: "SELL_LIMIT", volume: 0.01, price_open: 2425.00, sl: 2435.00, tp: 2400.00, comment: "Resistance check" }
  ],

  // Market Watch Overview (M30) matching mockup
  marketWatch: [
    { symbol: "EURUSD", price: 1.08945, e13_dist: 120, e50_dist: 350, s200_dist: 715, signal: "BUY", change: "+0.35%", history: [1.085, 1.086, 1.087, 1.089, 1.08945] },
    { symbol: "GBPUSD", price: 1.27430, e13_dist: 150, e50_dist: 410, s200_dist: 890, signal: "BUY", change: "+0.28%", history: [1.270, 1.271, 1.272, 1.273, 1.27430] },
    { symbol: "XAUUSD", price: 2412.65, e13_dist: 1200, e50_dist: 3100, s200_dist: 6185, signal: "BUY", change: "+1.12%", history: [2390, 2395, 2400, 2408, 2412.65] },
    { symbol: "XAGUSD", price: 31.845, e13_dist: 250, e50_dist: 850, s200_dist: 1725, signal: "BUY", change: "+0.87%", history: [31.2, 31.4, 31.5, 31.7, 31.845] }
  ],

  // Gate Validation Matrix matching mockup
  gates: {
    gate_1_risk_slot: "PASS",
    gate_1_details: "Risk slots available",
    gate_2_correlation: "PASS",
    gate_2_details: "No correlation conflict",
    gate_3_fan_alignment: "PASS",
    gate_3_details: "Price > EMA13 > EMA50 > SMA200",
    gate_4_priority_filter: "PASS",
    gate_4_details: "Ranked by lowest projected risk",
    gate_5_hard_sl: "PASS",
    gate_5_details: "SL at SMA200 (1.08230)"
  },

  // Opportunities Scanner matching mockup
  rankedSignals: [
    { priority: 1, symbol: "XAUUSD", direction: "BUY", price: 2412.65, sma200: 2350.00, distance: 6185, projected_risk: 1.24, status: "APPROVED" },
    { priority: 2, symbol: "EURUSD", direction: "BUY", price: 1.08945, sma200: 1.08230, distance: 715, projected_risk: 1.23, status: "APPROVED" },
    { priority: 3, symbol: "GBPUSD", direction: "BUY", price: 1.27430, sma200: 1.26540, distance: 890, projected_risk: 1.78, status: "PENDING" },
    { priority: 4, symbol: "XAGUSD", direction: "BUY", price: 31.845, sma200: 30.120, distance: 1725, projected_risk: 1.72, status: "PENDING" }
  ],

  lastCycleTime: "2025-05-20 14:30:00", // To match mockup
  systemStats: { cpu: 22.4, memory: 345.2 },
  
  // Live Decision Feed log items matching mockup
  logs: [
    { timestamp: "14:30:00", level: "INFO", message: "EURUSD passed all 5 gates. Signal ranked #2. Executing...", formatted: "14:30:00 | INFO     | EURUSD passed all 5 gates. Signal ranked #2. Executing..." },
    { timestamp: "14:29:59", level: "INFO", message: "XAUUSD passed all 5 gates. Signal ranked #1. Executing...", formatted: "14:29:59 | INFO     | XAUUSD passed all 5 gates. Signal ranked #1. Executing..." },
    { timestamp: "14:29:58", level: "WARN", message: "GBPUSD blocked by Correlation Guard (Group 1).", formatted: "14:29:58 | WARN     | GBPUSD blocked by Correlation Guard (Group 1)." },
    { timestamp: "14:29:57", level: "INFO", message: "XAGUSD passed all 5 gates. Signal ranked #4.", formatted: "14:29:57 | INFO     | XAGUSD passed all 5 gates. Signal ranked #4." },
    { timestamp: "14:29:56", level: "INFO", message: "Risk slot released by EURUSD (breakeven reached).", formatted: "14:29:56 | INFO     | Risk slot released by EURUSD (breakeven reached)." }
  ],

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
              positions: data.positions.length > 0 ? data.positions : get().positions,
              orders: data.orders && data.orders.length > 0 ? data.orders : get().orders,
              marketWatch: data.market_watch && data.market_watch.length > 0
                ? data.market_watch.map((m: any) => {
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
              rankedSignals: data.ranked_signals.length > 0 ? data.ranked_signals : get().rankedSignals,
              gates: Object.keys(data.gates || {}).length > 0 ? data.gates : get().gates,
              lastCycleTime: data.last_cycle_time || get().lastCycleTime,
              systemStats: data.system_stats || get().systemStats,
              correlationMatrix: data.correlation_matrix || get().correlationMatrix
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
