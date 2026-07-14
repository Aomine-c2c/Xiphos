"use client";

import React from "react";
import TradingChart from "../TradingChart";
import { useTradingStore } from "../../store/useTradingStore";
import { Activity, Target, ShieldAlert, Cpu } from "lucide-react";

export function MainChartTerminal({ activeSymbol, activeTf }: { activeSymbol: string, activeTf: string }) {
  const { mahoragaState } = useTradingStore();
  const state = mahoragaState && mahoragaState[activeSymbol];
  
  const confidence = state?.is_adapted ? 98 : (state?.adaptation_spins ? Math.min(state.adaptation_spins * 12, 85) : 45);
  const bias = state?.momentum_state || "NEUTRAL";
  const biasColor = bias === "BULLISH" ? "text-[#4ade80]" : bias === "BEARISH" ? "text-[#f87171]" : "text-[#a1a1aa]";

  return (
    <div className="relative w-full h-full bg-[#09090e] border border-[#1e1e2e] rounded-xl overflow-hidden flex flex-col group">
      
      {/* Chart Canvas */}
      <div className="flex-1 w-full h-full relative">
        <TradingChart symbol={activeSymbol} timeframe={activeTf} />
        
        {/* Cyberpunk HUD Overlays */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
          
          <div className="bg-[#0f0f1a]/80 backdrop-blur-md border border-[#8b5cf6]/30 rounded-lg p-3 w-48 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3.5 h-3.5 text-[#8b5cf6]" />
              <span className="text-[10px] font-mono text-[#a78bfa] tracking-widest uppercase">Mahoraga Core</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-[9px] text-[#52525b]">CONFIDENCE</span>
              <span className="text-xs font-mono text-[#e8e8f0] font-bold">{confidence}%</span>
            </div>
            <div className="w-full bg-[#1e1e2e] h-1 mt-1 rounded-full overflow-hidden">
              <div className="h-full bg-[#8b5cf6] transition-all duration-1000" style={{ width: `${confidence}%` }} />
            </div>
          </div>

          <div className="bg-[#0f0f1a]/80 backdrop-blur-md border border-[#1e1e2e] rounded-lg p-3 w-48">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-mono text-[#52525b] uppercase">Bias</span>
              <span className={`text-[10px] font-bold font-mono uppercase ${biasColor}`}>{bias}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#52525b] uppercase">Volatility</span>
              <span className="text-[10px] font-bold font-mono text-[#e8e8f0] uppercase">{state?.filter_strictness || "NORMAL"}</span>
            </div>
          </div>

          <div className="bg-[#0f0f1a]/80 backdrop-blur-md border border-[#1e1e2e] rounded-lg p-3 w-48 mt-auto">
            <div className="flex items-center gap-2">
              <Target className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span className="text-[9px] font-mono text-[#38bdf8] uppercase">Target Zone</span>
            </div>
            <div className="mt-1 text-[10px] font-mono text-[#94a3b8]">Auto-adjusting based on ATR</div>
          </div>
        </div>
      </div>
      
      {/* Footer Info Strip */}
      <div className="h-8 shrink-0 bg-[#0f0f1a] border-t border-[#1e1e2e] flex items-center px-4 justify-between">
        <div className="flex items-center gap-4">
          <span className="text-[9px] font-mono text-[#52525b] flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Protected Execution
          </span>
          <span className="text-[9px] font-mono text-[#4ade80] flex items-center gap-1">
            <Activity className="w-3 h-3" /> Live Feed
          </span>
        </div>
        <span className="text-[9px] font-mono text-[#52525b] tracking-widest uppercase">{activeSymbol} | {activeTf}</span>
      </div>
    </div>
  );
}
