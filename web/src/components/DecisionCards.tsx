"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Check, Target, X } from "lucide-react";

export default function DecisionCards() {
  const { gates, rankedSignals, sendCommand } = useTradingStore();

  const handleEngage = () => {
    alert("Signal engaged. Dispatched order execution package to direct broker link.");
    sendCommand("force_cycle");
  };

  const handleDismiss = () => {
    alert("Signal dismissed. Purging current cycle candidate.");
  };

  const topSignal = rankedSignals && rankedSignals.length > 0 ? rankedSignals[0] : null;

  if (!topSignal) {
    return (
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg w-full h-full p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <Target className="h-10 w-10 text-[#52525b] mb-4" />
        <span className="text-sm font-semibold text-[#52525b] tracking-widest uppercase">
          NO ACTIVE SIGNALS PENDING DECISION
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg w-full h-full flex flex-col overflow-hidden relative group">
      
      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[#1e1e2e] bg-[#0f0f1a] flex items-center justify-between">
        <span className="text-lg font-semibold text-[#e8e8f0] uppercase tracking-widest flex items-center gap-3">
          <Target className="h-5 w-5 text-[#a1a1aa]" />
          <span>DYNAMIC DECISION CARD</span>
        </span>
        <span className="flex items-center gap-2 text-xs font-semibold text-[#a1a1aa] uppercase">
          <span className="h-2 w-2 rounded-full bg-[#a1a1aa] animate-pulse" />
          {' '}AWAITING INPUT
        </span>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-4 space-y-4 bg-[#0f0f1a] overflow-y-auto custom-scrollbar">
        
        {/* Core signal header */}
        <div className="bg-[#09090e] border border-[#1e1e2e] rounded p-4 flex justify-between items-center transition-all hover:border-[rgba(139,92,246,0.25)] relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] text-[#52525b] font-semibold tracking-widest uppercase block">
              TARGET ACQUIRED
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-semibold text-[#e8e8f0] font-mono">{topSignal.symbol}</span>
              <span className={topSignal.direction === 'BUY' ? "bg-[rgba(74,222,128,0.09)] text-[#4ade80] border border-[rgba(74,222,128,0.2)] font-mono text-[10px] px-1.5 py-0.5 rounded" : topSignal.direction === 'SELL' ? "bg-[rgba(248,113,113,0.09)] text-[#f87171] border border-[rgba(248,113,113,0.2)] font-mono text-[10px] px-1.5 py-0.5 rounded" : "bg-[rgba(82,82,91,0.1)] text-[#52525b] border border-[rgba(82,82,91,0.2)] font-mono text-[10px] px-1.5 py-0.5 rounded"}>
                {topSignal.direction}
              </span>
            </div>
            <div className="text-[8px] text-[#52525b] font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>TIME:</span>
              <span className="text-[#e8e8f0] bg-white/5 px-1.5 py-0.5 rounded-sm">LIVE FEED</span>
            </div>
          </div>

          <div className="text-right space-y-1 relative z-10">
            <span className="text-[9px] text-[#52525b] font-semibold block tracking-widest uppercase">DISTANCE</span>
            <span className="text-3xl font-semibold text-[#a1a1aa] leading-none flex items-baseline gap-0.5 justify-end font-mono">
              {topSignal.distance} <span className="text-[9px] text-[#52525b] font-semibold uppercase tracking-widest">pts</span>
            </span>
          </div>
        </div>

        {/* Gate Status Checklist */}
        <div className="space-y-2">
          <span className="text-[9px] text-[#52525b] font-semibold uppercase tracking-widest block">
            GATES SYSTEM INTEGRITY
          </span>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 1, name: "RISK SLOTS", status: gates?.gate_1_risk_slot || "WAIT", colorClass: gates?.gate_1_risk_slot === "PASS" ? "text-[#4ade80]" : "text-[#f59e0b]" },
              { id: 2, name: "CORRELATION", status: gates?.gate_2_correlation || "WAIT", colorClass: gates?.gate_2_correlation === "PASS" ? "text-[#4ade80]" : "text-[#f59e0b]" },
              { id: 3, name: "FAN ALIGNMENT", status: gates?.gate_3_fan_alignment || "WAIT", colorClass: gates?.gate_3_fan_alignment === "PASS" ? "text-[#4ade80]" : "text-[#f59e0b]" },
              { id: 4, name: "PRIORITY RANK", status: gates?.gate_4_priority_filter || "WAIT", colorClass: gates?.gate_4_priority_filter === "PASS" ? "text-[#4ade80]" : "text-[#f59e0b]" }
            ].map((gate) => (
              <div key={gate.id} className="bg-[#09090e] border border-[#1e1e2e] rounded py-2 px-2.5 flex items-center justify-between text-xs transition-all hover:bg-[rgba(139,92,246,0.04)]">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-sm bg-[rgba(161,161,170,0.1)] text-[#a1a1aa] font-semibold text-[9px] border border-[#1e1e2e]">G{gate.id}</span>
                  <span className="text-[#52525b] font-semibold uppercase tracking-wider text-[8px]">{gate.name}</span>
                </div>
                <span className={`font-semibold text-[9px] tracking-widest flex items-center gap-0.5 ${gate.colorClass}`}>
                  <Check className="h-2.5 w-2.5" /> {gate.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="shrink-0 p-5 bg-[#0f0f1a] border-t border-[#1e1e2e]">
        <div className="flex gap-4">
          <button
            onClick={handleEngage}
            className="flex-2 py-3.5 bg-[rgba(74,222,128,0.1)] hover:bg-[rgba(74,222,128,0.2)] border border-[#4ade80] text-[#4ade80] text-sm font-semibold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <Check className="h-5 w-5 group-hover:scale-110 transition-transform" /> ENGAGE TARGET
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-3.5 bg-transparent hover:bg-[rgba(248,113,113,0.1)] border border-[#1e1e2e] hover:border-[#f87171] text-[#f87171] text-sm font-semibold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group"
          >
            <X className="h-5 w-5 group-hover:scale-110 transition-transform" /> DISMISS
          </button>
        </div>
      </div>

    </div>
  );
}
