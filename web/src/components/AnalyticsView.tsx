"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Activity, Zap, Network, Target, Workflow, TreePine } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";

// 1. Performance DNA (Heat Map)
const PerformanceDNA = () => {
  const sequence = Array.from({ length: 144 }, () => Math.random());
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-4 h-4 text-[#a78bfa]" />
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Performance DNA</span>
      </div>
      <div className="flex-1 grid grid-cols-12 gap-1 content-start">
        {sequence.map((val, i) => {
          const isWin = val > 0.3;
          const color = isWin ? "bg-[#4ade80]" : "bg-[#f87171]";
          const opacity = isWin ? val : (1 - val) * 0.8;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity, scale: 1 }}
              transition={{ delay: i * 0.01, duration: 0.5 }}
              className={`aspect-square rounded-[2px] ${color} shadow-[0_0_8px_currentColor]`}
            />
          );
        })}
      </div>
    </div>
  );
};

// 2. Capital Flow (Animated pathways)
const CapitalFlow = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <Workflow className="w-4 h-4 text-[#4cc9f0]" />
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Capital Flow</span>
      </div>
      <div className="flex-1 relative flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="flowGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4cc9f0" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="1" />
            </linearGradient>
            <filter id="glowFlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Paths */}
          {[
            { d: "M 50 100 Q 150 50 250 40", label: "SCALPING", y: 40 },
            { d: "M 50 100 Q 150 100 250 100", label: "TREND", y: 100 },
            { d: "M 50 100 Q 150 150 250 160", label: "HEDGING", y: 160 }
          ].map((path, i) => (
            <g key={i}>
              <path d={path.d} fill="none" stroke="#1e1e2e" strokeWidth="4" />
              <motion.path
                d={path.d}
                fill="none"
                stroke="url(#flowGrad)"
                strokeWidth="2"
                strokeDasharray="10 10"
                filter="url(#glowFlow)"
                animate={{ strokeDashoffset: [20, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <circle cx="250" cy={path.y} r="6" fill="#09090e" stroke="#8b5cf6" strokeWidth="2" />
              <text x="265" y={path.y + 3} fill="#94a3b8" fontSize="8" fontFamily="monospace" fontWeight="bold">{path.label}</text>
            </g>
          ))}

          {/* Central Node */}
          <circle cx="50" cy="100" r="16" fill="#09090e" stroke="#4cc9f0" strokeWidth="3" filter="url(#glowFlow)" />
          <motion.circle 
            cx="50" cy="100" r="24" fill="none" stroke="#4cc9f0" strokeWidth="1"
            animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <text x="50" y="103" fill="#fff" fontSize="8" textAnchor="middle" fontWeight="bold">POOL</text>
        </svg>
      </div>
    </div>
  );
};

// 3. Circular Charts (Concentric HUD)
const CircularCharts = () => {
  const circles = [
    { label: "WIN RATE", value: 83.4, radius: 60, color: "#4ade80", stroke: 6 },
    { label: "PROFIT FACTOR", value: 65.0, radius: 45, color: "#f59e0b", stroke: 6 },
    { label: "EDGE CONFIDENCE", value: 92.1, radius: 30, color: "#8b5cf6", stroke: 6 }
  ];

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-[#f59e0b]" />
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">System Telemetry</span>
      </div>
      <div className="flex-1 relative flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
          <filter id="glowCircle">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {circles.map((c, i) => {
            const circumference = 2 * Math.PI * c.radius;
            const dashoffset = circumference - (c.value / 100) * circumference;
            return (
              <g key={i}>
                {/* Background track */}
                <circle cx="100" cy="100" r={c.radius} fill="none" stroke="#1e1e2e" strokeWidth={c.stroke} />
                
                {/* Progress arc */}
                <motion.circle
                  cx="100" cy="100" r={c.radius}
                  fill="none" stroke={c.color} strokeWidth={c.stroke}
                  strokeDasharray={circumference}
                  strokeLinecap="round"
                  filter="url(#glowCircle)"
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: dashoffset }}
                  transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                  transform="rotate(-90 100 100)"
                />
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute right-0 bottom-0 flex flex-col gap-2">
          {circles.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px] font-mono font-bold tracking-widest text-[#94a3b8]">
              <div className="w-2 h-2 rounded-full shadow-[0_0_5px_currentColor]" style={{ backgroundColor: c.color, color: c.color }}></div>
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 4. Strategy Relationships (Neural Graph)
const NeuralGraph = () => {
  const [nodes, setNodes] = useState<{id: number, x: number, y: number}[]>([]);
  
  useEffect(() => {
    // Generate random nodes
    const newNodes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 20 + Math.random() * 260,
      y: 20 + Math.random() * 160
    }));
    setNodes(newNodes);
  }, []);

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <Network className="w-4 h-4 text-[#8b5cf6]" />
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Neural Relationships</span>
      </div>
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
          <filter id="glowNode">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          
          {/* Lines */}
          {nodes.map((node, i) => {
            // Connect to 2 nearest neighbors
            const others = nodes.filter(n => n.id !== node.id);
            others.sort((a,b) => Math.hypot(a.x-node.x, a.y-node.y) - Math.hypot(b.x-node.x, b.y-node.y));
            const targets = others.slice(0, 2);
            
            return targets.map(t => (
              <motion.line
                key={`${node.id}-${t.id}`}
                x1={node.x} y1={node.y} x2={t.x} y2={t.y}
                stroke="#a78bfa" strokeWidth="1" opacity="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, delay: i * 0.1 }}
              />
            ));
          })}

          {/* Nodes */}
          {nodes.map((node, i) => (
            <motion.circle
              key={node.id}
              cx={node.x} cy={node.y} r={4}
              fill="#09090e" stroke="#8b5cf6" strokeWidth="2"
              filter="url(#glowNode)"
              animate={{ 
                cx: node.x + (Math.random() * 10 - 5),
                cy: node.y + (Math.random() * 10 - 5)
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

// 5. Growth Trees (Trend Networks)
const GrowthTree = () => {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center gap-2 mb-4">
        <TreePine className="w-4 h-4 text-[#4ade80]" />
        <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-widest">Trend Growth Tree</span>
      </div>
      <div className="flex-1 relative flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
          <filter id="glowTree">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>

          <g transform="translate(150, 180)">
            {/* Trunk */}
            <motion.path 
              d="M 0 0 L 0 -40" fill="none" stroke="#4ade80" strokeWidth="4" strokeLinecap="round" filter="url(#glowTree)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1 }}
            />
            {/* Branches Left */}
            <motion.path 
              d="M 0 -40 Q -30 -60 -40 -90" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" filter="url(#glowTree)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.5 }}
            />
            <motion.path 
              d="M -40 -90 Q -70 -100 -80 -130" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" filter="url(#glowTree)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1 }}
            />
            <motion.path 
              d="M -40 -90 Q -10 -110 0 -140" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" filter="url(#glowTree)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.2 }}
            />

            {/* Branches Right */}
            <motion.path 
              d="M 0 -40 Q 40 -60 50 -90" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" filter="url(#glowTree)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 0.7 }}
            />
            <motion.path 
              d="M 50 -90 Q 80 -110 90 -140" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" filter="url(#glowTree)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.4 }}
            />
            <motion.path 
              d="M 50 -90 Q 20 -120 30 -150" fill="none" stroke="#86efac" strokeWidth="2" strokeLinecap="round" filter="url(#glowTree)"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: 1.6 }}
            />
          </g>

          {/* Node pulses at tips */}
          {[
            {x: 70, y: 50, color: "#4ade80"}, {x: 150, y: 40, color: "#86efac"}, 
            {x: 240, y: 40, color: "#4ade80"}, {x: 180, y: 30, color: "#86efac"}
          ].map((pt, i) => (
            <motion.circle 
              key={i} cx={pt.x} cy={pt.y} r="3" fill={pt.color} filter="url(#glowTree)"
              initial={{ opacity: 0, scale: 0 }} animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 2 + i * 0.3 }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};


export default function AnalyticsView() {
  return (
    <GlassPanel className="flex flex-col w-full h-full font-sans select-none overflow-hidden p-0 transition-all duration-300 animate-in fade-in" noOverflowHidden>
      
      <PageHeader
        title="AI VISUAL ANALYTICS"
        icon={BarChart3}
      />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[300px]">
          
          <GlassCard className="p-6 col-span-1 border border-[#1e1e2e] shadow-2xl flex flex-col bg-[#05050a]/80 backdrop-blur-md">
            <CircularCharts />
          </GlassCard>

          <GlassCard className="p-6 col-span-1 border border-[#1e1e2e] shadow-2xl flex flex-col bg-[#05050a]/80 backdrop-blur-md">
            <CapitalFlow />
          </GlassCard>

          <GlassCard className="p-6 col-span-1 border border-[#1e1e2e] shadow-2xl flex flex-col bg-[#05050a]/80 backdrop-blur-md">
            <PerformanceDNA />
          </GlassCard>

          <GlassCard className="p-6 col-span-1 lg:col-span-2 border border-[#1e1e2e] shadow-2xl flex flex-col bg-[#05050a]/80 backdrop-blur-md">
            <NeuralGraph />
          </GlassCard>

          <GlassCard className="p-6 col-span-1 border border-[#1e1e2e] shadow-2xl flex flex-col bg-[#05050a]/80 backdrop-blur-md">
            <GrowthTree />
          </GlassCard>

        </div>
      </div>

    </GlassPanel>
  );
}
