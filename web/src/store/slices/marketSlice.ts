import { StateCreator } from 'zustand';
import { TradingStore, MarketWatchItem, GatesState, RankedSignal, NewsData, ScannerBlip } from '../types';

export interface MarketSlice {
  marketWatch: MarketWatchItem[];
  gates: GatesState;
  rankedSignals: RankedSignal[];
  news: NewsData | null;
  scannerBlips: ScannerBlip[];
}

export const createMarketSlice: StateCreator<
  TradingStore,
  [],
  [],
  MarketSlice
> = (set, get) => ({
  marketWatch: [],
  gates: {},
  rankedSignals: [],
  news: null,
  scannerBlips: [],
});
