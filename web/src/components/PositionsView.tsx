"use client";

import React, { useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Briefcase, ShieldAlert, BrainCircuit, Activity, Crosshair } from "lucide-react";

export default function PositionsView() {
  const { positions, orders, activePositionsTab } = useTradingStore();

  const [page, setPage] = useState(0);
  const itemsPerPage = 12;

  const dataToPaginate = activePositionsTab === "ACTIVE" ? positions : orders;
  const totalPages = Math.max(1, Math.ceil(dataToPaginate.length / itemsPerPage));
  const paginatedData = dataToPaginate.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  const totalPnL = positions.reduce((acc, p) => acc + p.profit, 0);
  const riskBearingCount = positions.filter(p => p.risk_status === "RISK").length;
  const riskFreeCount = positions.filter(p => p.risk_status === "FREE").length;

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300">
      
      <div className="bg-[#09090e] border border-[#1e1e2e] rounded-xl flex flex-col flex-1 overflow-hidden relative">

        {/* Data Table */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-[#0f0f1a] shadow-md z-10">
              <tr className="border-b border-[#1e1e2e]">
                <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest w-24">Ticket</th>
                <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest">Asset</th>
                <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest text-center">Type</th>
                <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest text-right">Volume</th>
                <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest text-right">Open Price</th>
                <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest text-right">SL</th>
                <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest text-right">TP</th>
                {activePositionsTab === "ACTIVE" && (
                  <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest text-right">PnL</th>
                )}
                {activePositionsTab === "PENDING" && (
                  <th className="py-3 px-6 text-[#52525b] font-bold uppercase tracking-widest text-right">Status</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e1e2e]/50">
              {paginatedData.map((item) => {
                const isLong = item.type === "BUY" || item.type === "BUYLIMIT" || item.type === "BUYSTOP";
                const typeColor = isLong ? "text-[#4ade80] bg-[#4ade80]/10" : "text-[#f87171] bg-[#f87171]/10";
                const rowBaseClass = "hover:bg-[#1e1e2e]/30 transition-colors";

                if (activePositionsTab === "ACTIVE") {
                  const p = item as any;
                  return (
                    <tr key={p.ticket} className={rowBaseClass}>
                      <td className="py-3 px-6 font-mono text-[#94a3b8]">#{p.ticket}</td>
                      <td className="py-3 px-6 font-bold text-white">{p.symbol}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColor}`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-[#e2e8f0]">{p.volume.toFixed(2)}</td>
                      <td className="py-3 px-6 text-right font-mono text-[#94a3b8]">{p.open_price.toFixed(5)}</td>
                      <td className="py-3 px-6 text-right font-mono text-[#f87171]">{p.sl > 0 ? p.sl.toFixed(5) : "NONE"}</td>
                      <td className="py-3 px-6 text-right font-mono text-[#4ade80]">{p.tp > 0 ? p.tp.toFixed(5) : "NONE"}</td>
                      <td className="py-3 px-6 text-right font-mono">
                        <span className={p.profit >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}>
                          ${p.profit.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                } else {
                  const o = item as any;
                  return (
                    <tr key={o.ticket} className={rowBaseClass}>
                      <td className="py-3 px-6 font-mono text-[#94a3b8]">#{o.ticket}</td>
                      <td className="py-3 px-6 font-bold text-white">{o.symbol}</td>
                      <td className="py-3 px-6 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${typeColor}`}>
                          {o.type}
                        </span>
                      </td>
                      <td className="py-3 px-6 text-right font-mono text-[#e2e8f0]">{o.volume.toFixed(2)}</td>
                      <td className="py-3 px-6 text-right font-mono text-[#94a3b8]">{o.open_price.toFixed(5)}</td>
                      <td className="py-3 px-6 text-right font-mono text-[#f87171]">{o.sl > 0 ? o.sl.toFixed(5) : "NONE"}</td>
                      <td className="py-3 px-6 text-right font-mono text-[#4ade80]">{o.tp > 0 ? o.tp.toFixed(5) : "NONE"}</td>
                      <td className="py-3 px-6 text-right font-mono text-[#52525b]">PLACED</td>
                    </tr>
                  );
                }
              })}
              {paginatedData.length === 0 && (
                <tr>
                  <td colSpan={activePositionsTab === "ACTIVE" ? 8 : 8} className="py-12 text-center text-[#52525b] font-bold uppercase tracking-widest">
                    No {activePositionsTab.toLowerCase()} deployments
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
