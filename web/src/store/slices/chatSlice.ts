import { StateCreator } from 'zustand';
import { TradingStore, ChatMessage } from '../types';

export interface ChatSlice {
  chatMessages: ChatMessage[];
  isTyping: boolean;
  sendChatMessage: (text: string) => void;
}

const API_URL = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : 'http://127.0.0.1:8001';

export const createChatSlice: StateCreator<
  TradingStore,
  [],
  [],
  ChatSlice
> = (set, get) => ({
  chatMessages: [
    { sender: "vincent", text: "Welcome to the XIPHOS Command Core. I am Vincent, wielding the Mahoraga Technique. Ask me about active setups, risk exposures, or skipped signals.", timestamp: "14:28" }
  ],
  isTyping: false,

  sendChatMessage: async (text) => {
    if (!text.trim()) return;
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    set((state) => ({
      chatMessages: [...state.chatMessages, { sender: "user", text, timestamp: ts }],
      isTyping: true,
    }));

    try {
      const history = get().chatMessages.map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));
      const res = await fetch(`${API_URL || 'http://127.0.0.1:8001'}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (res.ok) {
        const json = await res.json();
        set((state) => ({
          chatMessages: [...state.chatMessages, { sender: "vincent", text: json.response, timestamp: ts }],
          isTyping: false,
        }));
      } else {
        throw new Error("Chat API error");
      }
    } catch {
      set((state) => ({
        chatMessages: [...state.chatMessages, {
          sender: "vincent",
          text: "Vincent AI (Offline): Unable to reach the backend. Ensure the API server is running.",
          timestamp: ts,
        }],
        isTyping: false,
      }));
    }
  },
});
