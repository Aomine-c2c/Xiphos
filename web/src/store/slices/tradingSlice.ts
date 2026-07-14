import { StateCreator } from 'zustand';
import { TradingStore } from '../types';
import { MOCK_ACCOUNT, MOCK_POSITIONS, MOCK_ORDERS } from '../mockData';
import { AccountInfo, Position, Order, StrategyPlanet } from '../types';

export interface TradingSlice {
  account: AccountInfo;
  positions: Position[];
  orders: Order[];
  strategyPlanets: StrategyPlanet[];
  modifySL: (ticket: number, symbol: string, newSL: number) => void;
  modifyTP: (ticket: number, symbol: string, newTP: number) => void;
  closePosition: (ticket: number, symbol: string) => void;
  breakeven: (ticket: number, symbol: string) => void;
  partialClose: (ticket: number, symbol: string) => void;
  placeOrder: (symbol: string, type: string, volume: number, price: number, sl: number, tp: number) => void;
  cancelOrder: (ticket: number) => void;
  activePositionsTab: "ACTIVE" | "PENDING";
  setActivePositionsTab: (tab: "ACTIVE" | "PENDING") => void;
}

export const createTradingSlice: StateCreator<
  TradingStore,
  [],
  [],
  TradingSlice
> = (set, get) => ({
  account: { balance: 0, equity: 0, margin_free: 0, margin_level: 0, profit: 0, margin: 0 },
  positions: [],
  orders: [],
  strategyPlanets: [],
  activePositionsTab: "ACTIVE",
  
  setActivePositionsTab: (tab) => {
    set({ activePositionsTab: tab });
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
  },
});
