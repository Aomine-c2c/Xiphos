"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, BrainCircuit, Send, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "../store/useTradingStore";

interface VincentPanelProps { isOpen: boolean; onClose: () => void; }

const DIRECTIVES = [
  { id: "DIR-001", symbol: "EURUSD", type: "BUY LIMIT" as const, price: 1.089, tp: 1.092, sl: 1.0823, confidence: 92 },
  { id: "DIR-002", symbol: "XAUUSD", type: "BUY STOP" as const, price: 2408.2, tp: 2450, sl: 2390, confidence: 88 },
];

export default function VincentPanel({ isOpen, onClose }: VincentPanelProps) {
  const { chatMessages, isTyping, sendChatMessage, placeOrder } = useTradingStore();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chatMessages, isTyping]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    sendChatMessage(text);
    setInput("");
  }, [input, sendChatMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="vincent-panel"
          initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 w-[360px] bg-[#0f0f1a] border-l border-[#1e1e2e] z-50 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="h-10 flex items-center justify-between px-4 border-b border-[#1e1e2e] shrink-0">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-[#8b5cf6] animate-ai-pulse" />
              <span className="text-xs font-sans font-semibold text-[#e8e8f0]">Vincent AI</span>
              <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-widest ml-1">LLaMA-3-70B</span>
            </div>
            <button id="vincent-close-btn" onClick={onClose} aria-label="Close Vincent panel"
              className="w-6 h-6 flex items-center justify-center rounded text-[#52525b] hover:text-[#e8e8f0] hover:bg-white/5 transition-colors cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs font-sans leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-[rgba(139,92,246,0.15)] text-[#e8e8f0] border border-[rgba(139,92,246,0.25)]"
                    : "bg-[#14142a] text-[#c4b5fd] border border-[#1e1e2e]"
                }`}>{msg.text}</div>
                <span className="text-[9px] font-mono text-[#52525b]">{msg.timestamp}</span>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-1.5 px-3 py-2">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-ai-pulse"
                    style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            )}
          </div>

          {/* Directives */}
          <div className="border-t border-[#1e1e2e] px-4 py-3 space-y-2 shrink-0">
            <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">AI Directives</span>
            {DIRECTIVES.map((rec) => (
              <div key={rec.id} className="bg-[#09090e] border border-[#1e1e2e] rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-xs font-mono font-semibold text-[#e8e8f0]">{rec.symbol}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    rec.type.includes("BUY")
                      ? "bg-[rgba(74,222,128,0.09)] text-[#4ade80] border-[rgba(74,222,128,0.2)]"
                      : "bg-[rgba(248,113,113,0.09)] text-[#f87171] border-[rgba(248,113,113,0.2)]"
                  }`}>{rec.type}</span>
                  <span className="text-[9px] font-mono text-[#52525b]">{rec.confidence}%</span>
                </div>
                <button onClick={() => placeOrder(rec.symbol, rec.type, 0.01, rec.price, rec.sl, rec.tp)}
                  className="flex items-center gap-1 px-2 py-1 text-[9px] font-sans font-medium uppercase tracking-widest rounded border border-[rgba(74,222,128,0.25)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.09)] transition-colors cursor-pointer">
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-[#1e1e2e] p-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#09090e] border border-[#1e1e2e] rounded-lg px-3 py-2 focus-within:border-[rgba(139,92,246,0.4)] transition-colors">
              <input id="vincent-input" type="text" value={input}
                onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask Vincent..."
                className="flex-1 bg-transparent text-xs font-sans text-[#e8e8f0] placeholder-[#52525b] outline-none" />
              <button id="vincent-send-btn" onClick={handleSend} disabled={!input.trim()}
                aria-label="Send message"
                className="text-[#8b5cf6] disabled:opacity-30 hover:text-[#a78bfa] transition-colors cursor-pointer disabled:cursor-default">
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
