import { StateCreator } from 'zustand';
import { TradingStore, MahoragaState, PerformanceMetrics, Opportunity, AdaptationNode } from '../types';

export interface MahoragaSlice {
  mahoragaState: Record<string, MahoragaState> | null;
  correlationMatrix: Record<string, Record<string, string>>;
  performanceMetrics: PerformanceMetrics;
  opportunities: Opportunity[];
  adaptationNodes: AdaptationNode[];
  
  fetchMahoragaState: () => Promise<void>;
  simulateMahoraga: () => void;
  updateMahoragaConstraint: (constraintKey: string, value: any) => void;
  toggleTradingHalt: () => void;
}

const API_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'http://127.0.0.1:8001';

export const createMahoragaSlice: StateCreator<
  TradingStore,
  [],
  [],
  MahoragaSlice
> = (set, get) => ({
  mahoragaState: null,
  correlationMatrix: {},
  performanceMetrics: { total_trades: 0, win_rate: 0, total_profit: 0, profit_factor: 0, max_drawdown: 0, sharpe_ratio: 0, equity_curve: [] },
  opportunities: [],
  adaptationNodes: [],

  fetchMahoragaState: async () => {
    try {
      const res = await fetch(`${API_URL || 'http://127.0.0.1:8001'}/api/mahoraga/state`);
      if (res.ok) {
        const data = await res.json();
        set({ mahoragaState: data });
      }
    } catch (e) {
      console.error("Failed to fetch Mahoraga state", e);
    }
  },

  simulateMahoraga: () => {
    // Deprecated: Moving to live backend state stream
  },

  updateMahoragaConstraint: (constraintKey, value) => {
    get().sendCommand("update_mahoraga_constraint", { key: constraintKey, value });
  },

  toggleTradingHalt: () => {
    get().sendCommand("toggle_trading_halt", {});
  },
});
