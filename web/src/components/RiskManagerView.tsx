"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Shield, AlertTriangle, Activity, BrainCircuit, PlayCircle, Maximize2, XOctagon } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

const HoldButton = ({ label, onTrigger, colorClass, icon: Icon }: { label: string, onTrigger: () => void, colorClass: string, icon: React.ElementType }) => {
  const [progress, setProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isHolding) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            clearInterval(interval);
            onTrigger();
            setIsHolding(false);
            return 100;
          }
          return p + 4;
        });
      }, 20);
    }
    return () => clearInterval(interval);
  }, [isHolding, onTrigger]);

  const handleStart = () => {
    setProgress(0);
    setIsHolding(true);
  };

  const handleStop = () => {
    setIsHolding(false);
    setProgress(0);
  };

  return (
    <button 
      className={`relative overflow-hidden w-full h-12 rounded flex items-center justify-center gap-2 font-black tracking-widest text-xs border transition-colors ${colorClass} ${isHolding ? 'scale-95' : 'scale-100'} select-none`}
      onMouseDown={handleStart}
      onMouseUp={handleStop}
      onMouseLeave={handleStop}
      onTouchStart={handleStart}
      onTouchEnd={handleStop}
    >
      <Icon className="w-4 h-4 relative z-10" />
      <span className="relative z-10">{label} {progress > 0 && progress < 100 && `(${progress}%)`}</span>
      <div 
        className="absolute left-0 top-0 bottom-0 opacity-20"
        style={{ width: `${progress}%`, backgroundColor: "currentColor" }} 
      />
    </button>
  );
};

export default function RiskManagerView() {
  const { account } = useTradingStore();

  const [aiSuggestions] = useState([
    "WARNING: High GBP correlation detected across 3 open positions. Consider reducing GBPJPY longs.",
    "VaR Exceedance Risk: Next FOMC meeting in 2 hours. Auto-hedging recommended.",
    "Stress Test Alert: '2008 Flash Crash' scenario projects a 14% drawdown with current exposure."
  ]);

  const [circuitTriggered, setCircuitTriggered] = useState<string | null>(null);

  const handleTrigger = useCallback((action: string) => {
    setCircuitTriggered(action);
    setTimeout(() => setCircuitTriggered(null), 3000);
  }, []);

  const pseudoRandom = useCallback((seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  }, []);

  // Mock data for Monte Carlo
  const monteCarloData = useMemo(() => {
    const paths = [];
    for (let path = 0; path < 5; path++) {
      let currentVal = account.balance || 100000;
      const dataPoints = [];
      for (let day = 0; day <= 30; day++) {
        dataPoints.push({ day, value: currentVal });
        // Random walk
        const drift = 0.0002;
        const vol = 0.015;
        const shock = (pseudoRandom(path * 100 + day) - 0.5) * 2; // -1 to 1
        currentVal = currentVal * (1 + drift + shock * vol);
      }
      paths.push(dataPoints);
    }
    // Convert to recharts format
    const chartData = [];
    for (let day = 0; day <= 30; day++) {
      const point: Record<string, string | number> = { day: `Day ${day}` };
      paths.forEach((p, i) => {
        point[`path${i}`] = p[day].value;
      });
      chartData.push(point);
    }
    return chartData;
  }, [account.balance, pseudoRandom]);

  const metrics = [
    { label: "Daily Loss", value: "-$1,245.00", color: "text-xiphos-crimson glow-crimson" },
    { label: "Weekly Loss", value: "+$4,120.00", color: "text-xiphos-emerald glow-emerald" },
    { label: "Monthly Loss", value: "+$12,450.00", color: "text-xiphos-emerald glow-emerald" },
    { label: "Current Exposure", value: "$450,000", color: "text-white" },
    { label: "Correlation Risk", value: "85% (HIGH)", color: "text-xiphos-crimson glow-crimson" },
    { label: "Open Risk", value: "2.4%", color: "text-xiphos-gold glow-gold" },
    { label: "VaR (99%)", value: "$15,200", color: "text-white" },
    { label: "Max Drawdown", value: "4.1%", color: "text-white" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-6 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative">
      <GlassPanel glowColor="crimson" className="p-0 gap-6" noOverflowHidden>
      {/* HEADER */}
      <PageHeader 
        title="INSTITUTIONAL RISK CENTER" 
        icon={Shield} 
        glowColor="purple" 
        subtitle="Real-time exposure, VaR, and circuit breaker controls."
        actions={
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-xiphos-muted uppercase tracking-widest mb-1">Global Risk Score</span>
            <div className="px-4 py-2 border border-xiphos-gold/30 bg-xiphos-gold/10 rounded text-xiphos-gold font-black glow-gold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> ELEVATED (7.4/10)
            </div>
          </div>
        }
      />

      {/* TOP METRICS GRID */}
      <div className="grid grid-cols-4 xl:grid-cols-8 gap-4 shrink-0 px-6">
        {metrics.map((m, i) => (
          <GlassCard key={i} className="p-4 flex flex-col justify-center">
            <span className="text-[9px] text-xiphos-muted font-bold tracking-widest uppercase mb-2">
              {m.label}
            </span>
            <span className={`text-lg font-black ${m.color}`}>{m.value}</span>
          </GlassCard>
        ))}
      </div>

      <div className="flex-1 min-h-0 flex flex-col xl:flex-row gap-6 px-6 pb-6">
        
        {/* LEFT COLUMN */}
        <div className="w-full xl:w-1/3 flex flex-col gap-6 shrink-0">
          
          {/* CIRCUIT BREAKERS */}
          <GlassCard className="p-5 border-l-2 border-l-xiphos-crimson relative overflow-hidden">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <XOctagon className="w-3 h-3 text-xiphos-crimson" /> Circuit Breakers (Hold to Confirm)
            </h3>
            
            <div className="space-y-4 relative z-10">
              <HoldButton 
                label="EMERGENCY STOP (FLATTEN ALL)" 
                onTrigger={() => handleTrigger("Flattened all positions!")} 
                colorClass="text-xiphos-crimson border-xiphos-crimson/50 hover:bg-xiphos-crimson/10" 
                icon={AlertTriangle}
              />
              <HoldButton 
                label="AUTO HEDGE (DELTA NEUTRAL)" 
                onTrigger={() => handleTrigger("Auto hedging initiated.")} 
                colorClass="text-xiphos-cyan border-xiphos-cyan/50 hover:bg-xiphos-cyan/10" 
                icon={Shield}
              />
              <HoldButton 
                label="AUTO REDUCE LOTS (50%)" 
                onTrigger={() => handleTrigger("Reduced all lots by 50%.")} 
                colorClass="text-xiphos-gold border-xiphos-gold/50 hover:bg-xiphos-gold/10" 
                icon={Activity}
              />
            </div>

            <AnimatePresence>
              {circuitTriggered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex items-center justify-center p-4 text-center"
                >
                  <span className="text-xiphos-emerald font-black tracking-widest glow-emerald">
                    {circuitTriggered}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          {/* AI RISK SUGGESTIONS */}
          <GlassCard className="p-5 flex-1 flex flex-col min-h-0">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <BrainCircuit className="w-3 h-3 text-xiphos-purple" /> AI Risk Suggestions
            </h3>
            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {aiSuggestions.map((sug, i) => (
                <div key={i} className="p-3 bg-white/5 border-l-2 border-xiphos-gold/50 rounded-r text-xs text-gray-300 leading-relaxed">
                  {sug}
                </div>
              ))}
            </div>
          </GlassCard>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-6 min-h-0">
          
          {/* RISK HEAT MAP */}
          <GlassCard className="p-5 h-64 shrink-0 flex flex-col">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <Maximize2 className="w-3 h-3" /> Portfolio Risk Heat Map (Sector/Asset Exposure)
            </h3>
            <div className="flex-1 grid grid-cols-5 gap-1">
              {/* Mock Heatmap blocks */}
              {[
                { symbol: "EURUSD", risk: 80, size: "col-span-2 row-span-2" },
                { symbol: "GBPUSD", risk: 65, size: "col-span-1 row-span-2" },
                { symbol: "XAUUSD", risk: 30, size: "col-span-1 row-span-1" },
                { symbol: "BTCUSD", risk: 95, size: "col-span-1 row-span-1" },
                { symbol: "US30", risk: 45, size: "col-span-2 row-span-1" },
              ].map((block, i) => {
                const isHigh = block.risk > 70;
                const isMed = block.risk > 40 && block.risk <= 70;
                const color = isHigh ? "bg-xiphos-crimson/80" : isMed ? "bg-xiphos-gold/80" : "bg-xiphos-emerald/80";
                return (
                  <div key={i} className={`${block.size} ${color} rounded-sm p-2 flex flex-col justify-between hover:opacity-80 transition-opacity cursor-pointer border border-white/10`}>
                    <span className="text-white font-black text-sm tracking-wider">{block.symbol}</span>
                    <span className="text-white/80 font-bold text-xs">{block.risk}% RISK</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>

          {/* MONTE CARLO SIMULATION */}
          <GlassCard className="p-5 flex-1 min-h-0 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase font-bold flex items-center gap-2">
                <PlayCircle className="w-3 h-3 text-xiphos-cyan" /> Monte Carlo Stress Test (30 Days)
              </h3>
              <span className="text-[10px] text-xiphos-muted tracking-widest bg-white/5 px-2 py-1 rounded">
                SIMULATING 10,000 PATHS
              </span>
            </div>
            
            <div className="flex-1 w-full h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monteCarloData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" fontSize={10} tickMargin={10} />
                  <YAxis 
                    stroke="rgba(255,255,255,0.2)" 
                    fontSize={10} 
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(5, 8, 15, 0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, "Equity"]}
                  />
                  <Line type="monotone" dataKey="path0" stroke="rgba(139, 92, 246, 0.4)" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="path1" stroke="rgba(6, 182, 212, 0.4)" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="path2" stroke="rgba(234, 179, 8, 0.4)" strokeWidth={1} dot={false} isAnimationActive={false} />
                  <Line type="monotone" dataKey="path3" stroke="rgba(239, 68, 68, 0.4)" strokeWidth={1} dot={false} isAnimationActive={false} />
                  {/* Mean Path */}
                  <Line type="monotone" dataKey="path4" stroke="#fff" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
              
              {/* Overlay stats */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <div className="bg-black/40 backdrop-blur-md border border-white/5 p-2 rounded text-right">
                  <div className="text-[9px] text-xiphos-muted tracking-widest mb-1">PROJECTED MEAN</div>
                  <div className="text-white font-black">$102,450</div>
                </div>
                <div className="bg-black/40 backdrop-blur-md border border-xiphos-crimson/30 p-2 rounded text-right">
                  <div className="text-[9px] text-xiphos-muted tracking-widest mb-1">WORST CASE (5th %ile)</div>
                  <div className="text-xiphos-crimson font-black">$86,200</div>
                </div>
              </div>
            </div>

          </GlassCard>

        </div>
      </div>
      </GlassPanel>
    </div>
  );
}
