import { StateCreator } from 'zustand';
import { TradingStore, LogItem } from '../types';
import { MOCK_LOGS } from '../mockData';

export interface ConnectionSlice {
  connected: boolean;
  botRunning: boolean;
  mt5Connected: boolean;
  apiLatency: number;
  wsRetries: number;
  lastCycleTime: string;
  systemStats: { cpu: number; memory: number };
  logs: LogItem[];
  sendCommand: (type: string, data?: unknown) => void;
  setConnectionState: (connected: boolean) => void;
  incrementWsRetries: () => void;
  resetWsRetries: () => void;
}

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const API_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'http://127.0.0.1:8001/app';

export const createConnectionSlice: StateCreator<
  TradingStore,
  [],
  [],
  ConnectionSlice
> = (set, get) => ({
  connected: false,
  botRunning: false,
  mt5Connected: false,
  apiLatency: 0,
  wsRetries: 0,
  lastCycleTime: "--:--:--",
  systemStats: { cpu: 0, memory: 0 },
  logs: [],

  setConnectionState: (connected: boolean) => set({ connected }),

  incrementWsRetries: () => set((state) => ({ wsRetries: state.wsRetries + 1 })),

  resetWsRetries: () => set({ wsRetries: 0 }),

  sendCommand: async (type, data = {}) => {
    if (isTauri) {
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        await invoke("send_command", { cmdType: type, data });
      } catch (e) {
        console.warn(`Tauri command failed: ${type}`, e);
      }
    } else {
      try {
        await fetch(`${API_URL}/api/command`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, data }),
        });
      } catch (e) {
        console.warn(`HTTP command failed: ${type}`, e);
      }
    }
  },

  fetchSystemState: async () => {
    try {
      const res = await fetch(`${API_URL}/api/state`);
      const json = await res.json();
      if (json) {
        set({
          botRunning: !!json.bot_running,
          mt5Connected: !!json.mt5_connected,
          apiLatency: json.api_latency || 0,
          lastCycleTime: json.last_cycle_time || "--:--:--",
          systemStats: json.system_stats || { cpu: 0, memory: 0 },
        });
      }
    } catch (e) {
      console.warn("Failed to fetch system state", e);
    }
  },
});
