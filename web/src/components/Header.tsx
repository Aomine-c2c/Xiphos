"use client";

import React, { useEffect, useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Radio, Activity } from "lucide-react";

export default function Header() {
  const {
    apiLatency,
    connectWebSocket
  } = useTradingStore();

  const [time, setTime] = useState("2025-05-20 14:30:00");

  useEffect(() => {
    connectWebSocket();
    // In demo mode we freeze the time to match the exact mockup server time,
    // or let it tick relative to it. Let's let it run from the mockup baseline.
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
    <header className="h-[56px] bg-[#070B14]/70 backdrop-blur-md border-b border-xiphos-blue/30 shadow-[0_0_15px_rgba(0,168,255,0.15)] flex items-center justify-between px-4 select-none font-mono relative z-50">
      
      {/* Left Title & Cyborg Logo */}
      <div className="flex items-center gap-3">
        {/* Custom Cyborg Head SVG Logo */}
        <div className="h-8 w-8 text-xiphos-blue shrink-0">
          <svg viewBox="0 0 24 24" className="w-full h-full fill-current">
            <path d="M12 2C6.48 2 2 6.48 2 12c0 3.06 1.38 5.8 3.56 7.66L7 16.5c-1.25-1.07-2-2.7-2-4.5 0-3.31 2.69-6 6-6s6 2.69 6 6c0 1.8-.75 3.43-2 4.5l1.44 3.16C18.62 17.8 20 15.06 20 12c0-5.52-4.48-10-10-10zm0 6c-2.21 0-4 1.79-4 4 0 1.2.53 2.27 1.37 3L11 12.5v-2.5h2v2.5l1.63 2.5c.84-.73 1.37-1.8 1.37-3 0-2.21-1.79-4-4-4z" />
            <path d="M12 12c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1zm-3.5 6.5l.8-1.5c-.8-.5-1.3-1.4-1.3-2.5 0-1.7 1.3-3 3-3s3 1.3 3 3c0 1.1-.5 2-1.3 2.5l.8 1.5c1.2-.7 2-2.1 2-3.6 0-2.5-2-4.5-4.5-4.5S7.5 12.4 7.5 14.9c0 1.5.8 2.9 2 3.6z" />
          </svg>
        </div>
        <div className="flex flex-col leading-none">
          <span className="text-3xl font-black text-white tracking-widest">XIPHOS</span>
          <span className="text-[14px] text-xiphos-blue font-bold tracking-widest mt-0.5">AI TRADING COMMAND CENTER</span>
        </div>
      </div>

      {/* Center Metrics & Status Badges */}
      <div className="flex items-center gap-6 text-[16px] text-xiphos-muted">
        
        {/* System Status */}
        <div className="flex flex-col items-center">
          <span className="text-[14px] text-slate-500 font-bold">SYSTEM STATUS</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-xiphos-green animate-pulse" />
            <span className="text-xiphos-green font-bold uppercase">ACTIVE</span>
          </div>
        </div>

        {/* Market Scan */}
        <div className="flex flex-col items-center">
          <span className="text-[14px] text-slate-500 font-bold">MARKET SCAN</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Activity className="h-3 w-3 text-xiphos-green" />
            <span className="text-xiphos-green font-bold uppercase">RUNNING</span>
          </div>
        </div>

        {/* Ping */}
        <div className="flex flex-col items-center">
          <span className="text-[14px] text-slate-500 font-bold">PING</span>
          <div className="flex items-center gap-1 mt-0.5">
            <Radio className="h-3 w-3 text-xiphos-green" />
            <span className="text-xiphos-green font-bold">{apiLatency} ms</span>
          </div>
        </div>

        {/* Broker */}
        <div className="flex flex-col">
          <span className="text-[14px] text-slate-500 font-bold">BROKER</span>
          <span className="text-white font-bold mt-0.5">Deriv MT5</span>
        </div>

        {/* Server Time */}
        <div className="flex flex-col">
          <span className="text-[14px] text-slate-500 font-bold">SERVER TIME</span>
          <span className="text-white font-bold mt-0.5">{time}</span>
        </div>

        {/* Timeframe */}
        <div className="flex flex-col">
          <span className="text-[14px] text-slate-500 font-bold">TIMEFRAME</span>
          <span className="text-white font-bold mt-0.5">M30</span>
        </div>

      </div>

      {/* Right Core Details */}
      <div className="flex items-center gap-4 text-right">
        <div className="flex flex-col">
          <span className="text-[16px] text-xiphos-blue font-bold tracking-wider leading-none">XIPHOS CORE v2.1.0</span>
          <span className="text-[14px] text-slate-500 font-bold leading-none mt-0.5">Build: 2025.05.20</span>
        </div>
      </div>

    </header>
  );
}
