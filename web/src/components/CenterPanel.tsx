"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Radio, Play, Activity, Target } from "lucide-react";

export default function CenterPanel() {
  const { sendCommand, rankedSignals, gates } = useTradingStore();

  const heroSignal = rankedSignals.find((s) => s.status === "APPROVED") || rankedSignals[0] || {
    symbol: "EURUSD",
    direction: "BUY",
    price: 1.08945,
    projected_risk: 1.23,
    distance: 715,
    sma200: 1.0823,
    priority: 2
  };

  const handleForceExecute = () => {
    alert(`Manual override dispatch package transmitted for Hero Target: ${heroSignal.symbol}`);
    sendCommand("force_cycle");
  };

  const lifecycleSteps = [
    { label: "SIGNAL", status: "COMPLETED", desc: "M30 Tick" },
    { label: "VALIDATE", status: "COMPLETED", desc: "5-Gates" },
    { label: "EXECUTE", status: "COMPLETED", desc: "MT5 Order" },
    { label: "PROTECT", status: "ACTIVE", desc: "SL Active" },
    { label: "RUNNING", status: "PENDING", desc: "Floating" },
    { label: "CLOSED", status: "PENDING", desc: "Target" }
  ];

  return (
    <div className="flex flex-col gap-6 w-full h-full justify-between">
      
      {/* 1. SIGNAL INTELLIGENCE COMMAND CORE */}
      <div className="glass-panel flex flex-col overflow-hidden flex-1 min-h-0">
        
        {/* Title Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex items-center justify-between shrink-0">
          <span className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
            <Radio className="h-5 w-5 text-xiphos-purple animate-pulse glow-purple" />
            <span className="glow-purple">XIPHOS HERO DECISION CORE</span>
          </span>
          <span className="text-sm text-xiphos-muted font-semibold tracking-widest flex items-center gap-2">
            LATENCY: <span className="text-xiphos-cyan glow-cyan">12ms</span>
          </span>
        </div>

        {/* Hero Grid layout */}
        <div className="p-6 grid grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
          
          {/* Left Hero Core Block */}
          <div className="col-span-7 glass-card p-6 flex flex-col justify-between min-h-0 overflow-hidden relative group">
            {/* Ambient background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-xiphos-purple/10 rounded-full blur-[80px] -z-10 group-hover:bg-xiphos-purple/20 transition-all duration-700"></div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-xiphos-muted" />
                <span className="text-sm text-xiphos-muted font-bold tracking-widest uppercase">
                  ACTIVE HERO TARGET
                </span>
              </div>
              
              <div className="flex items-baseline gap-4 mt-2">
                <span className="text-5xl font-black text-white tracking-tight">{heroSignal.symbol}</span>
                <span className={`text-xl font-bold px-3 py-1 rounded-md shadow-lg ${
                  heroSignal.direction === "BUY" ? "bg-xiphos-emerald/20 text-xiphos-emerald border border-xiphos-emerald/50 glow-emerald" : "bg-xiphos-crimson/20 text-xiphos-crimson border border-xiphos-crimson/50 glow-crimson"
                }`}>
                  {heroSignal.direction}
                </span>
              </div>
            </div>

            {/* Huge Metrics Display Area */}
            <div className="my-6 py-6 border-y border-[rgba(255,255,255,0.05)] flex items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-sm text-xiphos-muted font-bold block uppercase tracking-widest">KRONOS CONFIDENCE</span>
                <span className="text-6xl font-black text-xiphos-gold leading-none tracking-tighter glow-gold">92%</span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-sm text-xiphos-muted font-bold block uppercase tracking-widest">PROJECTED RISK</span>
                <span className="text-4xl font-black text-white leading-none">
                  {heroSignal.projected_risk.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Live Ticks Summary */}
            <div className="text-sm text-xiphos-muted grid grid-cols-3 gap-4 font-mono">
              <div className="bg-[rgba(11,15,23,0.5)] p-3 rounded-lg border border-[rgba(255,255,255,0.02)]">
                <span className="block text-[10px] uppercase mb-1">PRICE</span>
                <span className="text-white font-bold text-lg">{heroSignal.price.toFixed(5)}</span>
              </div>
              <div className="bg-[rgba(11,15,23,0.5)] p-3 rounded-lg border border-[rgba(255,255,255,0.02)]">
                <span className="block text-[10px] uppercase mb-1">SMA200</span>
                <span className="text-white font-bold text-lg">{heroSignal.sma200.toFixed(5)}</span>
              </div>
              <div className="bg-[rgba(11,15,23,0.5)] p-3 rounded-lg border border-[rgba(255,255,255,0.02)]">
                <span className="block text-[10px] uppercase mb-1">GAP</span>
                <span className="text-xiphos-cyan font-bold text-lg glow-cyan">{heroSignal.distance} pts</span>
              </div>
            </div>
          </div>

          {/* Right Core block: Validation Gates & Action Dispatcher */}
          <div className="col-span-5 flex flex-col justify-between gap-6 min-h-0">
            
            {/* Validation Matrix Box */}
            <div className="glass-card p-5 space-y-3 flex-1 min-h-0 overflow-hidden relative">
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)] pb-3 mb-3">
                <Activity className="w-4 h-4 text-xiphos-purple" />
                <span className="text-sm text-white font-bold uppercase tracking-widest">
                  NEURAL GATES
                </span>
              </div>
              
              <div className="space-y-2">
                {[
                  { id: 1, name: "RISK SLOTS", status: gates.gate_1_risk_slot || "PASS" },
                  { id: 2, name: "CORRELATION", status: gates.gate_2_correlation || "PASS" },
                  { id: 3, name: "FAN ALIGN", status: gates.gate_3_fan_alignment || "PASS" },
                  { id: 4, name: "PRIORITY", status: gates.gate_4_priority_filter || "PASS" },
                  { id: 5, name: "HARD SL", status: gates.gate_5_hard_sl || "PASS" }
                ].map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between text-xs border border-[rgba(255,255,255,0.05)] p-2.5 rounded-lg bg-[rgba(11,15,23,0.6)] leading-none transition-colors hover:bg-[rgba(11,15,23,0.8)]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-md bg-xiphos-purple/20 text-xiphos-purple font-bold text-[10px]">G{g.id}</span>
                      <span className="font-semibold text-xiphos-muted uppercase tracking-wider">{g.name}</span>
                    </div>
                    <span className={`font-bold tracking-widest flex items-center ${
                      g.status === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"
                    }`}>
                      {g.status === "PASS" ? "VERIFIED" : "BLOCKED"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Dispatcher Box */}
            <div className="glass-card p-5 flex flex-col items-center text-center justify-between shrink-0 border-xiphos-purple/30 bg-xiphos-purple/5 shadow-[0_0_20px_rgba(139,92,246,0.05)]">
              <div className="flex items-center gap-2 mb-4">
                <span className="h-2 w-2 rounded-full bg-xiphos-emerald animate-ping absolute" />
                <span className="h-2 w-2 rounded-full bg-xiphos-emerald relative z-10" />
                <span className="text-sm text-xiphos-emerald font-bold uppercase tracking-widest glow-emerald">
                  SYSTEM READY TO FIRE
                </span>
              </div>
              <button
                onClick={handleForceExecute}
                className="w-full py-3.5 bg-xiphos-purple/20 hover:bg-xiphos-purple border border-xiphos-purple text-white text-sm font-bold tracking-widest uppercase rounded-lg transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] group"
              >
                <Play className="h-4 w-4 fill-current group-hover:scale-110 transition-transform" /> EXECUTE OVERRIDE
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. TRADE LIFECYCLE TRACKER */}
      <div className="glass-panel p-5 shrink-0">
        <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest block mb-4">
          XIPHOS AUTOMATED PIPELINE
        </span>

        <div className="flex items-center justify-between text-sm font-bold tracking-wider">
          {lifecycleSteps.map((step) => {
            const isCompleted = step.status === "COMPLETED";
            const isActive = step.status === "ACTIVE";

            let classes = "border-[rgba(255,255,255,0.1)] text-xiphos-muted bg-[rgba(11,15,23,0.5)]";
            if (isCompleted) {
              classes = "border-xiphos-cyan/50 text-xiphos-cyan bg-xiphos-cyan/10 glow-cyan shadow-[0_0_10px_rgba(76,201,240,0.2)]";
            } else if (isActive) {
              classes = "border-xiphos-purple/50 text-white bg-xiphos-purple/20 glow-purple shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-105";
            }

            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center transition-all duration-300">
                  <span className={`px-4 py-2 rounded-lg border ${classes}`}>
                    {step.label}
                  </span>
                </div>
                
                {step.label !== "CLOSED" && (
                  <span className={`text-lg font-bold ${
                    isCompleted ? "text-xiphos-cyan glow-cyan" : "text-[rgba(255,255,255,0.1)]"
                  }`}>
                    ➔
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

    </div>
  );
}
