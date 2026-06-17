"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Award } from "lucide-react";

interface TradeRecord {
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  profit: number;
  close_time: string;
}

export default function AnalyticsView() {
  const [history, setHistory] = useState<TradeRecord[]>([
    { ticket: 108422, symbol: "EURUSD", type: "SELL", volume: 0.01, profit: 1.20, close_time: "14:20:12" },
    { ticket: 240715, symbol: "XAUUSD", type: "BUY", volume: 0.01, profit: 3.50, close_time: "14:15:00" },
    { ticket: 108399, symbol: "EURUSD", type: "BUY", volume: 0.01, profit: -0.50, close_time: "14:10:45" },
    { ticket: 31590, symbol: "XAGUSD", type: "BUY", volume: 0.01, profit: 0.95, close_time: "13:58:32" },
    { ticket: 108340, symbol: "EURUSD", type: "BUY", volume: 0.01, profit: 2.10, close_time: "13:45:10" },
    { ticket: 240650, symbol: "XAUUSD", type: "BUY", volume: 0.01, profit: 5.20, close_time: "13:20:00" },
  ]);

  const [metrics, setMetrics] = useState({ sharpe: 2.84, profitFactor: 3.45, winRate: 83.3, expectancy: 1.19, scalperProfit: 17.65, runnerProfit: 9.80 });

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch("http://127.0.0.1:8001/api/history?limit=10");
        if (r1.ok) {
          const d = await r1.json();
          if (d && d.length > 0) {
            setHistory(d.map((x: any) => ({
              ticket: x.ticket, symbol: x.symbol,
              type: x.type === 0 ? "BUY" : "SELL",
              volume: x.volume, profit: x.profit,
              close_time: x.close_time ? x.close_time.split(" ")[1] || x.close_time : "—",
            })));
          }
        }
        const r2 = await fetch("http://127.0.0.1:8001/api/performance");
        if (r2.ok) {
          const d = await r2.json();
          if (d && d.global) {
            setMetrics(prev => ({ ...prev, sharpe: d.global.sharpe_ratio || prev.sharpe, expectancy: d.global.expectancy || prev.expectancy }));
          }
        }
      } catch {}
    })();
  }, []);

  // Equity curve data
  const balanceHistory = [100.00, 100.00, 102.10, 102.10, 104.85, 104.85, 114.30, 114.30, 117.30, 117.30, 127.45];
  const equityHistory =  [100.00, 102.10, 101.60, 104.85, 103.90, 109.10, 114.30, 113.80, 117.30, 122.50, 127.45];

  const drawEquityChart = () => {
    const W = 560, H = 130, PAD = 16;
    const all = [...balanceHistory, ...equityHistory];
    const min = Math.min(...all) * 0.998;
    const max = Math.max(...all) * 1.002;
    const range = max - min || 1;

    const toCoord = (vals: number[]) =>
      vals.map((v, i) => ({
        x: PAD + (i / (vals.length - 1)) * (W - PAD * 2),
        y: H - PAD - ((v - min) / range) * (H - PAD * 2),
      }));

    const balCoords = toCoord(balanceHistory);
    const eqCoords = toCoord(equityHistory);

    let balPath = `M ${balCoords[0].x} ${balCoords[0].y}`;
    for (let i = 0; i < balCoords.length - 1; i++) {
      balPath += ` H ${balCoords[i + 1].x} V ${balCoords[i + 1].y}`;
    }
    let eqPath = `M ${eqCoords[0].x} ${eqCoords[0].y}`;
    for (let i = 0; i < eqCoords.length - 1; i++) {
      const xc = (eqCoords[i].x + eqCoords[i + 1].x) / 2;
      const yc = (eqCoords[i].y + eqCoords[i + 1].y) / 2;
      eqPath += ` Q ${eqCoords[i].x} ${eqCoords[i].y}, ${xc} ${yc}`;
    }
    eqPath += ` L ${eqCoords[eqCoords.length - 1].x} ${eqCoords[eqCoords.length - 1].y}`;

    const balFill = balPath + ` L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;
    const eqFill = eqPath + ` L ${W - PAD} ${H - PAD} L ${PAD} ${H - PAD} Z`;

    return (
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00A8FF" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#00A8FF" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00D26A" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#00D26A" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[PAD, H / 2, H - PAD].map(y => (
          <line key={y} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#0E1525" strokeWidth="1" strokeDasharray="3,3" />
        ))}
        <path d={balFill} fill="url(#bg)" />
        <path d={eqFill} fill="url(#eg)" />
        <path fill="none" stroke="#00A8FF" strokeWidth="1.5" d={balPath} strokeLinecap="round" strokeDasharray="3,3" />
        <path fill="none" stroke="#00D26A" strokeWidth="2" d={eqPath} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={eqCoords[eqCoords.length - 1].x} cy={eqCoords[eqCoords.length - 1].y} r="4" fill="#00D26A" />
        <g transform={`translate(${PAD + 4}, ${PAD + 8})`}>
          <circle cx="3" cy="-2" r="2.5" fill="#00A8FF" />
          <text x="10" y="1" fill="#6f7e90" fontSize="7" fontFamily="monospace">BALANCE</text>
          <circle cx="75" cy="-2" r="2.5" fill="#00D26A" />
          <text x="82" y="1" fill="#6f7e90" fontSize="7" fontFamily="monospace">EQUITY</text>
        </g>
      </svg>
    );
  };

  const totalSubProfit = metrics.scalperProfit + metrics.runnerProfit || 1;
  const scalperPct = Math.round((metrics.scalperProfit / totalSubProfit) * 100);

  const kpis = [
    { label: "WIN RATE", value: `${metrics.winRate.toFixed(1)}%`, color: "#00D26A" },
    { label: "PROFIT FACTOR", value: metrics.profitFactor.toFixed(2), color: "#00A8FF" },
    { label: "SHARPE RATIO", value: metrics.sharpe.toFixed(2), color: "#FFB020" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2">
      <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center bg-[#0a101b]/40 flex-shrink-0">
          <span className="text-xs font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            XIPHOS PERFORMANCE ANALYTICS & STRATEGY HISTORY
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: KPI cards */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden">
            <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              PERFORMANCE KPIs
            </span>

            {kpis.map(kpi => (
              <div key={kpi.label} className="bg-[#070B14]/40 border border-slate-900/60 rounded-sm p-3.5">
                <div className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider mb-1.5">{kpi.label}</div>
                <div className="text-[28px] font-black leading-none" style={{ color: kpi.color }}>{kpi.value}</div>
              </div>
            ))}

            {/* Strategy profit split */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block mb-3">STRATEGY SPLIT</span>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-[#8e9aa8]">
                  <span>SCALPER (A)</span>
                  <span className="text-[#00D26A] font-black">{scalperPct}%</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold text-[#8e9aa8]">
                  <span>RUNNER (B)</span>
                  <span className="text-xiphos-blue font-black">{100 - scalperPct}%</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-sm overflow-hidden flex border border-slate-900/50">
                  <div className="h-full bg-[#00D26A]" style={{ width: `${scalperPct}%` }} />
                  <div className="h-full bg-xiphos-blue flex-1" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-950 pt-3">
              <div className="space-y-1.5 text-[10px] text-[#8e9aa8]">
                <div className="flex justify-between">
                  <span>EXPECTANCY</span>
                  <span className="text-white font-bold">${metrics.expectancy.toFixed(2)}/trade</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL TRADES</span>
                  <span className="text-white font-bold">{history.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Equity curve + trade history */}
          <div className="col-span-9 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Equity curve */}
            <div className="bg-[#070B14]/40 border border-slate-900/60 rounded-sm p-3.5 flex-shrink-0" style={{ height: "175px" }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider">HISTORICAL EQUITY GROWTH CURVE</span>
                <span className="text-[#00D26A] font-black text-[11px]">$127.45 USD</span>
              </div>
              <div className="flex-1 min-h-0" style={{ height: "120px" }}>
                {drawEquityChart()}
              </div>
            </div>

            {/* Trade history table */}
            <div className="flex-1 min-h-0 flex flex-col">
              <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2 border-b border-slate-950 pb-1.5 flex-shrink-0">
                TRADE HISTORY LOG
              </span>
              <div className="overflow-hidden flex-1 min-h-0">
                <table className="w-full text-left text-[11px] border-collapse font-bold">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[9px]">
                      <th className="p-2.5 font-black">TICKET</th>
                      <th className="p-2.5 font-black">SYMBOL</th>
                      <th className="p-2.5 font-black">DIR</th>
                      <th className="p-2.5 font-black text-right">LOTS</th>
                      <th className="p-2.5 font-black text-right">PROFIT</th>
                      <th className="p-2.5 font-black text-right">CLOSE TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((row) => (
                      <tr key={row.ticket} className="border-b border-slate-950/60 hover:bg-[#070B14]/60 transition-colors">
                        <td className="p-2.5 text-[#6f7e90]">{row.ticket}</td>
                        <td className="p-2.5 text-white font-black">{row.symbol}</td>
                        <td className={`p-2.5 font-black ${row.type === "BUY" ? "text-[#00D26A]" : "text-[#FF4D4D]"}`}>{row.type}</td>
                        <td className="p-2.5 text-right text-[#ccd6e0]">{row.volume.toFixed(2)}</td>
                        <td className={`p-2.5 text-right font-black ${row.profit >= 0 ? "text-[#00D26A]" : "text-[#FF4D4D]"}`}>
                          {row.profit >= 0 ? "+" : ""}${row.profit.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right text-[#425062]">{row.close_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
            <span>PORTFOLIO STATISTICAL HEALTH AUDIT CONTEXT</span>
          </div>
          <span className="text-[#8e9aa8] text-[9px]">
            AGGREGATE SHARPE: <span className="text-[#00A8FF] font-black">{metrics.sharpe.toFixed(2)} (OPTIMAL)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
