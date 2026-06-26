"use client";

import React, { useState } from "react";
import { ShieldAlert, Info, X, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NodeData {
  id: string;
  name: string;
  x: number;
  y: number;
  status: string;
  direction: string;
  confidence: string;
  rank: string;
  color: string;
  glow: string;
}

export default function Battlefield() {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Nodes position coordinates inside 260x110 viewport with extended telemetry
  const nodes: NodeData[] = [
    { id: "EURUSD", name: "EURUSD", x: 130, y: 25, status: "RISK-BEARING", direction: "BUY", confidence: "92", rank: "#2", color: "#EF4444", glow: "glow-crimson" },
    { id: "GBPUSD", name: "GBPUSD", x: 210, y: 60, status: "BLOCKED", direction: "BUY", confidence: "78", rank: "#3", color: "#D4AF37", glow: "glow-gold" },
    { id: "XAUUSD", name: "XAUUSD", x: 130, y: 95, status: "RISK-FREE", direction: "BUY", confidence: "94", rank: "#1", color: "#22C55E", glow: "glow-emerald" },
    { id: "XAGUSD", name: "XAGUSD", x: 50, y: 60, status: "RISK-FREE", direction: "BUY", confidence: "72", rank: "#4", color: "#22C55E", glow: "glow-emerald" }
  ];

  // Links representing correlation strengths
  const links = [
    { source: "EURUSD", target: "GBPUSD", correlation: "92", type: "high-threat", color: "#EF4444" },
    { source: "XAUUSD", target: "XAGUSD", correlation: "89", type: "high", color: "#D4AF37" },
    { source: "EURUSD", target: "XAUUSD", correlation: "25", type: "low", color: "#4CC9F0" },
    { source: "EURUSD", target: "XAGUSD", correlation: "22", type: "low", color: "#4CC9F0" },
    { source: "GBPUSD", target: "XAUUSD", correlation: "24", type: "low", color: "#4CC9F0" },
    { source: "GBPUSD", target: "XAGUSD", correlation: "21", type: "low", color: "#4CC9F0" }
  ];

  return (
    <div className="glass-panel flex flex-col overflow-hidden font-mono select-none relative h-full justify-between transition-all duration-300">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-xiphos-cyan opacity-5 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Title Header */}
      <div className="p-3 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0 z-10">
        <span className="text-sm font-black text-xiphos-cyan uppercase tracking-widest flex items-center gap-1.5 glow-cyan">
          <Activity className="h-4 w-4" />
          MARKET COMMAND GRAPH
        </span>
        <span className="text-[10px] bg-xiphos-crimson/20 border border-xiphos-crimson/50 text-xiphos-crimson px-2 py-0.5 rounded font-black tracking-widest flex items-center gap-1 shadow-[0_0_8px_rgba(239,68,68,0.4)]">
          <ShieldAlert className="h-3 w-3" /> SECURITY GATE ACTIVE
        </span>
      </div>

      {/* SVG network topology */}
      <div className="p-2.5 flex-1 flex flex-col items-center justify-center relative min-h-0 z-10">
        
        <svg viewBox="0 0 260 120" className="w-full h-full overflow-visible">
          {/* Links rendering */}
          {links.map((link) => {
            const fromNode = nodes.find((n) => n.id === link.source)!;
            const toNode = nodes.find((n) => n.id === link.target)!;
            const isThreat = link.type === "high-threat";
            const isHigh = link.type === "high";
            const corrValue = Number.parseInt(link.correlation);
            // Dynamic edge thickness based on correlation (max ~3px, min 0.5px)
            const strokeThickness = Math.max(0.5, (corrValue / 100) * 3);

            let textColor = "#94A3B8"; // muted
            if (isThreat) textColor = "#EF4444";
            else if (isHigh) textColor = "#D4AF37";

            return (
              <g key={`${link.source}-${link.target}`}>
                <motion.line
                  initial={{ strokeDashoffset: 100 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={link.color}
                  strokeWidth={strokeThickness}
                  strokeDasharray={isThreat || isHigh ? "none" : "3,3"}
                  className={isThreat ? "animate-pulse opacity-80" : "opacity-40"}
                />
                
                <rect
                  x={(fromNode.x + toNode.x) / 2 - 12}
                  y={(fromNode.y + toNode.y) / 2 - 6}
                  width="24"
                  height="12"
                  rx="2"
                  fill="#0B0F17"
                  stroke={link.color}
                  strokeWidth="0.5"
                  className="opacity-95"
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 + 3.5}
                  textAnchor="middle"
                  fill={textColor}
                  fontSize="7.5"
                  fontWeight="black"
                  className={isThreat ? "glow-crimson" : isHigh ? "glow-gold" : ""}
                >
                  {link.correlation}%
                </text>
              </g>
            );
          })}

          {/* Nodes rendering */}
          {nodes.map((node, i) => {
            const isSelected = selectedNode?.id === node.id;
            const confValue = Number.parseInt(node.confidence);
            // Dynamic node size based on confidence (max ~18, min 10)
            const nodeRadius = Math.max(10, (confValue / 100) * 18);

            return (
              <motion.g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: i * 0.1, type: "spring" }}
              >
                {/* Node pulse effect */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius + 4}
                  fill={node.color}
                  opacity="0.1"
                  className="animate-ping"
                />

                {/* Node outer ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="#0B0F17"
                  stroke={isSelected ? "#4CC9F0" : node.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all drop-shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:stroke-xiphos-cyan"
                  style={{ filter: `drop-shadow(0 0 5px ${isSelected ? "#4CC9F0" : node.color})` }}
                />
                {/* Symbol label */}
                <text
                  x={node.x}
                  y={node.y + 3.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8"
                  fontWeight="black"
                  className={`group-hover:fill-xiphos-cyan transition-colors ${isSelected ? "glow-cyan" : ""}`}
                >
                  {node.name}
                </text>
              </motion.g>
            );
          })}
        </svg>

        {/* Selected Node Telemetry HUD Overlay */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md border border-white/10 rounded p-4 flex flex-col justify-between z-20"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-sm text-white font-black flex items-center gap-2">
                  <Info className="h-4 w-4 text-xiphos-cyan glow-cyan" />
                  HUD DATA: <span className="text-xiphos-cyan glow-cyan">{selectedNode.name}</span>
                </span>
                <button title="Close HUD"
                  onClick={() => setSelectedNode(null)}
                  className="text-xiphos-muted hover:text-white cursor-pointer transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-xiphos-muted py-2 flex-1 items-center">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest">DIRECTION</span>
                  <span className="text-white font-black">{selectedNode.direction}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest">RANK</span>
                  <span className="text-xiphos-cyan font-black glow-cyan">{selectedNode.rank}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest">CONFIDENCE</span>
                  <span className="text-xiphos-emerald font-black glow-emerald">{selectedNode.confidence}%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest">RISK STATE</span>
                  <span className={`font-bold ${selectedNode.glow}`}>{selectedNode.status}</span>
                </div>
              </div>
              <div className="text-[10px] text-xiphos-muted tracking-widest border-t border-white/5 pt-2 mt-auto text-center">
                Click assets to probe active correlation linkages.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend Area */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between text-[11px] tracking-widest text-xiphos-muted font-black bg-black/20 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-xiphos-crimson shadow-[0_0_5px_#EF4444]" />
          <span>BEARING</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-xiphos-emerald shadow-[0_0_5px_#22C55E]" />
          <span>FREE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-xiphos-gold shadow-[0_0_5px_#D4AF37]" />
          <span>BLOCKED</span>
        </div>
      </div>

    </div>
  );
}
