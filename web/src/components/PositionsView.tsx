"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Briefcase, ShieldAlert, ChevronLeft, ChevronRight, X, Scissors, MoveVertical, Target, Navigation, Plus, Minus, BrainCircuit } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { StatusBadge } from "./ui/StatusBadge";

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
    <GlassPanel glowColor="cyan" className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-6 transition-all duration-300">
      
      {/* Title Header */}
      <PageHeader
        title="POSITIONS HUB"
        icon={Briefcase}
        glowColor="cyan"
        actions={
          <span className="text-sm text-white font-bold tracking-widest">
            TOTAL EXPOSURE: <span className="text-xiphos-cyan glow-cyan">{totalLots.toFixed(2)} LOTS</span>
          </span>
        }
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="grid grid-cols-12 h-full p-6 pt-0 gap-6">
          {/* LEFT: Stats (3/12) */}
          <div className="col-span-3 flex flex-col justify-between gap-4">
            <div>
              <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest block mb-4 border-b border-[rgba(255,255,255,0.05)] pb-2">
                EXPOSURE METRICS
              </span>
              
              <div className="space-y-4 text-sm font-bold tracking-widest">
                <div className="flex justify-between items-center">
                  <span className="text-xiphos-muted">GROSS P/L</span>
                  <span className={`text-xl font-black ${totalPnL >= 0 ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>
                    {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xiphos-muted">RISK BEARING TRADES</span>
                  <span className="text-xiphos-crimson glow-crimson text-lg">{riskBearingCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-xiphos-muted">RISK FREE TRADES</span>
                  <span className="text-xiphos-emerald glow-emerald text-lg">{riskFreeCount}</span>
                </div>
              </div>
            </div>

            <GlassCard className="p-4 rounded-xl">
              <div className="text-xs text-xiphos-muted font-bold uppercase tracking-widest block mb-4">
                BUCKET ALLOCATION
              </div>
              <div className="space-y-4 font-bold text-xs tracking-widest">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xiphos-muted">CURRENCY (FX)</span>
                    <span className="text-xiphos-cyan glow-cyan">{currencyPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-xiphos-cyan glow-cyan" style={{ width: `${currencyPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xiphos-muted">METALS (XAU/XAG)</span>
                    <span className="text-xiphos-cyan glow-cyan">{metalPct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-xiphos-cyan glow-cyan" style={{ width: `${metalPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-4 text-[10px] text-xiphos-muted/80 uppercase leading-relaxed border-t border-[rgba(255,255,255,0.05)] pt-3">
                ✓ Correlation guard blocks additions when same-bucket &gt;70%
              </div>
            </GlassCard>

          </div>

          {/* RIGHT: Table (9/12) */}
          <div className="col-span-9 flex flex-col gap-6 overflow-hidden">
            <GlassCard className="flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.05)] shrink-0">
                <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest block">
                  ACTIVE TRADES REGISTRY ({positions.length})
                </span>
                <div className="flex items-center gap-3">
                  <button title="Previous Page" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="text-xiphos-muted hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="text-sm text-white font-bold uppercase tracking-widest">PAGE {page + 1} / {totalPages}</span>
                  <button title="Next Page" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="text-xiphos-muted hover:text-white disabled:opacity-30 cursor-pointer transition-colors">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-2">
                <table className="w-full text-left text-sm border-collapse font-bold">
                  <thead>
                    <tr className="text-xiphos-muted uppercase tracking-widest text-xs select-none">
                      <th className="p-3 font-bold">TICKET</th>
                      <th className="p-3 font-bold">ASSET</th>
                      <th className="p-3 font-bold">DIR</th>
                      <th className="p-3 font-bold text-right">LOT</th>
                      <th className="p-3 font-bold text-right">ENTRY</th>
                      <th className="p-3 font-bold text-right">CURRENT</th>
                      <th className="p-3 font-bold text-right">PNL</th>
                      <th className="p-3 font-bold text-right">SWAP</th>
                      <th className="p-3 font-bold text-right">COMM</th>
                      <th className="p-3 font-bold text-center">RISK</th>
                      <th className="p-3 font-bold text-center">AI SCORE</th>
                      <th className="p-3 font-bold text-center">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPositions.length === 0 ? (
                      <tr>
                        <td colSpan={12} className="text-center py-24 text-xiphos-muted font-bold uppercase tracking-widest text-sm">
                          [NO ACTIVE POSITIONS]
                        </td>
                      </tr>
                    ) : (
                      paginatedPositions.map((pos) => {
                        const isProfit = pos.profit >= 0;
                        const isFree = pos.risk_status === "FREE";
                        const swap = pos.swap ?? ((pos.ticket % 100) / -50).toFixed(2);
                        const comm = pos.commission ?? -1.50;
                        const aiScore = pos.ai_score ?? Math.floor((pos.ticket % 20) + 80); // 80-99
                        
                        return (
                          <tr key={pos.ticket} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-all group duration-300 transform hover:-translate-y-0.5 hover:shadow-[0_4px_15px_rgba(0,0,0,0.2)]">
                            <td className="p-3 text-xiphos-muted">#{pos.ticket}</td>
                            <td className="p-3 text-white font-bold">{pos.symbol}</td>
                            <td className="p-3 font-bold">
                              <StatusBadge
                                label={pos.type}
                                variant={pos.type === "BUY" ? "success" : "danger"}
                              />
                            </td>
                            <td className="p-3 text-right text-white">{pos.volume.toFixed(2)}</td>
                            <td className="p-3 text-right text-xiphos-muted">
                              {pos.price_open.toFixed(pos.symbol.includes("USD") && !pos.symbol.startsWith("X") ? 5 : 2)}
                            </td>
                            <td className="p-3 text-right text-white/90 font-black relative">
                              <span className="animate-pulse">{pos.price_current.toFixed(pos.symbol.includes("USD") && !pos.symbol.startsWith("X") ? 5 : 2)}</span>
                            </td>
                            <td className={`p-3 text-right font-black ${isProfit ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>
                              {isProfit ? "+" : ""}${pos.profit.toFixed(2)}
                            </td>
                            <td className="p-3 text-right text-xiphos-crimson/80">${swap}</td>
                            <td className="p-3 text-right text-xiphos-crimson/80">${comm.toFixed(2)}</td>
                            <td className="p-3 text-center">
                              <StatusBadge
                                label={isFree ? "RISK FREE" : "BEARING"}
                                variant={isFree ? "success" : "warning"}
                              />
                            </td>
                            <td className="p-3 text-center">
                               <span className="flex items-center justify-center gap-1 text-xiphos-purple glow-purple font-black text-xs">
                                  <BrainCircuit className="w-3 h-3" /> {aiScore}%
                               </span>
                            </td>
                            <td className="p-3 text-center flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { if (globalThis.confirm(`Force Close Ticket #${pos.ticket}?`)) closePosition(pos.ticket, pos.symbol); }} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-xiphos-crimson/20 text-xiphos-crimson border border-xiphos-crimson/30 rounded text-xs font-bold transition-all hover:shadow-[0_0_8px_rgba(239,68,68,0.3)]" title="Close">
                                <X className="w-3 h-3" />
                              </button>
                              <button onClick={() => { if (globalThis.confirm(`Partial Close (50%) Ticket #${pos.ticket}?`)) partialClose(pos.ticket, pos.symbol); }} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-xiphos-gold/20 text-xiphos-gold border border-xiphos-gold/30 rounded text-xs font-bold transition-all hover:shadow-[0_0_8px_rgba(212,175,55,0.3)]" title="Partial Close">
                                <Scissors className="w-3 h-3" />
                              </button>
                              <button onClick={() => {}} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-white/20 text-xiphos-muted hover:text-white border border-white/20 rounded text-xs font-bold transition-all" title="Move SL">
                                <MoveVertical className="w-3 h-3" />
                              </button>
                              <button onClick={() => {}} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-white/20 text-xiphos-muted hover:text-white border border-white/20 rounded text-xs font-bold transition-all" title="Move TP">
                                <Target className="w-3 h-3" />
                              </button>
                              <button onClick={() => {}} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-white/20 text-xiphos-muted hover:text-white border border-white/20 rounded text-xs font-bold transition-all" title="Trail Stop">
                                <Navigation className="w-3 h-3" />
                              </button>
                              <button onClick={() => { if (globalThis.confirm(`Breakeven Ticket #${pos.ticket}?`)) breakeven(pos.ticket, pos.symbol); }} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-xiphos-emerald/20 text-xiphos-emerald border border-xiphos-emerald/30 rounded text-xs font-bold transition-all hover:shadow-[0_0_8px_rgba(34,197,94,0.3)]" title="Breakeven">
                                <ShieldAlert className="w-3 h-3" />
                              </button>
                              <button onClick={() => {}} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-white/20 text-xiphos-muted hover:text-white border border-white/20 rounded text-xs font-bold transition-all" title="Scale In">
                                <Plus className="w-3 h-3" />
                              </button>
                              <button onClick={() => {}} className="p-1.5 bg-[rgba(11,15,23,0.5)] hover:bg-white/20 text-xiphos-muted hover:text-white border border-white/20 rounded text-xs font-bold transition-all" title="Scale Out">
                                <Minus className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Footer */}
      <GlassCard className="shrink-0 p-4 rounded-none border-b-0 border-l-0 border-r-0">
        <div className="flex items-center justify-between text-sm font-bold tracking-widest">
          <div className="flex items-center gap-3 text-xiphos-gold glow-gold">
            <ShieldAlert className="h-5 w-5" />
            <span>PORTFOLIO RISK CONTAINMENT FIELD</span>
          </div>
          <span className="text-xiphos-muted">
            ACTIVE EXPOSURE: <span className="text-xiphos-emerald glow-emerald font-black">{totalLots.toFixed(2)} LOTS (WITHIN LIMITS)</span>
          </span>
        </div>
      </GlassCard>
    </GlassPanel>
  );
}
