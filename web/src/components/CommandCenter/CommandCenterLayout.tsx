"use client";

import React, { useState } from "react";
import { MainChartTerminal } from "./MainChartTerminal";
import { MiniRadar } from "./MiniRadar";
import { OrderBookDOM } from "./OrderBookDOM";
import { AILogFeed } from "./AILogFeed";
import { Zap } from "lucide-react";
import { useTradingStore } from "../../store/useTradingStore";

const TIMEFRAMES = ["M5", "M15", "M30", "H1", "H4"];

export default function CommandCenterLayout() {
  const [activeSymbol, setActiveSymbol] = useState("EURUSD");
  const [activeTf, setActiveTf] = useState("M30");
  const { apiLatency, marketWatch } = useTradingStore();

  const currentData = marketWatch.find(m => m.symbol === activeSymbol);

  return (
    <div className="h-full w-full p-4 grid grid-cols-[200px_1fr_300px] gap-4 overflow-hidden bg-[#050508]">
      
      {/* LEFT SIDEBAR: Mini Radar */}
      <div className="h-full min-h-0 overflow-hidden flex flex-col">
        <MiniRadar activeSymbol={activeSymbol} onSelect={setActiveSymbol} />
      </div>

      {/* CENTER: Main Chart & Controls */}
      <div className="h-full min-h-0 flex flex-col overflow-hidden gap-4">
        {/* Top Controls */}
        <div className="h-10 shrink-0 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl flex items-center justify-between px-4">
          <div className="flex gap-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTf(tf)}
                className={`px-3 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
                  activeTf === tf
                    ? "text-[#e8e8f0] bg-[#1e1e2e] border border-[#3f3f46]"
                    : "text-[#52525b] hover:text-[#a1a1aa] border border-transparent"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-widest flex items-center gap-1">
               <Zap className="w-3 h-3 text-[#f59e0b]" />
               {typeof apiLatency === "number" ? apiLatency.toFixed(2) : apiLatency}ms
             </span>
          </div>
        </div>

        {/* Main Chart */}
        <div className="flex-1 min-h-0 overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.05)] rounded-xl">
          <MainChartTerminal activeSymbol={activeSymbol} activeTf={activeTf} />
        </div>
      </div>

      {/* RIGHT SIDEBAR: Telemetry & DOM */}
      <div className="h-full min-h-0 overflow-hidden flex flex-col gap-4">
        <div className="flex-[0.5] min-h-0 overflow-hidden">
          <OrderBookDOM activeSymbol={activeSymbol} currentPrice={currentData?.price} />
        </div>
        <div className="flex-[0.5] min-h-0 overflow-hidden">
          <AILogFeed activeSymbol={activeSymbol} />
        </div>
      </div>
      
    </div>
  );
}
