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
  price: number;
  e13_dist: number;
  e50_dist: number;
  s200_dist: number;
  signal: string;
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

export interface NewsData {
  sentiment: string;
  recent_headlines: string[];
}

export interface Opportunity {
  id: string;
  asset: string;
  direction: "LONG" | "SHORT";
  probability: number;
  confidence: number;
  riskPct: number;
  expectedRewardPct: number;
  timestamp: string;
  reasoning: {
    evidence: string;
    indicators: string[];
    counterArguments: string[];
    decisionLog: string[];
  };
}

export interface AdaptationNode {
  id: string;
  version: string;
  improvement: string;
  reason: string;
  impact: string;
  confidence: number;
  parents: string[];
  x: number;
  y: number;
  iconName: string;
}

export interface StrategyPlanet {
  id: string;
  name: string;
  allocation: number;
  returnPct: number;
  confidence: number;
  risk: string;
  status: "ACTIVE" | "IDLE" | "SCALING";
  color: string;
  iconName: string;
  angle: number;
  distance: number;
}

export interface ScannerBlip {
  id: number;
  r: number;
  theta: number;
  symbol: string;
  intensity: number;
  age: number;
}

import type { ConnectionSlice } from './slices/connectionSlice';
import type { TradingSlice } from './slices/tradingSlice';
import type { MarketSlice } from './slices/marketSlice';
import type { MahoragaSlice } from './slices/mahoragaSlice';
import type { JournalSlice } from './slices/journalSlice';
import type { ChatSlice } from './slices/chatSlice';

export interface TradingStore extends ConnectionSlice, TradingSlice, MarketSlice, MahoragaSlice, JournalSlice, ChatSlice {}
