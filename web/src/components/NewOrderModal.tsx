"use client";

import React, { useState, useEffect } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, AlertTriangle } from "lucide-react";
import { GlassCard } from "./ui/GlassCard";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
}

export default function NewOrderModal({ isOpen, onClose, defaultSymbol = "EURUSD" }: NewOrderModalProps) {
  const { placeOrder, account } = useTradingStore();
  
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [type, setType] = useState("BUY");
  const [volume, setVolume] = useState("1.00");
  const [price, setPrice] = useState("");
  const [sl, setSl] = useState("");
  const [tp, setTp] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSymbol(defaultSymbol);
      setType("BUY");
      setVolume("1.00");
      setPrice("");
      setSl("");
      setTp("");
    }
  }, [isOpen, defaultSymbol]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !volume) return;
    
    placeOrder(
      symbol.toUpperCase(),
      type,
      parseFloat(volume),
      price ? parseFloat(price) : 0,
      sl ? parseFloat(sl) : 0,
      tp ? parseFloat(tp) : 0
    );
    
    onClose();
  };

  const isPending = type.includes("LIMIT") || type.includes("STOP");

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <GlassCard className="flex flex-col overflow-hidden shadow-2xl border-[#8b5cf6]/30">
              <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.6)]">
                <h2 className="text-[11px] font-bold text-white tracking-widest uppercase">NEW ORDER TICKET</h2>
                <button onClick={onClose} className="p-1 text-[#94a3b8] hover:text-white rounded hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest">Symbol</label>
                    <input 
                      type="text" 
                      value={symbol} 
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                      className="bg-[rgba(11,15,23,0.5)] border border-[#1e1e2e] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest">Type</label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="bg-[rgba(11,15,23,0.5)] border border-[#1e1e2e] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors appearance-none cursor-pointer"
                    >
                      <option value="BUY">Market Buy</option>
                      <option value="SELL">Market Sell</option>
                      <option value="BUY_LIMIT">Buy Limit</option>
                      <option value="SELL_LIMIT">Sell Limit</option>
                      <option value="BUY_STOP">Buy Stop</option>
                      <option value="SELL_STOP">Sell Stop</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest">Volume (Lots)</label>
                    <input 
                      type="number" 
                      step="0.01" 
                      min="0.01"
                      value={volume} 
                      onChange={(e) => setVolume(e.target.value)}
                      className="bg-[rgba(11,15,23,0.5)] border border-[#1e1e2e] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                      required
                    />
                  </div>
                  {isPending && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest">Price</label>
                      <input 
                        type="number" 
                        step="0.00001"
                        value={price} 
                        onChange={(e) => setPrice(e.target.value)}
                        className="bg-[rgba(11,15,23,0.5)] border border-[#1e1e2e] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#8b5cf6]/50 transition-colors"
                        required={isPending}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest">Stop Loss</label>
                    <input 
                      type="number" 
                      step="0.00001"
                      value={sl} 
                      onChange={(e) => setSl(e.target.value)}
                      className="bg-[rgba(11,15,23,0.5)] border border-[#1e1e2e] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#f87171]/50 transition-colors"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[9px] text-[#94a3b8] font-bold uppercase tracking-widest">Take Profit</label>
                    <input 
                      type="number" 
                      step="0.00001"
                      value={tp} 
                      onChange={(e) => setTp(e.target.value)}
                      className="bg-[rgba(11,15,23,0.5)] border border-[#1e1e2e] rounded px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-[#4ade80]/50 transition-colors"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {account.margin_level > 0 && account.margin_level < 150 && (
                  <div className="flex gap-2 items-start bg-[#f59e0b]/10 border border-[#f59e0b]/30 rounded p-2 mt-2">
                    <AlertTriangle className="w-3 h-3 text-[#f59e0b] shrink-0 mt-0.5" />
                    <p className="text-[9px] text-[#f59e0b] leading-tight">Margin level is low ({account.margin_level.toFixed(0)}%). Further positions may be rejected.</p>
                  </div>
                )}

                <button 
                  type="submit"
                  className={`mt-2 w-full py-3 rounded text-[11px] font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${
                    type.includes("BUY") 
                      ? "bg-[#4ade80]/20 text-[#4ade80] hover:bg-[#4ade80] hover:text-black" 
                      : "bg-[#f87171]/20 text-[#f87171] hover:bg-[#f87171] hover:text-black"
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {type.includes("BUY") ? "PLACE BUY ORDER" : "PLACE SELL ORDER"}
                </button>

              </form>
            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
