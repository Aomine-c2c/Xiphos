"use client";

import React, { useRef, useEffect } from "react";
import React, { useRef, useEffect } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Activity, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DecisionFeed() {
  const { logs } = useTradingStore();
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLineStyle = (message: string) => {
    if (message.toLowerCase().includes("blocked") || message.toLowerCase().includes("violate")) {
      return "text-xiphos-crimson glow-crimson";
    }
    if (message.toLowerCase().includes("warn") || message.toLowerCase().includes("released")) {
      return "text-xiphos-gold glow-gold";
    }
    return "text-slate-300"; 
  };

  return (
    <div className="glass-panel w-full h-full flex flex-col overflow-hidden relative group">
      
      {/* Background glow effects */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-xiphos-emerald/5 rounded-full blur-[50px] -z-10 group-hover:bg-xiphos-emerald/10 transition-all duration-700"></div>

      {/* Header */}
      <div className="shrink-0 px-5 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex items-center justify-between relative z-10">
        <span className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
          <Terminal className="h-5 w-5 text-xiphos-emerald animate-pulse glow-emerald" />
          <span className="glow-emerald">AI DECISION FEED</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-xiphos-emerald uppercase tracking-widest glow-emerald animate-pulse">LIVE STREAM</span>
          <div className="flex gap-1 items-center">
            <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-xiphos-emerald rounded-full glow-emerald" />
            <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-xiphos-emerald rounded-full glow-emerald" />
            <motion.div animate={{ opacity: [0.2, 1, 0.2] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-xiphos-emerald rounded-full glow-emerald" />
          </div>
        </div>
      </div>

      {/* Log list */}
      <div
        ref={logContainerRef}
        className="flex-1 p-5 overflow-y-auto space-y-3 bg-[rgba(11,15,23,0.2)] text-sm leading-relaxed custom-scrollbar relative"
      >
        {/* Subtle grid lines background overlay */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none"></div>

        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full items-center justify-center text-xiphos-muted font-black tracking-widest uppercase">
              <span className="animate-pulse">AWAITING NEURAL DATA STREAM...</span>
            </motion.div>
          ) : (
            logs.slice(-5).map((log, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ duration: 0.2 }}
                key={`${log.timestamp}-${i}`} 
                className="flex flex-col gap-1 font-mono group/log transition-all hover:bg-white/5 p-3 rounded-lg -mx-2 border border-transparent hover:border-[rgba(255,255,255,0.02)] relative overflow-hidden"
              >
                {/* Simulated metadata row */}
                <div className="flex items-center gap-3 text-[8px] uppercase tracking-widest opacity-60 font-black mb-1">
                  <span className="text-xiphos-emerald glow-emerald">{log.timestamp}</span>
                  <span className="text-xiphos-muted bg-white/5 px-1 rounded">LATENCY: {Math.floor(Math.random() * 20 + 5)}ms</span>
                  <span className="text-xiphos-purple">SRC: {Math.random() > 0.5 ? "LLaMA-3" : "KRONOS-V4"}</span>
                  <span className="text-xiphos-cyan">CONF: {Math.floor(Math.random() * 20 + 80)}%</span>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className={`break-all font-medium transition-colors ${getLineStyle(log.message)}`}>
                    <span className="text-xiphos-emerald/30 mr-2">&gt;</span>{log.message}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* View Full Log Button Box */}
      <div className="shrink-0 p-4 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex justify-center">
        <button
          onClick={() => alert("Loading historical session logs...")}
          className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xiphos-muted hover:text-white text-xs font-bold tracking-widest uppercase rounded-lg transition-all duration-300 cursor-pointer backdrop-blur-md"
        >
          VIEW HISTORICAL LOGS
        </button>
      </div>
    </div>
  );
}
