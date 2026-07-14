import { StateCreator } from 'zustand';
import { TradingStore, JournalEntry } from '../types';
import { MOCK_JOURNAL } from '../mockData';

export interface JournalSlice {
  journal: JournalEntry[];
  updateJournalNotes: (tradeId: string, notes: string) => void;
  requestAiAnalysis: (tradeId: string) => void;
}

export const createJournalSlice: StateCreator<
  TradingStore,
  [],
  [],
  JournalSlice
> = (set, get) => ({
  journal: MOCK_JOURNAL,

  updateJournalNotes: (tradeId, notes) => {
    set(state => ({
      journal: state.journal.map(t => t.id === tradeId ? { ...t, notes } : t)
    }));
    get().sendCommand("update_journal_notes", { tradeId, notes });
  },

  requestAiAnalysis: (tradeId) => {
    get().sendCommand("request_ai_analysis", { tradeId });
    setTimeout(() => {
      set(state => ({
        journal: state.journal.map(t => {
          if (t.id === tradeId) {
            return {
              ...t,
              ai_explanation: "The algorithm identified a high-probability mean-reversion setup based on the recent liquidity sweep. Order flow delta flipped heavily bullish at the lows.",
              mistake_analysis: "Entry was optimal. However, you closed the trade prematurely before the M15 structure confirmed a reversal.",
              lessons_learned: "Wait for structural confirmation before abandoning a high-conviction setup."
            };
          }
          return t;
        })
      }));
    }, 2500);
  },
});
