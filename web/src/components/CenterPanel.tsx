"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Radio, Play } from "lucide-react";

export default function CenterPanel() {
  const { sendCommand, rankedSignals, gates } = useTradingStore();

  // Dynamically select the highest-priority approved signal from store as Hero Target
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

  // Evolve Typography: Metrics +60%, Titles +40%, Section Headers +30%
  return (
    <div className="flex flex-col gap-3.5 w-full h-full justify-between">
      
      {/* 1. SIGNAL INTELLIGENCE COMMAND CORE (HERO DECISION PANEL) */}
      <div className="bg-xiphos-panel border border-slate-900/80 rounded-sm flex flex-col overflow-hidden font-mono select-none flex-1 min-h-0">
        
        {/* Title Header (+40% Font Scaling: text-[16px] -> text-[20px]) */}
        <div className="p-3.5 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40 shrink-0">
          <span className="text-[20px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-2">
            <Radio className="h-4 w-4 text-xiphos-blue animate-pulse" />
            XIPHOS HERO DECISION INTEL CORE
          </span>
          <span className="text-[17px] text-[#8e9aa8] font-bold">
            LATENCY: <span className="text-xiphos-green">12ms</span>
          </span>
        </div>

        {/* Hero Grid layout */}
        <div className="p-4.5 grid grid-cols-12 gap-4 items-stretch flex-1 min-h-0">
          
          {/* Left Hero Core Block: Main display of target decisions */}
          <div className="col-span-7 bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-4 flex flex-col justify-between min-h-0 overflow-hidden">
            <div>
              <span className="text-[17px] text-[#6f7e90] font-black tracking-widest block uppercase leading-none mb-1.5">
                ACTIVE HERO TARGET SETUP
              </span>
              
              <div className="flex items-baseline gap-3">
                {/* Symbol Title (+40% scaled: text-3xl) */}
                <span className="text-3xl font-black text-white leading-none tracking-wide">{heroSignal.symbol}</span>
                {/* Direction (+60% scaled: text-[22px]) */}
                <span className={`text-[22px] font-black px-2.5 py-0.5 rounded-sm leading-none ${
                  heroSignal.direction === "BUY" ? "bg-xiphos-green text-black" : "bg-xiphos-red text-white"
                }`}>
                  {heroSignal.direction}
                </span>
              </div>
            </div>

            {/* Huge Metrics Display Area (+60% scaled) */}
            <div className="my-2.5 py-3 border-y border-slate-950 flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[15px] text-[#6f7e90] font-black block uppercase tracking-wider">CONFIDENCE</span>
                {/* Massive Confidence text (+60% scaled: text-[58px]) */}
                <span className="text-[58px] font-black text-xiphos-blue leading-none tracking-tighter">92%</span>
              </div>
              <div className="space-y-0.5 text-right">
                <span className="text-[15px] text-[#6f7e90] font-black block uppercase tracking-wider">PROJECTED RISK</span>
                {/* Massive Risk text (+60% scaled: text-[36px]) */}
                <span className="text-[36px] font-black text-white leading-none">
                  {heroSignal.projected_risk.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Live Ticks Summary */}
            <div className="text-[16px] text-[#8e9aa8] grid grid-cols-3 gap-2">
              <div>
                PRICE: <span className="text-white font-bold">{heroSignal.price.toFixed(5)}</span>
              </div>
              <div className="text-center">
                SMA200: <span className="text-white">{heroSignal.sma200.toFixed(5)}</span>
              </div>
              <div className="text-right">
                GAP: <span className="text-xiphos-blue font-bold">{heroSignal.distance} pts</span>
              </div>
            </div>
          </div>

          {/* Right Core block: Validation Gates & Action Dispatcher */}
          <div className="col-span-5 flex flex-col justify-between gap-3 min-h-0">
            
            {/* Validation Matrix Box */}
            <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-3.5 space-y-1.5 flex-1 min-h-0 overflow-hidden">
              <span className="text-[16px] text-[#6f7e90] font-black uppercase tracking-wider block border-b border-slate-950 pb-1 mb-1">
                GATE VALIDATION MATRIX
              </span>
              {[
                { id: 1, name: "RISK SLOTS", status: gates.gate_1_risk_slot || "PASS" },
                { id: 2, name: "CORRELATION", status: gates.gate_2_correlation || "PASS" },
                { id: 3, name: "FAN ALIGN", status: gates.gate_3_fan_alignment || "PASS" },
                { id: 4, name: "PRIORITY", status: gates.gate_4_priority_filter || "PASS" },
                { id: 5, name: "HARD SL", status: gates.gate_5_hard_sl || "PASS" }
              ].map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between text-[11.5px] border border-slate-950 p-1.5 rounded-sm bg-slate-950/20 leading-none"
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xiphos-blue font-black text-[9.5px]">G{g.id}</span>
                    <span className="font-bold text-white uppercase">{g.name}</span>
                  </div>
                  <span className={`font-black text-[14px] flex items-center ${
                    g.status === "PASS" ? "text-xiphos-green" : "text-xiphos-red"
                  }`}>
                    {g.status === "PASS" ? "✓ PASS" : "✗ BLOCKED"}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Dispatcher Box */}
            <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-3 flex flex-col items-center text-center justify-between shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-xiphos-green animate-pulse" />
                <span className="text-[16px] text-xiphos-green font-black uppercase tracking-wider">
                  STATUS: READY TO FIRE
                </span>
              </div>
              <button
                onClick={handleForceExecute}
                className="w-full py-2 bg-xiphos-blue hover:bg-sky-400 text-black text-[16px] font-black tracking-widest uppercase rounded-sm transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_8px_rgba(0,168,255,0.15)]"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> EXECUTE DISPATCH
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. TRADE LIFECYCLE TRACKER (+30% Font Scaling: text-[15px] -> text-[18px]) */}
      <div className="bg-xiphos-panel border border-slate-900/80 rounded-sm p-3.5 font-mono select-none shrink-0">
        <span className="text-[18px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2.5 leading-none">
          XIPHOS AUTOMATED LIFECYCLE PIPELINE
        </span>

        <div className="flex items-center justify-between text-[17px] font-black leading-none">
          {lifecycleSteps.map((step) => {
            const isCompleted = step.status === "COMPLETED";
            const isActive = step.status === "ACTIVE";

            let classes = "border-slate-900 text-[#425062]";
            if (isCompleted) {
              classes = "border-xiphos-green/45 text-xiphos-green bg-xiphos-green/5";
            } else if (isActive) {
              classes = "border-xiphos-blue text-xiphos-blue bg-xiphos-blue/5";
            }

            return (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center">
                  <span className={`px-2.5 py-1 rounded-sm border text-[16px] tracking-wide font-black ${classes}`}>
                    {step.label}
                  </span>
                </div>
                
                {step.label !== "CLOSED" && (
                  <span className={`text-[17px] font-bold ${
                    isCompleted ? "text-xiphos-green" : "text-[#425062]"
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
