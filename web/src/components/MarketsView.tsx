"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { 
  Radar, 
  Activity, 
  Search, 
  ShieldAlert, 
  Compass, 
  Cpu, 
  Award, 
  TrendingUp, 
  Zap, 
  Layers, 
  Globe 
} from "lucide-react";
import { 
  GlassCard, 
  HUDButton, 
  StatusBadge, 
  ProgressRing, 
  CircularGauge, 
  MiniChart, 
  TOKENS 
} from "./ui/DesignSystem";
import { motion, AnimatePresence } from "framer-motion";

interface RadarNode {
  symbol: string;
  angle: number; // degrees
  radius: number; // percentage from center (20 to 85)
  category: "FOREX" | "CRYPTO" | "INDICES" | "COMMODITIES";
  signal: "BUY" | "SELL" | "HOLD";
  strength: number; // 0.1 to 1.0
  health: number; // 0 to 100
  volatility: number; // 0 to 100
  threatScore: number; // 0 to 100
  expectedRR: string;
  reasoning: string;
}

export default function MarketsView() {
  const { marketWatch } = useTradingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<RadarNode | null>(null);
  
  // Tactical Radar Nodes representing global markets surveillance
  const radarNodes: RadarNode[] = useMemo(() => [
    { symbol: "EURUSD", angle: 30, radius: 45, category: "FOREX", signal: "BUY", strength: 0.88, health: 92, volatility: 42, threatScore: 12, expectedRR: "1:3.2", reasoning: "Structural continuation above H4 demand block. Orderflow bullish. Sentiment supportive." },
    { symbol: "GBPUSD", angle: 120, radius: 55, category: "FOREX", signal: "BUY", strength: 0.76, health: 84, volatility: 48, threatScore: 18, expectedRR: "1:2.8", reasoning: "Strong momentum following news expansion. Liquidity pools cleared." },
    { symbol: "USDJPY", angle: 210, radius: 65, category: "FOREX", signal: "SELL", strength: 0.92, health: 89, volatility: 64, threatScore: 32, expectedRR: "1:4.1", reasoning: "Bearish divergence on Daily TF. Institutional distribution block mitigated." },
    { symbol: "BTCUSD", angle: 315, radius: 75, category: "CRYPTO", signal: "BUY", strength: 0.95, health: 96, volatility: 82, threatScore: 45, expectedRR: "1:5.2", reasoning: "Weekly range breakout. Hyper-liquidity mitigation. Strong correlation with indices." },
    { symbol: "ETHUSD", angle: 285, radius: 60, category: "CRYPTO", signal: "BUY", strength: 0.82, health: 90, volatility: 78, threatScore: 38, expectedRR: "1:3.8", reasoning: "Beta play to Bitcoin breakout. Smart contract gas fee optimization." },
    { symbol: "XAUUSD", angle: 75, radius: 35, category: "COMMODITIES", signal: "SELL", strength: 0.74, health: 78, volatility: 35, threatScore: 22, expectedRR: "1:2.4", reasoning: "Safe haven capital rotation out. Structural break of H1 trend line." },
    { symbol: "SPX500", angle: 165, radius: 50, category: "INDICES", signal: "BUY", strength: 0.85, health: 95, volatility: 38, threatScore: 14, expectedRR: "1:3.0", reasoning: "Index rebalancing. Support held at 200 EMA. Volatility crush expected." }
  ], []);

  // Filter nodes based on search
  const filteredNodes = useMemo(() => {
    return radarNodes.filter(n => n.symbol.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [radarNodes, searchQuery]);

  // Set initial selected node
  useEffect(() => {
    if (filteredNodes.length > 0 && !selectedNode) {
      setSelectedNode(filteredNodes[0]);
    }
  }, [filteredNodes, selectedNode]);

  // Orbit particles in background
  const bgParticles = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 600,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 12 + 8
    }));
  }, []);

  return (
    <div className="flex-1 w-full h-full flex flex-col p-5 gap-5 overflow-hidden bg-[#05050a] relative select-none font-mono">
      
      {/* BACKGROUND PARTICLES */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-15">
        {bgParticles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full bg-gradient-to-tr from-[#38bdf8] to-[#f59e0b]"
            style={{ width: p.size, height: p.size, left: "50%", top: "50%" }}
            animate={{
              x: [p.x, p.x + (Math.random() - 0.5) * 100, p.x],
              y: [p.y, p.y + (Math.random() - 0.5) * 100, p.y],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{ duration: p.duration, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* HEADER TACTICAL STRIP */}
      <div className="flex items-center justify-between shrink-0 z-10 px-1">
        <div className="flex flex-col gap-1">
          <h1 className="text-sm font-black text-[#e8e8f0] tracking-[0.3em] uppercase flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#38bdf8]" />
            Global Surveillance Scanner
          </h1>
          <span className="text-[7.5px] text-[#52525b] uppercase font-bold tracking-widest block">
            Tactical Opportunity Map • Multi-Asset Radar Surveillance
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Tactical Search */}
          <div className="flex items-center bg-[#0f0f1a]/80 border border-[#151522] rounded-xl px-3 py-1.5 gap-2 transition-all duration-300 focus-within:border-[#38bdf8]/50">
            <Search className="h-3 w-3 text-[#52525b]" />
            <input
              type="text"
              placeholder="SEARCH ASSET TARGET..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-[8.5px] text-[#e8e8f0] placeholder-[#52525b] outline-none border-none tracking-widest uppercase font-bold w-36"
            />
          </div>
          <StatusBadge status="active" text="SCANNER ONLINE" />
        </div>
      </div>

      {/* THREE-COLUMN MILITARY COCKPIT */}
      <div className="flex-1 grid grid-cols-[280px_1fr_320px] gap-5 items-stretch min-h-0 z-10">
        
        {/* COLUMN 1: Volatility Clusters & Sector Intelligence */}
        <div className="flex flex-col gap-5 min-h-0 justify-between">
          
          {/* Card 1: Sector Intelligence */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0}>
            <div className="flex items-center justify-between">
              <span className={TOKENS.typography.title}>Sector Intelligence</span>
              <Compass className="w-3.5 h-3.5 text-[#38bdf8]" />
            </div>
            <p className={TOKENS.typography.details}>
              Capital momentum flow tracked across global market sectors.
            </p>
            <div className="flex-1 flex flex-col justify-end gap-2 mt-3">
              {/* Crypto */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[7px] font-bold text-[#71717a] uppercase">
                  <span>Crypto Momentum</span>
                  <span className="text-[#38bdf8]">96%</span>
                </div>
                <div className="h-1 bg-[#151522] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "96%" }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-[#38bdf8]" />
                </div>
              </div>
              {/* Forex */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[7px] font-bold text-[#71717a] uppercase">
                  <span>Forex Liquidity</span>
                  <span className="text-[#a78bfa]">64%</span>
                </div>
                <div className="h-1 bg-[#151522] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "64%" }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.1 }} className="h-full bg-[#a78bfa]" />
                </div>
              </div>
              {/* Commodities */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[7px] font-bold text-[#71717a] uppercase">
                  <span>Commodities Flow</span>
                  <span className="text-[#f59e0b]">35%</span>
                </div>
                <div className="h-1 bg-[#151522] rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "35%" }} transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }} className="h-full bg-[#f59e0b]" />
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Card 2: Volatility Clusters */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0.2}>
            <div className="flex items-center justify-between">
              <span className={TOKENS.typography.title}>Volatility Clusters</span>
              <Activity className="w-3.5 h-3.5 text-[#f59e0b]" />
            </div>
            <p className={TOKENS.typography.details}>
              Variance anomalies Mitigating systemic correlation risks.
            </p>
            <div className="flex-1 flex flex-col justify-end gap-1.5 mt-2">
              <div className="flex items-center justify-between text-[8px] border-b border-[#151522]/30 pb-1">
                <span className="text-[#71717a] font-bold">Anomalous Clusters</span>
                <span className="text-[#f59e0b] font-black">2 Clusters</span>
              </div>
              <div className="flex items-center justify-between text-[8px] pb-1">
                <span className="text-[#71717a] font-bold">Variance Score</span>
                <span className="text-[#e8e8f0] font-black">81.4</span>
              </div>
              <MiniChart points="M0,15 L20,3 L40,16 L60,4 L80,18 L100,10" color="#f59e0b" className="w-full h-8 opacity-90" />
            </div>
          </GlassCard>

          {/* Card 3: Systemic Risk Zones */}
          <GlassCard className="flex flex-col gap-2 flex-1" animateFloat delay={0.4}>
            <div className="flex items-center justify-between">
              <span className={TOKENS.typography.title}>Systemic Risk Zones</span>
              <ShieldAlert className="w-3.5 h-3.5 text-[#f87171]" />
            </div>
            <div className="flex-1 flex flex-col justify-end gap-2 mt-2">
              <div className="flex items-center justify-between text-[8px] text-[#f87171] bg-[#f87171]/5 border border-[#f87171]/20 rounded p-2">
                <span className="font-bold">US CPI Announcement</span>
                <span className="font-black">HIGH</span>
              </div>
              <div className="flex items-center justify-between text-[8px] text-[#f59e0b] bg-[#f59e0b]/5 border border-[#f59e0b]/20 rounded p-2">
                <span className="font-bold">Crypto Funding Volatility</span>
                <span className="font-black">MODERATE</span>
              </div>
            </div>
          </GlassCard>

        </div>

        {/* COLUMN 2: Tactical Glowing Radar Surveillance Screen */}
        <div className="border border-[#151522] bg-[#07070c]/85 rounded-2xl flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(139,92,246,0.01)] min-h-0 overflow-hidden z-20 p-6">
          
          {/* Radar background grid */}
          <div className="absolute inset-0 bg-[#050508]/40 bg-[linear-gradient(rgba(21,21,34,0.35)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(21,21,34,0.35)_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none" />

          {/* Radar sweeping visual HUD */}
          <div className="relative w-[340px] h-[340px] rounded-full border border-[#151522] flex items-center justify-center">
            
            {/* Ambient radar sweep gradient overlay */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "conic-gradient(from 0deg, rgba(56, 189, 248, 0.15) 0deg, rgba(56, 189, 248, 0) 120deg)",
                transformOrigin: "center"
              }}
            />

            {/* Radar concentric circular rings */}
            <div className="absolute w-[260px] h-[260px] rounded-full border border-[#151522]/60" />
            <div className="absolute w-[180px] h-[180px] rounded-full border border-[#151522]/40" />
            <div className="absolute w-[100px] h-[100px] rounded-full border border-[#151522]/20" />
            
            {/* Crosshairs */}
            <div className="absolute h-full w-[0.8px] bg-[#151522]/40 left-1/2 -translate-x-1/2 pointer-events-none" />
            <div className="absolute w-full h-[0.8px] bg-[#151522]/40 top-1/2 -translate-y-1/2 pointer-events-none" />

            {/* RADAR TARGET NODE SELECTION */}
            {filteredNodes.map((node) => {
              const rad = (node.angle * Math.PI) / 180;
              // Node position (radius factor from center of w=340, radius=170)
              const distance = (node.radius / 100) * 170;
              const x = distance * Math.cos(rad);
              const y = distance * Math.sin(rad);

              const isSelected = selectedNode?.symbol === node.symbol;
              const nodeColor = node.signal === "BUY" ? "bg-[#4ade80]" : "bg-[#f87171]";

              return (
                <div
                  key={node.symbol}
                  className="absolute cursor-pointer z-30 group"
                  style={{ transform: `translate(${x}px, ${y}px)` }}
                  onClick={() => setSelectedNode(node)}
                >
                  {/* Glowing core dot */}
                  <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all duration-300 relative ${
                    isSelected 
                      ? "bg-[#38bdf8] border-[#ffffff] scale-125 shadow-[0_0_15px_#38bdf8]" 
                      : "bg-[#07070c] border-[#38bdf8]/40 hover:border-[#38bdf8] hover:scale-110"
                  }`}>
                    {/* Ring ping animations */}
                    {isSelected && (
                      <span className="absolute inset-0 rounded-full bg-[#38bdf8] animate-ping opacity-60 pointer-events-none" />
                    )}
                    <span className={`w-1.5 h-1.5 rounded-full ${nodeColor}`} />
                  </div>

                  {/* Target text flag label */}
                  <div className={`absolute left-5 -top-1 px-1.5 py-0.5 border bg-[#050508]/90 text-[7px] font-black rounded tracking-widest ${
                    isSelected 
                      ? "border-[#38bdf8] text-[#38bdf8]" 
                      : "border-[#151522] text-[#52525b] group-hover:text-[#e8e8f0] group-hover:border-[#38bdf8]/50"
                  }`}>
                    {node.symbol}
                  </div>
                </div>
              );
            })}

            {/* Radar center lock core */}
            <div className="w-4 h-4 rounded-full bg-[#050508] border border-[#38bdf8] flex items-center justify-center z-20 shadow-[0_0_8px_rgba(56,189,248,0.4)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8] animate-pulse" />
            </div>

          </div>

          {/* Bottom telemetry legend */}
          <div className="mt-4 flex items-center gap-6 z-10 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
              <span className="text-[6.5px] font-bold text-[#71717a] uppercase tracking-wider">Bullish target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
              <span className="text-[6.5px] font-bold text-[#71717a] uppercase tracking-wider">Bearish target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              <span className="text-[6.5px] font-bold text-[#71717a] uppercase tracking-wider">Selected Target LOCK</span>
            </div>
          </div>

        </div>

        {/* COLUMN 3: AI Reasoning & Target Threat Analysis */}
        <div className="flex flex-col gap-5 min-h-0 justify-between">
          
          {/* Target deep details */}
          <GlassCard className="flex flex-col gap-4 flex-1 h-full" animateFloat delay={0.3}>
            
            <AnimatePresence mode="wait">
              {selectedNode ? (
                <motion.div
                  key={selectedNode.symbol}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={TOKENS.transitions.springCard}
                  className="flex flex-col gap-4 h-full"
                >
                  {/* Target title header */}
                  <div className="flex items-center justify-between border-b border-[#151522] pb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[7.5px] text-[#52525b] uppercase font-bold tracking-widest">Surveillance Target</span>
                      <h3 className="text-sm font-black text-[#e8e8f0] tracking-widest">{selectedNode.symbol}</h3>
                    </div>
                    <StatusBadge status={selectedNode.signal === "BUY" ? "active" : "alert"} text={`${selectedNode.signal} VECTOR`} />
                  </div>

                  {/* Quantitative surveillance metrics */}
                  <div className="grid grid-cols-[100px_1fr] gap-x-2 gap-y-3.5 text-[8.5px] my-1">
                    
                    <span className="text-[#52525b] font-bold">Expected RR</span>
                    <span className="text-[#e8e8f0] font-black">{selectedNode.expectedRR}</span>

                    <span className="text-[#52525b] font-bold">Signal Strength</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#38bdf8] font-black">{(selectedNode.strength * 100).toFixed(0)}%</span>
                      <div className="h-1.5 w-16 bg-[#151522] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${selectedNode.strength * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#38bdf8]" />
                      </div>
                    </div>

                    <span className="text-[#52525b] font-bold">Asset Health</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#4ade80] font-black">{selectedNode.health}%</span>
                      <div className="h-1.5 w-16 bg-[#151522] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${selectedNode.health}%` }} transition={{ duration: 1 }} className="h-full bg-[#4ade80]" />
                      </div>
                    </div>

                    <span className="text-[#52525b] font-bold">Volatility Index</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#f59e0b] font-black">{selectedNode.volatility}%</span>
                      <div className="h-1.5 w-16 bg-[#151522] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${selectedNode.volatility}%` }} transition={{ duration: 1 }} className="h-full bg-[#f59e0b]" />
                      </div>
                    </div>

                    <span className="text-[#52525b] font-bold">Threat score</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#f87171] font-black">{selectedNode.threatScore}%</span>
                      <div className="h-1.5 w-16 bg-[#151522] rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${selectedNode.threatScore}%` }} transition={{ duration: 1 }} className="h-full bg-[#f87171]" />
                      </div>
                    </div>

                  </div>

                  {/* AI Reasoning description */}
                  <div className="flex flex-col gap-2 border-t border-[#151522] pt-3">
                    <span className="text-[7.5px] text-[#52525b] uppercase font-bold tracking-widest flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
                      AI Surveillance Reasoning
                    </span>
                    <p className="text-[8px] text-[#a1a1aa] leading-normal select-text">
                      {selectedNode.reasoning}
                    </p>
                  </div>

                  {/* Order execution trigger */}
                  <div className="flex-1 flex flex-col justify-end mt-4">
                    <HUDButton variant="purple" cmdKey="⌘E" className="w-full py-2.5">
                      DEPLOY VECTOR EXECUTION
                    </HUDButton>
                  </div>

                </motion.div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center">
                  <Radar className="w-10 h-10 text-[#52525b] animate-pulse mb-3" />
                  <span className="text-[8.5px] text-[#52525b] font-bold uppercase tracking-wider block">
                    LOCK A RADAR TARGET VECTOR
                  </span>
                </div>
              )}
            </AnimatePresence>

          </GlassCard>

        </div>

      </div>

    </div>
  );
}
