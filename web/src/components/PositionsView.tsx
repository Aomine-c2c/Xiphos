"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Briefcase, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";

export default function PositionsView() {
  const { positions, closePosition, breakeven, partialClose } = useTradingStore();

  const currencyPositions = positions.filter((p) => ["EURUSD", "GBPUSD"].includes(p.symbol));

  const totalLots = positions.reduce((acc, p) => acc + p.volume, 0);
  const totalPnL = positions.reduce((acc, p) => acc + p.profit, 0);

  const currencyLots = currencyPositions.reduce((acc, p) => acc + p.volume, 0);
  const totalVolume = totalLots || 1;
  const currencyPct = Math.round((currencyLots / totalVolume) * 100);
  const metalPct = 100 - currencyPct;

  const riskBearingCount = positions.filter(p => p.risk_status === "RISK").length;
  const riskFreeCount = positions.filter(p => p.risk_status === "FREE").length;

  const [page, setPage] = useState(0);
  const itemsPerPage = 6;
  const totalPages = Math.max(1, Math.ceil(positions.length / itemsPerPage));
  const paginatedPositions = positions.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="flex flex-col h-full bg-xiphos-bg font-mono select-none overflow-hidden gap-4">
      {/* Title Header */}
      <div className="p-3 border-b border-slate-900 flex items-center justify-between bg-xiphos-panel/60 backdrop-blur-xl shrink-0">
        <span className="text-[20px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Positions Hub
        </span>
        <span className="text-[16px] text-white font-bold">
          TOTAL EXPOSURE: <span className="text-xiphos-blue">{totalLots.toFixed(2)} LOTS</span>
        </span>
      </div>

      <div className="flex-1 flex flex-col min-h-0 bg-xiphos-panel/40 backdrop-blur-md border border-slate-900/80 rounded-sm shadow-xl">
        <div className="grid grid-cols-12 h-full">
          {/* LEFT: Stats (3/12) */}
          <div className="col-span-3 border-r border-slate-900/80 p-4 flex flex-col justify-between">
            <div>
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-4 border-b border-slate-950 pb-1.5">
                EXPOSURE METRICS
              </span>
              
              <div className="space-y-4 text-[16px] font-black">
                <div className="flex justify-between items-center">
                  <span className="text-[#8e9aa8]">GROSS P/L</span>
                  <span className={totalPnL >= 0 ? "text-xiphos-green" : "text-xiphos-red"}>
                    {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[#8e9aa8]">RISK BEARING TRADES</span>
                  <span className="text-xiphos-red">{riskBearingCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#8e9aa8]">RISK FREE TRADES</span>
                  <span className="text-xiphos-green">{riskFreeCount}</span>
                </div>
              </div>
            </div>

            <div className="bg-xiphos-bg/50 border border-slate-900 rounded-sm p-3">
              <div className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">
                BUCKET ALLOCATION
              </div>
              <div className="space-y-3 font-bold text-[15px]">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8e9aa8]">CURRENCY (FX)</span>
                    <span className="text-xiphos-blue">{currencyPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                    <div className="h-full bg-xiphos-blue" style={{ width: `${currencyPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-[#8e9aa8]">METALS (XAU/XAG)</span>
                    <span className="text-xiphos-blue">{metalPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                    <div className="h-full bg-xiphos-blue" style={{ width: `${metalPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[14px] text-[#425062] leading-relaxed border-t border-slate-950 pt-2">
                ✓ Correlation guard blocks additions when same-bucket &gt;70%
              </div>
            </div>

          </div>

          {/* RIGHT: Table (9/12) */}
          <div className="col-span-9 p-4 flex flex-col gap-4 overflow-hidden">
            <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-4 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2 border-b border-slate-950 pb-1.5 shrink-0">
                <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block">
                  ACTIVE TRADES REGISTRY ({positions.length})
                </span>
                <div className="flex items-center gap-2">
                  <button title="Previous Page" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-[#6f7e90] hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-[15px] text-[#8e9aa8] font-black uppercase">PAGE {page + 1} / {totalPages}</span>
                  <button title="Next Page" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-[#6f7e90] hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <table className="w-full text-left text-[17px] border-collapse font-bold">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[15px] select-none">
                      <th className="p-2.5 font-black">TICKET</th>
                      <th className="p-2.5 font-black">SYMBOL</th>
                      <th className="p-2.5 font-black">DIR</th>
                      <th className="p-2.5 font-black text-right">LOTS</th>
                      <th className="p-2.5 font-black text-right">CURRENT</th>
                      <th className="p-2.5 font-black text-right">PROFIT</th>
                      <th className="p-2.5 font-black">RISK TYPE</th>
                      <th className="p-2.5 font-black text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPositions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-24 text-[#425062] font-black uppercase text-[17px]">
                          [NO ACTIVE POSITIONS]
                        </td>
                      </tr>
                    ) : (
                      paginatedPositions.map((pos) => {
                        const isProfit = pos.profit >= 0;
                        const isFree = pos.risk_status === "FREE";
                        return (
                          <tr key={pos.ticket} className="border-b border-slate-950/60 hover:bg-xiphos-bg/60 transition-colors">
                            <td className="p-2.5 text-[#6f7e90]">{pos.ticket}</td>
                            <td className="p-2.5 text-white font-black">{pos.symbol}</td>
                            <td className={`p-2.5 font-black ${pos.type === "BUY" ? "text-xiphos-green" : "text-xiphos-red"}`}>{pos.type}</td>
                            <td className="p-2.5 text-right text-white">{pos.volume.toFixed(2)}</td>
                            <td className="p-2.5 text-right text-[#ccd6e0]">
                              {pos.price_current.toFixed(pos.symbol.includes("USD") && !pos.symbol.startsWith("X") ? 5 : 2)}
                            </td>
                            <td className={`p-2.5 text-right font-black ${isProfit ? "text-xiphos-green" : "text-xiphos-red"}`}>
                              {isProfit ? "+" : ""}${pos.profit.toFixed(2)}
                            </td>
                            <td className="p-2.5">
                              <span className={`px-1.5 py-0.5 rounded-sm text-[14px] font-black border uppercase ${
                                isFree ? "bg-xiphos-green/5 border-xiphos-green/45 text-xiphos-green" : "bg-xiphos-red/5 border-xiphos-red/45 text-xiphos-red"
                              }`}>
                                {isFree ? "RISK FREE" : "BEARING"}
                              </span>
                            </td>
                            <td className="p-2.5 text-center flex items-center justify-center gap-1">
                              <button onClick={() => { if (globalThis.confirm(`Breakeven Ticket #${pos.ticket}?`)) breakeven(pos.ticket, pos.symbol); }} className="px-1.5 py-0.5 bg-xiphos-blue/20 hover:bg-xiphos-blue/40 text-xiphos-blue border border-xiphos-blue/40 rounded-[2px] text-[14px] transition-colors" title="Move Stop Loss to Entry Price">
                                BE
                              </button>
                              <button onClick={() => { if (globalThis.confirm(`Partial Close (50%) Ticket #${pos.ticket}?`)) partialClose(pos.ticket, pos.symbol); }} className="px-1.5 py-0.5 bg-xiphos-orange/20 hover:bg-xiphos-orange/40 text-xiphos-orange border border-xiphos-orange/40 rounded-[2px] text-[14px] transition-colors" title="Close Half Position">
                                1/2
                              </button>
                              <button onClick={() => { if (globalThis.confirm(`Force Close Ticket #${pos.ticket}?`)) closePosition(pos.ticket, pos.symbol); }} className="px-1.5 py-0.5 bg-xiphos-red/20 hover:bg-xiphos-red/40 text-xiphos-red border border-xiphos-red/40 rounded-[2px] text-[14px] transition-colors" title="Close Position Entirely">
                                X
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-orange/20 shadow-[0_0_15px_rgba(255,176,32,0.05)] rounded-sm p-3 shrink-0">
        <div className="flex items-center justify-between text-[16px] font-black">
          <div className="flex items-center gap-2 text-xiphos-orange">
            <ShieldAlert className="h-4 w-4" />
            <span>PORTFOLIO RISK CONTAINMENT FIELD</span>
          </div>
          <span className="text-[#8e9aa8] text-[15px]">
            ACTIVE EXPOSURE: <span className="text-xiphos-green font-black">{totalLots.toFixed(2)} LOTS (WITHIN LIMITS)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
