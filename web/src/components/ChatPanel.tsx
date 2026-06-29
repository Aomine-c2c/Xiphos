"use client";

import React, { useRef, useEffect } from "react";
import { AlertTriangle, CheckCircle, BrainCircuit } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";

export default function ChatPanel() {
  const { placeOrder } = useTradingStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  const feedItems = [
    { type: "INFO", time: "08:15:22", text: "M30 alignments show EURUSD and XAUUSD holding strong bullish momentum. Prices reside comfortably above the EMA13/EMA50 channels." },
    { type: "WARN", time: "08:17:05", text: "Correlation coefficient for Precious Metals group (XAU/XAG) exceeds 89% safety threshold. Limiting new exposure." },
    { type: "INFO", time: "08:21:40", text: "Global risk allocation is currently at 50% (2 of 4 slots). Capacity available for high-conviction signals." },
    { type: "WARN", time: "08:25:11", text: "GBPUSD execution blocked. EURUSD holds major risk allocation. Correlation limit breached." },
    { type: "CRITICAL", time: "08:30:00", text: "Market volatility spike detected across USD crosses. Widening dynamic trailing stops by 15%." }
  ];

  const recommendations = [
    { id: "DIR-001", symbol: "EURUSD", type: "BUY LIMIT", price: 1.089, tp: 1.092, sl: 1.0823, status: "READY", confidence: 92 },
    { id: "DIR-002", symbol: "XAUUSD", type: "BUY STOP", price: 2408.2, tp: 2450, sl: 2390, status: "READY", confidence: 88 }
  ];

  return (
    <div className="glass-panel w-full h-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex items-center justify-between">
        <span className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
          <BrainCircuit className="h-5 w-5 text-xiphos-purple animate-pulse glow-purple" />
          <span className="glow-purple">VINCENT AI CTO</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-xiphos-purple uppercase tracking-widest animate-pulse glow-purple">
            ANALYZING NEURAL DATA
          </span>
          <div className="flex gap-1 items-center h-4">
            <div className="w-1 h-3 bg-xiphos-purple rounded-full animate-[pulse_1s_ease-in-out_infinite] glow-purple" />
            <div className="w-1 h-4 bg-xiphos-purple rounded-full animate-[pulse_1s_ease-in-out_0.2s_infinite] glow-purple" />
            <div className="w-1 h-2 bg-xiphos-purple rounded-full animate-[pulse_1s_ease-in-out_0.4s_infinite] glow-purple" />
          </div>
        </div>
      </div>

      {/* TOP HALF: Unified Analysis & Alert Feed */}
      <div className="flex-[0.55] flex flex-col min-h-0 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.2)] relative">
        <span className="text-xs text-xiphos-muted font-bold uppercase tracking-widest block px-5 py-3 border-b border-[rgba(255,255,255,0.02)] shrink-0 z-10">
          LIVE INTELLIGENCE FEED
        </span>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar z-10">
          {feedItems.map((item, idx) => {
            const isWarn = item.type === "WARN";
            const isCrit = item.type === "CRITICAL";
            let color = "text-xiphos-cyan glow-cyan";
            let bg = "bg-xiphos-cyan/5 border-xiphos-cyan/20";
            if (isCrit) {
              color = "text-xiphos-crimson glow-crimson";
              bg = "bg-xiphos-crimson/5 border-xiphos-crimson/20";
            } else if (isWarn) {
              color = "text-xiphos-gold glow-gold";
              bg = "bg-xiphos-gold/5 border-xiphos-gold/20";
            }
            
            return (
              <div key={`${item.time}-${idx}`} className={`p-4 border rounded-xl flex items-start gap-3 backdrop-blur-md transition-all hover:bg-white/5 ${bg}`}>
                <div className={`mt-0.5 ${color}`}>
                  {isCrit || isWarn ? <AlertTriangle className="h-4 w-4" /> : <span className="text-sm font-bold opacity-80">&gt;</span>}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${color}`}>{item.type}</span>
                    <span className="text-[10px] text-xiphos-muted font-mono">{item.time}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-300 font-sans">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM HALF: Structured Recommendation Cards */}
      <div className="flex-[0.45] flex flex-col min-h-0 bg-[rgba(11,15,23,0.4)]">
        <span className="text-xs text-xiphos-muted font-bold uppercase tracking-widest block px-5 py-3 border-b border-[rgba(255,255,255,0.02)] shrink-0">
          AI ACTION DIRECTIVES
        </span>
        
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
          {recommendations.map(rec => (
            <div key={rec.id} className="glass-card rounded-xl flex flex-col transition-all hover:border-xiphos-purple/40 hover:shadow-[0_0_15px_rgba(139,92,246,0.1)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center bg-[rgba(11,15,23,0.6)]">
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
              
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-between text-xs font-mono">
                  <div>
                    <span className="block text-xiphos-muted font-bold mb-1 uppercase tracking-wider text-[10px]">ENTRY</span>
                    <span className="text-white font-bold">{rec.price.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-xiphos-muted font-bold mb-1 uppercase tracking-wider text-[10px]">TARGET</span>
                    <span className="text-xiphos-emerald glow-emerald font-bold">{rec.tp.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-xiphos-muted font-bold mb-1 uppercase tracking-wider text-[10px]">RISK</span>
                    <span className="text-xiphos-crimson glow-crimson font-bold">{rec.sl.toFixed(5)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => placeOrder(rec.symbol, rec.type, 0.01, rec.price, rec.sl, rec.tp)}
                  className="w-full py-2.5 bg-xiphos-emerald/10 hover:bg-xiphos-emerald/20 border border-xiphos-emerald/50 text-xiphos-emerald text-xs font-bold tracking-widest uppercase rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] glow-emerald"
                >
                  <CheckCircle className="h-4 w-4" /> APPROVE DIRECTIVE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
