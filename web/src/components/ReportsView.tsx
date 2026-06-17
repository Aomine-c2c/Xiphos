"use client";

import React from "react";
import { FileText, TrendingUp, Download, Award } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";

export default function ReportsView() {
  const { account, performanceMetrics } = useTradingStore();

  const balanceHistory = performanceMetrics?.equity_curve || [100.0];
  const equityHistory = performanceMetrics?.equity_curve || [100.0];

  const reportsList = [
    { id: "R-9402", type: "AUDIT LOG", name: "DAILY_PERFORMANCE_2026_06_16.csv", date: "2026-06-16", size: "12 KB" },
    { id: "R-9399", type: "RISK REPORT", name: "CORRELATION_GUARD_INCIDENTS.log", date: "2026-06-15", size: "4 KB" },
    { id: "R-9385", type: "EQUITY STATEMENT", name: "MONTHLY_STATEMENT_2026_05.pdf", date: "2026-06-01", size: "148 KB" },
    { id: "R-9370", type: "AUDIT LOG", name: "DAILY_PERFORMANCE_2026_05_31.csv", date: "2026-05-31", size: "11 KB" },
  ];

  const kpis = [
    { label: "PROFIT FACTOR", value: performanceMetrics?.profit_factor.toFixed(2) || "0.00", sub: "EFFICIENCY RATING", color: "#00D26A" },
    { label: "WIN RATE", value: `${performanceMetrics?.win_rate.toFixed(1) || 0}%`, sub: "RELIABILITY", color: "#00A8FF" },
    { label: "MAX DRAWDOWN", value: `-$${performanceMetrics?.max_drawdown.toFixed(2) || 0}`, sub: "PEAK TO TROUGH", color: "#FF4D4D" },
    { label: "TOTAL RETURN", value: `+$${performanceMetrics?.total_profit.toFixed(2) || 0}`, sub: "SINCE INCEPTION", color: "#00D26A" },
  ];

  const drawChart = () => {
    const W = 520, H = 120, PAD = 14;
    const all = [...balanceHistory, ...equityHistory];
    const min = Math.min(...all) * 0.998;
    const max = Math.max(...all) * 1.002;
    const range = max - min || 1;

    const toXY = (vals: number[]) => vals.map((v, i) => ({
      x: PAD + (i / (vals.length - 1)) * (W - PAD * 2),
      y: H - PAD - ((v - min) / range) * (H - PAD * 2),
    }));

    const bC = toXY(balanceHistory);
    const eC = toXY(equityHistory);

    let bPath = `M ${bC[0].x} ${bC[0].y}`;
    for (let i = 0; i < bC.length - 1; i++) {
      bPath += ` H ${bC[i + 1].x} V ${bC[i + 1].y}`;
    }
    let ePath = `M ${eC[0].x} ${eC[0].y}`;
    for (let i = 0; i < eC.length - 1; i++) {
      const xc = (eC[i].x + eC[i + 1].x) / 2;
      const yc = (eC[i].y + eC[i + 1].y) / 2;
      ePath += ` Q ${eC[i].x} ${eC[i].y}, ${xc} ${yc}`;
    }
    ePath += ` L ${eC[eC.length - 1].x} ${eC[eC.length - 1].y}`;

    const bFill = bPath + ` L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;
    const eFill = ePath + ` L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <linearGradient id="rBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00A8FF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00A8FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rEg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D26A" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#00D26A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[PAD, H / 2, H - PAD].map(y => (
          <line key={y} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#0E1525" strokeWidth="1" strokeDasharray="3,3" />
        ))}
        <path d={bFill} fill="url(#rBg)" />
        <path d={eFill} fill="url(#rEg)" />
        <path fill="none" stroke="#00A8FF" strokeWidth="1.5" d={bPath} strokeLinecap="round" strokeDasharray="3,3" />
        <path fill="none" stroke="#00D26A" strokeWidth="2" d={ePath} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={eC[eC.length - 1].x} cy={eC[eC.length - 1].y} r="4" fill="#00D26A" />
        <g transform={`translate(${PAD + 4}, ${PAD + 8})`}>
          <circle cx="3" cy="-2" r="2.5" fill="#00A8FF" />
          <text x="10" y="1" fill="#6f7e90" fontSize="7" fontFamily="monospace">BALANCE</text>
          <circle cx="75" cy="-2" r="2.5" fill="#00D26A" />
          <text x="82" y="1" fill="#6f7e90" fontSize="7" fontFamily="monospace">EQUITY</text>
        </g>
      </svg>
    );
  };

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2">
      <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center bg-[#0a101b]/40 flex-shrink-0">
          <span className="text-xs font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            XIPHOS PERFORMANCE AUDIT & COMPLIANCE REPORTS
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: Performance summary */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-3 overflow-hidden">
            <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              PERFORMANCE SUMMARY
            </span>

            {kpis.map(kpi => (
              <div key={kpi.label} className="bg-[#070B14]/40 border border-slate-900/60 rounded-sm p-3">
                <div className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider mb-1">{kpi.label}</div>
                <div className="text-[20px] font-black leading-none" style={{ color: kpi.color }}>{kpi.value}</div>
                <div className="text-[8px] mt-0.5" style={{ color: kpi.color }}>{kpi.sub}</div>
              </div>
            ))}

            <div className="border-t border-slate-950 pt-3 mt-auto">
              <div className="space-y-1.5 text-[9px] text-[#8e9aa8]">
                <div className="flex justify-between">
                  <span>AUDIT FREQUENCY</span>
                  <span className="text-white font-bold">MONTHLY</span>
                </div>
                <div className="flex justify-between">
                  <span>SECURITY ENGINE</span>
                  <span className="text-[#00D26A] font-bold">SHIELD v2</span>
                </div>
                <div className="flex justify-between">
                  <span>COMPLIANCE CODE</span>
                  <span className="text-xiphos-blue font-bold">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Equity curve + export file list */}
          <div className="col-span-9 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Equity curve */}
            <div className="bg-[#070B14]/40 border border-slate-900/60 rounded-sm p-3.5 flex-shrink-0" style={{ height: "165px" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider">HISTORICAL EQUITY GROWTH CURVE</span>
                <span className="text-[11px] font-black text-[#00D26A]">CURRENT: ${account.equity.toFixed(2)} USD</span>
              </div>
              <div style={{ height: "110px" }}>
                {drawChart()}
              </div>
            </div>

            {/* Export file list */}
            <div className="flex-1 min-h-0 flex flex-col">
              <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2.5 border-b border-slate-950 pb-1.5 flex-shrink-0">
                RECENT COMPLIANCE & PERFORMANCE EXPORTS
              </span>
              <div className="space-y-2 flex-1 min-h-0 overflow-hidden">
                {reportsList.map(report => (
                  <div key={report.id}
                    className="border border-slate-950 bg-[#0E1525]/60 hover:bg-[#0E1525] transition-all p-3 rounded-sm flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 border border-xiphos-blue/40 text-xiphos-blue bg-xiphos-blue/5 rounded-sm font-black text-[8px] uppercase">
                          {report.type}
                        </span>
                        <span className="text-white font-bold text-[10px]">{report.name}</span>
                      </div>
                      <div className="text-[9px] text-[#6f7e90]">
                        Export: {report.date} <span className="mx-1">·</span> Size: {report.size}
                      </div>
                    </div>
                    <button
                      onClick={() => alert(`Downloading ${report.id}`)}
                      className="p-1.5 bg-slate-950 hover:bg-[#00A8FF]/20 text-[#6f7e90] hover:text-[#00A8FF] border border-slate-900 hover:border-[#00A8FF]/40 rounded-sm cursor-pointer transition-all">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm p-3 flex-shrink-0">
        <div className="flex items-center justify-between text-[10px] font-black">
          <div className="flex items-center gap-2 text-[#00D26A]">
            <TrendingUp className="h-4 w-4" />
            <span>XIPHOS STRATEGY COMPLIANCE STATEMENT</span>
          </div>
          <span className="text-[#8e9aa8] text-[9px]">
            PROFIT FACTOR: <span className="text-[#00D26A] font-black">{performanceMetrics?.profit_factor.toFixed(2) || "0.00"} (HIGH EFFICIENCY)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
