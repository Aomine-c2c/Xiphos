"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Server, Database, BrainCircuit, ShieldCheck, Activity, Globe, Zap, Network, Cpu } from "lucide-react";

export default function MonitoringView() {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => p + 1);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-[#05050a] font-mono select-none overflow-hidden gap-4 animate-in fade-in">
      
      {/* Header Telemetry */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        {[
          { label: "Network Latency", value: "14ms", icon: Globe, color: "#4cc9f0" },
          { label: "Core Processing", value: "32%", icon: Cpu, color: "#8b5cf6" },
          { label: "Neural Memory", value: "88%", icon: BrainCircuit, color: "#f59e0b" },
          { label: "Firewall Integrity", value: "SECURE", icon: ShieldCheck, color: "#4ade80" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#09090e] border border-[#1e1e2e] p-4 rounded-xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] text-[#52525b] font-bold uppercase tracking-widest mb-1">{stat.label}</span>
              <span className="text-2xl font-bold text-white font-mono">{stat.value}</span>
            </div>
            <div className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${stat.color}15`, borderColor: `${stat.color}30` }}>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Server Topology Map */}
      <div className="bg-[#09090e] border border-[#1e1e2e] rounded-xl flex flex-col flex-1 overflow-hidden relative">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-[#1e1e2e] bg-[#05050a] shrink-0 z-10">
          <Network className="w-4 h-4 text-[#a78bfa]" />
          <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">Network Topology</span>
        </div>

        <div className="flex-1 relative flex items-center justify-center p-8 overflow-hidden bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
          {/* Animated SVG Data Pipeline */}
          <div className="absolute inset-0 flex items-center justify-center z-0">
            <svg width="800" height="400" viewBox="0 0 800 400" fill="none" className="overflow-visible">
              
              {/* Path 1: Market Data -> Brain */}
              <path id="path1" d="M 100 100 C 250 100 250 200 400 200" stroke="#1e1e2e" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Path 2: Liquidity -> Brain */}
              <path id="path2" d="M 100 300 C 250 300 250 200 400 200" stroke="#1e1e2e" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Path 3: Brain -> Execution */}
              <path id="path3" d="M 400 200 C 550 200 550 100 700 100" stroke="#1e1e2e" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Path 4: Brain -> Memory */}
              <path id="path4" d="M 400 200 C 550 200 550 300 700 300" stroke="#1e1e2e" strokeWidth="4" fill="none" strokeLinecap="round" />

              {/* Glowing Data Packets */}
              <circle r="4" fill="#4cc9f0" className="drop-shadow-[0_0_8px_rgba(76,201,240,0.8)]">
                <animateMotion dur="2s" repeatCount="indefinite" path="M 100 100 C 250 100 250 200 400 200" />
              </circle>
              <circle r="4" fill="#f87171" className="drop-shadow-[0_0_8px_rgba(248,113,113,0.8)]">
                <animateMotion dur="3s" repeatCount="indefinite" path="M 100 300 C 250 300 250 200 400 200" />
              </circle>
              <circle r="4" fill="#4ade80" className="drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]">
                <animateMotion dur="1.5s" repeatCount="indefinite" path="M 400 200 C 550 200 550 100 700 100" />
              </circle>
              <circle r="4" fill="#a78bfa" className="drop-shadow-[0_0_8px_rgba(167,139,250,0.8)]">
                <animateMotion dur="2.5s" repeatCount="indefinite" path="M 400 200 C 550 200 550 300 700 300" />
              </circle>
            </svg>
          </div>

          {/* Physical Nodes */}
          <div className="absolute w-[800px] h-[400px] pointer-events-none z-10 flex items-center justify-between">
            
            {/* Input Nodes (Left) */}
            <div className="flex flex-col h-full justify-between py-10 w-48">
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 10px rgba(76,201,240,0.2)", "0 0 25px rgba(76,201,240,0.6)", "0 0 10px rgba(76,201,240,0.2)"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-[#0f0f1a] border-2 border-[#4cc9f0] flex items-center justify-center pointer-events-auto"
                >
                  <Activity className="w-8 h-8 text-[#4cc9f0]" />
                </motion.div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest block">Market Feeds</span>
                  <span className="text-[8px] text-[#4cc9f0] font-mono">1.2 TB/s</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 10px rgba(248,113,113,0.2)", "0 0 25px rgba(248,113,113,0.6)", "0 0 10px rgba(248,113,113,0.2)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-[#0f0f1a] border-2 border-[#f87171] flex items-center justify-center pointer-events-auto"
                >
                  <Database className="w-8 h-8 text-[#f87171]" />
                </motion.div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest block">Liquidity Pools</span>
                  <span className="text-[8px] text-[#f87171] font-mono">Connected</span>
                </div>
              </div>
            </div>

            {/* Core Node (Center) */}
            <div className="flex flex-col items-center gap-3 w-48 relative -top-1">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 w-32 h-32 m-auto rounded-full border border-dashed border-[#8b5cf6]/30 pointer-events-none"
              />
              <motion.div 
                animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 20px rgba(139,92,246,0.3)", "0 0 40px rgba(139,92,246,0.8)", "0 0 20px rgba(139,92,246,0.3)"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-24 h-24 rounded-full bg-[#05050a] border-[3px] border-[#8b5cf6] flex items-center justify-center relative z-10 pointer-events-auto"
              >
                <BrainCircuit className="w-10 h-10 text-[#8b5cf6]" />
              </motion.div>
              <div className="text-center mt-4">
                <span className="text-xs font-black text-white uppercase tracking-widest block">Mahoraga Core</span>
                <span className="text-[10px] text-[#8b5cf6] font-mono">Neural Ops Active</span>
              </div>
            </div>

            {/* Output Nodes (Right) */}
            <div className="flex flex-col h-full justify-between py-10 w-48">
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 10px rgba(74,222,128,0.2)", "0 0 25px rgba(74,222,128,0.6)", "0 0 10px rgba(74,222,128,0.2)"] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-[#0f0f1a] border-2 border-[#4ade80] flex items-center justify-center pointer-events-auto"
                >
                  <Zap className="w-8 h-8 text-[#4ade80]" />
                </motion.div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest block">Execution Engine</span>
                  <span className="text-[8px] text-[#4ade80] font-mono">0.4ms latency</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 10px rgba(167,139,250,0.2)", "0 0 25px rgba(167,139,250,0.6)", "0 0 10px rgba(167,139,250,0.2)"] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="w-16 h-16 rounded-2xl bg-[#0f0f1a] border-2 border-[#a78bfa] flex items-center justify-center pointer-events-auto"
                >
                  <Server className="w-8 h-8 text-[#a78bfa]" />
                </motion.div>
                <div className="text-center">
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest block">Redis Cache</span>
                  <span className="text-[8px] text-[#a78bfa] font-mono">Syncing</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
// Cpu definition dummy fix: added import to the top
