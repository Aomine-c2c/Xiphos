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
                    key={`${item.time}-${idx}`} className="py-2.5 px-3 border rounded-xl flex items-start gap-2 backdrop-blur-md transition-all hover:bg-white/5 bg-xiphos-purple/5 border-xiphos-purple/20"
                  >
                    <div className="mt-0.5 text-xiphos-purple glow-purple">
                      <Network className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-[9px] font-black uppercase tracking-wider text-xiphos-purple">{item.type}</span>
                        <span className="text-[9px] text-xiphos-muted font-mono">{item.time}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-slate-300 font-sans">{item.text}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "MEMORY" && (
              <motion.div key="memory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2 font-mono">
                {memoryBlocks.map((mem, idx) => (
                  <div key={idx} className="glass-card p-3 flex flex-col gap-2 relative overflow-hidden transition-all hover:bg-white/5 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-xiphos-purple bg-xiphos-purple/10 px-1.5 py-0.5 rounded font-black">0x7F03A{idx}</span>
                        <span className="text-[10px] text-white font-black tracking-wider uppercase">{mem.key}</span>
                      </div>
                      <span className="text-[8px] text-xiphos-muted">{mem.updated}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-black/30 p-2 rounded border border-white/5">
                      <span className="text-[11px] font-black text-xiphos-cyan glow-cyan">{mem.value}</span>
                      <div className="flex flex-col items-end gap-1 w-24">
                        <div className="flex justify-between w-full text-[8px] text-xiphos-muted font-black">
                          <span>ACCURACY</span>
                          <span className="text-xiphos-cyan">{mem.acc}</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-xiphos-cyan glow-cyan" style={{ width: mem.acc }} />
                        </div>
                      </div>
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
        <span className="text-[10px] text-xiphos-muted font-bold uppercase tracking-widest block px-5 py-3 border-b border-[rgba(255,255,255,0.02)] shrink-0">
          AI ACTION DIRECTIVES
        </span>
        
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar relative z-10">
          {recommendations.map((rec, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}
              key={rec.id} className="glass-card rounded-lg flex flex-col transition-all border-xiphos-purple/20 hover:border-xiphos-purple/60 overflow-hidden group relative"
            >
              {/* Tactical Warning Diagonal Line */}
              <div className="absolute top-0 left-0 w-12 h-[3px] bg-linear-to-r from-xiphos-purple via-xiphos-cyan to-transparent" />
              
              <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-black/40 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white tracking-widest font-mono">{rec.symbol}</span>
                  <span className={`px-1.5 py-0.5 text-[8px] font-black border rounded-sm uppercase ${
                    rec.type.includes('BUY') ? 'border-xiphos-emerald/30 text-xiphos-emerald bg-xiphos-emerald/5' : 'border-xiphos-crimson/30 text-xiphos-crimson bg-xiphos-crimson/5'
                  }`}>
                    {rec.type}
                  </span>
                </div>
                <span className="text-[9px] font-black text-xiphos-muted uppercase tracking-wider">
                  CONF: <span className="text-xiphos-purple glow-purple">{rec.confidence}%</span>
                </span>
              </div>
              
              <div className="p-3 flex flex-col gap-3 relative z-10 font-mono">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black/30 p-1.5 rounded border border-white/5">
                    <span className="block text-[7px] text-xiphos-muted font-black uppercase tracking-widest mb-0.5">ENTRY</span>
                    <span className="text-white font-black text-[11px]">{rec.price.toFixed(5)}</span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded border border-white/5">
                    <span className="block text-[7px] text-xiphos-muted font-black uppercase tracking-widest mb-0.5">TARGET</span>
                    <span className="text-xiphos-emerald glow-emerald font-black text-[11px]">{rec.tp.toFixed(5)}</span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded border border-white/5">
                    <span className="block text-[7px] text-xiphos-muted font-black uppercase tracking-widest mb-0.5">STOP SL</span>
                    <span className="text-xiphos-crimson glow-crimson font-black text-[11px]">{rec.sl.toFixed(5)}</span>
                  </div>
                </div>
                <button
                  onClick={() => placeOrder(rec.symbol, rec.type, 0.01, rec.price, rec.sl, rec.tp)}
                  className="w-full py-2 bg-xiphos-emerald/10 hover:bg-xiphos-emerald border border-xiphos-emerald/40 hover:border-xiphos-emerald text-xiphos-emerald hover:text-black text-[10px] font-black tracking-widest uppercase rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] group-hover:bg-xiphos-emerald/20"
                >
                  <CheckCircle className="h-3.5 w-3.5" /> APPROVE DIRECTIVE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

    </div>
  );
}
