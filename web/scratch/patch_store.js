const fs = require('fs');

let store = fs.readFileSync('src/store/useTradingStore.ts', 'utf8');
const mocks = fs.readFileSync('mock_output.ts', 'utf8');

// Replace Interface
const oldInterface = `export interface MarketWatchItem {
  symbol: string;
  price: number;
  e13_dist: number;
  e50_dist: number;
  s200_dist: number;
  signal: string;
  change?: string;
  history?: number[];
}`;

const newInterface = `export interface MarketWatchItem {
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
}`;

store = store.replace(oldInterface, newInterface);

// Replace MOCK_MARKET_WATCH array
const oldArrayRegex = /const MOCK_MARKET_WATCH: MarketWatchItem\[\] = \[\s*\{.*?\},?\s*\];/s;

// We'll replace the block from "const MOCK_MARKET_WATCH" to the closing "];"
// Since the old array has 8 items:
const oldArrayStart = store.indexOf('const MOCK_MARKET_WATCH: MarketWatchItem[]');
const oldArrayEnd = store.indexOf('];', oldArrayStart) + 2;

store = store.substring(0, oldArrayStart) + mocks.replace('export const MOCK_MARKET_WATCH', 'const MOCK_MARKET_WATCH') + store.substring(oldArrayEnd);


// Add toggleFavorite to TradingStore interface
const intfTarget = `cancelOrder: (ticket: number) => void;
}`;
const intfReplace = `cancelOrder: (ticket: number) => void;
  toggleFavorite: (symbol: string) => void;
}`;
store = store.replace(intfTarget, intfReplace);

// Add toggleFavorite to implementation
const implTarget = `cancelOrder: (ticket) => {
    set((state) => ({ orders: state.orders.filter((o) => o.ticket !== ticket) }));
  },
}));`;
const implReplace = `cancelOrder: (ticket) => {
    set((state) => ({ orders: state.orders.filter((o) => o.ticket !== ticket) }));
  },

  toggleFavorite: (symbol) => {
    set((state) => ({
      marketWatch: state.marketWatch.map((m) =>
        m.symbol === symbol ? { ...m, is_favorite: !m.is_favorite } : m
      ),
    }));
  },
}));`;
store = store.replace(implTarget, implReplace);

fs.writeFileSync('src/store/useTradingStore.ts', store);
console.log('Patch complete.');
