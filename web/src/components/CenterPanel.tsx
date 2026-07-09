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
      <div className="glass-panel flex flex-col overflow-hidden flex-1 min-h-0">
        
        {/* Title Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex items-center justify-between shrink-0 relative z-10">
          <span className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Radio className="h-5 w-5 text-xiphos-purple animate-pulse glow-purple" />
            <span className="glow-purple">XIPHOS HERO DECISION CORE</span>
          </span>
          <span className="text-xs text-xiphos-muted font-bold tracking-widest flex items-center gap-2">
            LATENCY: <span className="text-xiphos-cyan glow-cyan flex items-center gap-1"><Zap className="w-3 h-3" /> 12ms</span>
          </span>
        </div>

        {/* Hero Grid layout */}
        <div className="p-6 grid grid-cols-12 gap-6 items-stretch flex-1 min-h-0">
          
          {/* Left Hero Core Block */}
          <div className="col-span-7 glass-card p-6 flex flex-col justify-between min-h-0 overflow-hidden relative group">
            {/* Animated Target Radar Background */}
            <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-30 mix-blend-screen overflow-hidden">
              <svg width="100%" height="100%" viewBox="0 0 400 400" className="absolute w-[360px] h-[360px]">
                <circle cx="200" cy="200" r="180" stroke="rgba(139, 92, 246, 0.15)" strokeWidth="1" fill="none" strokeDasharray="4 8" />
                <circle cx="200" cy="200" r="140" stroke="rgba(76, 201, 240, 0.15)" strokeWidth="1" fill="none" />
                <circle cx="200" cy="200" r="100" stroke="rgba(139, 92, 246, 0.2)" strokeWidth="1" fill="none" strokeDasharray="2 4" />
                <circle cx="200" cy="200" r="60" stroke="rgba(76, 201, 240, 0.2)" strokeWidth="1" fill="none" />
                <line x1="200" y1="10" x2="200" y2="390" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                <line x1="10" y1="200" x2="390" y2="200" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
                
                {/* Radar Sweep Line & Trailing Gradient */}
                <g transform="translate(200, 200)" className="animate-radar-sweep">
                  <line x1="0" y1="0" x2="180" y2="0" stroke="rgba(76, 201, 240, 0.4)" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="0,0 180,-15 180,0" fill="url(#radarGradient)" />
                </g>
                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(76, 201, 240, 0)" />
                    <stop offset="100%" stopColor="rgba(76, 201, 240, 0.15)" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-xiphos-muted animate-pulse" />
                <span className="text-[10px] text-xiphos-muted font-black tracking-widest uppercase">
                  ACTIVE HERO TARGET
                </span>
              </div>
              
              <div className="flex items-center gap-4 mt-2 relative w-fit">
                {/* HUD corner brackets */}
                <div className="absolute -left-3 -top-2 w-3 h-3 border-l-2 border-t-2 border-xiphos-cyan/40" />
                <div className="absolute -right-3 -top-2 w-3 h-3 border-r-2 border-t-2 border-xiphos-cyan/40" />
                <div className="absolute -left-3 -bottom-2 w-3 h-3 border-l-2 border-b-2 border-xiphos-cyan/40" />
                <div className="absolute -right-3 -bottom-2 w-3 h-3 border-r-2 border-b-2 border-xiphos-cyan/40" />
                
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[64px] font-black text-white tracking-tighter leading-none glow-white drop-shadow-2xl font-mono"
                >
                  {heroSignal.symbol}
                </motion.span>
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className={`text-xl font-black px-4 py-1 rounded-sm shadow-[0_0_20px_rgba(var(--color-xiphos-${heroSignal.direction === "BUY" ? "emerald" : "crimson"}),0.3)] ${
                  heroSignal.direction === "BUY" ? "bg-xiphos-emerald/20 text-xiphos-emerald border border-xiphos-emerald/50 glow-emerald" : "bg-xiphos-crimson/20 text-xiphos-crimson border border-xiphos-crimson/50 glow-crimson"
                }`}>
                  {heroSignal.direction}
                </motion.span>
              </div>
            </div>

            {/* Huge Metrics Display Area */}
            <div className="my-6 py-6 border-y border-[rgba(255,255,255,0.05)] flex items-center justify-between gap-6 relative z-10 backdrop-blur-sm">
              <div className="space-y-1">
                <span className="text-[10px] text-xiphos-muted font-black block uppercase tracking-widest">KRONOS CONFIDENCE</span>
                <span className="text-6xl font-black text-xiphos-gold leading-none tracking-tighter glow-gold drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]">92%</span>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[10px] text-xiphos-muted font-black block uppercase tracking-widest">PROJECTED RISK</span>
                <span className="text-[40px] font-black text-white leading-none tracking-tighter drop-shadow-lg">
                  {heroSignal.projected_risk.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Live Ticks Summary */}
            <div className="text-sm text-xiphos-muted grid grid-cols-3 gap-4 font-mono relative z-10">
              <div className="glass-card p-3 border border-[rgba(255,255,255,0.05)] bg-black/40 hover:border-white/10 transition-colors">
                <span className="block text-[9px] uppercase tracking-widest mb-1 text-xiphos-muted font-black">PRICE STREAM</span>
                <span className="text-white font-black text-lg drop-shadow-md">{heroSignal.price.toFixed(5)}</span>
              </div>
              <div className="glass-card p-3 border border-[rgba(255,255,255,0.05)] bg-black/40 hover:border-white/10 transition-colors">
                <span className="block text-[9px] uppercase tracking-widest mb-1 text-xiphos-muted font-black">SMA200 DYNAMIC</span>
                <span className="text-white font-black text-lg drop-shadow-md">{heroSignal.sma200.toFixed(5)}</span>
              </div>
              <div className="glass-card p-3 border border-xiphos-cyan/20 bg-xiphos-cyan/5 hover:bg-xiphos-cyan/10 transition-colors relative overflow-hidden">
                <motion.div 
                  animate={{ x: ["-100%", "100%"] }} 
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-xiphos-cyan/20 to-transparent skew-x-12"
                />
                <span className="block text-[9px] uppercase tracking-widest mb-1 text-xiphos-cyan font-black relative z-10">DEVIATION GAP</span>
                <span className="text-xiphos-cyan font-black text-base lg:text-lg glow-cyan relative z-10 whitespace-nowrap">{heroSignal.distance} pts</span>
              </div>
            </div>
          </div>

          {/* Right Core block: Validation Gates & Action Dispatcher */}
          <div className="col-span-5 flex flex-col justify-between gap-6 min-h-0 h-full">
            
            {/* Validation Matrix Box */}
            <div className="glass-card p-3 space-y-2 flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-xiphos-emerald/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)] pb-1.5 mb-2 relative z-10">
                <Shield className="w-4 h-4 text-xiphos-purple glow-purple" />
                <span className="text-[10px] text-white font-black uppercase tracking-widest drop-shadow-md">
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
                    className="flex items-center justify-between border border-[rgba(255,255,255,0.05)] py-1 px-2 rounded-lg bg-[rgba(11,15,23,0.6)] backdrop-blur-sm transition-all hover:bg-[rgba(11,15,23,0.8)] hover:border-xiphos-purple/30 group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-5 h-5 rounded-sm bg-xiphos-purple/20 border border-xiphos-purple/30 text-xiphos-purple font-black text-[9px] group-hover:bg-xiphos-purple group-hover:text-white transition-colors">G{g.id}</span>
                      <span className="text-[10px] font-black text-xiphos-muted uppercase tracking-widest group-hover:text-white transition-colors">{g.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-xiphos-emerald animate-pulse"></span>
                      <span className={`text-[10px] font-black tracking-widest flex items-center ${
                        g.status === "PASS" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"
                      }`}>
                        {g.status === "PASS" ? "VERIFIED" : "BLOCKED"}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Dispatcher Box */}
            <div className="glass-card py-3.5 px-4 flex flex-col items-center text-center justify-between shrink-0 border-xiphos-purple/30 bg-linear-to-b from-xiphos-purple/10 to-xiphos-purple/5 relative overflow-hidden group/override">
              {/* Cybermatic corner stripes */}
              <div className="absolute top-0 left-0 w-8 h-1 bg-linear-to-r from-xiphos-purple to-transparent" />
              <div className="absolute top-0 left-0 w-1 h-8 bg-linear-to-b from-xiphos-purple to-transparent" />
              <div className="absolute bottom-0 right-0 w-8 h-1 bg-linear-to-l from-xiphos-purple to-transparent" />
              <div className="absolute bottom-0 right-0 w-1 h-8 bg-linear-to-t from-xiphos-purple to-transparent" />

              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-xiphos-emerald opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-xiphos-emerald glow-emerald"></span>
                </span>
                <span className="text-[10px] text-xiphos-emerald font-black uppercase tracking-widest glow-emerald">
                  SYSTEM READY TO FIRE
                </span>
              </div>
              <button
                onClick={handleForceExecute}
                className="w-full py-2.5 bg-xiphos-purple hover:bg-white text-black hover:text-black text-xs font-black tracking-widest uppercase rounded border border-xiphos-purple cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] group-hover/override:scale-[1.02]"
              >
                <Play className="h-3.5 w-3.5 fill-current" /> EXECUTE OVERRIDE
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* 2. TRADE LIFECYCLE TRACKER */}
      <div className="glass-panel p-5 shrink-0 relative overflow-hidden group">
        <div className="absolute inset-0 bg-linear-to-r from-xiphos-purple/5 via-transparent to-xiphos-cyan/5 opacity-50 mix-blend-overlay"></div>
        
        <span className="text-[10px] text-xiphos-muted font-black uppercase tracking-widest block mb-4 relative z-10 flex items-center gap-2">
          <GitCommit className="w-4 h-4 text-xiphos-purple animate-pulse" />
          XIPHOS AUTOMATED LIFECYCLE PIPELINE
        </span>

        <div className="flex items-center justify-between relative z-10 h-12">
          {/* Custom SVG Connector Line running behind all nodes */}
          <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-4 z-0 pointer-events-none">
            <svg width="100%" height="100%" preserveAspectRatio="none" className="overflow-visible">
              <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="2" />
              {/* Active animated stroke */}
              <line 
                x1="0%" y1="50%" 
                x2={`${(lifecycleSteps.findIndex(s => s.status === 'ACTIVE' || s.status === 'PENDING') / (lifecycleSteps.length - 1)) * 100}%`} 
                y2="50%" 
                stroke="#4CC9F0" 
                strokeWidth="2.5" 
                className="animate-pipeline-pulse" 
              />
            </svg>
          </div>

          {lifecycleSteps.map((step, i) => {
            const isCompleted = step.status === "COMPLETED";
            const isActive = step.status === "ACTIVE";

            let classes = "border-[rgba(255,255,255,0.1)] text-xiphos-muted bg-black/40";
            if (isCompleted) {
              classes = "border-xiphos-cyan/50 text-xiphos-cyan bg-xiphos-cyan/10 glow-cyan shadow-[0_0_15px_rgba(76,201,240,0.2)]";
            } else if (isActive) {
              classes = "border-xiphos-purple text-white bg-xiphos-purple/20 glow-white shadow-[0_0_20px_rgba(139,92,246,0.4)] scale-105";
            }

            return (
              <div key={step.label} className="flex flex-col items-center group/step relative z-10">
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow"
                    className="absolute inset-0 bg-xiphos-purple/30 blur-xl rounded-full"
                    transition={{ duration: 0.5 }}
                  />
                )}
                <span className={`px-4 py-2 rounded-md border text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all duration-300 relative z-10 ${classes}`}>
                  {step.label}
                </span>
                <span className="text-[8px] text-xiphos-muted mt-2 tracking-widest uppercase font-bold absolute -bottom-5 opacity-0 group-hover/step:opacity-100 transition-opacity whitespace-nowrap">
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
