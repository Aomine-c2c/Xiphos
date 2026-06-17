"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { ShieldAlert, Info, X } from "lucide-react";

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
}

export default function Battlefield() {
  const { positions } = useTradingStore();
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);

  // Nodes position coordinates inside 260x110 viewport with extended telemetry
  const nodes: NodeData[] = [
    { id: "EURUSD", name: "EURUSD", x: 130, y: 20, status: "RISK-BEARING", direction: "BUY", confidence: "92", rank: "#2", color: "#FF4D4D" },
    { id: "GBPUSD", name: "GBPUSD", x: 210, y: 55, status: "BLOCKED", direction: "BUY", confidence: "78", rank: "#3", color: "#FFB020" },
    { id: "XAUUSD", name: "XAUUSD", x: 130, y: 90, status: "RISK-FREE", direction: "BUY", confidence: "94", rank: "#1", color: "#00D26A" },
    { id: "XAGUSD", name: "XAGUSD", x: 50, y: 55, status: "RISK-FREE", direction: "BUY", confidence: "72", rank: "#4", color: "#00D26A" }
  ];

  // Links representing correlation strengths
  const links = [
    { source: "EURUSD", target: "GBPUSD", correlation: "92", type: "high-threat", color: "#FF4D4D" },
    { source: "XAUUSD", target: "XAGUSD", correlation: "89", type: "high", color: "#FFB020" },
    { source: "EURUSD", target: "XAUUSD", correlation: "25", type: "low", color: "#425062" },
    { source: "EURUSD", target: "XAGUSD", correlation: "22", type: "low", color: "#425062" },
    { source: "GBPUSD", target: "XAUUSD", correlation: "24", type: "low", color: "#425062" },
    { source: "GBPUSD", target: "XAGUSD", correlation: "21", type: "low", color: "#425062" }
  ];

  return (
    <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden font-mono select-none relative h-full justify-between">
      
      {/* Title Header */}
      <div className="p-2.5 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40 flex-shrink-0">
        <span className="text-[14px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
          MARKET COMMAND GRAPH
        </span>
        <span className="text-[9px] bg-red-950/20 border border-red-900/50 text-[#FF4D4D] px-1.5 py-0.5 rounded-sm font-bold flex items-center gap-1">
          <ShieldAlert className="h-3 w-3" /> SECURITY GATE ACTIVE
        </span>
      </div>

      {/* SVG network topology */}
      <div className="p-2.5 flex-1 flex flex-col items-center justify-center bg-[#070B14]/30 relative min-h-0">
        
        <svg viewBox="0 0 260 110" className="w-full max-w-[280px] h-[110px] overflow-visible">
          {/* Links rendering */}
          {links.map((link, idx) => {
            const fromNode = nodes.find((n) => n.id === link.source)!;
            const toNode = nodes.find((n) => n.id === link.target)!;
            const isThreat = link.type === "high-threat";
            const isHigh = link.type === "high";
            const corrValue = parseInt(link.correlation);
            // Dynamic edge thickness based on correlation (max ~3px, min 0.5px)
            const strokeThickness = Math.max(0.5, (corrValue / 100) * 3);

            return (
              <g key={idx}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={link.color}
                  strokeWidth={strokeThickness}
                  strokeDasharray={isThreat || isHigh ? "none" : "3,3"}
                  className={isThreat ? "animate-pulse" : ""}
                />
                
                <rect
                  x={(fromNode.x + toNode.x) / 2 - 12}
                  y={(fromNode.y + toNode.y) / 2 - 6}
                  width="24"
                  height="12"
                  rx="2"
                  fill="#070B14"
                  stroke={link.color}
                  strokeWidth="0.5"
                  className="opacity-95"
                />
                <text
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 + 3.5}
                  textAnchor="middle"
                  fill={isThreat ? "#FF4D4D" : isHigh ? "#FFB020" : "#6f7e90"}
                  fontSize="7.5"
                  fontWeight="black"
                >
                  {link.correlation}%
                </text>
              </g>
            );
          })}

          {/* Nodes rendering */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const confValue = parseInt(node.confidence);
            // Dynamic node size based on confidence (max ~18, min 10)
            const nodeRadius = Math.max(10, (confValue / 100) * 18);

            return (
              <g
                key={node.id}
                onClick={() => setSelectedNode(node)}
                className="cursor-pointer group"
              >
                {/* Node outer ring */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={nodeRadius}
                  fill="#0E1525"
                  stroke={isSelected ? "#00A8FF" : node.color}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className="transition-all"
                />
                {/* Symbol label */}
                <text
                  x={node.x}
                  y={node.y + 3.5}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="8"
                  fontWeight="black"
                  className="group-hover:fill-xiphos-blue transition-colors"
                >
                  {node.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Telemetry HUD Overlay */}
        {selectedNode && (
          <div className="absolute inset-0 bg-[#070b14]/95 border border-slate-900 rounded-sm p-2 flex flex-col justify-between z-10">
            <div className="flex items-center justify-between border-b border-slate-950 pb-1.5">
              <span className="text-[11px] text-white font-black flex items-center gap-1">
                <Info className="h-3.5 w-3.5 text-xiphos-blue" />
                HUD DATA: {selectedNode.name}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-white cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[9.5px] text-[#8e9aa8] py-1">
              <div>
                DIRECTION: <span className="text-white font-black">{selectedNode.direction}</span>
              </div>
              <div>
                RANK: <span className="text-xiphos-blue font-black">{selectedNode.rank}</span>
              </div>
              <div>
                CONFIDENCE: <span className="text-[#00D26A] font-black">{selectedNode.confidence}%</span>
              </div>
              <div>
                RISK STATE: <span className="text-white font-bold">{selectedNode.status}</span>
              </div>
            </div>
            <div className="text-[8px] text-[#6f7e90]">
              Click assets to probe active correlation linkages.
            </div>
          </div>
        )}
      </div>

      {/* Legend Area */}
      <div className="p-3 border-t border-slate-950 flex items-center justify-between text-[10px] text-[#6f7e90] font-black bg-[#0E1525] flex-shrink-0">
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D4D]" />
          <span>BEARING</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00D26A]" />
          <span>FREE</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFB020]" />
          <span>BLOCKED</span>
        </div>
      </div>

    </div>
  );
}
