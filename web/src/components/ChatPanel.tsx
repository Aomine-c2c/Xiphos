"use client";

import React, { useRef, useEffect, useState } from "react";
import { CheckCircle, BrainCircuit, Database, Cpu, Network } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatPanel() {
  const { placeOrder } = useTradingStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const [activeTab, setActiveTab] = useState<"REASONING" | "MEMORY">("REASONING");

  const reasoningLogs = [
    { type: "ANALYSIS", time: "08:15:22", text: "M30 alignments show EURUSD and XAUUSD holding strong bullish momentum. Prices reside comfortably above the EMA13/EMA50 channels." },
    { type: "RISK", time: "08:17:05", text: "Correlation coefficient for Precious Metals group (XAU/XAG) exceeds 89% safety threshold. Limiting new exposure." },
    { type: "ALLOCATION", time: "08:21:40", text: "Global risk allocation is currently at 50% (2 of 4 slots). Capacity available for high-conviction signals." },
    { type: "ADAPTATION", time: "08:30:00", text: "Market volatility spike detected across USD crosses. Widening dynamic trailing stops by 15%." }
  ];

  const memoryBlocks = [
    { key: "EURUSD_BIAS", value: "BULLISH_STRONG", updated: "2m ago", acc: "94%" },
    { key: "VOL_REGIME", value: "EXPANDING", updated: "5m ago", acc: "88%" },
    { key: "RISK_CAP", value: "CONSTRAINED", updated: "12m ago", acc: "100%" }
  ];

  const recommendations = [
    { id: "DIR-001", symbol: "EURUSD", type: "BUY LIMIT", price: 1.089, tp: 1.092, sl: 1.0823, status: "READY", confidence: 92 },
    { id: "DIR-002", symbol: "XAUUSD", type: "BUY STOP", price: 2408.2, tp: 2450, sl: 2390, status: "READY", confidence: 88 }
  ];

  return (
    <div className="glass-panel w-full h-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex items-center justify-between relative z-10">
        <span className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-xiphos-purple animate-pulse glow-purple" />
          <span className="glow-purple">VINCENT AI MISSION CONTROL</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-black text-xiphos-purple uppercase tracking-widest animate-pulse glow-purple">
            ACTIVE LLaMA-3-70B
          </span>
          <div className="flex gap-1 items-center h-4">
            <motion.div animate={{ height: ["4px", "16px", "4px"] }} transition={{ duration: 1, repeat: Infinity }} className="w-1 bg-xiphos-purple rounded-full glow-purple" />
            <motion.div animate={{ height: ["4px", "12px", "4px"] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1 bg-xiphos-purple rounded-full glow-purple" />
            <motion.div animate={{ height: ["4px", "8px", "4px"] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1 bg-xiphos-purple rounded-full glow-purple" />
          </div>
        </div>
      </div>

      {/* TOP HALF: Unified Analysis & Alert Feed */}
      <div className="flex-[0.55] flex flex-col min-h-0 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.2)] relative">
        <div className="flex border-b border-[rgba(255,255,255,0.02)] shrink-0 z-10">
          <button 
            onClick={() => setActiveTab("REASONING")}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === "REASONING" ? "text-xiphos-purple border-b-2 border-xiphos-purple bg-xiphos-purple/5" : "text-xiphos-muted hover:bg-white/5 hover:text-white"}`}
          >
            <Cpu className="w-3 h-3" /> LIVE REASONING LOG
          </button>
          <button 
            onClick={() => setActiveTab("MEMORY")}
            className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${activeTab === "MEMORY" ? "text-xiphos-purple border-b-2 border-xiphos-purple bg-xiphos-purple/5" : "text-xiphos-muted hover:bg-white/5 hover:text-white"}`}
          >
            <Database className="w-3 h-3" /> LONG-TERM MEMORY
          </button>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar z-10">
          <AnimatePresence mode="wait">
            {activeTab === "REASONING" && (
              <motion.div key="reasoning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                {reasoningLogs.map((item, idx) => (
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: idx * 0.1 }}
                    key={`${item.time}-${idx}`} className="p-4 border rounded-xl flex items-start gap-3 backdrop-blur-md transition-all hover:bg-white/5 bg-xiphos-purple/5 border-xiphos-purple/20"
                  >
                    <div className="mt-0.5 text-xiphos-purple glow-purple">
                      <Network className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-xiphos-purple">{item.type}</span>
                        <span className="text-[10px] text-xiphos-muted font-mono">{item.time}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-300 font-sans">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "MEMORY" && (
              <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                {memoryBlocks.map((mem, idx) => (
                  <div key={idx} className="glass-card p-3 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-xiphos-muted font-black tracking-widest block uppercase mb-1">{mem.key}</span>
                      <span className="text-sm font-black text-white tracking-wider">{mem.value}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] text-xiphos-muted block">{mem.updated}</span>
                      <span className="text-[10px] text-xiphos-cyan glow-cyan font-black">{mem.acc} ACCURACY</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM HALF: Structured Recommendation Cards */}
      <div className="flex-[0.45] flex flex-col min-h-0 bg-[rgba(11,15,23,0.4)]">
        <span className="text-xs text-xiphos-muted font-bold uppercase tracking-widest block px-5 py-3 border-b border-[rgba(255,255,255,0.02)] shrink-0">
          AI ACTION DIRECTIVES
        </span>
        
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar relative z-10">
          {recommendations.map((rec, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}
              key={rec.id} className="glass-card rounded-xl flex flex-col transition-all hover:border-xiphos-purple/40 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] overflow-hidden group relative"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-xiphos-purple/10 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[rgba(11,15,23,0.6)] relative z-10">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-white uppercase tracking-wider">{rec.symbol}</span>
                  <span className="px-2 py-1 text-[10px] font-bold border border-xiphos-emerald/30 text-xiphos-emerald bg-xiphos-emerald/10 rounded-md uppercase">
                    {rec.type}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-xiphos-muted uppercase tracking-wider">
                  CONFIDENCE: <span className="text-xiphos-purple glow-purple font-black">{rec.confidence}%</span>
                </div>
              </div>
              
              <div className="p-4 flex flex-col gap-4 relative z-10">
                <div className="flex justify-between text-xs font-mono">
                  <div>
                    <span className="block text-xiphos-muted font-black mb-1 uppercase tracking-widest text-[9px]">ENTRY ZONE</span>
                    <span className="text-white font-black text-sm">{rec.price.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-xiphos-muted font-black mb-1 uppercase tracking-widest text-[9px]">PROFIT TARGET</span>
                    <span className="text-xiphos-emerald glow-emerald font-black text-sm">{rec.tp.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-xiphos-muted font-black mb-1 uppercase tracking-widest text-[9px]">RISK SL</span>
                    <span className="text-xiphos-crimson glow-crimson font-black text-sm">{rec.sl.toFixed(5)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => placeOrder(rec.symbol, rec.type, 0.01, rec.price, rec.sl, rec.tp)}
                  className="w-full py-3 bg-xiphos-emerald/10 hover:bg-xiphos-emerald/20 border border-xiphos-emerald/50 text-xiphos-emerald text-xs font-black tracking-widest uppercase rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] glow-emerald group/btn"
                >
                  <CheckCircle className="h-4 w-4 group-hover/btn:scale-110 transition-transform" /> APPROVE DIRECTIVE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
