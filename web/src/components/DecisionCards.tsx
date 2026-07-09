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
      <div className="flex-1 p-4 space-y-4 bg-[rgba(11,15,23,0.2)] overflow-y-auto custom-scrollbar">
        
        {/* Core signal header */}
        <div className="glass-card p-4 flex justify-between items-center transition-all border-xiphos-cyan/20 hover:border-xiphos-cyan/50 relative overflow-hidden bg-black/40">
          <div className="absolute top-0 left-0 w-8 h-[2px] bg-linear-to-r from-xiphos-cyan to-transparent" />
          <div className="absolute top-0 left-0 w-[2px] h-8 bg-linear-to-b from-xiphos-cyan to-transparent" />
          
          <div className="space-y-1 relative z-10">
            <span className="text-[9px] text-xiphos-muted font-black tracking-widest uppercase block">
              TARGET ACQUIRED
            </span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white font-mono">{topSignal.symbol}</span>
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-sm ${
                topSignal.direction === 'BUY' ? 'bg-xiphos-emerald/20 text-xiphos-emerald border border-xiphos-emerald/30 glow-emerald' : 'bg-xiphos-crimson/20 text-xiphos-crimson border border-xiphos-crimson/30 glow-crimson'
              }`}>
                {topSignal.direction}
              </span>
            </div>
            <div className="text-[8px] text-xiphos-muted font-mono uppercase tracking-wider flex items-center gap-1.5">
              <span>TIME:</span>
              <span className="text-white bg-white/5 px-1.5 py-0.5 rounded-sm">LIVE FEED</span>
            </div>
          </div>

          <div className="text-right space-y-1 relative z-10">
            <span className="text-[9px] text-xiphos-muted font-black block tracking-widest uppercase">DISTANCE</span>
            <span className="text-3xl font-black text-xiphos-cyan glow-cyan leading-none flex items-baseline gap-0.5 justify-end font-mono">
              {topSignal.distance} <span className="text-[9px] text-xiphos-cyan/60 font-black uppercase tracking-widest">pts</span>
            </span>
          </div>
        </div>

        {/* Gate Status Checklist */}
        <div className="space-y-2">
          <span className="text-[9px] text-xiphos-muted font-black uppercase tracking-widest block">
            GATES SYSTEM INTEGRITY
          </span>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 1, name: "RISK SLOTS", status: gates?.gate_1_risk_slot || "WAIT", colorClass: gates?.gate_1_risk_slot === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" },
              { id: 2, name: "CORRELATION", status: gates?.gate_2_correlation || "WAIT", colorClass: gates?.gate_2_correlation === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" },
              { id: 3, name: "FAN ALIGNMENT", status: gates?.gate_3_fan_alignment || "WAIT", colorClass: gates?.gate_3_fan_alignment === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" },
              { id: 4, name: "PRIORITY RANK", status: gates?.gate_4_priority_filter || "WAIT", colorClass: gates?.gate_4_priority_filter === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-gold glow-gold" }
            ].map((gate) => (
              <div key={gate.id} className="glass-card py-2 px-2.5 flex items-center justify-between text-xs transition-all hover:bg-white/5 bg-black/40 border border-white/5">
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center justify-center w-4 h-4 rounded-sm bg-xiphos-cyan/10 text-xiphos-cyan font-black text-[9px] border border-xiphos-cyan/20">G{gate.id}</span>
                  <span className="text-xiphos-muted font-black uppercase tracking-wider text-[8px]">{gate.name}</span>
                </div>
                <span className={`font-black text-[9px] tracking-widest flex items-center gap-0.5 ${gate.colorClass}`}>
                  <Check className="h-2.5 w-2.5" /> {gate.status}
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
            className="flex-2 py-3.5 bg-xiphos-emerald/20 hover:bg-xiphos-emerald border border-xiphos-emerald text-white text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] cursor-pointer group"
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
