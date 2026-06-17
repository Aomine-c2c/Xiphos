"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { CheckCircle, Clock, AlertTriangle, Play, Award } from "lucide-react";

export default function MarketRadar() {
  const { rankedSignals } = useTradingStore();

  const getConfidence = (priority: number) => {
    if (priority === 1) return "94%";
    if (priority === 2) return "92%";
    if (priority === 3) return "78%";
    return "72%";
  };

  const getStatusIcon = (status: string) => {
    if (status === "APPROVED") return <CheckCircle className="h-3.5 w-3.5 text-[#00D26A]" />;
    if (status === "PENDING") return <Clock className="h-3.5 w-3.5 text-[#FFB020]" />;
    return <AlertTriangle className="h-3.5 w-3.5 text-[#FF4D4D]" />;
  };

  const getStatusClass = (status: string) => {
    if (status === "APPROVED") return "bg-[#00D26A]/5 border-[#00D26A]/45 text-[#00D26A]";
    if (status === "PENDING") return "bg-[#FFB020]/5 border-[#FFB020]/45 text-[#FFB020]";
    return "bg-[#FF4D4D]/5 border-[#FF4D4D]/45 text-[#FF4D4D]";
  };

  // Evolve Typography: Title +40% (text-[11px] -> text-[15px])
  // Section Headers +30% (text-[9px] -> text-[11px])
  return (
    <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden font-mono select-none h-full justify-between">
      
      {/* Title Header (+40% scaled: text-[14.5px]) */}
      <div className="p-2 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40 flex-shrink-0">
        <span className="text-[14.5px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
          <Award className="h-4 w-4 text-xiphos-blue" />
          TOP OPPORTUNITIES QUEUE
        </span>
      </div>

      {/* Main List */}
      <div className="p-2 space-y-1 bg-[#070B14]/30 flex-1 overflow-hidden flex flex-col justify-between">
        <div className="w-full overflow-x-hidden flex-1 min-h-0">
          <table className="w-full text-left text-[10px] border-collapse font-bold">
            <thead>
              {/* Section Headers (+30% scaled: text-[8px] -> text-[10.5px]) */}
              <tr className="bg-slate-950/70 border-b border-slate-900 text-[#6f7e90] uppercase text-[10.5px] select-none">
                <th className="p-1 font-black text-center w-10">RANK</th>
                <th className="p-1 font-black">SYMBOL</th>
                <th className="p-1 font-black text-center">CONF</th>
                <th className="p-1 font-black text-right">RISK</th>
                <th className="p-1 font-black text-center">STATUS</th>
                <th className="p-1 text-center font-black">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {rankedSignals.slice(0, 3).map((opp) => {
                const confidence = getConfidence(opp.priority);
                const isApproved = opp.status === "APPROVED";

                return (
                  <tr
                    key={opp.priority}
                    className="border-b border-slate-950 hover:bg-[#0E1525]/60 transition-colors"
                  >
                    <td className="p-2 text-center text-xiphos-blue font-black text-[11px]">{opp.priority}</td>
                    <td className="p-2 text-white text-[11px] font-black flex items-center gap-1.5">
                      <span className={`text-[8.5px] font-black px-1 py-0.2 rounded-sm leading-none ${
                        opp.direction === "BUY" ? "bg-[#00D26A] text-black" : "bg-[#FF4D4D] text-white"
                      }`}>
                        {opp.direction}
                      </span>
                      {opp.symbol}
                    </td>
                    <td className="p-2 text-center text-white text-[11px] font-black">{confidence}</td>
                    <td className="p-2 text-right text-[#ccd6e0]">{opp.projected_risk.toFixed(2)}%</td>
                    <td className="p-1.5 text-center">
                      <span className={`px-1.5 py-0.5 rounded-sm text-[8px] font-black border uppercase tracking-wider flex items-center justify-center gap-1 ${getStatusClass(opp.status)}`}>
                        {getStatusIcon(opp.status)}
                        <span>{opp.status}</span>
                      </span>
                    </td>
                    <td className="p-1 text-center flex justify-center items-center">
                      {isApproved ? (
                        <button
                          onClick={() => alert(`Engaging Opportunities selection: ${opp.symbol}`)}
                          className="px-2 py-1 bg-[#00A8FF] hover:bg-sky-400 text-black text-[8px] font-black tracking-widest uppercase rounded-sm transition-all flex items-center gap-0.5 cursor-pointer"
                        >
                          <Play className="h-2.5 w-2.5 fill-current" /> ENGAGE
                        </button>
                      ) : (
                        <span className="text-[8px] text-[#425062] font-black">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Dynamic status tracker footer */}
        <div className="text-[9px] text-[#6f7e90] border-t border-slate-950 pt-2 flex items-center justify-between">
          <span>✓ DISPATCH CRITERIA SETTINGS LOCKED</span>
          <span>LIMIT: 4 SCAN SLOTS</span>
        </div>
      </div>

    </div>
  );
}
