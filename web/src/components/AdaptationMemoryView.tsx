"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, GitBranch, Crosshair, TrendingUp, AlertTriangle, 
  BrainCircuit, Zap, X, Code, Clock
} from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";

// Types
export type EventType = "Pattern Learned" | "Parameter Updated" | "Strategy Rejected" | "Risk Increased" | "Model Improved" | "Confidence Increased";

export interface MemoryNode {
  id: string;
  type: EventType;
  title: string;
  timestamp: string;
  branch: number; // For vertical positioning (git-style)
  details: {
    logic: string;
    metrics: string;
    impact: string;
  };
}

// Generate deterministic mock nodes
const generateMockNodes = (count: number): MemoryNode[] => {
  const types: EventType[] = ["Pattern Learned", "Parameter Updated", "Strategy Rejected", "Risk Increased", "Model Improved", "Confidence Increased"];
  const titles = [
    "Detected inverse correlation in JPY pairs",
    "Adjusted trailing stop threshold to 1.2%",
    "Rejected mean-reversion on TSLA (high volume)",
    "Increased exposure limit due to VIX drop",
    "Reduced latency in feature extraction",
    "Win-rate stability verified over 10k ticks"
  ];
  
  const nodes: MemoryNode[] = [];
  let currentBranch = 0;

  for (let i = 0; i < count; i++) {
    // Semi-random branch logic to make a tree shape
    if (i % 5 === 0) currentBranch = Math.floor(Math.random() * 3);
    else if (i % 3 === 0) currentBranch = 0;

    const typeIdx = i % types.length;
    nodes.push({
      id: `node-${1000 + i}`,
      type: types[typeIdx],
      title: titles[typeIdx] + ` #${i}`,
      timestamp: `2026-07-${14 - Math.floor(i / 10)}T${String(10 + (i % 12)).padStart(2, '0')}:${String((i * 13) % 60).padStart(2, '0')}:00Z`,
      branch: currentBranch,
      details: {
        logic: `if (volumeDelta > ${100 + i}) {\n  executeAdaptation();\n}`,
        metrics: `Delta: +${(Math.random() * 5).toFixed(2)}%\nConfidence: ${(80 + Math.random() * 15).toFixed(1)}%`,
        impact: "System stability improved. Edge increased."
      }
    });
  }
  return nodes;
};

const MOCK_DATA = generateMockNodes(150);

// Colors by event type
const getTypeColor = (type: EventType) => {
  switch (type) {
    case "Pattern Learned": return "#a78bfa"; // Purple
    case "Parameter Updated": return "#4cc9f0"; // Cyan
    case "Strategy Rejected": return "#f59e0b"; // Orange
    case "Risk Increased": return "#f87171"; // Red
    case "Model Improved": return "#4ade80"; // Green
    case "Confidence Increased": return "#fbbf24"; // Yellow
    default: return "#94a3b8"; // Slate
  }
};

const getTypeIcon = (type: EventType, className: string) => {
  switch (type) {
    case "Pattern Learned": return <BrainCircuit className={className} />;
    case "Parameter Updated": return <Code className={className} />;
    case "Strategy Rejected": return <X className={className} />;
    case "Risk Increased": return <AlertTriangle className={className} />;
    case "Model Improved": return <TrendingUp className={className} />;
    case "Confidence Increased": return <Zap className={className} />;
    default: return <Crosshair className={className} />;
  }
};

export default function AdaptationMemoryView() {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<EventType | "All">("All");
  const [selectedNode, setSelectedNode] = useState<MemoryNode | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Drag to scroll logic
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Wire to Zustand
  // In a real scenario, map store AdaptationNodes to MemoryNodes
  const rawNodes = useTradingStore(state => state.adaptationNodes);
  const nodes = rawNodes.length > 0 ? (rawNodes as unknown as MemoryNode[]) : MOCK_DATA;

  // Filter nodes
  const filteredNodes = nodes.filter(node => {
    const matchesSearch = node.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "All" || node.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll-fast
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };



  // Calculate layout coordinates
  const nodeWidth = 200;
  const nodeGap = 60;
  const branchHeight = 120;
  const trackHeight = 400; // Total height of the timeline track

  return (
    <div className="flex flex-col w-full h-full bg-[#05050a] text-sm overflow-hidden select-none animate-in fade-in">
      
      {/* Top Control Bar */}
      <div className="h-16 bg-[#09090e] border-b border-[#1e1e2e] flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-[#8b5cf6]" />
            <span className="font-bold tracking-widest text-white uppercase">Adaptation Memory</span>
          </div>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
            <input 
              type="text" 
              placeholder="Search memory graph..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#1e1e2e] rounded-full text-white text-xs px-9 py-2 focus:outline-none focus:border-[#8b5cf6] transition-colors"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setActiveFilter("All")}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === "All" ? "bg-[#1e1e2e] text-white" : "text-[#52525b] hover:text-[#94a3b8]"
            }`}
          >
            All Events
          </button>
          {(["Pattern Learned", "Parameter Updated", "Strategy Rejected", "Risk Increased", "Model Improved", "Confidence Increased"] as EventType[]).map(type => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors border"
              style={{
                borderColor: activeFilter === type ? getTypeColor(type) : "transparent",
                backgroundColor: activeFilter === type ? `${getTypeColor(type)}15` : "transparent",
                color: activeFilter === type ? getTypeColor(type) : "#52525b"
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Horizontal Timeline Track */}
        <div 
          ref={scrollRef}
          className={`flex-1 relative overflow-x-auto overflow-y-hidden ${isDragging ? "cursor-grabbing" : "cursor-grab"} hide-scrollbar`}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
        >
          {/* Canvas bounds */}
          <div 
            className="absolute top-0 bottom-0 flex items-center"
            style={{ width: `${filteredNodes.length * (nodeWidth + nodeGap) + 400}px` }}
          >
            {/* SVG Connections (Git-style tree) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minHeight: trackHeight }}>
              {filteredNodes.map((node, i) => {
                if (i === 0) return null; // No line to the left of the first node
                const prevNode = filteredNodes[i - 1];
                
                const startX = (i - 1) * (nodeWidth + nodeGap) + (nodeWidth / 2) + 50;
                const startY = (trackHeight / 2) + (prevNode.branch * branchHeight) - branchHeight;
                
                const endX = i * (nodeWidth + nodeGap) + (nodeWidth / 2) + 50;
                const endY = (trackHeight / 2) + (node.branch * branchHeight) - branchHeight;

                // Bezier curve for smooth branch connecting
                const controlX1 = startX + (nodeGap / 2) + 50;
                const controlX2 = endX - (nodeGap / 2) - 50;

                return (
                  <path
                    key={`link-${node.id}`}
                    d={`M ${startX} ${startY} C ${controlX1} ${startY}, ${controlX2} ${endY}, ${endX} ${endY}`}
                    fill="none"
                    stroke={getTypeColor(node.type)}
                    strokeWidth="2"
                    strokeOpacity="0.3"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {filteredNodes.map((node, i) => {
              const xPos = i * (nodeWidth + nodeGap) + 50;
              const yPos = (trackHeight / 2) + (node.branch * branchHeight) - branchHeight;
              
              const color = getTypeColor(node.type);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div
                  key={node.id}
                  className="absolute transform -translate-y-1/2 transition-all duration-300"
                  style={{ left: `${xPos}px`, top: `${yPos}px`, width: `${nodeWidth}px` }}
                >
                  <div 
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent drag from triggering select if we don't want to
                      if (!isDragging) setSelectedNode(node);
                    }}
                    className={`
                      relative p-3 rounded-lg border backdrop-blur-md transition-all 
                      ${isSelected ? 'shadow-[0_0_20px_rgba(0,0,0,0.8)] z-20' : 'hover:scale-105 hover:shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10'}
                    `}
                    style={{ 
                      borderColor: isSelected ? color : `${color}40`,
                      backgroundColor: isSelected ? `${color}15` : '#0f0f1a'
                    }}
                  >
                    {/* Node Dot Indicator */}
                    <div 
                      className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-[#0f0f1a]"
                      style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
                    />
                    
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeIcon(node.type, "w-4 h-4")}
                      <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{node.type}</span>
                    </div>
                    
                    <h3 className={`text-xs font-bold leading-tight mb-2 ${isSelected ? 'text-white' : 'text-[#94a3b8]'}`}>
                      {node.title}
                    </h3>
                    
                    <div className="flex items-center gap-1 text-[9px] text-[#52525b]">
                      <Clock className="w-3 h-3" />
                      {new Date(node.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel (Node Details) */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-[400px] h-full bg-[#09090e] border-l border-[#1e1e2e] shrink-0 flex flex-col z-30"
            >
              <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between bg-gradient-to-r from-[#09090e] to-transparent"
                   style={{ borderLeft: `4px solid ${getTypeColor(selectedNode.type)}` }}>
                <h3 className="text-sm font-bold text-white tracking-widest uppercase">Node Details</h3>
                <button 
                  onClick={() => setSelectedNode(null)}
                  className="p-1 hover:bg-[#1e1e2e] rounded text-[#52525b] hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-[#94a3b8]">
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {getTypeIcon(selectedNode.type, "w-5 h-5")}
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: getTypeColor(selectedNode.type) }}>
                      {selectedNode.type}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-white leading-tight">
                    {selectedNode.title}
                  </h1>
                  <div className="flex items-center gap-2 text-xs text-[#52525b] mt-3">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedNode.timestamp).toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#52525b] mt-1">
                    <GitBranch className="w-3 h-3" />
                    Branch ID: {selectedNode.branch} • Hash: {selectedNode.id}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-2">Executed Logic</h4>
                  <div className="bg-[#05050a] border border-[#1e1e2e] rounded-lg p-4 font-mono text-xs text-[#4ade80] whitespace-pre">
                    {selectedNode.details.logic}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-2">Telemetry Metrics</h4>
                  <div className="bg-[#05050a] border border-[#1e1e2e] rounded-lg p-4 font-mono text-xs text-[#4cc9f0] whitespace-pre">
                    {selectedNode.details.metrics}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-2">System Impact</h4>
                  <div className="p-4 border-l-2 border-[#8b5cf6] bg-[#8b5cf6]/5 text-white text-sm">
                    {selectedNode.details.impact}
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
