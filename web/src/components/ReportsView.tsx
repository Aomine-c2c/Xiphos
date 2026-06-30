"use client";

import React from "react";
import { FileText, TrendingUp, Download } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";
import { motion } from "framer-motion";

export default function ReportsView() {
  const { performanceMetrics } = useTradingStore();

  const balanceHistory = performanceMetrics?.equity_curve || [100];
  const equityHistory = performanceMetrics?.equity_curve || [100];

  const reportsList = [
    { id: "R-9402", type: "AUDIT LOG", name: "DAILY_PERFORMANCE_2026_06_16.csv", date: "2026-06-16", size: "12 KB" },
    { id: "R-9399", type: "RISK REPORT", name: "CORRELATION_GUARD_INCIDENTS.log", date: "2026-06-15", size: "4 KB" },
    { id: "R-9385", type: "EQUITY STATEMENT", name: "MONTHLY_STATEMENT_2026_05.pdf", date: "2026-06-01", size: "148 KB" },
    { id: "R-9370", type: "AUDIT LOG", name: "DAILY_PERFORMANCE_2026_05_31.csv", date: "2026-05-31", size: "11 KB" },
  ];

  const kpis = [
    { label: "PROFIT FACTOR", value: performanceMetrics?.profit_factor.toFixed(2) || "0.00", sub: "EFFICIENCY RATING", colorClass: "text-xiphos-gold glow-gold" },
    { label: "WIN RATE", value: `${performanceMetrics?.win_rate.toFixed(1) || 0}%`, sub: "RELIABILITY", colorClass: "text-xiphos-cyan glow-cyan" },
    { label: "MAX DRAWDOWN", value: `-$${performanceMetrics?.max_drawdown.toFixed(2) || 0}`, sub: "PEAK TO TROUGH", colorClass: "text-xiphos-crimson glow-crimson" },
    { label: "TOTAL RETURN", value: `+$${performanceMetrics?.total_profit.toFixed(2) || 0}`, sub: "SINCE INCEPTION", colorClass: "text-xiphos-emerald glow-emerald" },
  ];

  const drawChart = () => {
    const W = 520, H = 160, PAD = 14;
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
    ePath += ` L ${eC.at(-1)!.x} ${eC.at(-1)!.y}`;

    const bFill = bPath + ` L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;
    const eFill = ePath + ` L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible filter drop-shadow-[0_0_8px_rgba(76,201,240,0.3)]">
        <defs>
          <linearGradient id="rBg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CC9F0" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4CC9F0" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="rEg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[PAD, H / 2, H - PAD].map(y => (
          <line key={y} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3,3" />
        ))}
        <path d={bFill} fill="url(#rBg)" />
        <path d={eFill} fill="url(#rEg)" />
        <path fill="none" stroke="#4CC9F0" strokeWidth="1.5" d={bPath} strokeLinecap="round" strokeDasharray="3,3" />
        <path fill="none" stroke="#22C55E" strokeWidth="2.5" d={ePath} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={eC.at(-1)!.x} cy={eC.at(-1)!.y} r="4" fill="#22C55E" className="animate-pulse" />
        <g transform={`translate(${PAD + 4}, ${PAD + 8})`}>
          <circle cx="3" cy="-2" r="3" fill="#4CC9F0" />
          <text x="10" y="1" fill="#94A3B8" fontSize="7" fontFamily="monospace" fontWeight="bold">BALANCE</text>
          <circle cx="75" cy="-2" r="3" fill="#22C55E" />
          <text x="82" y="1" fill="#94A3B8" fontSize="7" fontFamily="monospace" fontWeight="bold">EQUITY</text>
        </g>
      </svg>
    );
  };

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2 p-0 transition-all duration-300">
      <div className="glass-panel flex flex-col overflow-hidden flex-1 min-h-0 relative rounded-none border-0">

        {/* Subtle Background Glow */}
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-xiphos-cyan opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-2 border-b border-white/5 flex items-center bg-black/20 shrink-0 z-10">
          <span className="text-[10px] font-black text-xiphos-cyan uppercase tracking-widest flex items-center gap-1 glow-cyan">
            <FileText className="h-4 w-4" />
            XIPHOS PERFORMANCE AUDIT & COMPLIANCE REPORTS
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden z-10">

          {/* LEFT: KPIs */}
          <div className="col-span-3 border-r border-white/5 p-4 flex flex-col gap-2 overflow-hidden bg-black/20">
            <span className="text-[10px] text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-1">
              LIFETIME METRICS
            </span>

            <div className="flex flex-col gap-2">
              {kpis.map((kpi, i) => (
                <motion.div 
                  key={kpi.label} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="glass-card p-3 hover:border-white/20 transition-all cursor-default group shrink-0"
                >
                  <div className="text-[9px] text-xiphos-muted font-black uppercase tracking-widest mb-1 group-hover:text-white transition-colors">{kpi.label}</div>
                  <div className={`text-2xl font-black leading-none mb-1 ${kpi.colorClass}`}>{kpi.value}</div>
                  <div className="text-[8px] text-xiphos-muted tracking-widest uppercase">{kpi.sub}</div>
                </motion.div>
              ))}
            </div>

            <div className="mt-auto pt-2 shrink-0">
              <button className="w-full py-2 bg-xiphos-cyan/20 text-xiphos-cyan border border-xiphos-cyan/50 hover:bg-xiphos-cyan hover:text-black text-[10px] font-black uppercase tracking-widest rounded transition-all flex justify-center items-center gap-1">
                <Download className="w-3 h-3" /> EXPORT ALL DATA
              </button>
            </div>
          </div>

          {/* RIGHT: Chart + Reports Table */}
          <div className="col-span-9 p-4 flex flex-col gap-2 overflow-hidden">

            {/* Main Equity Chart */}
            <div className="h-40 shrink-0 glass-card flex flex-col p-3 relative group hover:border-xiphos-cyan/30 transition-all">
              <span className="text-[10px] text-xiphos-muted font-black uppercase tracking-wider border-b border-white/5 pb-1 mb-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-xiphos-cyan" />
                CONSOLIDATED EQUITY GROWTH (YTD)
              </span>
              <div className="flex-1 min-h-0 w-full pt-2">
                {drawChart()}
              </div>
            </div>

            {/* Generated Reports Archive */}
            <div className="flex-1 min-h-0 flex flex-col glass-card border border-white/5 overflow-hidden">
              <div className="flex justify-between items-center p-2 border-b border-white/5 bg-black/20 shrink-0">
                <span className="text-[10px] text-xiphos-muted font-black uppercase tracking-wider">
                  SECURE DOCUMENT ARCHIVE
                </span>
                <span className="text-[8px] text-xiphos-muted tracking-widest bg-black/40 px-2 py-0.5 rounded">
                  4 DOCUMENTS
                </span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar">
                <table className="w-full text-left text-[9px] border-collapse whitespace-nowrap">
                  <thead className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
                    <tr className="text-xiphos-muted text-[9px] tracking-widest uppercase">
                      <th className="p-2 pl-3 font-black">ID</th>
                      <th className="p-2 font-black">TYPE</th>
                      <th className="p-2 font-black">DOCUMENT NAME</th>
                      <th className="p-2 font-black">DATE</th>
                      <th className="p-2 font-black text-right">SIZE</th>
                      <th className="p-2 pr-3 text-right font-black">ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportsList.map((r, i) => (
                      <motion.tr 
                        key={r.id} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + (i * 0.05) }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                      >
                        <td className="p-2 pl-3 text-xiphos-muted font-bold">{r.id}</td>
                        <td className="p-2 text-[8px] font-black tracking-widest text-xiphos-purple">{r.type}</td>
                        <td className="p-2 font-mono text-white group-hover:text-xiphos-cyan transition-colors">{r.name}</td>
                        <td className="p-2 font-mono text-xiphos-muted">{r.date}</td>
                        <td className="p-2 text-right text-xiphos-muted">{r.size}</td>
                        <td className="p-2 pr-3 text-right">
                          <button title="Download report" aria-label="Download report" className="opacity-0 group-hover:opacity-100 p-1 text-xiphos-muted hover:text-white hover:bg-white/10 rounded transition-all">
                            <Download className="w-3 h-3" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
