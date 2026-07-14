"use client";

import React, { useEffect, useMemo, useState } from "react";
import { RefreshCw, Activity, Cpu, Shield, HelpCircle, Network, Layers, TrendingUp, Sliders } from "lucide-react";
import { useTradingStore } from "../../store/useTradingStore";
import { MahoragaWheel } from "../CommandCenter/MahoragaWheel";
import { 
  GlassCard, 
  HUDButton, 
  StatusBadge, 
  ProgressRing, 
  CircularGauge, 
  HUDConsole, 
  AIReasoningCard, 
  MiniChart, 
  TOKENS
} from "../ui/DesignSystem";
import { motion, Variants } from "framer-motion";

export default function EngineLayout() {
  const { mahoragaState, simulateMahoraga, updateMahoragaConstraint, toggleTradingHalt } = useTradingStore();

  useEffect(() => {
    simulateMahoraga();
    const interval = setInterval(simulateMahoraga, 5000);
    return () => clearInterval(interval);
  }, [simulateMahoraga]);

  const primaryState = mahoragaState && Object.keys(mahoragaState).length > 0
    ? mahoragaState[Object.keys(mahoragaState)[0]]
    : null;

  const [history, setHistory] = useState<any[]>([]);

  // Accumulate history for charts
  useEffect(() => {
    if (primaryState) {
      setHistory(prev => {
        const now = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const newData = { time: now, ...primaryState };
        return [...prev, newData].slice(-30);
      });
    }
  }, [primaryState]);

  const isFullyAdapted = primaryState?.is_adapted || false;
  const isHalted = primaryState?.trading_halted || false;
  const trendState = primaryState?.trend_state || "RANGE";
  const momentumState = primaryState?.momentum_state || "NEUTRAL";
  const strictness = primaryState?.filter_strictness || "NORMAL";

  const learningLog = useMemo(() => {
    if (!primaryState) return [{ time: "00:00", tag: "SYSTEM", text: "Initializing Core...", color: "text-[#52525b]" }];
    if (isHalted) return [{ time: "00:00", tag: "CRITICAL", text: "TRADING SUSPENDED BY OPERATOR.", color: "text-[#f87171]" }];
    return [
      { time: "10:45:02", tag: "NEURAL", text: `Syncing with ${Object.keys(mahoragaState || {}).length} symbol vectors.`, color: "text-[#a78bfa]" },
      { time: "10:45:08", tag: "ADAPT", text: `Phenomenon tracked: ${primaryState.phenomenon || trendState}`, color: "text-[#f59e0b]" },
      { time: "10:45:14", tag: "RISK", text: `SL Multiplier adjusted: ${primaryState.sl_multiplier}x`, color: "text-[#f87171]" },
      { time: "10:45:20", tag: "EXECUTION", text: `Lot size sizing adjusted: ${primaryState.lot_multiplier}x`, color: "text-[#4ade80]" }
    ];
  }, [primaryState, trendState, mahoragaState, isHalted]);

  // Local state for overrides sliders
  const [maxLotMultiplier, setMaxLotMultiplier] = useState(primaryState?.lot_multiplier || 2.0);
  const [maxSlExpansion, setMaxSlExpansion] = useState(primaryState?.sl_multiplier || 1.5);
  const [minEmaSpeed, setMinEmaSpeed] = useState(primaryState?.fast_ema || 13);

  // Sync sliders if backend state changes
  useEffect(() => {
    if (primaryState) {
      if (Math.abs(primaryState.lot_multiplier - maxLotMultiplier) > 0.5) setMaxLotMultiplier(primaryState.lot_multiplier);
      if (Math.abs(primaryState.sl_multiplier - maxSlExpansion) > 0.5) setMaxSlExpansion(primaryState.sl_multiplier);
      if (Math.abs(primaryState.fast_ema - minEmaSpeed) > 2) setMinEmaSpeed(primaryState.fast_ema);
    }
  }, [primaryState?.lot_multiplier, primaryState?.sl_multiplier, primaryState?.fast_ema]);

  // Adaptation spoke weights (local state mapped for Three-dimensional dashboard)
  const [spokeWeights, setSpokeWeights] = useState<Record<number, number>>({
    0: 1.0, 1: 1.0, 2: 1.0, 3: 1.0, 4: 1.0, 5: 1.0, 6: 1.0, 7: 1.0
  });

  const handleWeightChange = (id: number, weight: number) => {
    setSpokeWeights(prev => ({ ...prev, [id]: weight }));
  };

  const steps = [
    { label: "Neural Vector Mapping", sub: "Scans layers", status: "complete" as const },
    { label: "Phenomenon Isolation", sub: "Isolating divergence", status: "complete" as const },
    { label: "Weights Adjustment", sub: "Radially tuning spokes", status: "running" as const },
    { label: "Execution Propagation", sub: "Applying updates", status: "complete" as const }
  ];

  // Ambient particles
  const bgParticles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 500,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 10 + 8
    }));
  }, []);

  return (
    <div className="flex-1 w-full h-full flex flex-col p-5 gap-5 overflow-hidden bg-[#05050a] relative select-none font-mono">
      
      {/* BACKGROUND PLASMA PARTICLES & CIRCUITS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
        {bgParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#f59e0b]"
            style={{ width: p.size, height: p.size, left: "50%", top: "50%" }}
            animate={{
              x: [p.x, p.x + (Math.random() - 0.5) * 100, p.x],
              y: [p.y, p.y + (Math.random() - 0.5) * 100, p.y],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* SVG NEURAL PIPELINES CONNECTING SURROUNDING CARDS TO CENTRAL CORE */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-25" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <defs>
          <linearGradient id="coreNeuralGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        {/* Center coordinates roughly 500, 500 */}
        {/* Left top to center */}
        <path d="M 230 200 L 400 350" stroke="url(#coreNeuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Left mid to center */}
        <path d="M 230 450 L 400 450" stroke="url(#coreNeuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Left bot to center */}
        <path d="M 230 700 L 400 550" stroke="url(#coreNeuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* Right top to center */}
        <path d="M 770 200 L 600 350" stroke="url(#coreNeuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Right mid to center */}
        <path d="M 770 450 L 600 450" stroke="url(#coreNeuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        {/* Right bot to center */}
        <path d="M 770 700 L 600 550" stroke="url(#coreNeuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />

        {/* Animated conduit signals */}
        <circle r="2" fill="#a78bfa"><animateMotion dur="2.4s" repeatCount="indefinite" path="M 230 200 L 400 350" /></circle>
        <circle r="2" fill="#f59e0b"><animateMotion dur="3.2s" repeatCount="indefinite" path="M 230 450 L 400 450" /></circle>
        <circle r="2" fill="#a78bfa"><animateMotion dur="2.8s" repeatCount="indefinite" path="M 230 700 L 400 550" /></circle>
        <circle r="2" fill="#f59e0b"><animateMotion dur="3s" repeatCount="indefinite" path="M 770 200 L 600 350" /></circle>
        <circle r="2" fill="#a78bfa"><animateMotion dur="3.5s" repeatCount="indefinite" path="M 770 450 L 600 450" /></circle>
        <circle r="2" fill="#f59e0b"><animateMotion dur="2.7s" repeatCount="indefinite" path="M 770 700 L 600 550" /></circle>
      </svg>

      {/* HEADER ROW */}
      <div className="flex items-center justify-between shrink-0 z-10 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-black text-[#e8e8f0] tracking-[0.3em] uppercase flex items-center gap-2">
            <Network className="w-5 h-5 text-[#8b5cf6]" />
            Mahoraga Adaptation Matrix
          </h1>
          <span className="text-[7.5px] text-[#52525b] uppercase font-bold tracking-widest block">
            Visualizing Neural Evolution & Adaptive State Constraints
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <StatusBadge 
            status={isHalted ? "alert" : isFullyAdapted ? "active" : "standby"} 
            text={isHalted ? "SUSPENDED" : isFullyAdapted ? "FULL ADAPTATION" : "ADAPTING REGIME"} 
          />
          <HUDButton variant="glass" onClick={toggleTradingHalt} className="px-3 py-1.5 border-[#e8e8f0]/10 hover:border-[#8b5cf6]/35 text-[#e8e8f0]/90">
            {isHalted ? "Resume Core" : "Suspend Core"}
          </HUDButton>
        </div>
      </div>

      {/* DETAILED 3D IMMERSIVE COCKPIT LAYOUT */}
      <div className="flex-1 grid grid-cols-[280px_1fr_280px] gap-5 items-stretch min-h-0 z-10">
        
        {/* LEFT COLUMN: Observational Analysis Panels */}
        <div className="flex flex-col gap-5 min-h-0 justify-between">
          
          {/* Card 1: Neural Activity */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0}>
            <div className="flex items-center justify-between">
              <span className={TOKENS.typography.title}>Neural Activity</span>
              <Activity className="w-3.5 h-3.5 text-[#a78bfa]" />
            </div>
            <p className={TOKENS.typography.details}>
              Live synaptic firing rates inside signal validation layers.
            </p>
            <div className="flex-1 flex flex-col justify-end gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[8px]">
                <span className="text-[#52525b] font-bold">Synaptic Frequency</span>
                <span className="text-[#4ade80] font-black">94.2 Hz</span>
              </div>
              <MiniChart points="M0,10 L15,18 L30,3 L45,15 L60,5 L75,16 L90,4 L100,10" color="#4ade80" className="w-full h-8 opacity-90" />
            </div>
          </GlassCard>

          {/* Card 2: Adaptation Graph */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0.2}>
            <div className="flex items-center justify-between">
              <span className={TOKENS.typography.title}>Adaptation Graph</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#f59e0b]" />
            </div>
            <p className={TOKENS.typography.details}>
              Constraint evolution values tracked across historical ticks.
            </p>
            <div className="flex-1 flex flex-col justify-end gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[8px] border-b border-[#151522]/30 pb-1">
                <span className="text-[#71717a] font-bold">EMA Speed factor</span>
                <span className="text-[#e8e8f0] font-black">{minEmaSpeed}</span>
              </div>
              <div className="flex items-center justify-between text-[8px] pb-1">
                <span className="text-[#71717a] font-bold">Lot size scale</span>
                <span className="text-[#e8e8f0] font-black">{maxLotMultiplier}x</span>
              </div>
              <MiniChart points="M0,15 L20,12 L40,17 L60,8 L80,11 L100,3" color="#f59e0b" className="w-full h-8 opacity-90" />
            </div>
          </GlassCard>

          {/* Card 3: Pattern Recognition */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0.4}>
            <div className="flex items-center justify-between">
              <span className={TOKENS.typography.title}>Pattern Recognition</span>
              <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-x-2 gap-y-1.5 text-[8.5px] mt-2">
              <span className="text-[#52525b] font-bold">Regime</span>
              <span className="text-[#e8e8f0] font-bold">{trendState}</span>
              
              <span className="text-[#52525b] font-bold">Momentum</span>
              <span className="text-[#e8e8f0] font-bold">{momentumState}</span>
              
              <span className="text-[#52525b] font-bold">Strictness</span>
              <span className="text-[#a78bfa] font-bold">{strictness}</span>
            </div>
          </GlassCard>

        </div>

        {/* CENTER COLUMN: The animated technological Mahoraga Wheel Core */}
        <div className="border border-[#151522] bg-[#07070c]/80 rounded-2xl flex items-center justify-center relative shadow-[0_0_30px_rgba(139,92,246,0.02)] min-h-0 overflow-visible z-20">
          <MahoragaWheel 
            spokeWeights={spokeWeights}
            onWeightChange={handleWeightChange}
          />
        </div>

        {/* RIGHT COLUMN: Cognitive Adaptation Panels */}
        <div className="flex flex-col gap-5 min-h-0 justify-between">
          
          {/* Card 1: Evolution Progress */}
          <GlassCard className="flex flex-col gap-2 flex-1 items-start" animateFloat delay={0.1}>
            <div className="w-full flex items-center justify-between">
              <span className={TOKENS.typography.title}>Evolution Progress</span>
              <Layers className="w-3.5 h-3.5 text-[#a78bfa]" />
            </div>
            <p className={TOKENS.typography.details}>
              Total evolutionary convergence factor computed across constraints.
            </p>
            <div className="w-full flex-1 flex items-center justify-center mt-3">
              <ProgressRing value={isFullyAdapted ? 100 : 87} max={100} size={70} strokeWidth={5} color="#8b5cf6" />
            </div>
          </GlassCard>

          {/* Card 2: Model Confidence */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0.3}>
            <div className="flex items-center justify-between">
              <span className={TOKENS.typography.title}>Model Confidence</span>
              <Shield className="w-3.5 h-3.5 text-[#4ade80]" />
            </div>
            <p className={TOKENS.typography.details}>
              Confidence coefficient across 10 active strategy models.
            </p>
            <div className="w-full flex-1 flex flex-col justify-end mt-2">
              <CircularGauge label="Confidence" value={isFullyAdapted ? 98 : 91} percentage={isFullyAdapted ? 0.98 : 0.91} color="#4ade80" />
            </div>
          </GlassCard>

          {/* Card 3: Current Cycle */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0.5}>
            <AIReasoningCard title="Adaptation Cycle" steps={steps} />
          </GlassCard>

        </div>

      </div>

      {/* BOTTOM ROW: Learning Memory Timeline Logs */}
      <div className="h-[150px] shrink-0 z-10">
        <HUDConsole 
          title="Learning Memory" 
          logs={learningLog} 
          onClear={() => {}}
        />
      </div>

    </div>
  );
}
