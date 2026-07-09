"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Play, GitCommit, Radio, Target, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

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
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg flex flex-col overflow-hidden flex-1 min-h-0">
        
        {/* Title Header */}
        <div className="px-6 py-4 border-b border-[#1e1e2e] bg-[#09090e] flex items-center justify-between shrink-0 relative z-10">
          <span className="text-lg font-semibold text-[#e8e8f0] uppercase tracking-widest flex items-center gap-3">
            <Radio className="h-5 w-5 text-[#8b5cf6]" />
            <span>XIPHOS HERO DECISION CORE</span>
          </span>
          <span className="text-xs text-[#52525b] font-semibold tracking-widest flex items-center gap-2">
            LATENCY: <span className="text-[#a1a1aa] flex items-center gap-1"><Zap className="w-3 h-3" /> 12ms</span>
          </span>
        </div>

        {/* Hero Grid layout */}
        <div className="p-6 grid grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
          
          {/* Left Hero Core Block */}
          <div className="col-span-7 bg-[#09090e] border border-[#1e1e2e] rounded p-6 flex flex-col justify-between min-h-0 overflow-hidden relative group">
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-[#52525b]" />
                <span className="text-[10px] text-[#52525b] font-semibold tracking-widest uppercase">
                  ACTIVE HERO TARGET
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-2 relative w-fit">
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[64px] font-semibold text-[#e8e8f0] tracking-tighter leading-none font-mono"
                >
                  {heroSignal.symbol}
                </motion.span>
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={heroSignal.direction === "BUY" ? "bg-[rgba(74,222,128,0.09)] text-[#4ade80] border border-[rgba(74,222,128,0.2)] font-mono text-xl px-4 py-1 rounded" : heroSignal.direction === "SELL" ? "bg-[rgba(248,113,113,0.09)] text-[#f87171] border border-[rgba(248,113,113,0.2)] font-mono text-xl px-4 py-1 rounded" : "bg-[rgba(82,82,91,0.1)] text-[#52525b] border border-[rgba(82,82,91,0.2)] font-mono text-xl px-4 py-1 rounded"}>
                  {heroSignal.direction}
                </motion.span>
              </div>
            </div>

            {/* Huge Metrics Display Area */}
            <div className="my-6 py-6 border-y border-[#1e1e2e] flex items-center justify-between gap-6 relative z-10">
              <div className="space-y-1">
                <span className="text-[10px] text-[#52525b] font-semibold block uppercase tracking-widest">KRONOS CONFIDENCE</span>
                <span className="text-6xl font-semibold text-[#f59e0b] leading-none tracking-tighter">92%</span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-[#52525b] font-semibold block uppercase tracking-widest">PROJECTED RISK</span>
                <span className="text-[40px] font-semibold text-[#e8e8f0] leading-none tracking-tighter">
                  {heroSignal.projected_risk.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Live Ticks Summary */}
            <div className="text-sm text-[#52525b] grid grid-cols-3 gap-4 font-mono relative z-10">
              <div className="bg-[#09090e] border border-[#1e1e2e] rounded p-3 transition-colors">
                <span className="block text-[9px] uppercase tracking-widest mb-1 text-[#52525b] font-semibold">PRICE STREAM</span>
                <span className="text-[#e8e8f0] font-semibold text-lg">{heroSignal.price.toFixed(5)}</span>
              </div>
              <div className="bg-[#09090e] border border-[#1e1e2e] rounded p-3 transition-colors">
                <span className="block text-[9px] uppercase tracking-widest mb-1 text-[#52525b] font-semibold">SMA200 DYNAMIC</span>
                <span className="text-[#e8e8f0] font-semibold text-lg">{heroSignal.sma200.toFixed(5)}</span>
              </div>
              <div className="bg-[rgba(161,161,170,0.05)] border border-[rgba(161,161,170,0.2)] rounded p-3 transition-colors relative overflow-hidden">
                <span className="block text-[9px] uppercase tracking-widest mb-1 text-[#a1a1aa] font-semibold relative z-10">DEVIATION GAP</span>
                <span className="text-[#a1a1aa] font-semibold text-base lg:text-lg relative z-10 whitespace-nowrap">{heroSignal.distance} pts</span>
              </div>
            </div>
          </div>

          {/* Right Core block: Validation Gates & Action Dispatcher */}
          <div className="col-span-5 flex flex-col justify-between gap-6 min-h-0 h-full">
            
            {/* Validation Matrix Box */}
            <div className="bg-[#09090e] border border-[#1e1e2e] rounded p-3 space-y-2 flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
              
              <div className="flex items-center gap-2 border-b border-[#1e1e2e] pb-1.5 mb-2 relative z-10">
                <Shield className="w-4 h-4 text-[#8b5cf6]" />
                <span className="text-[10px] text-[#e8e8f0] font-semibold uppercase tracking-widest">
                  MULTI-STAGE NEURAL VALIDATION GATES
                </span>
              </div>
              
              <div className="space-y-1 relative z-10">
                {[
                  { id: 1, name: "TREND ALIGNMENT", status: gates.gate_1_risk_slot || "PASS" },
                  { id: 2, name: "VOLATILITY CHECK", status: gates.gate_2_correlation || "PASS" },
                  { id: 3, name: "LIQUIDITY ZONES", status: gates.gate_3_fan_alignment || "PASS" },
                  { id: 4, name: "CORRELATION MATRIX", status: gates.gate_4_priority_filter || "PASS" },
                  { id: 5, name: "RISK EXPOSURE", status: gates.gate_5_hard_sl || "PASS" }
                ].map((g, i) => (
                  <motion.div
                    key={g.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.1 }}
                    className="flex items-center justify-between border border-[#1e1e2e] py-1 px-2 rounded-lg bg-[#0f0f1a] transition-all hover:bg-[rgba(139,92,246,0.04)] hover:border-[rgba(139,92,246,0.2)] group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-sm bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] text-[#8b5cf6] font-semibold text-[9px] group-hover:bg-[#8b5cf6] group-hover:text-[#09090e] transition-colors">G{g.id}</span>
                      <span className="text-[10px] font-semibold text-[#52525b] uppercase tracking-widest group-hover:text-[#e8e8f0] transition-colors">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]"></span>
                      <span className={`text-[10px] font-semibold tracking-widest flex items-center ${
                        g.status === "PASS" ? "text-[#4ade80]" : "text-[#f87171]"
                      }`}>
                        {g.status === "PASS" ? "VERIFIED" : "BLOCKED"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Dispatcher Box */}
            <div className="bg-[rgba(139,92,246,0.08)] border border-[rgba(139,92,246,0.25)] rounded py-3.5 px-4 flex flex-col items-center text-center justify-between shrink-0 relative overflow-hidden group/override">

              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                </span>
                <span className="text-[10px] text-[#4ade80] font-semibold uppercase tracking-widest">
                  SYSTEM READY TO FIRE
                </span>
              </div>
              <button
                onClick={handleForceExecute}
                className="w-full py-2.5 bg-[#8b5cf6] hover:bg-[#a78bfa] text-[#09090e] text-xs font-semibold tracking-widest uppercase rounded cursor-pointer transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> EXECUTE OVERRIDE
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. TRADE LIFECYCLE TRACKER */}
      <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg p-5 shrink-0 relative overflow-hidden group">
        
        <span className="text-[10px] text-[#52525b] font-semibold uppercase tracking-widest block mb-4 relative z-10 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-[#8b5cf6]" />
          XIPHOS AUTOMATED LIFECYCLE PIPELINE
        </span>

        <div className="flex items-center justify-between relative z-10 h-12">
          {/* Custom SVG Connector Line running behind all nodes */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-4 z-0 pointer-events-none">
            <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#1e1e2e" strokeWidth="2" />
              {/* Active animated stroke */}
              <line 
                x1="0%" y1="50%" 
                x2={`${(lifecycleSteps.findIndex(s => s.status === 'ACTIVE' || s.status === 'PENDING') / (lifecycleSteps.length - 1)) * 100}%`} 
                y2="50%" 
                stroke="#8b5cf6" 
                strokeWidth="2.5" 
              />
            </svg>
          </div>

          {lifecycleSteps.map((step, i) => {
            const isCompleted = step.status === "COMPLETED";
            const isActive = step.status === "ACTIVE";

            let classes = "border-[#1e1e2e] text-[#52525b] bg-[#09090e]";
            if (isCompleted) {
              classes = "border-[rgba(161,161,170,0.5)] text-[#a1a1aa] bg-[rgba(161,161,170,0.1)]";
            } else if (isActive) {
              classes = "border-[#8b5cf6] text-[#e8e8f0] bg-[rgba(139,92,246,0.2)]";
            }

            return (
              <div key={step.label} className="flex flex-col items-center group/step relative z-10">
                <span className={`px-4 py-2 rounded-md border text-[10px] font-semibold uppercase tracking-widest transition-all duration-300 relative z-10 ${classes}`}>
                  {step.label}
                </span>
                <span className="text-[8px] text-[#52525b] mt-2 tracking-widest uppercase font-semibold absolute -bottom-5 opacity-0 group-hover/step:opacity-100 transition-opacity whitespace-nowrap">
                  {step.desc}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
