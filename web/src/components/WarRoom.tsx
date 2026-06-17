"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";

export default function WarRoom() {
  const { account } = useTradingStore();

  return (
    <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm p-5 font-mono select-none">
      
      {/* 6-Card Grid Row */}
      <div className="grid grid-cols-6 gap-4.5">
        
        {/* Card 1: Equity */}
        <div className="bg-[#070B14]/40 border border-slate-950 p-3.5 rounded-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-[10px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            EQUITY
          </span>
          <span className="text-lg font-black text-white mt-1.5 leading-none">
            ${account.equity.toFixed(2)}
          </span>
          {/* Equity SVG Area Chart */}
          <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-full h-6.5 mt-2">
            <defs>
              <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00D26A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#00D26A" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 22 Q 25 15 50 18 T 100 4 L 100 28 L 0 28 Z"
              fill="url(#eqGrad)"
            />
            <path
              d="M 0 22 Q 25 15 50 18 T 100 4"
              fill="none"
              stroke="#00D26A"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        {/* Card 2: Balance */}
        <div className="bg-[#070B14]/40 border border-slate-950 p-3.5 rounded-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-[10px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            BALANCE
          </span>
          <span className="text-lg font-black text-white mt-1.5 leading-none">
            ${account.balance.toFixed(2)}
          </span>
          {/* Balance SVG Line Chart */}
          <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-full h-6.5 mt-2">
            <path
              d="M 0 22 L 20 22 L 40 15 L 60 15 L 80 8 L 100 8"
              fill="none"
              stroke="#00D26A"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Card 3: Net Profit */}
        <div className="bg-[#070B14]/40 border border-slate-950 p-3.5 rounded-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-[10px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            NET PROFIT
          </span>
          <div className="flex flex-col mt-1.5">
            <span className="text-lg font-black text-[#00D26A]">
              +$27.45
            </span>
            <span className="text-[9px] text-[#00D26A] font-black mt-1 leading-none">
              +27.45%
            </span>
          </div>
          {/* Net Profit SVG Columns */}
          <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-full h-5 mt-2">
            <rect x="2" y="18" width="8" height="10" fill="#00D26A" opacity="0.8" rx="0.5" />
            <rect x="16" y="14" width="8" height="14" fill="#00D26A" opacity="0.8" rx="0.5" />
            <rect x="30" y="20" width="8" height="8" fill="#00D26A" opacity="0.8" rx="0.5" />
            <rect x="44" y="10" width="8" height="18" fill="#00D26A" opacity="0.8" rx="0.5" />
            <rect x="58" y="15" width="8" height="13" fill="#00D26A" opacity="0.8" rx="0.5" />
            <rect x="72" y="8" width="8" height="20" fill="#00D26A" opacity="0.8" rx="0.5" />
            <rect x="86" y="2" width="8" height="26" fill="#00D26A" opacity="0.8" rx="0.5" />
          </svg>
        </div>

        {/* Card 4: Win Rate */}
        <div className="bg-[#070B14]/40 border border-slate-950 p-3.5 rounded-sm flex flex-col justify-between min-h-[105px] items-center text-center">
          <span className="text-[10px] text-[#8e9aa8] uppercase tracking-wider font-bold w-full text-left">
            WIN RATE
          </span>
          {/* Circular Progress gauge */}
          <div className="relative w-14 h-14 flex items-center justify-center mt-2">
            <svg className="absolute w-14 h-14 transform -rotate-90">
              <circle cx="28" cy="28" r="22" className="stroke-slate-950 fill-none" strokeWidth="4" />
              <circle
                cx="28"
                cy="28"
                r="22"
                className="stroke-[#00D26A] fill-none"
                strokeWidth="4"
                strokeDasharray={138}
                strokeDashoffset={138 - (0.74 * 138)}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[11px] font-black text-white z-10 leading-none">
              74%
            </span>
          </div>
        </div>

        {/* Card 5: Profit Factor */}
        <div className="bg-[#070B14]/40 border border-slate-950 p-3.5 rounded-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-[10px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            PROFIT FACTOR
          </span>
          <span className="text-lg font-black text-white mt-1.5">
            2.35
          </span>
          <div className="w-full h-1.5 bg-slate-950 rounded-sm overflow-hidden mt-3 mb-1 border border-slate-900/60">
            <div className="h-full bg-[#00A8FF]" style={{ width: "70%" }} />
          </div>
        </div>

        {/* Card 6: Drawdown */}
        <div className="bg-[#070B14]/40 border border-slate-950 p-3.5 rounded-sm flex flex-col justify-between min-h-[105px]">
          <span className="text-[10px] text-[#8e9aa8] uppercase tracking-wider font-bold">
            MAX DRAWDOWN
          </span>
          <span className="text-lg font-black text-[#FF4D4D] mt-1.5">
            3.12%
          </span>
          <div className="w-full h-1.5 bg-slate-950 rounded-sm overflow-hidden mt-3 mb-1 border border-slate-900/60">
            <div className="h-full bg-[#FF4D4D]" style={{ width: "31.2%" }} />
          </div>
        </div>

      </div>

      {/* Aligned Secondary Metadata Row */}
      <div className="grid grid-cols-6 gap-4.5 mt-4 pt-3.5 border-t border-slate-950 text-[11px] text-[#8e9aa8] leading-none">
        <div className="flex justify-between items-center pr-2">
          <span className="uppercase text-[9px] font-black">TOTAL TRADES</span>
          <span className="text-white font-black">23</span>
        </div>
        <div className="flex justify-between items-center pr-2">
          <span className="uppercase text-[9px] font-black">WINNING TRADES</span>
          <span className="text-white font-black">17</span>
        </div>
        <div className="flex justify-between items-center pr-2">
          <span className="uppercase text-[9px] font-black">LOSING TRADES</span>
          <span className="text-white font-black">6</span>
        </div>
        <div className="flex justify-between items-center pr-2">
          <span className="uppercase text-[9px] font-black">AVERAGE WIN</span>
          <span className="text-[#00D26A] font-black">$3.12</span>
        </div>
        <div className="flex justify-between items-center pr-2">
          <span className="uppercase text-[9px] font-black">AVERAGE LOSS</span>
          <span className="text-[#FF4D4D] font-black">$1.33</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="uppercase text-[9px] font-black">EXPECTANCY</span>
          <span className="text-[#00D26A] font-black">$1.19</span>
        </div>
      </div>

    </div>
  );
}
