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
      <div className="glass-panel w-full h-full p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-xiphos-cyan/5 rounded-full blur-[60px]"></div>
        <Target className="h-10 w-10 text-xiphos-cyan/30 mb-4 animate-pulse" />
        <span className="text-sm font-bold text-xiphos-muted tracking-widest uppercase">
          NO ACTIVE SIGNALS PENDING DECISION
        </span>
      </div>
    );
  }

  return (
    <div className="glass-panel w-full h-full flex flex-col overflow-hidden relative group">
      
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-xiphos-cyan/10 rounded-full blur-[60px] -z-10 group-hover:bg-xiphos-cyan/20 transition-all duration-700"></div>

      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex items-center justify-between">
        <span className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
          <Target className="h-5 w-5 text-xiphos-cyan animate-pulse glow-cyan" />
          <span className="glow-cyan">DYNAMIC DECISION CARD</span>
        </span>
        <span className="flex items-center gap-2 text-xs font-bold text-xiphos-cyan uppercase">
          <span className="h-2 w-2 rounded-full bg-xiphos-cyan animate-ping absolute" />
          <span className="h-2 w-2 rounded-full bg-xiphos-cyan relative z-10" />
          {' '}AWAITING INPUT
        </span>
      </div>

      {/* Card Body */}
      <div className="flex-1 p-5 space-y-5 bg-[rgba(11,15,23,0.2)] overflow-y-auto custom-scrollbar">
        
        {/* Core signal header */}
        <div className="glass-card p-5 flex justify-between items-center transition-all hover:border-xiphos-cyan/40">
          <div className="space-y-2">
            <span className="text-xs text-xiphos-muted font-bold tracking-widest uppercase block">
              TARGET ACQUIRED
            </span>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-white">{topSignal.symbol}</span>
              <span className={`text-sm font-bold px-2 py-1 rounded-md shadow-lg ${
                topSignal.direction === 'BUY' ? 'bg-xiphos-emerald/20 text-xiphos-emerald border border-xiphos-emerald/50 glow-emerald' : 'bg-xiphos-crimson/20 text-xiphos-crimson border border-xiphos-crimson/50 glow-crimson'
              }`}>
                {topSignal.direction}
              </span>
            </div>
            <span className="text-xs text-xiphos-muted font-bold flex items-center gap-2 uppercase tracking-wider">
              TRIGGER TIME: <span className="text-white bg-white/10 px-2 py-0.5 rounded-sm">LIVE</span>
            </span>
          </div>

          <div className="text-right space-y-1">
            <span className="text-xs text-xiphos-muted font-bold block tracking-widest uppercase">DISTANCE TO TARGET</span>
            <span className="text-4xl font-black text-xiphos-cyan glow-cyan leading-none flex items-baseline gap-1 justify-end">
              {topSignal.distance} <span className="text-sm text-xiphos-cyan/60 font-bold uppercase tracking-wider">pts</span>
            </span>
          </div>
        </div>

        {/* Gate Status Checklist */}
        <div className="space-y-3">
          <span className="text-xs text-xiphos-muted font-bold uppercase tracking-widest block">
            GATES SYSTEM INTEGRITY
          </span>

          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 1, name: "RISK SLOTS", status: gates?.gate_1_risk_slot || "WAIT", colorClass: gates?.gate_1_risk_slot === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" },
              { id: 2, name: "CORRELATION", status: gates?.gate_2_correlation || "WAIT", colorClass: gates?.gate_2_correlation === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" },
              { id: 3, name: "FAN ALIGNMENT", status: gates?.gate_3_fan_alignment || "WAIT", colorClass: gates?.gate_3_fan_alignment === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" },
              { id: 4, name: "PRIORITY RANK", status: gates?.gate_4_priority_filter || "WAIT", colorClass: gates?.gate_4_priority_filter === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" }
            ].map((gate) => (
              <div key={gate.id} className="glass-card p-3 flex items-center justify-between text-sm transition-all hover:bg-white/5">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-md bg-xiphos-cyan/10 text-xiphos-cyan font-bold text-xs border border-xiphos-cyan/20 glow-cyan">G{gate.id}</span>
                  <span className="text-white font-bold uppercase tracking-wider text-xs">{gate.name}</span>
                </div>
                <span className={`font-bold text-xs tracking-widest flex items-center gap-1 ${gate.colorClass}`}>
                  <Check className="h-3 w-3" /> {gate.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Controls */}
      <div className="shrink-0 p-5 bg-[rgba(11,15,23,0.4)] border-t border-[rgba(255,255,255,0.05)]">
        <div className="flex gap-4">
          <button
            onClick={handleEngage}
            className="flex-[2] py-3.5 bg-xiphos-emerald/20 hover:bg-xiphos-emerald border border-xiphos-emerald text-white text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] cursor-pointer group"
          >
            <Check className="h-5 w-5 group-hover:scale-110 transition-transform" /> ENGAGE TARGET
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-3.5 bg-[rgba(11,15,23,0.6)] hover:bg-xiphos-crimson/10 border border-xiphos-crimson/30 hover:border-xiphos-crimson/80 text-xiphos-crimson text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] cursor-pointer group"
          >
            <X className="h-5 w-5 group-hover:scale-110 transition-transform" /> DISMISS
          </button>
        </div>
      </div>

    </div>
  );
}
