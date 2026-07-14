import { create } from "zustand";
import { TradingStore } from "./types";
import { createConnectionSlice } from "./slices/connectionSlice";
import { createTradingSlice } from "./slices/tradingSlice";
import { createMarketSlice } from "./slices/marketSlice";
import { createMahoragaSlice } from "./slices/mahoragaSlice";
import { createJournalSlice } from "./slices/journalSlice";
import { createChatSlice } from "./slices/chatSlice";

export const useTradingStore = create<TradingStore>()((...a) => ({
  ...createConnectionSlice(...a),
  ...createTradingSlice(...a),
  ...createMarketSlice(...a),
  ...createMahoragaSlice(...a),
  ...createJournalSlice(...a),
  ...createChatSlice(...a),
}));

export type { TradingStore };
