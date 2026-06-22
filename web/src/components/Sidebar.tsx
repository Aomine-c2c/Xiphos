"use client";

import React, { useState } from "react";
import { Activity } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";

export default function Sidebar() {
  const { correlationMatrix } = useTradingStore();
  const [hoveredCell, setHoveredCell] = useState<{ r: number; c: number } | null>(null);

  const heatmapAssets = ["EURUSD", "GBPUSD", "AUDUSD", "NZDUSD", "USDJPY", "USDCHF", "USDCAD", "XAUUSD", "XAGUSD"];
  
  // Fetch from live store, fallback to "-" if not ready
  const getMatrixVal = (rSym: string, cSym: string) => {
    if (!correlationMatrix || !correlationMatrix[rSym] || !correlationMatrix[rSym][cSym]) {
      return "-";
    }
    return correlationMatrix[rSym][cSym];
  };

  const getHeatmapColor = (val: string) => {
    if (val === "-") return { bg: "bg-xiphos-bg/40", text: "text-[#425062]" };
    const num = parseInt(val);
    const absNum = Math.abs(num);
    
    if (absNum >= 80) return { bg: "bg-xiphos-red/15", text: "text-xiphos-red" };
    if (absNum >= 50) return { bg: "bg-yellow-500/15", text: "text-yellow-500" };
    return { bg: "bg-xiphos-green/10", text: "text-xiphos-green" };
  };

  return (
    <div className="flex flex-col w-full h-full bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm overflow-hidden select-none font-mono transition-all duration-300 hover:border-xiphos-blue/40">
      
      {/* Title Header */}
      <div className="p-3 border-b border-slate-950 flex items-center justify-between bg-xiphos-bg/40 shrink-0">
        <span className="text-[20px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="h-5 w-5 text-xiphos-blue" />
          GLOBAL CORRELATION MATRIX
        </span>
      </div>

      {/* Matrix Area */}
      <div className="p-3 flex-1 flex flex-col justify-between min-h-0 bg-xiphos-bg/20 relative">
        
        {/* Header Row */}
        <div className="grid grid-cols-10 gap-1 text-center text-[12.5px] font-black text-[#6f7e90] uppercase mb-1">
          <div /> {/* Empty top-left cell */}
          {heatmapAssets.map(asset => (
            <div key={asset} className="flex items-end justify-center pb-1">
              <span className="-rotate-45 origin-bottom-left inline-block w-10 text-right whitespace-nowrap">
                {asset}
              </span>
            </div>
          ))}
        </div>

        {/* Heatmap Rows */}
        <div className="flex-1 flex flex-col gap-1 justify-center">
          {heatmapAssets.map((assetRow, r) => (
            <div key={assetRow} className="grid grid-cols-10 gap-1 items-stretch flex-1">
              {/* Row Label */}
              <div className="text-[#8e9aa8] text-[17px] font-black flex items-center justify-end pr-2 uppercase">
                {assetRow}
              </div>
              
              {/* Data Cells */}
              {heatmapAssets.map((colAsset, c) => {
                const val = getMatrixVal(assetRow, colAsset);
                const { bg, text } = getHeatmapColor(val);
                const isHovered = hoveredCell?.r === r && hoveredCell?.c === c;
                const isCrossHovered = hoveredCell?.r === r || hoveredCell?.c === c;
                
                return (
                  <div
                    key={c}
                    onMouseEnter={() => setHoveredCell({ r, c })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`
                      relative flex items-center justify-center text-[18px] font-black rounded-sm cursor-crosshair transition-all duration-200
                      ${bg} ${text} 
                      ${val !== "-" && isHovered ? "ring-1 ring-white/50 scale-110 z-10 shadow-[0_0_10px_rgba(255,255,255,0.1)]" : ""}
                      ${val !== "-" && isCrossHovered && !isHovered ? "brightness-150" : ""}
                    `}
                  >
                    {val !== "-" ? val : "·"}
                    
                    {/* Hover Telemetry Overlay */}
                    {isHovered && val !== "-" && (
                      <div className="absolute top-1/2 left-full ml-2 -translate-y-1/2 bg-xiphos-bg border border-slate-700 p-2.5 rounded-sm z-50 whitespace-nowrap shadow-xl pointer-events-none text-left">
                        <div className="text-[11.5px] text-[#6f7e90] font-bold uppercase mb-0.5">CORRELATION FACTOR</div>
                        <div className="text-[18px] text-white font-black flex items-center gap-1.5">
                          <span>{assetRow}</span>
                          <span className="text-[#425062]">×</span>
                          <span>{heatmapAssets[c]}</span>
                        </div>
                        <div className={`text-[24px] font-black mt-1 ${text}`}>
                          {val}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

      </div>

      {/* Legend Footer */}
      <div className="p-2.5 border-t border-slate-950 flex items-center justify-between text-[17px] text-[#6f7e90] font-black bg-xiphos-bg/40 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-xiphos-green" />
            <span>&lt; 50% (SAFE)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-yellow-500" />
            <span>50-79% (WARN)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm bg-xiphos-red" />
            <span>&gt; 80% (DANGER)</span>
          </div>
        </div>
        <div>
          <span>HOVER CELLS FOR TELEMETRY</span>
        </div>
      </div>

    </div>
  );
}
