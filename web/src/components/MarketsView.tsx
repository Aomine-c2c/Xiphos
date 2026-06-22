"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { TrendingUp, Search, Activity, ChevronRight } from "lucide-react";
import Battlefield from "./Battlefield";
import Sidebar from "./Sidebar";
import MarketRadar from "./MarketRadar";
import TradingChart from "./TradingChart";

export default function MarketsView() {
  const { marketWatch } = useTradingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  const filteredMarkets = marketWatch.filter((m) =>
    m.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(filteredMarkets.length / itemsPerPage));
  const paginatedMarkets = filteredMarkets.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const buyCount = marketWatch.filter(m => m.signal === "BUY").length;
  const sellCount = marketWatch.filter(m => m.signal === "SELL").length;
  const neutralCount = marketWatch.filter(m => m.signal !== "BUY" && m.signal !== "SELL").length;

  const drawSparkline = (history: number[] | undefined, color = "#00D26A") => {
    if (!history || history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const height = 22;
    const width = 100;

    const coords = history.map((val, idx) => ({
      x: (idx / (history.length - 1)) * width,
      y: height - ((val - min) / range) * height + 2,
    }));

    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2;
      const yc = (coords[i].y + coords[i + 1].y) / 2;
      pathD += ` Q ${coords[i].x} ${coords[i].y}, ${xc} ${yc}`;
    }
    pathD += ` L ${coords.at(-1)!.x} ${coords.at(-1)!.y}`;
    const last = coords.at(-1)!;

    return (
      <svg width={width + 4} height={height + 4} className="overflow-visible opacity-90">
        <path fill="none" stroke={color} strokeWidth="1.5" d={pathD} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last.x} cy={last.y} r="3.5" fill={color} opacity="0.5" className="animate-ping" />
        <circle cx={last.x} cy={last.y} r="1.8" fill={color} />
      </svg>
    );
  };

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2 transition-all duration-300 hover:border-xiphos-blue/40">
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center justify-between bg-xiphos-bg/40 shrink-0">
          <span className="text-3xl font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-2">
            <Activity className="h-4 w-4 animate-pulse" />
            XIPHOS REAL-TIME LIQUIDITY & SIGNAL MATRIX
          </span>
          <div className="flex items-center bg-slate-950/80 border border-slate-900 rounded-sm px-2.5 py-1 gap-2">
            <Search className="h-3 w-3 text-slate-500" />
            <input
              type="text"
              placeholder="FILTER SYMBOL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-slate-600 focus:outline-none w-36 text-[16px] uppercase font-bold"
            />
          </div>
        </div>

        {/* Content: 3 + 9 split */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT sidebar */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-[0.28] shrink-0 overflow-hidden bg-xiphos-bg/40 rounded-sm border border-slate-900/40">
              <Battlefield />
            </div>
            <div className="flex-[0.44] min-h-0 overflow-hidden bg-xiphos-bg/40 rounded-sm border border-slate-900/40">
              <Sidebar />
            </div>
            <div className="flex-[0.28] min-h-0 overflow-hidden bg-xiphos-bg/40 rounded-sm border border-slate-900/40">
              <MarketRadar />
            </div>
          </div>

          {/* RIGHT: Markets table */}
          <div className="col-span-9 p-4 flex flex-col overflow-hidden gap-4">
            
            {/* Signal Breakdown Header */}
            <div className="grid grid-cols-3 gap-4 shrink-0">
              {[
                { label: "BULLISH (BUY)", count: buyCount, colorClass: "text-xiphos-green", colorHex: "#00D26A" },
                { label: "BEARISH (SELL)", count: sellCount, colorClass: "text-xiphos-red", colorHex: "#FF4D4D" },
                { label: "NEUTRAL / FLAT", count: neutralCount, colorClass: "text-xiphos-orange", colorHex: "#FFB020" },
              ].map(item => (
                <div key={item.label} className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[15px] text-[#8e9aa8] font-bold">{item.label}</span>
                    <span className={`text-[22px] font-black leading-none ${item.colorClass}`}>{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                    <div
                      className="h-full rounded-sm transition-all"
                      style={{ width: `${marketWatch.length ? (item.count / marketWatch.length) * 100 : 0}%`, backgroundColor: item.colorHex }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between mt-1 border-b border-slate-950 pb-1.5 shrink-0">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block">
                MARKET WATCH MATRIX ({filteredMarkets.length})
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-[#6f7e90] hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                  <span className="text-[16px] font-black tracking-widest">&lt;</span>
                </button>
                <span className="text-[15px] text-[#8e9aa8] font-black uppercase">PAGE {page + 1} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-[#6f7e90] hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                  <span className="text-[16px] font-black tracking-widest">&gt;</span>
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {selectedSymbol && (
                <div className="w-full h-1/2 border-b border-slate-900 mb-2 p-2">
                  <div className="text-[14px] text-xiphos-blue font-black mb-1">M30 CHART FOR {selectedSymbol}</div>
                  <TradingChart symbol={selectedSymbol} />
                </div>
              )}
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-[17px] border-collapse font-bold">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[15px] select-none">
                      <th className="p-2.5 font-black">SYMBOL</th>
                    <th className="p-2.5 font-black text-right">PRICE (BID)</th>
                    <th className="p-2.5 font-black text-right">24H DELTA</th>
                    <th className="p-2.5 font-black text-right">E13 GAP</th>
                    <th className="p-2.5 font-black text-right">E50 GAP</th>
                    <th className="p-2.5 font-black text-right">S200 GAP</th>
                    <th className="p-2.5 font-black">FAN ALIGNMENT</th>
                    <th className="p-2.5 text-center font-black">SPARKLINE</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMarkets.map((item) => {
                    const isUp = item.change ? !item.change.startsWith("-") : true;
                    return (
                      <tr 
                        key={item.symbol} 
                        onClick={() => setSelectedSymbol(item.symbol === selectedSymbol ? null : item.symbol)}
                        className={`border-b border-slate-950 hover:bg-xiphos-bg/40 transition-colors cursor-pointer ${selectedSymbol === item.symbol ? 'bg-xiphos-blue/10' : ''}`}
                      >
                        <td className="p-2.5 text-white text-[18px] font-black tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <ChevronRight className="h-3.5 w-3.5 text-xiphos-blue" />
                            {item.symbol}
                          </div>
                        </td>
                        <td className="p-2.5 text-right font-black text-white text-[18px]">
                          {item.price.toFixed(item.symbol.includes("USD") && !item.symbol.startsWith("X") ? 5 : 3)}
                        </td>
                        <td className={`p-2.5 text-right font-black text-[18px] ${isUp ? "text-xiphos-green" : "text-xiphos-red"}`}>
                          {item.change || "0.00%"}
                        </td>
                        <td className={`p-2.5 text-right text-[17px] ${item.e13_dist >= 0 ? "text-xiphos-green" : "text-xiphos-red"}`}>
                          {item.e13_dist >= 0 ? "+" : ""}{Math.round(item.e13_dist)} pts
                        </td>
                        <td className={`p-2.5 text-right text-[17px] ${item.e50_dist >= 0 ? "text-xiphos-green" : "text-xiphos-red"}`}>
                          {item.e50_dist >= 0 ? "+" : ""}{Math.round(item.e50_dist)} pts
                        </td>
                        <td className={`p-2.5 text-right text-[17px] ${item.s200_dist >= 0 ? "text-xiphos-green" : "text-xiphos-red"}`}>
                          {item.s200_dist >= 0 ? "+" : ""}{Math.round(item.s200_dist)} pts
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 text-[15px] font-black rounded-sm border uppercase ${
                            item.signal === "BUY" ? "bg-xiphos-green/5 text-xiphos-green border-xiphos-green/45"
                            : item.signal === "SELL" ? "bg-xiphos-red/5 text-xiphos-red border-xiphos-red/45"
                            : "bg-transparent text-[#6f7e90] border-slate-900"
                          }`}>
                            {item.signal === "BUY" ? "BULLISH FAN" : item.signal === "SELL" ? "BEARISH FAN" : "NEUTRAL/FLAT"}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex justify-center items-center">
                            {drawSparkline(item.history, isUp ? "#00D26A" : "#FF4D4D")}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm p-3 shrink-0">
        <div className="flex items-center justify-between text-[16px] font-black">
          <div className="flex items-center gap-2 text-xiphos-blue">
            <TrendingUp className="h-4 w-4" />
            <span>M30 TIME FRAME SYSTEM SCAN — CORRELATION CATEGORIES: GROUP 1 (CURRENCIES), GROUP 2 (METALS)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#8e9aa8]">
            <span className="h-1.5 w-1.5 rounded-full bg-xiphos-green animate-pulse" />
            <span className="text-[15px]">REALTIME · <span className="text-xiphos-blue">{marketWatch.length} ASSETS</span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
