"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { TrendingUp, Search, Activity, ChevronRight, ChevronLeft } from "lucide-react";
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

  const drawSparkline = (history: number[] | undefined, color = "#4CC9F0") => {
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
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-6 transition-all duration-300">
      <div className="glass-panel flex flex-col flex-1 min-h-0">

        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[rgba(11,15,23,0.4)] shrink-0">
          <span className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
            <Activity className="h-5 w-5 text-xiphos-cyan animate-pulse glow-cyan" />
            <span className="glow-cyan">REAL-TIME LIQUIDITY & SIGNAL MATRIX</span>
          </span>
          <div className="flex items-center bg-[rgba(11,15,23,0.6)] border border-[rgba(255,255,255,0.05)] rounded-lg px-4 py-2 gap-3 transition-colors focus-within:border-xiphos-cyan/50 focus-within:shadow-[0_0_15px_rgba(76,201,240,0.1)]">
            <Search className="h-4 w-4 text-xiphos-muted" />
            <input
              type="text"
              placeholder="FILTER SYMBOL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-xiphos-muted focus:outline-none w-48 text-sm uppercase font-bold tracking-widest"
            />
          </div>
        </div>

        {/* Content: 3 + 9 split */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden gap-6 p-6">

          {/* LEFT sidebar */}
          <div className="col-span-3 flex flex-col gap-6 overflow-hidden h-full">
            <div className="flex-[0.28] shrink-0 overflow-hidden glass-card rounded-xl">
              <Battlefield />
            </div>
            <div className="flex-[0.44] min-h-0 overflow-hidden glass-card rounded-xl">
              <Sidebar />
            </div>
            <div className="flex-[0.28] min-h-0 overflow-hidden glass-card rounded-xl">
              <MarketRadar />
            </div>
          </div>

          {/* RIGHT: Markets table */}
          <div className="col-span-9 flex flex-col overflow-hidden gap-6">
            
            {/* Signal Breakdown Header */}
            <div className="grid grid-cols-3 gap-6 shrink-0">
              {[
                { label: "BULLISH (BUY)", count: buyCount, colorClass: "text-xiphos-emerald glow-emerald", colorHex: "#22C55E" },
                { label: "BEARISH (SELL)", count: sellCount, colorClass: "text-xiphos-crimson glow-crimson", colorHex: "#EF4444" },
                { label: "NEUTRAL / FLAT", count: neutralCount, colorClass: "text-xiphos-gold glow-gold", colorHex: "#D4AF37" },
              ].map(item => (
                <div key={item.label} className="glass-card rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-xiphos-muted font-bold tracking-widest">{item.label}</span>
                    <span className={`text-2xl font-black leading-none ${item.colorClass}`}>{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${marketWatch.length ? (item.count / marketWatch.length) * 100 : 0}%`, backgroundColor: item.colorHex }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="glass-card flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.05)] shrink-0">
                <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest block">
                  MARKET WATCH MATRIX ({filteredMarkets.length})
                </span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-xiphos-muted hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-white font-bold uppercase tracking-widest">PAGE {page + 1} / {totalPages}</span>
                  <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-xiphos-muted hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                {selectedSymbol && (
                  <div className="w-full h-1/2 border-b border-[rgba(255,255,255,0.05)] mb-2 p-4 bg-[rgba(11,15,23,0.3)]">
                    <div className="text-sm text-xiphos-cyan glow-cyan font-bold mb-2 tracking-widest uppercase">M30 CHART FOR {selectedSymbol}</div>
                    <TradingChart symbol={selectedSymbol} />
                  </div>
                )}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                  <table className="w-full text-left text-sm border-collapse font-bold">
                    <thead>
                      <tr className="text-xiphos-muted uppercase tracking-widest text-xs">
                        <th className="p-3 font-bold">SYMBOL</th>
                        <th className="p-3 font-bold text-right">PRICE (BID)</th>
                        <th className="p-3 font-bold text-right">24H DELTA</th>
                        <th className="p-3 font-bold text-right">E13 GAP</th>
                        <th className="p-3 font-bold text-right">E50 GAP</th>
                        <th className="p-3 font-bold text-right">S200 GAP</th>
                        <th className="p-3 font-bold">FAN ALIGNMENT</th>
                        <th className="p-3 text-center font-bold">DATA STREAM</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMarkets.map((item) => {
                        const isUp = item.change ? !item.change.startsWith("-") : true;
                        return (
                          <tr 
                            key={item.symbol} 
                            onClick={() => setSelectedSymbol(item.symbol === selectedSymbol ? null : item.symbol)}
                            className={`border-b border-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-colors cursor-pointer ${selectedSymbol === item.symbol ? 'bg-xiphos-cyan/5' : ''}`}
                          >
                            <td className="p-3 text-white text-base tracking-wider">
                              <div className="flex items-center gap-2">
                                <ChevronRight className={`h-4 w-4 ${selectedSymbol === item.symbol ? 'text-xiphos-cyan' : 'text-transparent'}`} />
                                {item.symbol}
                              </div>
                            </td>
                            <td className="p-3 text-right font-black text-white text-base">
                              {item.price.toFixed(item.symbol.includes("USD") && !item.symbol.startsWith("X") ? 5 : 3)}
                            </td>
                            <td className={`p-3 text-right font-black text-base ${isUp ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>
                              {item.change || "0.00%"}
                            </td>
                            <td className={`p-3 text-right text-sm ${item.e13_dist >= 0 ? "text-xiphos-emerald" : "text-xiphos-crimson"}`}>
                              {item.e13_dist >= 0 ? "+" : ""}{Math.round(item.e13_dist)}
                            </td>
                            <td className={`p-3 text-right text-sm ${item.e50_dist >= 0 ? "text-xiphos-emerald" : "text-xiphos-crimson"}`}>
                              {item.e50_dist >= 0 ? "+" : ""}{Math.round(item.e50_dist)}
                            </td>
                            <td className={`p-3 text-right text-sm ${item.s200_dist >= 0 ? "text-xiphos-emerald" : "text-xiphos-crimson"}`}>
                              {item.s200_dist >= 0 ? "+" : ""}{Math.round(item.s200_dist)}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 text-xs font-bold rounded-md border uppercase ${
                                item.signal === "BUY" ? "bg-xiphos-emerald/10 text-xiphos-emerald border-xiphos-emerald/30 glow-emerald"
                                : item.signal === "SELL" ? "bg-xiphos-crimson/10 text-xiphos-crimson border-xiphos-crimson/30 glow-crimson"
                                : "bg-white/5 text-xiphos-muted border-[rgba(255,255,255,0.1)]"
                              }`}>
                                {item.signal === "BUY" ? "BULLISH FAN" : item.signal === "SELL" ? "BEARISH FAN" : "NEUTRAL"}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex justify-center items-center">
                                {drawSparkline(item.history, isUp ? "#22C55E" : "#EF4444")}
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
      </div>

    </div>
  );
}
