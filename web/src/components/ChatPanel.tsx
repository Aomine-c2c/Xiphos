"use client";

import React, { useRef, useEffect } from "react";
import { AlertTriangle, Award, CheckCircle } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";

export default function ChatPanel() {
  const { placeOrder } = useTradingStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
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
    { id: "DIR-001", symbol: "EURUSD", type: "BUY LIMIT", price: 1.08900, tp: 1.09200, sl: 1.08230, status: "READY", confidence: 92 },
    { id: "DIR-002", symbol: "XAUUSD", type: "BUY STOP", price: 2408.20, tp: 2450.00, sl: 2390.00, status: "READY", confidence: 88 }
  ];

  return (
    <div className="w-full h-full bg-[#0E1525] border border-slate-900/80 flex flex-col font-mono select-none overflow-hidden rounded-sm">
      
      {/* Header */}
      <div className="flex-shrink-0 p-2.5 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40">
        <span className="text-[15px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
          <Award className="h-4 w-4 text-xiphos-blue" />
          CHIEF TRADING OFFICER
        </span>
        <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#00D26A] uppercase">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D26A] animate-pulse" />
          CTO ACTIVE
        </span>
      </div>

      {/* TOP HALF: Unified Analysis & Alert Feed */}
      <div className="flex-[0.55] flex flex-col min-h-0 border-b border-slate-900/60 bg-[#070B14]/40 relative">
        {/* Background Cyborg Watermark */}
        <div className="absolute top-0 right-0 bottom-0 w-1/2 opacity-10 pointer-events-none flex justify-end">
          <img src="/cyborg.png" alt="" className="object-cover object-right h-full" />
        </div>
        
        <span className="text-[10px] text-[#6f7e90] font-black uppercase tracking-wider block p-2.5 border-b border-slate-950/60 flex-shrink-0 z-10">
          LIVE INTELLIGENCE & RISK FEED
        </span>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-2.5 space-y-2.5 z-10">
          {feedItems.map((item, idx) => {
            const isWarn = item.type === "WARN";
            const isCrit = item.type === "CRITICAL";
            const color = isCrit ? "text-[#FF4D4D]" : isWarn ? "text-[#FFB020]" : "text-[#00A8FF]";
            const bg = isCrit ? "bg-[#FF4D4D]/5 border-[#FF4D4D]/20" : isWarn ? "bg-[#FFB020]/5 border-[#FFB020]/20" : "bg-[#00A8FF]/5 border-[#00A8FF]/20";
            
            return (
              <div key={idx} className={`p-2 border rounded-sm flex items-start gap-2.5 ${bg}`}>
                <div className={`mt-0.5 ${color}`}>
                  {isCrit || isWarn ? <AlertTriangle className="h-3.5 w-3.5" /> : <span className="text-[10px] font-black opacity-80">&gt;</span>}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9.5px] font-black ${color}`}>{item.type}</span>
                    <span className="text-[8.5px] text-[#6f7e90] font-bold">{item.time}</span>
                  </div>
                  <p className="text-[10px] leading-relaxed text-[#ccd6e0]">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM HALF: Structured Recommendation Cards */}
      <div className="flex-[0.45] flex flex-col min-h-0 bg-[#070B14]/60">
        <span className="text-[10px] text-[#6f7e90] font-black uppercase tracking-wider block p-2.5 border-b border-slate-950/60 flex-shrink-0">
          CTO ACTION DIRECTIVES
        </span>
        
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {recommendations.map(rec => (
            <div key={rec.id} className="border border-emerald-950/60 bg-[#0E1525] rounded-sm flex flex-col">
              <div className="p-2 border-b border-slate-950/60 flex justify-between items-center bg-[#0a101b]/40">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-[#00D26A] uppercase">{rec.id}: {rec.symbol}</span>
                  <span className="px-1.5 py-0.5 text-[8.5px] font-black border border-[#00D26A]/30 text-[#00D26A] bg-[#00D26A]/5 rounded-sm">
                    {rec.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[9px] font-bold text-[#6f7e90]">
                  CONFIDENCE: <span className="text-white font-black">{rec.confidence}%</span>
                </div>
              </div>
              
              <div className="p-2.5 flex justify-between items-center">
                <div className="flex gap-4 text-[9.5px]">
                  <div>
                    <span className="block text-[#6f7e90] font-bold mb-0.5">ENTRY</span>
                    <span className="text-white font-black">{rec.price.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-[#6f7e90] font-bold mb-0.5">TARGET (TP)</span>
                    <span className="text-[#00D26A] font-black">{rec.tp.toFixed(5)}</span>
                  </div>
                  <div>
                    <span className="block text-[#6f7e90] font-bold mb-0.5">RISK (SL)</span>
                    <span className="text-[#FF4D4D] font-black">{rec.sl.toFixed(5)}</span>
                  </div>
                </div>
                
                <button
                  onClick={() => placeOrder(rec.symbol, rec.type, 0.01, rec.price, rec.sl, rec.tp)}
                  className="px-3 py-1.5 bg-[#00D26A] hover:bg-emerald-400 text-black text-[9px] font-black tracking-widest uppercase rounded-sm cursor-pointer transition-all flex items-center gap-1"
                >
                  <CheckCircle className="h-3 w-3" /> APPROVE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
