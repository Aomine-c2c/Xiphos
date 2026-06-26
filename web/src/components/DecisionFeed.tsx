"use client";

import React, { useRef, useEffect } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Activity } from "lucide-react";

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
      <div className="shrink-0 px-5 py-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex items-center justify-between">
        <span className="text-lg font-bold text-white uppercase tracking-widest flex items-center gap-3">
          <Activity className="h-5 w-5 text-xiphos-emerald animate-pulse glow-emerald" />
          <span className="glow-emerald">AI DECISION FEED</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-xiphos-emerald uppercase tracking-widest glow-emerald animate-pulse">STREAMING</span>
          <div className="flex gap-1 items-center">
            <div className="w-1.5 h-1.5 bg-xiphos-emerald rounded-full animate-bounce glow-emerald" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-xiphos-emerald rounded-full animate-bounce glow-emerald" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-xiphos-emerald rounded-full animate-bounce glow-emerald" style={{ animationDelay: '300ms' }} />
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

        {logs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-xiphos-muted font-bold tracking-widest uppercase">
            <span className="animate-pulse">WAITING FOR DATA STREAM...</span>
          </div>
        ) : (
          logs.slice(-5).map((log, i) => (
            <div key={`${log.timestamp}-${i}`} className="flex gap-4 items-start font-mono group/log transition-all hover:bg-white/5 p-2 rounded-lg -mx-2">
              <span className="text-xiphos-emerald/50 font-bold shrink-0">{log.timestamp}</span>
              <span className={`break-all font-medium transition-colors ${getLineStyle(log.message)}`}>
                <span className="text-xiphos-emerald/30 mr-2">&gt;</span>{log.message}
              </span>
            </div>
          ))
        )}
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
