"use client";

import React from "react";

export default function ConfidenceEngine() {
  return (
    <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm p-4 font-mono select-none h-full flex flex-col justify-between">
      <div className="flex-shrink-0 mb-2.5">
        <span className="text-[10px] text-[#6f7e90] font-black uppercase tracking-wider block">
          AI CONFIDENCE ENGINE
        </span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-4 items-center min-h-0">
        {/* Left: 4 Progress quality bars (col-span-8) */}
        <div className="col-span-8 space-y-2">
          {[
            { label: "Trend Strength", val: "STRONG", progress: 95, color: "#00D26A" },
            { label: "Volatility Structure", val: "STABLE", progress: 85, color: "#00A8FF" },
            { label: "Signal Density", val: "HIGH", progress: 90, color: "#00D26A" },
            { label: "Risk Buffer", val: "SAFE", progress: 92, color: "#00D26A" }
          ].map((metric, idx) => (
            <div key={idx} className="space-y-0.5">
              <div className="flex justify-between text-[10px] font-bold text-[#8e9aa8] leading-none">
                <span>{metric.label}</span>
                <span style={{ color: metric.color }}>{metric.val}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${metric.progress}%`, backgroundColor: metric.color }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Combined Score gauge (col-span-4) */}
        <div className="col-span-4 flex flex-col items-center border-l border-slate-950 pl-3">
          <span className="text-[8px] text-[#6f7e90] uppercase font-black tracking-widest leading-none mb-1.5">
            COMBINED
          </span>
          <div className="relative h-16 w-16 flex items-center justify-center">
            <svg className="absolute w-16 h-16 transform -rotate-90">
              <circle cx="32" cy="32" r="25" className="stroke-slate-950 fill-none" strokeWidth="4" />
              <circle
                cx="32"
                cy="32"
                r="25"
                className="stroke-[#00D26A] fill-none"
                strokeWidth="4"
                strokeDasharray={157}
                strokeDashoffset={157 - (0.92 * 157)}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-black text-white glow-green">
              92%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
