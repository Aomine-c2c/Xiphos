"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { useTradingStore } from "../../store/useTradingStore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  TrendingUp, 
  ShieldCheck, 
  DollarSign, 
  Zap, 
  BarChart, 
  MessageCircle, 
  FileText,
  Activity
} from "lucide-react";

interface SpokeItem {
  id: number;
  label: string;
  sub: string;
  icon: any;
  angle: number;
  description: string;
}

interface MahoragaWheelProps {
  spokeWeights: Record<number, number>;
  onWeightChange: (id: number, weight: number) => void;
}

export function MahoragaWheel({ spokeWeights, onWeightChange }: MahoragaWheelProps) {
  const { mahoragaState } = useTradingStore();
  const [hoveredSpoke, setHoveredSpoke] = useState<number | null>(null);
  const [draggingSpoke, setDraggingSpoke] = useState<number | null>(null);
  
  // High-fidelity adaptation animation states
  const [adaptingSpoke, setAdaptingSpoke] = useState<number | null>(null);
  const [lightningPath, setLightningPath] = useState<string>("");
  const [isCoreFlaring, setIsCoreFlaring] = useState(false);
  const [energyPulseProgress, setEnergyPulseProgress] = useState<number | null>(null); // null, or 0.0 to 1.0
  const [propagationPulse, setPropagationPulse] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  
  const svgRef = useRef<SVGSVGElement>(null);

  // Spoke definitions aligned precisely with clock-wise angles (0deg is TOP)
  const spokes: SpokeItem[] = useMemo(() => [
    { id: 0, label: "NEWS ADAPTATION", sub: "Analyzing News Flow", icon: FileText, angle: 0, description: "Scans real-time global news API feeds to construct market sentiment and adjust directional trading bias." },
    { id: 1, label: "VOLATILITY ADAPTATION", sub: "Reading Volatility", icon: Activity, angle: 45, description: "Measures real-time ATR and Bollinger bands to adjust trailing SL/TP sizes dynamically." },
    { id: 2, label: "CORRELATION MAPPING", sub: "Mapping Correlations", icon: BarChart, angle: 90, description: "Maintains a live Pearson correlation matrix to prevent over-exposure to highly correlated assets." },
    { id: 3, label: "TREND & REGIME DETECTION", sub: "Detecting Regime", icon: TrendingUp, angle: 135, description: "Identifies whether markets are in trending or range-bound conditions to swap algorithm strategies." },
    { id: 4, label: "RISK MANAGEMENT", sub: "Controlling Risk", icon: ShieldCheck, angle: 180, description: "Monitors overall portfolio drawdown and shuts down trading activity if hard risk thresholds are violated." },
    { id: 5, label: "LIQUIDITY AWARENESS", sub: "Scanning Liquidity", icon: DollarSign, angle: 225, description: "Measures L2 book depth to optimize entry position sizing and limit market impact." },
    { id: 6, label: "EXECUTION OPTIMIZATION", sub: "Improving Execution", icon: Zap, angle: 270, description: "Selects optimal MT5 execution paths to minimize slippage and ensure trade latency is minimal." },
    { id: 7, label: "SENTIMENT ANALYSIS", sub: "Monitoring Sentiment", icon: MessageCircle, angle: 315, description: "Uses natural language models to process social sentiment and filter high-risk signals." },
  ], []);

  // 1. Dragging event handler
  useEffect(() => {
    if (draggingSpoke === null) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const distSvg = dist * (200 / rect.width);
      const clamped = Math.max(30, Math.min(54, distSvg));
      const weight = 0.1 + ((clamped - 30) / 24) * 0.9;
      onWeightChange(draggingSpoke, weight);
      
      // Dragging triggers instant core flare and conduit flow
      setAdaptingSpoke(draggingSpoke);
      setIsCoreFlaring(true);
    };

    const handleMouseUp = () => {
      setDraggingSpoke(null);
      setAdaptingSpoke(null);
      setIsCoreFlaring(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingSpoke, onWeightChange]);

  // 2. Generate random adaptation event loop (Every 8-12 seconds)
  useEffect(() => {
    const triggerAdaptation = () => {
      if (draggingSpoke !== null) return;
      
      const randomSpokeId = Math.floor(Math.random() * spokes.length);
      setAdaptingSpoke(randomSpokeId);
      
      // Step A: Flow energy pulse from handle down to center core
      let progress = 0;
      const pulseInterval = setInterval(() => {
        progress += 0.08;
        if (progress >= 1.0) {
          clearInterval(pulseInterval);
          setEnergyPulseProgress(null);
          
          // Step B: Core flaring
          setIsCoreFlaring(true);
          
          // Step C: Outer propagation wave & Wheel Click
          setTimeout(() => {
            setIsCoreFlaring(false);
            setPropagationPulse(true);
            setWheelRotation(prev => prev + 45); // Mechanical adaptation click
            setTimeout(() => setPropagationPulse(false), 800);
            setAdaptingSpoke(null);
          }, 600);
        } else {
          setEnergyPulseProgress(progress);
        }
      }, 30);
    };

    const interval = setInterval(triggerAdaptation, 9000);
    // Initial delay trigger
    const timeout = setTimeout(triggerAdaptation, 2500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [spokes.length, draggingSpoke]);

  // 3. Crackling Lightning Generator (Flickers rapidly when a spoke is adapting)
  useEffect(() => {
    if (adaptingSpoke === null) {
      setLightningPath("");
      return;
    }

    const interval = setInterval(() => {
      const activeSpoke = spokes.find(s => s.id === adaptingSpoke);
      if (!activeSpoke) return;

      const rad = (activeSpoke.angle * Math.PI) / 180;
      const w = spokeWeights[adaptingSpoke] ?? 1.0;
      const rSvg = 30 + ((w - 0.1) / 0.9) * 22;

      // Handle node center in SVG coordinates (100, 100 is origin)
      const startX = 100 + rSvg * Math.sin(rad);
      const startY = 100 - rSvg * Math.cos(rad);
      const endX = 100;
      const endY = 100;

      // Generate crackling electrical line path
      const segments = 6;
      let path = `M ${startX} ${startY}`;
      
      for (let i = 1; i < segments; i++) {
        const ratio = i / segments;
        // Linear interpolation
        const px = startX + (endX - startX) * ratio;
        const py = startY + (endY - startY) * ratio;
        
        // Random electric displacement perpendicular to line
        const displacement = 5;
        const dx = (Math.random() - 0.5) * displacement;
        const dy = (Math.random() - 0.5) * displacement;
        
        path += ` L ${px + dx} ${py + dy}`;
      }
      
      path += ` L ${endX} ${endY}`;
      setLightningPath(path);
    }, 70);

    return () => clearInterval(interval);
  }, [adaptingSpoke, spokes, spokeWeights]);

  // 4. Ambient floating micro-particles
  const particles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 320,
      y: (Math.random() - 0.5) * 320,
      size: Math.random() * 2.5 + 1.2,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * -10
    }));
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 relative font-mono select-none h-full min-h-[440px]">
      
      {/* 1. FLOATING PLASMA PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-tr from-[#8b5cf6] to-[#f59e0b] opacity-25"
            style={{
              width: p.size,
              height: p.size,
              left: "50%",
              top: "50%",
            }}
            animate={{
              x: [p.x, p.x + (Math.random() - 0.5) * 60, p.x],
              y: [p.y, p.y + (Math.random() - 0.5) * 60, p.y],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.4, 1]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* BACKGROUND DEEP GLOWS */}
      <div className={`absolute w-[280px] h-[280px] rounded-full blur-3xl pointer-events-none transition-all duration-1000 ${
        isCoreFlaring ? "bg-[#8b5cf6]/15 scale-110" : "bg-[#8b5cf6]/5"
      }`} />
      
      <div className="absolute w-[360px] h-[360px] rounded-full border border-[#8b5cf6]/5 pointer-events-none animate-[pulse_6s_ease-in-out_infinite]" />

      {/* WHEEL HEADER */}
      <div className="text-center mb-4 shrink-0 z-10">
        <h2 className="text-[10px] font-black text-[#e8e8f0] tracking-[0.3em] uppercase flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
          Mahoraga Adaptation Engine
        </h2>
        <span className="text-[6.5px] text-[#8b5cf6] font-bold tracking-widest uppercase block mt-1">
          Mechanical • Sacred • Autonomous Tuning
        </span>
      </div>

      {/* 2. THE MECHANICAL INTEGRATED WHEEL ASSEMBLY */}
      <motion.div 
        className="relative w-[380px] h-[380px] flex items-center justify-center shrink-0"
        animate={{ 
          rotate: wheelRotation,
          filter: propagationPulse ? "contrast(1.4) brightness(1.3)" : "contrast(1) brightness(1)"
        }}
        transition={{ 
          rotate: { type: "spring", stiffness: 350, damping: 22, mass: 2.5 },
          filter: { duration: 0.15 }
        }}
      >
        
        {/* Core SVG Canvas */}
        <svg 
          ref={svgRef}
          viewBox="0 0 200 200" 
          className="w-full h-full absolute overflow-visible drop-shadow-[0_0_15px_rgba(139,92,246,0.18)]"
        >
          {/* Defs for gradients/glows */}
          <defs>
            <radialGradient id="plasmaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#8b5cf6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#07070c" stopOpacity="0" />
            </radialGradient>
            
            <radialGradient id="goldGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#07070c" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* BACKGROUND PLASMA CLOUD (Rendered in SVG for performance) */}
          <circle cx="100" cy="100" r="80" fill="url(#plasmaGlow)" className="opacity-30 mix-blend-screen pointer-events-none" />

          {/* A. OUTER MECHANICAL RING - Gold Alloy (Static, rotates with whole wheel) */}
          <g style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="56" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="3, 5" className="opacity-80" />
            <circle cx="100" cy="100" r="53" fill="none" stroke="#f59e0b" strokeWidth="0.8" className="opacity-40" />
            
            {/* Ornate mechanical brackets on outer ring */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <rect x="98.5" y="41.5" width="3" height="4" fill="#f59e0b" className="opacity-75" />
                <circle cx="100" cy="40" r="0.8" fill="#f59e0b" />
              </g>
            ))}
          </g>

          {/* B. INNER MECHANICAL GEAR - (Static, rotates with whole wheel) */}
          <g style={{ transformOrigin: "100px 100px" }}>
            <circle cx="100" cy="100" r="22" fill="none" stroke="#f59e0b" strokeWidth="3" className="opacity-90" />
            {/* Gear teeth */}
            {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340].map((deg) => (
              <rect 
                key={deg} 
                x="98" y="75" width="4" height="4" fill="#f59e0b" 
                transform={`rotate(${deg} 100 100)`} 
                className="opacity-80"
              />
            ))}
            {/* Inner ring divider */}
            <circle cx="100" cy="100" r="16" fill="none" stroke="#8b5cf6" strokeWidth="0.8" className="opacity-45" />
          </g>

          {/* C. ENERGY CONDUITS & SPOKES */}
          {spokes.map((spoke) => {
            const isHovered = hoveredSpoke === spoke.id || draggingSpoke === spoke.id;
            const isAdapting = adaptingSpoke === spoke.id;
            
            const w = spokeWeights[spoke.id] ?? 1.0;
            const rSvg = 30 + ((w - 0.1) / 0.9) * 22;

            // Spoke angle layout
            return (
              <g key={spoke.id} transform={`rotate(${spoke.angle} 100 100)`}>
                {/* Structural support backing line */}
                <line 
                  x1="100" y1="84" x2="100" y2={100 - rSvg} 
                  stroke="#151522" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                />
                {/* Gold alloy mechanical spoke line */}
                <line 
                  x1="100" y1="84" x2="100" y2={100 - rSvg} 
                  stroke={isAdapting ? "#a78bfa" : isHovered ? "#f59e0b" : "#f59e0b"} 
                  strokeWidth={isAdapting ? "2.5" : isHovered ? "2" : "1.2"} 
                  className="transition-all duration-150"
                  opacity={isAdapting ? 1 : 0.8}
                />
                
                {/* Embedded Energy conduit (Purple plasma track inside the spoke) */}
                <line 
                  x1="100" y1="84" x2="100" y2={100 - rSvg} 
                  stroke="#c084fc" 
                  strokeWidth="0.6" 
                  opacity={isAdapting || isHovered ? 1 : 0.3}
                  className="transition-all duration-150"
                />

                {/* D. CONDUIT ENERGY FLOW PULSE (Flows from node down to center core when adapting) */}
                {isAdapting && energyPulseProgress !== null && (
                  <circle 
                    cx="100" 
                    cy={(100 - rSvg) + (rSvg - 16) * energyPulseProgress} 
                    r="2.5" 
                    fill="#a78bfa" 
                    filter="drop-shadow(0 0 4px #8b5cf6)"
                  />
                )}

                {/* Node structural housing ring */}
                <circle 
                  cx="100" cy={100 - rSvg} r="6.5" 
                  fill="#07070c" 
                  stroke={isAdapting ? "#a78bfa" : isHovered ? "#a78bfa" : "#f59e0b"} 
                  strokeWidth="1.5"
                  className="transition-all duration-150"
                />

                {/* Pulsing Neural Core when actively processing */}
                {(isAdapting || isHovered) && (
                  <circle
                    cx="100" cy={100 - rSvg} r="3.5"
                    fill={isAdapting ? "#a78bfa" : "#f59e0b"}
                    className="animate-ping opacity-75"
                    style={{ animationDuration: isAdapting ? '1s' : '2s' }}
                  />
                )}
                {(isAdapting || isHovered) && (
                  <circle
                    cx="100" cy={100 - rSvg} r="2.5"
                    fill={isAdapting ? "#a78bfa" : "#f59e0b"}
                  />
                )}
              </g>
            );
          })}

          {/* E. ELECTRICAL LIGHTNING ARCS (Crackling overlay when adapting) */}
          {adaptingSpoke !== null && lightningPath && (
            <g>
              {/* Lightning background blur glow */}
              <path 
                d={lightningPath} 
                stroke="#8b5cf6" 
                strokeWidth="4.5" 
                strokeLinecap="round" 
                fill="none" 
                className="opacity-25 blur-[2px]" 
              />
              {/* Core electric arc */}
              <path 
                d={lightningPath} 
                stroke="#c084fc" 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                fill="none" 
                className="opacity-90 animate-pulse" 
              />
              {/* Lightning bright center */}
              <path 
                d={lightningPath} 
                stroke="#ffffff" 
                strokeWidth="0.5" 
                strokeLinecap="round" 
                fill="none" 
                className="opacity-95" 
              />
            </g>
          )}

          {/* F. CENTRAL AI SACRED CORE (Multi-layered energy reactor) */}
          {/* Core glow */}
          <circle cx="100" cy="100" r="16" fill="url(#plasmaGlow)" className={`mix-blend-screen transition-all duration-300 ${isCoreFlaring ? "opacity-100 scale-125" : "opacity-60"}`} />
          
          {/* Core mechanical gold casing */}
          <circle cx="100" cy="100" r="12" fill="#07070c" stroke="#f59e0b" strokeWidth="2.2" />
          
          {/* Glowing central plasma reactor */}
          <circle 
            cx="100" cy="100" 
            r={isCoreFlaring ? 7 : 5} 
            fill={isCoreFlaring ? "#ffffff" : "#a78bfa"} 
            stroke={isCoreFlaring ? "#f59e0b" : "#8b5cf6"} 
            strokeWidth="1.5" 
            className="transition-all duration-300"
          />
          {/* Core status blinking dot */}
          <circle cx="100" cy="100" r="2.2" fill={isCoreFlaring ? "#f59e0b" : "#ffffff"} className="animate-pulse" />

          {/* G. PROPAGATION WAVE SHOCKWAVE (Flares outward when adaptation is completed) */}
          <AnimatePresence>
            {propagationPulse && (
              <motion.circle
                cx="100"
                cy="100"
                initial={{ r: 12, opacity: 1, strokeWidth: 8 }}
                animate={{ r: 90, opacity: 0, strokeWidth: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                fill="none"
                stroke="#ffffff"
                className="pointer-events-none drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]"
              />
            )}
          </AnimatePresence>
        </svg>

        {/* 3. ABSOLUTE INTERACTIVE NODE BUTTONS & PERMANENT LABELS */}
        {spokes.map((spoke) => {
          const rad = (spoke.angle * Math.PI) / 180;
          const w = spokeWeights[spoke.id] ?? 1.0;
          const rSvg = 30 + ((w - 0.1) / 0.9) * 22;
          
          // Map distance to absolute pixel spacing (380 / 200 = 1.9 factor)
          const distance = rSvg * 1.9;
          
          // Calculate x and y coordinates correctly matching SVG clock-wise rotation (0deg is TOP)
          const x = distance * Math.sin(rad);
          const y = -distance * Math.cos(rad);
          
          const Icon = spoke.icon;
          const isHovered = hoveredSpoke === spoke.id || draggingSpoke === spoke.id;
          const isAdapting = adaptingSpoke === spoke.id;

          return (
            <div 
              key={spoke.id}
              className="absolute z-20"
              style={{ transform: `translate(${x}px, ${y}px)` }}
            >
              {/* Node Icon Trigger (Ornate futuristic button casing) */}
              <button
                onMouseEnter={() => setHoveredSpoke(spoke.id)}
                onMouseLeave={() => setHoveredSpoke(null)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setDraggingSpoke(spoke.id);
                }}
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                  isAdapting
                    ? "bg-[#8b5cf6] border-[#ffffff] text-white shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-110"
                    : isHovered 
                      ? "bg-[#8b5cf6]/90 border-[#a78bfa] text-white shadow-[0_0_12px_rgba(139,92,246,0.6)] scale-105" 
                      : "bg-[#07070c] border-[#f59e0b] text-[#f59e0b] hover:border-[#a78bfa] hover:text-white"
                }`}
              >
                <motion.div 
                  animate={{ rotate: -wheelRotation }} 
                  transition={{ type: "spring", stiffness: 350, damping: 22, mass: 2.5 }}
                >
                  {(isAdapting || isHovered) && (
                    <Icon className={`w-3.5 h-3.5 pointer-events-none ${isAdapting ? "animate-spin [animation-duration:1.5s]" : ""}`} />
                  )}
                </motion.div>
              </button>
            </div>
          );
        })}
      </motion.div>

      {/* 4. BOTTOM ADAPTATION DETAILS BLOCK */}
      <div className="mt-6 w-full max-w-[400px] text-center z-10 shrink-0">
        {hoveredSpoke !== null || draggingSpoke !== null || adaptingSpoke !== null ? (
          <div className="border border-[#8b5cf6]/20 bg-[#8b5cf6]/4 rounded-xl p-2.5 animate-fade-in shadow-[0_0_15px_rgba(139,92,246,0.02)]">
            <span className="text-[8.5px] font-bold text-[#a78bfa] uppercase tracking-wider block">
              {spokes[draggingSpoke !== null ? draggingSpoke : hoveredSpoke !== null ? hoveredSpoke! : adaptingSpoke!].label}
            </span>
            <span className="text-[7px] text-[#71717a] block mt-1 tracking-wide leading-normal">
              {spokes[draggingSpoke !== null ? draggingSpoke : hoveredSpoke !== null ? hoveredSpoke! : adaptingSpoke!].description}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-[7px] text-[#52525b] uppercase tracking-widest font-bold">
              AI Adaptation Cycle Active
            </span>
            {/* Animated dotted loader */}
            <div className="flex items-center gap-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <span 
                  key={i} 
                  className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-pulse" 
                  style={{ animationDelay: `${i * 150}ms` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
