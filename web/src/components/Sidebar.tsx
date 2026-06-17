"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Lock } from "lucide-react";

export default function Sidebar() {
  const { positions } = useTradingStore();

  const maxSlots = 4;
  const slotsUsed = 2;
  const slotsFree = 2;
  const riskFreeCount = 5;
  const capitalAtRisk = "$2.46 (2.46%)";
  const portfolioHealth = "EXCELLENT";

  const r = 24;
  const c = Math.PI * r;
  const strokeOffset = c - (0.5 * c);

  const heatmapAssets = ["EURUSD", "GBPUSD", "XAUUSD", "XAGUSD"];
  const heatmapData = [
    ["-", "92%", "25%", "22%"],
    ["92%", "-", "24%", "21%"],
    ["25%", "24%", "-", "89%"],
    ["22%", "21%", "89%", "-"]
  ];

  const getHeatmapBg = (val: string) => {
    if (val === "-") return "bg-slate-950/60 text-slate-700";
    const num = parseInt(val);
    if (num >= 70) return "bg-[#FF4D4D]/15 text-[#FF4D4D] font-black";
    if (num >= 40) return "bg-[#FFB020]/10 text-[#FFB020]";
    return "bg-[#00D26A]/10 text-[#00D26A]";
  };

  return (
    <div className="flex flex-col gap-3.5 w-full">
      
      {/* 1. COMBINED RISK ENGINE & CORRELATION GUARD PANEL */}
      <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-950 flex items-center bg-[#0a101b]/40">
          <span className="text-[10px] font-black text-xiphos-blue uppercase tracking-widest">
            RISK INTEGRITY & CORRELATION BUCKETS
          </span>
        </div>
        
        <div className="p-3 grid grid-cols-2 gap-3 items-stretch">
          
          {/* Left Side: Risk Dial & Stats */}
          <div className="border-r border-slate-950 pr-3 flex flex-col items-center justify-between">
            <div className="relative w-24 h-12 flex flex-col justify-end items-center overflow-hidden">
              <svg className="w-20 h-20 absolute -top-3">
                <circle
                  cx="40"
                  cy="40"
                  r="24"
                  className="stroke-slate-950 fill-none"
                  strokeWidth="5"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="24"
                  className="stroke-[#00D26A] fill-none transition-all duration-1000"
                  strokeWidth="5"
                  strokeDasharray={151}
                  strokeDashoffset={151 - (0.5 * 151)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex flex-col items-center leading-none z-10">
                <span className="text-lg font-black text-white glow-green">2</span>
                <span className="text-[7px] text-[#8e9aa8] uppercase font-black tracking-wider mt-0.5">SLOTS USED</span>
              </div>
            </div>

            <div className="w-full space-y-0.5 text-[9px] text-[#8e9aa8] mt-2 pt-2 border-t border-slate-950/40">
              <div className="flex justify-between">
                <span>SLOTS FREE</span>
                <span className="text-[#00D26A] font-bold">{slotsFree}</span>
              </div>
              <div className="flex justify-between">
                <span>AT RISK</span>
                <span className="text-[#00D26A] font-bold">{capitalAtRisk}</span>
              </div>
              <div className="flex justify-between">
                <span>HEALTH</span>
                <span className="text-[#00D26A] font-black">{portfolioHealth}</span>
              </div>
            </div>
          </div>

          {/* Right Side: Correlation Guard buckets */}
          <div className="pl-1 flex flex-col justify-between text-[9px]">
            <div className="space-y-1.5">
              <span className="text-[7px] text-[#6f7e90] font-black uppercase tracking-wider block leading-none">
                BUCKET BARS
              </span>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[#8e9aa8]">
                  <span>EURUSD</span>
                  <span className="text-[#FF4D4D] font-black text-[7px]">BEARING</span>
                </div>
                <div className="flex justify-between items-center text-[#8e9aa8]">
                  <span className="line-through text-[#425062]">GBPUSD</span>
                  <span className="text-[#FF4D4D] font-black text-[7px] flex items-center gap-0.5">
                    LOCK <Lock className="h-2 w-2" />
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#8e9aa8] border-t border-slate-950/40 pt-1 mt-1">
                  <span>XAUUSD</span>
                  <span className="text-[#00D26A] font-black text-[7px]">FREE</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. CORRELATION HEATMAP PANEL */}
      <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden">
        <div className="p-2.5 border-b border-slate-950 flex items-center bg-[#0a101b]/40">
          <span className="text-[10px] font-black text-xiphos-blue uppercase tracking-widest">
            CORRELATION HEATMAP
          </span>
        </div>

        <div className="p-3 space-y-2">
          {/* Matrix headers */}
          <div className="grid grid-cols-5 gap-0.5 text-center text-[7px] font-black text-[#6f7e90] uppercase">
            <div />
            <div>EURUSD</div>
            <div>GBPUSD</div>
            <div>XAUUSD</div>
            <div>XAGUSD</div>
          </div>

          {/* Heatmap rows */}
          {heatmapAssets.map((assetRow, r) => (
            <div key={assetRow} className="grid grid-cols-5 gap-0.5 items-center text-[9px] font-black">
              <div className="text-[#6f7e90] text-left overflow-hidden text-ellipsis whitespace-nowrap">{assetRow}</div>
              {heatmapData[r].map((val, c) => (
                <div
                  key={c}
                  className={`py-1 text-center rounded-[1px] ${getHeatmapBg(val)}`}
                >
                  {val}
                </div>
              ))}
            </div>
          ))}

          {/* Heatmap Legend */}
          <div className="flex items-center justify-between text-[7px] text-[#425062] font-black border-t border-slate-950 pt-2 mt-0.5">
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00D26A]" />
              <span>LOW</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FFB020]" />
              <span>MODERATE</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4D4D]" />
              <span>HIGH</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
