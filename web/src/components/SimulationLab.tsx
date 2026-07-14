"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FlaskConical, Play, Pause, FastForward, Rewind, 
  RefreshCw, TrendingUp, ShieldAlert, BrainCircuit, Activity, BarChart2
} from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";

type SimType = "REPLAY" | "FORWARD" | "MONTE_CARLO" | "STRESS" | "SCENARIO" | "TRAINING";

// Shared lab grid background component
const LabGridBackground = () => (
  <div className="absolute inset-0 pointer-events-none opacity-20">
    <div className="w-full h-full" style={{
      backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)`,
      backgroundSize: '40px 40px',
      backgroundPosition: 'center center'
    }}></div>
    {/* Scanning laser line */}
    <motion.div 
      className="w-full h-0.5 bg-gradient-to-r from-transparent via-[#a78bfa] to-transparent shadow-[0_0_8px_#a78bfa] absolute top-0"
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

export default function SimulationLab() {
  const [activeSim, setActiveSim] = useState<SimType>("MONTE_CARLO");
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [speed, setSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return p + (0.5 * speed);
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, speed, progress]);

  const handlePlayPause = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  const cycleSpeed = () => {
    const speeds = [1, 2, 5, 10];
    const currentIndex = speeds.indexOf(speed);
    setSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  const handleReset = () => {
    setProgress(0);
    setIsPlaying(false);
  };

  const navItems = [
    { id: "REPLAY", icon: Rewind, label: "HISTORICAL REPLAY" },
    { id: "FORWARD", icon: FastForward, label: "FORWARD TESTING" },
    { id: "MONTE_CARLO", icon: TrendingUp, label: "MONTE CARLO" },
    { id: "STRESS", icon: ShieldAlert, label: "STRESS TESTS" },
    { id: "SCENARIO", icon: Activity, label: "SCENARIO BUILDER" },
    { id: "TRAINING", icon: BrainCircuit, label: "AI SELF-TRAINING" },
  ];

  return (
    <div className="flex flex-col w-full h-full bg-transparent text-[#e8e8f0] font-sans overflow-hidden border-none rounded-xl relative animate-in fade-in">
      <PageHeader 
        title="SIMULATION LAB" 
        icon={FlaskConical} 
      />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative bg-[#05050a]">
        
        {/* Left Side Menu */}
        <div className="w-full lg:w-64 border-r border-[#1e1e2e] bg-[#09090e] flex flex-col z-10 shrink-0">
          <div className="p-4 border-b border-[#1e1e2e]">
            <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Test Chambers</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveSim(item.id as SimType); setProgress(0); setIsPlaying(false); }}
                className={`flex items-center gap-3 px-3 py-3 rounded text-left transition-colors font-mono cursor-pointer ${
                  activeSim === item.id 
                    ? "bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 text-[#a78bfa] shadow-[inset_0_0_10px_rgba(139,92,246,0.2)]" 
                    : "text-[#94a3b8] border border-transparent hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-widest uppercase">{item.label}</span>
              </button>
            ))}
          </div>
          
          {/* Telemetry Snapshot */}
          <div className="p-4 border-t border-[#1e1e2e] bg-[#05050a]">
            <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase block mb-3">Live Telemetry</span>
            <div className="space-y-3 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-[#52525b]">SIMULATED PNL</span>
                <span className="text-xs font-bold text-[#4ade80]">+${(1420 * (progress/100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-[#52525b]">MAX DRAWDOWN</span>
                <span className="text-xs font-bold text-[#f87171]">${(350 * (progress/100)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-[#52525b]">WIN RATE</span>
                <span className="text-xs font-bold text-[#a78bfa]">{Math.min(100, 65 + (progress/5)).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          <LabGridBackground />
          
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-8 z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeSim}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full max-w-4xl max-h-[600px] border border-[#8b5cf6]/30 bg-[#09090e]/80 backdrop-blur-md rounded-xl shadow-[0_0_30px_rgba(139,92,246,0.1)] flex flex-col overflow-hidden relative"
              >
                {/* Hologram Header */}
                <div className="p-4 border-b border-[#1e1e2e] flex justify-between items-center bg-[#000000]/50 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8b5cf6] animate-pulse"></span>
                    <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">{activeSim.replace("_", " ")} CHAMBER</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#a78bfa]">STATUS: {isPlaying ? "ACTIVE SIMULATION" : "STANDBY"}</span>
                </div>

                {/* Simulation Visualizations */}
                <div className="flex-1 relative p-6 flex items-center justify-center">
                  
                  {/* MONTE CARLO VISUALIZATION */}
                  {activeSim === "MONTE_CARLO" && (
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      {Array.from({ length: 20 }).map((_, i) => {
                        const variance = (Math.random() - 0.5) * 40;
                        const finalY = 50 - variance - 20;
                        const controlY = 50 - (variance / 2);
                        const drawLength = progress; // 0 to 100
                        
                        return (
                          <motion.path
                            key={i}
                            d={`M 0 50 Q 50 ${controlY} 100 ${finalY}`}
                            fill="none"
                            stroke={variance > 0 ? "#4ade80" : "#f87171"}
                            strokeWidth="0.5"
                            opacity="0.4"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: drawLength / 100 }}
                            transition={{ duration: 0 }} // Controlled by progress state
                          />
                        );
                      })}
                      {/* Mean Path */}
                      <motion.path
                        d={`M 0 50 Q 50 45 100 30`}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="1.5"
                        filter="drop-shadow(0 0 2px #a78bfa)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                      />
                    </svg>
                  )}

                  {/* AI SELF-TRAINING VISUALIZATION */}
                  {activeSim === "TRAINING" && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet">
                        {/* Connecting lines */}
                        <motion.path 
                          d="M 50 100 L 100 50 L 150 100 L 100 150 Z M 100 50 L 100 150 M 50 100 L 150 100" 
                          fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.3" 
                        />
                        {/* Nodes */}
                        {[[50,100], [100,50], [150,100], [100,150], [100,100]].map(([cx, cy], i) => (
                          <motion.circle 
                            key={i} cx={cx} cy={cy} r="6" fill="#09090e" stroke="#8b5cf6" strokeWidth="2"
                            animate={{ 
                              r: isPlaying ? [6, 10, 6] : 6,
                              stroke: isPlaying ? ["#8b5cf6", "#4cc9f0", "#8b5cf6"] : "#8b5cf6"
                            }}
                            transition={{ duration: 1 / speed, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </svg>
                      <div className="absolute font-mono text-center">
                        <div className="text-[10px] text-[#94a3b8] tracking-widest uppercase">EPOCHS</div>
                        <div className="text-2xl font-bold text-white">{Math.floor(progress * 150)}</div>
                      </div>
                    </div>
                  )}

                  {/* STRESS TESTS VISUALIZATION */}
                  {activeSim === "STRESS" && (
                    <div className="w-full h-full flex items-center justify-center relative">
                      {/* Radar Chart Outline */}
                      <svg viewBox="0 0 100 100" className="w-64 h-64 overflow-visible">
                        <polygon points="50,10 90,40 80,90 20,90 10,40" fill="none" stroke="#1e1e2e" strokeWidth="0.5"/>
                        <polygon points="50,20 80,45 72,80 28,80 20,45" fill="none" stroke="#1e1e2e" strokeWidth="0.5"/>
                        <polygon points="50,30 70,50 64,70 36,70 30,50" fill="none" stroke="#1e1e2e" strokeWidth="0.5"/>
                        
                        {/* Dynamic Stress Polygon mapping to progress */}
                        <motion.polygon 
                          points="50,20 80,45 72,80 28,80 20,45"
                          fill="rgba(248, 113, 113, 0.2)"
                          stroke="#f87171"
                          strokeWidth="1"
                          animate={{
                            points: isPlaying 
                              ? `50,${20 + Math.random()*20} ${80 - Math.random()*20},45 ${72 - Math.random()*10},${80 - Math.random()*20} ${28 + Math.random()*10},${80 - Math.random()*20} ${20 + Math.random()*20},45`
                              : "50,20 80,45 72,80 28,80 20,45"
                          }}
                          transition={{ duration: 0.2, repeat: Infinity, repeatType: "mirror" }}
                        />
                      </svg>
                      {isPlaying && (
                        <div className="absolute inset-0 bg-red-500/5 animate-pulse mix-blend-overlay rounded-lg pointer-events-none"></div>
                      )}
                    </div>
                  )}

                  {/* DEFAULT/FALLBACK VISUALIZATION (Bars) */}
                  {["REPLAY", "FORWARD", "SCENARIO"].includes(activeSim) && (
                    <div className="w-full h-full flex items-end gap-2 px-4 pb-4">
                      {Array.from({ length: 40 }).map((_, i) => {
                        const threshold = (i / 40) * 100;
                        const isVisible = progress > threshold;
                        const height = 20 + Math.random() * 60; // 20% to 80%
                        const isUp = Math.random() > 0.4; // slight upward bias
                        
                        return (
                          <motion.div 
                            key={i}
                            className={`flex-1 rounded-t-sm ${isUp ? 'bg-[#4ade80]' : 'bg-[#f87171]'}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ 
                              height: isVisible ? `${height}%` : "0%",
                              opacity: isVisible ? 1 : 0
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        );
                      })}
                    </div>
                  )}
                  
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Replay Control Deck */}
          <div className="h-20 border-t border-[#1e1e2e] bg-[#09090e] flex items-center px-6 gap-6 z-10 shrink-0">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button onClick={handleReset} title="Reset" className="p-2 text-[#94a3b8] hover:text-white bg-[#0f0f1a] hover:bg-[#1e1e2e] rounded transition-colors cursor-pointer border border-[#1e1e2e]">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={handlePlayPause} title="Play/Pause" className="p-3 text-black bg-[#a78bfa] hover:bg-[#8b5cf6] rounded transition-colors cursor-pointer shadow-[0_0_10px_rgba(139,92,246,0.3)]">
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              </button>
              <button onClick={cycleSpeed} title="Playback Speed" className="w-12 h-[38px] flex items-center justify-center text-[#a78bfa] hover:text-white bg-[#0f0f1a] hover:bg-[#1e1e2e] rounded transition-colors cursor-pointer border border-[#1e1e2e] font-mono text-xs font-bold">
                {speed}x
              </button>
            </div>

            {/* Scrubber Bar */}
            <div className="flex-1 flex items-center gap-4">
              <span className="text-[10px] font-mono text-[#52525b] w-8 text-right">{Math.floor(progress)}%</span>
              <div className="flex-1 h-1.5 bg-[#1e1e2e] rounded-full overflow-hidden relative cursor-pointer" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                setProgress((clickX / rect.width) * 100);
              }}>
                <div 
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#4cc9f0] absolute left-0 top-0" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] font-mono text-[#52525b] w-8 text-left">100%</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
