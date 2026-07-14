"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Shield, TrendingUp, Activity, Crosshair, Sparkles } from "lucide-react";

// Types
type StrategyPlanet = {
  id: string;
  name: string;
  allocation: number; // percentage 0-100
  returnPct: number;
  confidence: number;
  risk: string;
  status: "ACTIVE" | "IDLE" | "SCALING";
  color: string;
  icon: React.ElementType;
  angle: number; // degrees on the orbit
  distance: number; // radius from core
};

// Mock Data
const PLANETS: StrategyPlanet[] = [
  {
    id: "strat-1",
    name: "Quantum Arbitrage",
    allocation: 35,
    returnPct: 12.4,
    confidence: 94,
    risk: "LOW",
    status: "ACTIVE",
    color: "#a78bfa", // purple
    icon: Zap,
    angle: -45,
    distance: 280
  },
  {
    id: "strat-2",
    name: "Neural Momentum",
    allocation: 25,
    returnPct: 8.2,
    confidence: 88,
    risk: "MED",
    status: "SCALING",
    color: "#4ade80", // green
    icon: TrendingUp,
    angle: 30,
    distance: 350
  },
  {
    id: "strat-3",
    name: "Macro Hedging",
    allocation: 20,
    returnPct: -1.5,
    confidence: 76,
    risk: "LOW",
    status: "ACTIVE",
    color: "#f87171", // red
    icon: Shield,
    angle: 120,
    distance: 250
  },
  {
    id: "strat-4",
    name: "Micro-Structure Liquidity",
    allocation: 15,
    returnPct: 4.1,
    confidence: 82,
    risk: "HIGH",
    status: "IDLE",
    color: "#f59e0b", // orange
    icon: Activity,
    angle: 210,
    distance: 320
  },
  {
    id: "strat-5",
    name: "Dark Pool Sniffer",
    allocation: 5,
    returnPct: 22.8,
    confidence: 99,
    risk: "EXTREME",
    status: "ACTIVE",
    color: "#4cc9f0", // cyan
    icon: Crosshair,
    angle: 280,
    distance: 400
  }
];

import { useTradingStore } from "../store/useTradingStore";

interface PortfolioViewProps {
  onPlanetClick?: (planetId: string) => void;
  onCoreClick?: () => void;
}

export default function PortfolioView({ onPlanetClick, onCoreClick }: PortfolioViewProps) {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  
  // Connect to Zustand store
  const rawPlanets = useTradingStore(state => state.strategyPlanets);
  
  // Icon Map since we can't store React components in Zustand easily
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Zap": return Zap;
      case "TrendingUp": return TrendingUp;
      case "Shield": return Shield;
      case "Activity": return Activity;
      case "Crosshair": return Crosshair;
      default: return Zap;
    }
  };

  const PLANETS = rawPlanets.length > 0 ? rawPlanets.map(p => ({ ...p, icon: getIcon(p.iconName) })) : [
    { id: "strat-1", name: "Quantum Arbitrage", allocation: 35, returnPct: 12.4, confidence: 94, risk: "LOW", status: "ACTIVE" as const, color: "#a78bfa", icon: Zap, angle: -45, distance: 280 },
    { id: "strat-2", name: "Neural Momentum", allocation: 25, returnPct: 8.2, confidence: 88, risk: "MED", status: "SCALING" as const, color: "#4ade80", icon: TrendingUp, angle: 30, distance: 350 },
    { id: "strat-3", name: "Macro Hedging", allocation: 20, returnPct: -1.5, confidence: 76, risk: "LOW", status: "ACTIVE" as const, color: "#f87171", icon: Shield, angle: 120, distance: 250 },
    { id: "strat-4", name: "Micro-Structure Liquidity", allocation: 15, returnPct: 4.1, confidence: 82, risk: "HIGH", status: "IDLE" as const, color: "#f59e0b", icon: Activity, angle: 210, distance: 320 },
    { id: "strat-5", name: "Dark Pool Sniffer", allocation: 5, returnPct: 22.8, confidence: 99, risk: "EXTREME", status: "ACTIVE" as const, color: "#4cc9f0", icon: Crosshair, angle: 280, distance: 400 }
  ];

  // Math helper for positioning
  const getCoordinates = (angle: number, distance: number) => {
    // Convert angle to radians, adjusted so 0 is top
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: distance * Math.cos(rad),
      y: distance * Math.sin(rad)
    };
  };

  return (
    <div className="relative w-full h-full bg-[#05050a] overflow-hidden flex items-center justify-center animate-in fade-in">
      
      {/* Custom Keyframes for Energy Streams */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes stream-flow-out {
          from { stroke-dashoffset: 100; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes stream-flow-in {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 100; }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .energy-stream-out {
          stroke-dasharray: 10 15;
          animation: stream-flow-out 1s linear infinite;
        }
        .energy-stream-in {
          stroke-dasharray: 10 15;
          animation: stream-flow-in 1s linear infinite;
        }
      `}} />

      {/* SVG Canvas for Orbits and Energy Streams */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none" 
        style={{ zIndex: 0 }}
      >
        <defs>
          {PLANETS.map(p => (
            <linearGradient key={`grad-${p.id}`} id={`grad-${p.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={p.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={p.color} stopOpacity="0" />
            </linearGradient>
          ))}
          <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g transform="translate(50%, 50%)" style={{ transformOrigin: "center" }}>
          
          {/* Orbital Rings */}
          {[250, 280, 320, 350, 400].map(r => (
            <circle 
              key={`ring-${r}`}
              cx="0" cy="0" r={r} 
              fill="none" 
              stroke="#1e1e2e" 
              strokeWidth="1" 
              strokeDasharray="4 8" 
              opacity={0.5}
            />
          ))}

          {/* Energy Streams */}
          {PLANETS.map(p => {
            const isHovered = hoveredPlanet === p.id;
            const isFaded = hoveredPlanet !== null && !isHovered;
            const coords = getCoordinates(p.angle, p.distance);
            
            // If return is positive, energy flows IN to core. If negative, flows OUT to planet.
            // Wait, usually capital flows to the planet (allocation) and returns flow back.
            // Let's use flow-out for SCALING, flow-in for high returns.
            const streamClass = p.returnPct > 0 ? "energy-stream-in" : "energy-stream-out";

            return (
              <line
                key={`stream-${p.id}`}
                x1="0" y1="0"
                x2={coords.x} y2={coords.y}
                stroke={`url(#grad-${p.id})`}
                strokeWidth={isHovered ? "4" : "2"}
                className={`${streamClass} transition-all duration-500`}
                style={{ opacity: isFaded ? 0.1 : 1 }}
              />
            );
          })}
        </g>
      </svg>

      {/* HTML Layer for Core and Planets */}
      <div className="absolute inset-0 w-full h-full flex items-center justify-center" style={{ zIndex: 10 }}>
        
        {/* Capital Core */}
        <div className="absolute flex flex-col items-center justify-center" style={{ animation: 'pulse-glow 4s ease-in-out infinite' }}>
          <div className="absolute w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.2)_0%,transparent_70%)] blur-xl" />
          <div 
            onClick={() => onCoreClick?.()}
            className="relative z-10 flex flex-col items-center justify-center w-40 h-40 rounded-full border-2 border-[#8b5cf6]/50 bg-[#0f0f1a]/80 backdrop-blur-md shadow-[0_0_50px_rgba(139,92,246,0.3)] cursor-pointer hover:scale-105 hover:bg-[#1a1a2e]/90 transition-all duration-300"
          >
            <Sparkles className="w-6 h-6 text-[#8b5cf6] mb-2 opacity-80" />
            <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest mb-1">Capital Core</span>
            <span className="text-2xl font-bold text-white font-mono">$12.4M</span>
            <span className="text-xs text-[#4ade80] font-bold mt-1">+4.2%</span>
          </div>
        </div>

        {/* Orbiting Planets */}
        {PLANETS.map(p => {
          const coords = getCoordinates(p.angle, p.distance);
          const isHovered = hoveredPlanet === p.id;
          const isFaded = hoveredPlanet !== null && !isHovered;

          // Planet base size scales with allocation
          const planetSize = 60 + (p.allocation * 1.5);

          return (
            <motion.div
              key={`planet-${p.id}`}
              onClick={() => onPlanetClick?.(p.id)}
              className={`absolute flex items-center justify-center transition-opacity duration-500 cursor-pointer`}
              style={{
                left: `calc(50% + ${coords.x}px)`,
                top: `calc(50% + ${coords.y}px)`,
                transform: 'translate(-50%, -50%)',
                opacity: isFaded ? 0.2 : 1,
                zIndex: isHovered ? 50 : 20
              }}
              onMouseEnter={() => setHoveredPlanet(p.id)}
              onMouseLeave={() => setHoveredPlanet(null)}
            >
              {/* The Visual Planet Node */}
              <div 
                className="relative flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-110"
                style={{ width: planetSize, height: planetSize }}
              >
                <div 
                  className="absolute inset-0 rounded-full opacity-20 blur-md"
                  style={{ backgroundColor: p.color }}
                />
                <div 
                  className="absolute inset-2 rounded-full border border-white/10 flex items-center justify-center bg-[#09090e]/80 backdrop-blur-md"
                  style={{ boxShadow: `0 0 20px ${p.color}40`, borderColor: `${p.color}80` }}
                >
                  <p.icon className="w-5 h-5" style={{ color: p.color }} />
                </div>
              </div>

              {/* Data Card (Visible on Hover or always slightly visible) */}
              <div 
                className={`
                  absolute top-full mt-4 left-1/2 -translate-x-1/2 w-64 bg-[#09090e]/95 backdrop-blur-xl border rounded-xl p-4 shadow-2xl transition-all duration-300 pointer-events-none
                  ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
                `}
                style={{ borderColor: `${p.color}50` }}
              >
                <div className="flex items-center justify-between mb-3 border-b border-[#1e1e2e] pb-2">
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#1e1e2e] text-white">
                    {p.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                  <div>
                    <span className="block text-[10px] text-[#52525b] uppercase tracking-widest font-bold mb-0.5">Allocation</span>
                    <span className="text-xs font-mono text-white">{p.allocation}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#52525b] uppercase tracking-widest font-bold mb-0.5">Return</span>
                    <span className={`text-xs font-mono font-bold ${p.returnPct > 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
                      {p.returnPct > 0 ? "+" : ""}{p.returnPct}%
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#52525b] uppercase tracking-widest font-bold mb-0.5">Confidence</span>
                    <span className="text-xs font-mono text-white">{p.confidence}%</span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#52525b] uppercase tracking-widest font-bold mb-0.5">Risk Level</span>
                    <span className="text-[10px] font-bold" style={{ color: p.risk === "LOW" ? "#4ade80" : p.risk === "MED" ? "#fbbf24" : "#f87171" }}>
                      {p.risk}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

      </div>
    </div>
  );
}
