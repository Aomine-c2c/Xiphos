"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Activity } from "lucide-react";

export default function MarketRadar() {
  const { marketWatch } = useTradingStore();

  const getDistColor = (dist: number) => {
    const d = Math.abs(dist);
    if (d > 500) return "text-xiphos-red";
    if (d > 200) return "text-xiphos-orange";
    return "text-xiphos-green";
  };

  const getSignalClass = (signal: string) => {
    if (signal === "BUY") return "bg-xiphos-green/10 border-xiphos-green/45 text-xiphos-green";
    if (signal === "SELL") return "bg-xiphos-red/10 border-xiphos-red/45 text-xiphos-red";
    return "bg-[#425062]/10 border-[#425062]/45 text-[#425062]";
  };



  // Evolve Typography: Title +40% (text-[17px] -> text-[21px])
  // Section Headers +30% (text-[15px] -> text-[17px])
  return (
    <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm flex flex-col overflow-hidden font-mono select-none h-full justify-between transition-all duration-300 hover:border-xiphos-blue/40">
      
      {/* Title Header */}
      <div className="p-2 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40 shrink-0">
        <span className="text-[16.5px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
          <Activity className="h-4 w-4 text-xiphos-blue" />
          MA FAN DISTANCES
        </span>
      </div>

      {/* Main List */}
      <div className="p-2 space-y-1 bg-xiphos-bg/30 flex-1 overflow-hidden flex flex-col justify-between">
        <div className="w-full overflow-x-hidden flex-1 min-h-0">
          <table className="w-full text-left text-[16px] border-collapse font-bold">
            <thead>
              {/* Section Headers (+30% scaled: text-[14px] -> text-[12.5px]) */}
              <tr className="bg-slate-950/70 border-b border-slate-900 text-[#6f7e90] uppercase text-[12.5px] select-none">
                <th className="p-1 font-black">SYMBOL</th>
                <th className="p-1 font-black text-right">E13 DIST</th>
                <th className="p-1 font-black text-right">E50 DIST</th>
                <th className="p-1 font-black text-right">S200 DIST</th>
                <th className="p-1 font-black text-center">SIGNAL</th>
              </tr>
            </thead>
            <tbody>
              {marketWatch.slice(0, 4).map((item) => {
                return (
                  <tr
                    key={item.symbol}
                    className="border-b border-slate-950 hover:bg-xiphos-panel/60 transition-colors"
                  >
                    <td className="p-2 text-white text-[17px] font-black">{item.symbol}</td>
                    <td className={`p-2 text-right font-black ${getDistColor(item.e13_dist)}`}>{item.e13_dist}</td>
                    <td className={`p-2 text-right font-black ${getDistColor(item.e50_dist)}`}>{item.e50_dist}</td>
                    <td className={`p-2 text-right font-black ${getDistColor(item.s200_dist)}`}>{item.s200_dist}</td>
                    <td className="p-1.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[14px] font-black border uppercase tracking-wider flex items-center justify-center gap-1 ${getSignalClass(item.signal)}`}>
                        {item.signal}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dynamic status tracker footer */}
        <div className="text-[15px] text-[#6f7e90] border-t border-slate-950 pt-2 flex items-center justify-between">
          <span>✓ REALTIME DISTANCE TRACKING ACTIVE</span>
          <span>LIMIT: 4 SCAN SLOTS</span>
        </div>
      </div>

    </div>
  );
}
