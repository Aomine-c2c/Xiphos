"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";

export default function WarRoom() {
  const { account } = useTradingStore();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Mock Risk Stats moved from Sidebar
  const slotsUsed = 2;
  const slotsFree = 2;
  const capitalAtRisk = "$2.46 (2.46%)";
  const portfolioHealth = "EXCELLENT";

  return (
    <div className="bg-[#0E1525]/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm p-4 font-mono select-none flex flex-col justify-between h-full transition-all duration-300 hover:border-xiphos-blue/40">
      
      {/* 6-Card Grid Row */}
      <div className="grid grid-cols-6 gap-4">
        
        {/* Card 1: Equity */}
        <div className="bg-[#070B14]/60 border border-slate-900/60 p-3.5 rounded-sm flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-[#00D26A]/50 transition-colors">
          <span className="text-[16px] text-[#8e9aa8] uppercase tracking-wider font-bold z-10">
            EQUITY
          </span>
          <span className="text-3xl font-black text-white mt-1 leading-none z-10">
            ${account.equity.toFixed(2)}
          </span>
          {/* Equity SVG Area Chart with Gradient */}
          <svg viewBox="0 0 100 35" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-[50px] opacity-70 group-hover:opacity-100 transition-opacity">
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D26A" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#00D26A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 25 Q 20 18 40 22 T 70 10 L 100 5 L 100 35 L 0 35 Z"
              fill="url(#eqGrad)"
            />
            <path
              d="M 0 25 Q 20 18 40 22 T 70 10 L 100 5"
              fill="none"
              stroke="#00D26A"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Card 2: Balance */}
        <div className="bg-[#070B14]/60 border border-slate-900/60 p-3.5 rounded-sm flex flex-col justify-between h-[105px] relative overflow-hidden group hover:border-[#00D26A]/50 transition-colors">
          <span className="text-[16px] text-[#8e9aa8] uppercase tracking-wider font-bold z-10">
            BALANCE
          </span>
          <span className="text-3xl font-black text-white mt-1 leading-none z-10">
            ${account.balance.toFixed(2)}
          </span>
          {/* Balance SVG Line Chart */}
          <svg viewBox="0 0 100 35" preserveAspectRatio="none" className="absolute bottom-0 left-0 w-full h-[50px] opacity-60 group-hover:opacity-100 transition-opacity">
             <defs>
              <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D26A" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#00D26A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 30 L 25 30 L 45 20 L 65 20 L 85 12 L 100 12 L 100 35 L 0 35 Z"
              fill="url(#balGrad)"
            />
            <path
              d="M 0 30 L 25 30 L 45 20 L 65 20 L 85 12 L 100 12"
              fill="none"
              stroke="#00D26A"
              strokeWidth="1.5"
              strokeLinecap="square"
            />
          </svg>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-[#070B14]/60 border border-slate-900/60 p-3.5 rounded-sm flex flex-col justify-between h-[105px]">
          <span className="text-[16px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            NET PROFIT
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#00D26A] leading-none">
              +$27.45
            </span>
            <span className="text-[16px] text-[#00D26A] font-black leading-none bg-[#00D26A]/10 px-1 py-0.5 rounded-sm border border-[#00D26A]/20">
              +27.45%
            </span>
          </div>
          {/* Dynamic SVG Columns with Hover */}
          <div className="relative w-full h-[35px] mt-2 flex items-end justify-between px-1">
            {[10, 15, 8, 20, 12, 24, 32].map((height, i) => (
              <div 
                key={i}
                className="w-2.5 bg-[#00D26A] rounded-t-[1px] relative cursor-pointer transition-all duration-300 hover:brightness-125"
                style={{ height: `${height}px`, opacity: hoveredBar === i ? 1 : 0.6 }}
                onMouseEnter={() => setHoveredBar(i)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {hoveredBar === i && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#070B14] border border-slate-700 text-white text-[14px] font-bold px-1.5 py-0.5 rounded-sm z-50">
                    +${(height * 0.5).toFixed(1)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 4: Win Rate (Double Ring) */}
        <div className="bg-[#070B14]/60 border border-slate-900/60 p-3.5 rounded-sm flex flex-col justify-between h-[105px] items-center text-center">
          <span className="text-[16px] text-[#8e9aa8] uppercase tracking-wider font-bold w-full text-left">
            WIN RATE
          </span>
          <div className="relative w-16 h-16 flex items-center justify-center mt-1">
            <svg className="absolute w-16 h-16 transform -rotate-90">
              {/* Outer track */}
              <circle cx="32" cy="32" r="26" className="stroke-slate-900/80 fill-none" strokeWidth="4" />
              {/* Inner track */}
              <circle cx="32" cy="32" r="20" className="stroke-slate-900/40 fill-none" strokeWidth="2" />
              
              {/* Outer progress */}
              <circle
                cx="32"
                cy="32"
                r="26"
                className="stroke-[#00D26A] fill-none"
                strokeWidth="4"
                strokeDasharray={163.3}
                strokeDashoffset={163.3 - (0.74 * 163.3)}
                strokeLinecap="round"
              />
              {/* Inner accent ring */}
              <circle
                cx="32"
                cy="32"
                r="20"
                className="stroke-[#00A8FF] fill-none opacity-50"
                strokeWidth="2"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (0.74 * 125.6)}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-3xl font-black text-white z-10 leading-none">
              74%
            </span>
          </div>
        </div>

        {/* Card 5: Profit Factor */}
        <div className="bg-[#070B14]/60 border border-slate-900/60 p-3.5 rounded-sm flex flex-col justify-between h-[105px]">
          <span className="text-[16px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            PROFIT FACTOR
          </span>
          <span className="text-3xl font-black text-white mt-1 leading-none">
            2.35
          </span>
          <div className="mt-3">
            <div className="flex justify-between text-[14px] text-[#6f7e90] font-black mb-1">
              <span>GROSS LOSS: $18.20</span>
              <span>GROSS WIN: $42.77</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden flex border border-slate-800">
              <div className="h-full bg-[#FF4D4D]" style={{ width: "30%" }} />
              <div className="h-full bg-[#00A8FF]" style={{ width: "70%" }} />
            </div>
          </div>
        </div>

        {/* Card 6: Drawdown */}
        <div className="bg-[#070B14]/60 border border-slate-900/60 p-3.5 rounded-sm flex flex-col justify-between h-[105px]">
          <span className="text-[16px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            MAX DRAWDOWN
          </span>
          <span className="text-3xl font-black text-[#FF4D4D] mt-1 leading-none">
            3.12%
          </span>
          <div className="mt-3">
            <div className="flex justify-between text-[14px] text-[#6f7e90] font-black mb-1">
              <span>CURRENT</span>
              <span>LIMIT 5.0%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-sm overflow-hidden border border-slate-800">
              <div className="h-full bg-[#FF4D4D] relative" style={{ width: "62.4%" }}>
                {/* Warning Hash marks overlay */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)' }}></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Upgraded Secondary Metadata Row w/ Migrated Risk Stats */}
      <div className="bg-[#070B14]/80 border border-slate-900 rounded-sm p-3 mt-4 flex items-center justify-between text-[16px] text-[#8e9aa8] font-black tracking-wide leading-none">
        
        {/* Performance Stats */}
        <div className="flex items-center gap-6">
          <div className="flex gap-2 items-center">
            <span className="uppercase text-[#6f7e90]">TRADES:</span>
            <span className="text-white">23</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="uppercase text-[#6f7e90]">W/L:</span>
            <span className="text-white">17 / 6</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="uppercase text-[#6f7e90]">AVG WIN:</span>
            <span className="text-[#00D26A]">${(3.12).toFixed(2)}</span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="uppercase text-[#6f7e90]">AVG LOSS:</span>
            <span className="text-[#FF4D4D]">${(1.33).toFixed(2)}</span>
          </div>
        </div>

        {/* Separator */}
        <div className="h-4 w-[1px] bg-slate-800"></div>

        {/* Migrated Risk Stats */}
        <div className="flex items-center gap-6">
          <div className="flex gap-2 items-center">
            <span className="uppercase text-[#6f7e90]">SLOTS USED:</span>
            <span className="text-[#FFB020] bg-[#FFB020]/10 px-1.5 py-0.5 rounded-[1px] border border-[#FFB020]/20">
              {slotsUsed} / {slotsUsed + slotsFree}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="uppercase text-[#6f7e90]">CAPITAL RISK:</span>
            <span className="text-[#00A8FF] bg-[#00A8FF]/10 px-1.5 py-0.5 rounded-[1px] border border-[#00A8FF]/20">
              {capitalAtRisk}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            <span className="uppercase text-[#6f7e90]">PORTFOLIO HEALTH:</span>
            <span className="text-[#00D26A] bg-[#00D26A]/10 px-1.5 py-0.5 rounded-[1px] border border-[#00D26A]/20">
              {portfolioHealth}
            </span>
          </div>
          <div className="flex gap-2 items-center ml-6">
            <button 
              onClick={() => { if(window.confirm('EMERGENCY: Close ALL Positions?')) useTradingStore.getState().sendCommand('panic_close'); }} 
              className="px-3 py-1 bg-[#FF4D4D]/20 hover:bg-[#FF4D4D]/80 hover:text-white text-[#FF4D4D] border border-[#FF4D4D]/40 rounded-sm text-[16px] uppercase font-black transition-all shadow-[0_0_10px_rgba(255,77,77,0.2)] animate-pulse hover:animate-none cursor-pointer"
            >
              PANIC CLOSE
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
