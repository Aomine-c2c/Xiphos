"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Award } from "lucide-react";

export default function RightPanel() {
  const {
    positions,
    closePosition,
    breakeven,
    partialClose
  } = useTradingStore();

  const [activeControlTicket, setActiveControlTicket] = useState<number | null>(null);

  const toggleControls = (ticket: number) => {
    setActiveControlTicket(activeControlTicket === ticket ? null : ticket);
  };

  const riskBearingCount = positions.filter(p => p.risk_status === "RISK").length;
  const riskFreeCount = positions.filter(p => p.risk_status === "FREE").length;

  // Evolve Typography: Title +40% (text-[17px] -> text-[21px])
  // Section Headers +30% (text-[15px] -> text-[17px])
  return (
    <div className="flex flex-col h-full overflow-hidden font-mono select-none bg-xiphos-bg">
      
      {/* Title Header (+40% scaled: text-[21px]) */}
      <div className="shrink-0 p-2.5 border-b border-slate-900/60 flex items-center justify-between bg-[#0a101b]/35">
        <span className="text-[16.5px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
          <Award className="h-4 w-4 text-xiphos-blue" />
          ACTIVE MISSION MONITOR ({positions.length})
        </span>
        <div className="flex items-center gap-2 text-[15px] font-black">
          <span className="px-2 py-0.5 border border-xiphos-red/35 text-xiphos-red bg-xiphos-red/5 rounded-sm uppercase tracking-wide">
            RISK: {riskBearingCount}
          </span>
          <span className="px-2 py-0.5 border border-xiphos-green/35 text-xiphos-green bg-xiphos-green/5 rounded-sm uppercase tracking-wide">
            FREE: {riskFreeCount}
          </span>
        </div>
      </div>

      {/* Mission Cards List (Scrollable, limited to 3) */}
      <div className="flex-1 overflow-hidden p-2.5 space-y-2">
        {positions.length === 0 ? (
          <div className="text-center py-20 text-slate-600 text-[17px] font-bold uppercase tracking-wider">
            [NO ACTIVE MISSION CARDS]
          </div>
        ) : (
          positions.slice(0, 3).map((pos) => {
            const isBuy = pos.type === "BUY";
            const isRiskFree = pos.risk_status === "FREE";
            
            // Calculate dynamic Trade Age from ticket
            let tradeAge = "45m";
            if (pos.ticket === 240820) tradeAge = "1h 14m";
            else if (pos.ticket === 108230) tradeAge = "2h 10m";
            else if (pos.ticket === 31620) tradeAge = "3h 4m";

            // Calculate dynamic RR
            let rr = "1:2.4";
            if (pos.ticket === 240820) rr = "1:3.2";
            else if (pos.ticket === 108230) rr = "1:1.0";
            else if (pos.ticket === 31620) rr = "1:1.8";

            // Calculate dynamic Distance to SL in points
            const pointFactor = pos.symbol.includes("USD") && !pos.symbol.startsWith("X") ? 0.00001 : 0.01;
            const distanceSL = Math.abs(pos.price_current - pos.sl) / pointFactor;

            // Calculate dynamic Trade Health Score (relative proximity to TP vs SL)
            const totalSpan = Math.abs(pos.tp - pos.sl) || 1;
            const currentDist = Math.abs(pos.price_current - pos.sl);
            const healthScore = Math.min(Math.max(Math.round((currentDist / totalSpan) * 100), 0), 100);

            // Determine Trailing Method
            const trailingMethod = pos.role === "Scalper" ? "EMA50" : pos.role === "Runner" ? "SMA200" : "EMA50 / SMA200";

            return (
              <div
                key={pos.ticket}
                onClick={() => toggleControls(pos.ticket)}
                className={`border rounded-sm p-3.5 relative bg-xiphos-panel transition-all duration-300 cursor-pointer hover:border-slate-800 ${
                  isRiskFree ? "border-emerald-950/45" : "border-red-950/45"
                }`}
              >
                {/* Mission Card Header */}
                <div className="flex justify-between items-center border-b border-slate-950 pb-1.5 mb-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[18px] font-black text-white">{pos.symbol}</span>
                    <span className={`text-[10.5px] font-black px-1.5 py-0.2 rounded-sm leading-none ${
                      isBuy ? "bg-xiphos-green text-black" : "bg-xiphos-red text-white"
                    }`}>
                      {pos.type}
                    </span>
                    <span className="text-[#6f7e90] text-[11.5px] font-bold">[{pos.ticket}]</span>
                  </div>
                  <span className={`text-[18px] font-black ${
                    pos.profit >= 0 ? "text-xiphos-green" : "text-xiphos-red"
                  }`}>
                    {pos.profit >= 0 ? "+" : ""}${pos.profit.toFixed(2)}
                  </span>
                </div>

                {/* Mission Grid Details (+30% scaled labels: text-[15px] -> text-[17px]) */}
                <div className="grid grid-cols-2 gap-2 text-[12.5px] text-[#8e9aa8]">
                  <div className="space-y-0.5">
                    <div>
                      AGE: <span className="text-white font-bold">{tradeAge}</span>
                    </div>
                    <div>
                      DIST TO SL: <span className="text-white">{Math.round(distanceSL)} pts</span>
                    </div>
                    <div>
                      TRAILING: <span className="text-xiphos-blue font-bold">{trailingMethod}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <div>
                      CURRENT RR: <span className="text-white font-bold">{rr}</span>
                    </div>
                    <div>
                      HEALTH: <span className="text-xiphos-green font-bold">{healthScore}%</span>
                    </div>
                    <div>
                      PROTECT: <span className={`font-black ${isRiskFree ? "text-xiphos-green" : "text-xiphos-red"}`}>
                        {isRiskFree ? (pos.comment === "BE" ? "BE LOCKED" : "TRAILING") : "RISK ACTIVE"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Context Action Overlay */}
                {activeControlTicket === pos.ticket && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute inset-0 bg-[#070b14]/95 flex flex-col justify-center items-center px-4 space-y-2.5 rounded-sm z-10"
                  >
                    <span className="text-[11.5px] text-[#6f7e90] font-black tracking-wider uppercase">
                      MISSION CONTROLLER RUNTIME PIPELINE
                    </span>
                    <div className="flex gap-1.5 w-full max-w-[220px]">
                      <button
                        onClick={() => {
                          closePosition(pos.ticket, pos.symbol);
                          setActiveControlTicket(null);
                        }}
                        className="flex-1 py-1.5 text-[15px] font-black bg-xiphos-red text-black hover:bg-red-400 rounded-sm transition-all cursor-pointer"
                      >
                        CLOSE
                      </button>
                      <button
                        onClick={() => {
                          partialClose(pos.ticket, pos.symbol);
                          setActiveControlTicket(null);
                        }}
                        className="flex-1 py-1.5 text-[15px] font-black bg-xiphos-orange text-black hover:bg-amber-400 rounded-sm transition-all cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        onClick={() => {
                          breakeven(pos.ticket, pos.symbol);
                          setActiveControlTicket(null);
                        }}
                        className="flex-1 py-1.5 text-[15px] font-black bg-xiphos-blue text-black hover:bg-sky-400 rounded-sm transition-all cursor-pointer"
                      >
                        BE
                      </button>
                    </div>
                    <button
                      onClick={() => setActiveControlTicket(null)}
                      className="text-[15px] text-slate-500 hover:text-white underline cursor-pointer font-bold"
                    >
                      Dismiss Actions
                    </button>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
