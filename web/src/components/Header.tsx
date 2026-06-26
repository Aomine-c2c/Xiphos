"use client";

import React, { useEffect, useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Radio, Activity, Cpu, Database, ShieldCheck, Bell } from "lucide-react";

export default function Header() {
  const {
    apiLatency,
    connectWebSocket
  } = useTradingStore();

  const [time, setTime] = useState("2025-05-20 14:30:00");

  useEffect(() => {
    connectWebSocket();
    const baseline = new Date("2025-05-20T14:30:00");
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const current = new Date(baseline.getTime() + elapsed);
      
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const hh = String(current.getHours()).padStart(2, '0');
      const min = String(current.getMinutes()).padStart(2, '0');
      const ss = String(current.getSeconds()).padStart(2, '0');
      
      setTime(`${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [connectWebSocket]);

  return (
    <header className="h-[64px] bg-[rgba(11,15,23,0.6)] backdrop-blur-md border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between px-6 select-none relative z-10 shrink-0">
      
      {/* Left: Breadcrumbs / System Info */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-xiphos-purple glow-purple" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-xiphos-muted font-bold tracking-wider uppercase">AI Core Model</span>
            <span className="text-sm text-white font-semibold tracking-wide mt-1">Vincent-7B (Local)</span>
          </div>
        </div>
        <div className="h-6 w-px bg-[rgba(255,255,255,0.1)]"></div>
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-xiphos-cyan glow-cyan" />
          <div className="flex flex-col leading-none">
            <span className="text-[10px] text-xiphos-muted font-bold tracking-wider uppercase">Market Data Stream</span>
            <span className="text-sm text-white font-semibold tracking-wide mt-1">LMAX Tier-1</span>
          </div>
        </div>
      </div>

      {/* Center: Global Status Indicators */}
      <div className="flex items-center gap-8 bg-[rgba(14,21,37,0.5)] px-6 py-2 rounded-full border border-[rgba(255,255,255,0.05)]">
        
        {/* System Status */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-xiphos-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-xiphos-emerald glow-emerald"></span>
          </span>
          <span className="text-xs text-xiphos-emerald font-bold tracking-widest uppercase">System Active</span>
        </div>

        {/* Neural Network Status */}
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-xiphos-purple" />
          <span className="text-xs text-xiphos-muted font-bold tracking-widest uppercase">NN: <span className="text-white glow-purple">OPTIMAL</span></span>
        </div>

        {/* Latency */}
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-xiphos-cyan" />
          <span className="text-xs text-xiphos-muted font-bold tracking-widest uppercase">Ping: <span className="text-white">{apiLatency}ms</span></span>
        </div>
      </div>

      {/* Right: Security & Time */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-xiphos-muted hover:text-white transition-colors cursor-pointer">
          <ShieldCheck className="w-5 h-5 text-xiphos-emerald glow-emerald" />
          <span className="text-xs font-bold tracking-wider uppercase">Risk Guard ON</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors">
            <Bell className="w-5 h-5 text-xiphos-muted hover:text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-xiphos-crimson glow-crimson"></span>
          </button>
          <div className="flex flex-col text-right leading-none border-l border-[rgba(255,255,255,0.1)] pl-4">
            <span className="text-[10px] text-xiphos-muted font-bold tracking-wider uppercase">Server Time (UTC)</span>
            <span className="text-sm text-white font-mono font-bold mt-1">{time}</span>
          </div>
        </div>
      </div>

    </header>
  );
}
