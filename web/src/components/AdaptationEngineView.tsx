"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BrainCircuit, Network, Fingerprint, Zap, RefreshCw, GitMerge, AlertTriangle } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { StatusBadge } from "./ui/StatusBadge";

export default function AdaptationEngineView() {
  const [learningLog, setLearningLog] = useState<string[]>([
    "Engine Initialized...",
    "Loading Neural Weights...",
    "Synchronizing with live market data...",
    "Scanning for recent liquidity sweeps..."
  ]);

  const [aiThoughts, setAiThoughts] = useState(
    "Market displaying heavy mean-reversion tendencies. Preparing to shift entry triggers from breakout to fade. Awaiting volatility confirmation."
  );

  const [scores] = useState({
    success: 87.4,
    confidence: 92.1,
    failure: 12.6
  });

  const [regime, setRegime] = useState("Liquidity sweep");

  // Simulated live feed updates
  useEffect(() => {
    const messages = [
      "Market changed: Spread widening detected.",
      "Adapting... shifting risk parameters.",
      "New pattern discovered: Fractal breakout on M15.",
      "Learning complete for recent sequence.",
      "Volatility spike detected. Adjusting timing."
    ];
    let i = 0;
    const interval = setInterval(() => {
      setLearningLog(prev => {
        const newLog = [...prev, messages[i % messages.length]];
        if (newLog.length > 8) newLog.shift();
        return newLog;
      });
      i++;
      if (i % 3 === 0) {
        setRegime(prev => prev === "Liquidity sweep" ? "High volatility" : prev === "High volatility" ? "Trending" : "Liquidity sweep");
        setAiThoughts("Regime shift confirmed. Recalibrating historical correlation matrices. Expecting increased drawdowns on trend-following strategies.");
      }
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handles = [
    { label: "Risk", deg: 0 },
    { label: "Entries", deg: 45 },
    { label: "Exits", deg: 90 },
    { label: "Timing", deg: 135 },
    { label: "Volatility", deg: 180 },
    { label: "Liquidity", deg: 225 },
    { label: "Correlation", deg: 270 },
    { label: "Psychology", deg: 315 },
  ];

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono text-sm relative">
      <GlassPanel glowColor="gold" className="p-0 gap-6" noOverflowHidden>
      {/* HEADER */}
      <PageHeader
        title="MAHORAGA ENGINE"
        icon={RefreshCw}
        glowColor="purple"
        subtitle="Continuous autonomous adaptation matrix."
        iconClassName="animate-spin-slow"
        actions={
          <StatusBadge label="ADAPTING" variant="info" className="animate-pulse shadow-[0_0_10px_#06b6d4]" />
        }
      />

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 px-6">
        
        {/* LEFT PANEL - Live Feed & AI Thoughts */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 shrink-0">
          <GlassCard className="p-5 flex-1 flex flex-col min-h-0">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2 shrink-0">
              <Zap className="w-3 h-3 text-xiphos-gold" /> Live Learning Feed
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar flex flex-col justify-end">
              <AnimatePresence>
                {learningLog.map((log, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xs text-gray-400 border-l-2 border-xiphos-gold/30 pl-2 py-1"
                  >
                    <span className="text-xiphos-gold mr-2">{'>'}</span>{log}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </GlassCard>

          <GlassCard className="p-5 shrink-0 border border-xiphos-purple/30 shadow-[0_0_20px_rgba(139,92,246,0.1)]">
            <h3 className="text-xiphos-purple tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <BrainCircuit className="w-3 h-3" /> Live AI Thoughts
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed italic">
              &quot;{aiThoughts}&quot;
            </p>
          </GlassCard>
        </div>

        {/* CENTER PANEL - Mahoraga Wheel */}
        <GlassCard className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
          
          {/* Background Neural Grid */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #8B5CF6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <h3 className="absolute top-5 left-5 text-xiphos-muted tracking-widest text-[10px] uppercase font-bold flex items-center gap-2">
            <Fingerprint className="w-3 h-3" /> Adaptive Core
          </h3>

          <div className="relative w-80 h-80 flex items-center justify-center">
            {/* The Wheel */}
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                {/* Central Hub */}
                <circle cx="100" cy="100" r="30" fill="none" stroke="white" strokeWidth="4" />
                <circle cx="100" cy="100" r="20" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="10" fill="white" className="animate-pulse" />
                
                {/* 8 Handles */}
                {handles.map((handle, i) => (
                  <g key={i} transform={`rotate(${handle.deg} 100 100)`}>
                    {/* Spoke */}
                    <line x1="100" y1="70" x2="100" y2="20" stroke="white" strokeWidth="6" strokeLinecap="round" />
                    <line x1="100" y1="70" x2="100" y2="20" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" className="animate-pulse" />
                    {/* Handle End */}
                    <circle cx="100" cy="20" r="8" fill="#0b0f17" stroke="white" strokeWidth="3" />
                  </g>
                ))}
                
                {/* Outer Ring */}
                <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              </svg>
            </motion.div>

            {/* Static Overlay Labels */}
            <div className="absolute inset-0 pointer-events-none">
              {handles.map((handle, i) => {
                const rad = (handle.deg - 90) * (Math.PI / 180);
                const radius = 170; // Label distance
                const x = Math.cos(rad) * radius;
                const y = Math.sin(rad) * radius;
                return (
                  <div 
                    key={i}
                    className="absolute font-bold text-[10px] tracking-widest uppercase text-xiphos-cyan glow-cyan"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    {handle.label}
                  </div>
                );
              })}
            </div>
          </div>
        </GlassCard>

        {/* RIGHT PANEL - Status & Sliders */}
        <div className="w-full lg:w-1/4 flex flex-col gap-6 shrink-0">
          
          {/* Scores */}
          <GlassCard className="p-5 shrink-0">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <Activity className="w-3 h-3 text-xiphos-emerald" /> Adaptation Score
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-xiphos-muted">Success %</span>
                  <span className="text-xiphos-emerald font-bold glow-emerald">{scores.success}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${scores.success}%` }} className="h-full bg-xiphos-emerald" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-xiphos-muted">Confidence</span>
                  <span className="text-xiphos-cyan font-bold glow-cyan">{scores.confidence}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${scores.confidence}%` }} className="h-full bg-xiphos-cyan" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-xiphos-muted">Failure Rate</span>
                  <span className="text-xiphos-crimson font-bold glow-crimson">{scores.failure}%</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${scores.failure}%` }} className="h-full bg-xiphos-crimson" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Current State */}
          <GlassCard className="p-5 shrink-0 flex-1 flex flex-col">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <AlertTriangle className="w-3 h-3 text-xiphos-gold" /> Current Market Regime
            </h3>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {["Trending", "Ranging", "High volatility", "News event", "Liquidity sweep"].map(r => (
                <span key={r} className={`px-2 py-1 text-[10px] font-bold rounded-sm border ${regime === r ? 'bg-white/10 text-white border-white' : 'bg-transparent text-gray-500 border-white/5'}`}>
                  {r}
                </span>
              ))}
            </div>

            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <Network className="w-3 h-3" /> Adaptive Parameters
            </h3>
            
            <div className="space-y-5 flex-1 justify-center flex flex-col">
              {[
                { label: "Stop Loss Tightness", val: 65 },
                { label: "Take Profit Extension", val: 82 },
                { label: "Position Sizing", val: 55 }
              ].map(param => (
                <div key={param.label}>
                  <div className="flex justify-between text-[10px] mb-2 text-xiphos-muted uppercase tracking-widest">
                    <span>{param.label}</span>
                  </div>
                  <div className="w-full h-0.5 bg-white/10 relative">
                    {/* Animated slider thumb */}
                    <motion.div 
                      animate={{ left: `${param.val}%` }} 
                      transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-xiphos-purple rounded-full shadow-[0_0_10px_#8B5CF6]" 
                    />
                  </div>
                </div>
              ))}
            </div>

          </GlassCard>

        </div>
      </div>

      {/* BOTTOM PANEL - Evolution Tree & History */}
      <div className="px-6 pb-6">
        <GlassCard className="p-5 shrink-0 h-48 flex flex-col">
          <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2 shrink-0">
          <GitMerge className="w-3 h-3 text-xiphos-cyan" /> Evolution Tree / History
        </h3>
        
        <div className="flex-1 relative flex items-center">
          {/* Horizontal Timeline Line */}
          <div className="absolute left-0 right-0 h-0.5 bg-white/10 top-1/2 -translate-y-1/2"></div>
          
          <div className="absolute inset-0 flex justify-between items-center px-12">
            {[
              { time: "-4h", event: "VIX Spiked", adapt: "Reduced lot size by 50%" },
              { time: "-2h", event: "Trend Failure", adapt: "Switched to Mean Reversion" },
              { time: "NOW", event: "Liquidity Sweep", adapt: "Fading breakouts", current: true },
              { time: "+1h", event: "FOMC Minutes", adapt: "Preparing to close all positions", future: true },
            ].map((node, i) => (
              <div key={i} className="relative flex flex-col items-center group">
                {/* Node */}
                <div className={`w-4 h-4 rounded-full border-2 z-10 ${node.current ? 'bg-xiphos-purple border-xiphos-purple glow-purple animate-pulse' : node.future ? 'bg-[#0b0f17] border-gray-600 border-dashed' : 'bg-[#0b0f17] border-xiphos-cyan'}`}></div>
                
                {/* Labels */}
                <div className="absolute top-6 flex flex-col items-center text-center w-32">
                  <span className={`text-[10px] font-black ${node.current ? 'text-xiphos-purple' : 'text-gray-400'}`}>{node.time}</span>
                  <span className="text-xs text-white mt-1 whitespace-nowrap">{node.event}</span>
                  <span className="text-[10px] text-xiphos-muted mt-1">{node.adapt}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Animated data particle traveling timeline */}
          <motion.div 
            className="absolute h-1.5 w-1.5 bg-xiphos-cyan rounded-full shadow-[0_0_8px_#06b6d4] top-1/2 -translate-y-1/2 z-20"
            initial={{ left: "0%" }}
            animate={{ left: "75%" }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />

        </div>
        </GlassCard>
      </div>

      </GlassPanel>
    </div>
  );
}
