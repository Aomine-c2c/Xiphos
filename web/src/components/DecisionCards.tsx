"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Check } from "lucide-react";

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
      <div className="bg-xiphos-panel border border-slate-900/80 rounded-sm p-4 font-mono select-none text-[16px] text-[#6f7e90] flex items-center justify-center h-full">
        NO ACTIVE SIGNALS PENDING DECISION
      </div>
    );
  }

  return (
    <div className="bg-xiphos-panel border border-slate-900/80 rounded-sm flex flex-col overflow-hidden font-mono select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-950 flex items-center bg-xiphos-bg/40">
        <span className="text-[17px] font-black text-xiphos-blue uppercase tracking-widest">
          DYNAMIC DECISION CARD
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4 bg-xiphos-bg/30">
        
        {/* Core signal header */}
        <div className="flex justify-between items-start border-b border-slate-950 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white">{topSignal.symbol}</span>
              <span className={`text-[15px] font-black px-2 py-0.5 rounded-sm ${topSignal.direction === 'BUY' ? 'bg-xiphos-green text-black' : 'bg-xiphos-red text-white'}`}>
                {topSignal.direction}
              </span>
            </div>
            <span className="text-[15px] text-[#425062] font-bold">
              TRIGGER TIME: <span className="text-white">LIVE</span>
            </span>
          </div>

          <div className="text-right space-y-1">
            <span className="text-[16px] text-[#8e9aa8] uppercase font-bold block leading-none">DISTANCE</span>
            <span className="text-3xl font-black text-xiphos-blue glow-blue leading-none">
              {topSignal.distance} <span className="text-[16px] text-[#8e9aa8] font-bold">pts</span>
            </span>
          </div>
        </div>

        {/* Gate Status Checklist */}
        <div className="space-y-2">
          <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block">
            GATES SYSTEM INTEGRITY
          </span>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 1, name: "RISK SLOTS", status: gates?.gate_1_risk_slot || "WAIT", colorClass: gates?.gate_1_risk_slot === "PASS" ? "text-xiphos-green" : "text-yellow-500" },
              { id: 2, name: "CORRELATION", status: gates?.gate_2_correlation || "WAIT", colorClass: gates?.gate_2_correlation === "PASS" ? "text-xiphos-green" : "text-yellow-500" },
              { id: 3, name: "FAN ALIGNMENT", status: gates?.gate_3_fan_alignment || "WAIT", colorClass: gates?.gate_3_fan_alignment === "PASS" ? "text-xiphos-green" : "text-yellow-500" },
              { id: 4, name: "PRIORITY RANK", status: gates?.gate_4_priority_filter || "WAIT", colorClass: gates?.gate_4_priority_filter === "PASS" ? "text-xiphos-green" : "text-yellow-500" }
            ].map((gate) => (
              <div key={gate.id} className="flex items-center justify-between border border-slate-950 p-2 rounded-sm bg-slate-950/20 text-[16px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-xiphos-blue font-black text-[14px]">G{gate.id}</span>
                  <span className="text-white font-bold">{gate.name}</span>
                </div>
                <span className={`font-black text-[15px] flex items-center gap-0.5 ${gate.colorClass}`}>
                  <Check className="h-3 w-3" /> {gate.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 pt-1 border-t border-slate-950">
          <button
            onClick={handleEngage}
            className="flex-1 py-2 bg-xiphos-green hover:bg-emerald-400 text-black text-[16px] font-black tracking-widest uppercase rounded-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            ENGAGE TARGET
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 border border-xiphos-red/40 hover:bg-xiphos-red/10 text-xiphos-red text-[16px] font-black tracking-widest uppercase rounded-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            DISMISS SIGNAL
          </button>
        </div>

      </div>
    </div>
  );
}
