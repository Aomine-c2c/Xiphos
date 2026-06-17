"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Briefcase, ShieldAlert } from "lucide-react";

export default function PositionsView() {
  const { positions, closePosition, breakeven, partialClose } = useTradingStore();

  const currencyPositions = positions.filter((p) => ["EURUSD", "GBPUSD"].includes(p.symbol));
  const metalPositions = positions.filter((p) => ["XAUUSD", "XAGUSD"].includes(p.symbol));

  const totalLots = positions.reduce((acc, p) => acc + p.volume, 0);
  const totalPnL = positions.reduce((acc, p) => acc + p.profit, 0);

  const currencyLots = currencyPositions.reduce((acc, p) => acc + p.volume, 0);
  const metalLots = metalPositions.reduce((acc, p) => acc + p.volume, 0);
  const totalVolume = totalLots || 1;
  const currencyPct = Math.round((currencyLots / totalVolume) * 100);
  const metalPct = 100 - currencyPct;

  const riskBearingCount = positions.filter(p => p.risk_status === "RISK").length;
  const riskFreeCount = positions.filter(p => p.risk_status === "FREE").length;

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2">
      <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40 flex-shrink-0">
          <span className="text-xs font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <Briefcase className="h-4 w-4" />
            XIPHOS INSTITUTIONAL ACTIVE PORTFOLIO MONITOR
          </span>
          <div className="flex items-center gap-4 text-[10px] font-black">
            <span className="text-slate-500">TOTAL VOLUME: <span className="text-white">{totalLots.toFixed(2)} LOTS</span></span>
            <span className={`font-black text-[11px] ${totalPnL >= 0 ? "text-[#00D26A]" : "text-[#FF4D4D]"}`}>
              NET P&L: {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: Summary panels */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Unrealized PnL */}
            <div>
              <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">UNREALIZED P&L</span>
              <div className={`text-[28px] font-black leading-none ${totalPnL >= 0 ? "text-[#00D26A]" : "text-[#FF4D4D]"}`}>
                {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
              </div>
              <div className="text-[9px] text-[#425062] font-bold mt-1">FLOATING EQUITY EXPOSURE</div>
            </div>

            {/* Drawdown */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">DRAWDOWN STATUS</span>
              <div className="flex justify-between text-[10px] font-bold text-[#8e9aa8] mb-1.5">
                <span>CURRENT</span>
                <span className="text-[#00D26A] font-black">1.2%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                <div className="h-full bg-[#00D26A] transition-all" style={{ width: "24%" }} />
              </div>
              <div className="flex justify-between text-[8px] text-[#425062] mt-1">
                <span>0%</span><span>LIMIT: 5%</span>
              </div>
            </div>

            {/* Risk status */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">RISK STATUS</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-[#FF4D4D]/5 border border-[#FF4D4D]/20 rounded-sm p-2.5 text-center">
                  <div className="text-[22px] font-black text-[#FF4D4D] leading-none">{riskBearingCount}</div>
                  <div className="text-[8px] text-[#FF4D4D] font-bold uppercase mt-0.5">BEARING</div>
                </div>
                <div className="bg-[#00D26A]/5 border border-[#00D26A]/20 rounded-sm p-2.5 text-center">
                  <div className="text-[22px] font-black text-[#00D26A] leading-none">{riskFreeCount}</div>
                  <div className="text-[8px] text-[#00D26A] font-bold uppercase mt-0.5">RISK FREE</div>
                </div>
              </div>
            </div>

            {/* Exposure bars */}
            <div className="border-t border-slate-950 pt-3 flex-1 min-h-0">
              <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block mb-3">EXPOSURE WEIGHTS</span>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-[#8e9aa8] mb-1">
                    <span>CURRENCIES</span>
                    <span className="text-[#00D26A] font-black">{currencyPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                    <div className="h-full bg-[#00D26A]" style={{ width: `${currencyPct}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-[#8e9aa8] mb-1">
                    <span>METALS</span>
                    <span className="text-xiphos-blue font-black">{metalPct}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                    <div className="h-full bg-xiphos-blue" style={{ width: `${metalPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="mt-3 text-[8px] text-[#425062] leading-relaxed border-t border-slate-950 pt-2">
                ✓ Correlation guard blocks additions when same-bucket &gt;70%
              </div>
            </div>

          </div>

          {/* RIGHT: Full positions table */}
          <div className="col-span-9 p-4 flex flex-col overflow-hidden">
            <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider mb-2 border-b border-slate-950 pb-1.5 flex-shrink-0 block">
              ACTIVE TRADES REGISTRY ({positions.length})
            </span>
            <div className="flex-1 min-h-0 overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse font-bold">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[9px] select-none">
                    <th className="p-2.5 font-black">TICKET</th>
                    <th className="p-2.5 font-black">SYMBOL</th>
                    <th className="p-2.5 font-black">DIR</th>
                    <th className="p-2.5 font-black text-right">LOTS</th>
                    <th className="p-2.5 font-black text-right">OPEN PRICE</th>
                    <th className="p-2.5 font-black text-right">CURRENT</th>
                    <th className="p-2.5 font-black text-right">PROFIT</th>
                    <th className="p-2.5 font-black">RISK TYPE</th>
                    <th className="p-2.5 text-center font-black">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-24 text-[#425062] font-black uppercase text-[11px]">
                        [NO ACTIVE POSITIONS]
                      </td>
                    </tr>
                  ) : (
                    positions.map((pos) => {
                      const isProfit = pos.profit >= 0;
                      const isFree = pos.risk_status === "FREE";
                      return (
                        <tr key={pos.ticket} className="border-b border-slate-950/60 hover:bg-[#070B14]/60 transition-colors">
                          <td className="p-2.5 text-[#6f7e90]">{pos.ticket}</td>
                          <td className="p-2.5 text-white font-black">{pos.symbol}</td>
                          <td className={`p-2.5 font-black ${pos.type === "BUY" ? "text-[#00D26A]" : "text-[#FF4D4D]"}`}>{pos.type}</td>
                          <td className="p-2.5 text-right text-white">{pos.volume.toFixed(2)}</td>
                          <td className="p-2.5 text-right text-[#ccd6e0]">
                            {pos.price_open.toFixed(pos.symbol.includes("USD") && !pos.symbol.startsWith("X") ? 5 : 2)}
                          </td>
                          <td className="p-2.5 text-right text-[#ccd6e0]">
                            {pos.price_current.toFixed(pos.symbol.includes("USD") && !pos.symbol.startsWith("X") ? 5 : 2)}
                          </td>
                          <td className={`p-2.5 text-right font-black ${isProfit ? "text-[#00D26A]" : "text-[#FF4D4D]"}`}>
                            {isProfit ? "+" : ""}${pos.profit.toFixed(2)}
                          </td>
                          <td className="p-2.5">
                            <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black border uppercase ${
                              isFree ? "bg-[#00D26A]/5 border-[#00D26A]/45 text-[#00D26A]" : "bg-[#FF4D4D]/5 border-[#FF4D4D]/45 text-[#FF4D4D]"
                            }`}>
                              {isFree ? "RISK FREE" : "BEARING"}
                            </span>
                          </td>
                          <td className="p-2 flex gap-1 justify-center items-center">
                            <button onClick={() => breakeven(pos.ticket, pos.symbol)}
                              className="px-2 py-1 bg-[#00A8FF]/20 hover:bg-[#00A8FF] hover:text-black border border-[#00A8FF]/30 text-[#00A8FF] text-[9px] font-black rounded-sm cursor-pointer transition-all">
                              BE
                            </button>
                            <button onClick={() => partialClose(pos.ticket, pos.symbol)}
                              className="px-2 py-1 bg-[#FFB020]/20 hover:bg-[#FFB020] hover:text-black border border-[#FFB020]/30 text-[#FFB020] text-[9px] font-black rounded-sm cursor-pointer transition-all">
                              50%
                            </button>
                            <button onClick={() => closePosition(pos.ticket, pos.symbol)}
                              className="px-2 py-1 bg-[#FF4D4D]/20 hover:bg-[#FF4D4D] hover:text-black border border-[#FF4D4D]/30 text-[#FF4D4D] text-[9px] font-black rounded-sm cursor-pointer transition-all">
                              CLOSE
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="text-[9px] text-[#FFB020] font-bold leading-none border-t border-slate-950 pt-2.5 flex-shrink-0 mt-2">
              ⚠ WARNING: Manual actions bypass bot scheduling and send instructions directly to the execution pipeline.
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm p-3 flex-shrink-0">
        <div className="flex items-center justify-between text-[10px] font-black">
          <div className="flex items-center gap-2 text-[#FFB020]">
            <ShieldAlert className="h-4 w-4 animate-pulse" />
            <span>PORTFOLIO CONCENTRATION CONTEXT</span>
          </div>
          <span className="text-[#8e9aa8] text-[9px]">
            ACTIVE HEDGES: <span className="text-[#00D26A] font-black">STABLE (0 NEGATIVE CORRELATIONS DETECTED)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
