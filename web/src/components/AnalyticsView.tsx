"use client";

import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

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
    { ticket: 108422, symbol: "EURUSD", type: "SELL", volume: 0.01, profit: 1.2, close_time: "14:20:12" },
    { ticket: 240715, symbol: "XAUUSD", type: "BUY", volume: 0.01, profit: 3.5, close_time: "14:15:00" },
    { ticket: 108399, symbol: "EURUSD", type: "BUY", volume: 0.01, profit: -0.5, close_time: "14:10:45" },
    { ticket: 31590, symbol: "XAGUSD", type: "BUY", volume: 0.01, profit: 0.95, close_time: "13:58:32" },
    { ticket: 108340, symbol: "EURUSD", type: "BUY", volume: 0.01, profit: 2.1, close_time: "13:45:10" },
    { ticket: 240650, symbol: "XAUUSD", type: "BUY", volume: 0.01, profit: 5.2, close_time: "13:20:00" },
  ]);

  const [metrics, setMetrics] = useState({ sharpe: 2.84, profitFactor: 3.45, winRate: 83.3, expectancy: 1.19, scalperProfit: 17.65, runnerProfit: 9.8 });

  const [page, setPage] = useState(0);
  const itemsPerPage = 5;
  const totalPages = Math.max(1, Math.ceil(history.length / itemsPerPage));
  const paginatedHistory = history.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch("http://127.0.0.1:8001/api/history?limit=10");
        if (r1.ok) {
          const d = await r1.json();
          if (d && d.length > 0) {
            setHistory(d.map((x: Record<string, unknown>) => ({
              ticket: Number(x.ticket), symbol: String(x.symbol),
              type: x.type === 0 ? "BUY" : "SELL",
              volume: Number(x.volume), profit: Number(x.profit),
              close_time: typeof x.close_time === 'string' ? x.close_time.split(" ")[1] || x.close_time : "—",
            })));
          }
        }
        const r2 = await fetch("http://127.0.0.1:8001/api/performance");
        if (r2.ok) {
          const d = await r2.json();
          if (d?.global) {
            setMetrics(prev => ({ ...prev, sharpe: d.global.sharpe_ratio || prev.sharpe, expectancy: d.global.expectancy || prev.expectancy }));
          }
        }
      } catch {}
    })();
  }, []);

  // Equity curve data
  const balanceHistory = [100, 100, 102.1, 102.1, 104.85, 104.85, 114.3, 114.3, 117.3, 117.3, 127.45];
  const equityHistory =  [100, 102.1, 101.6, 104.85, 103.9, 109.1, 114.3, 113.8, 117.3, 122.5, 127.45];

  const drawEquityChart = () => {
    const data = balanceHistory.map((bal, i) => ({
      index: i,
      balance: bal,
      equity: equityHistory[i]
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00A8FF" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00A8FF" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00D26A" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00D26A" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "#0E1525", borderColor: "#1E293B", color: "#fff", fontSize: "10px", fontFamily: "monospace" }} 
            itemStyle={{ fontWeight: "bold" }}
          />
          <Area type="step" dataKey="balance" stroke="#00A8FF" fillOpacity={1} fill="url(#colorBalance)" isAnimationActive={true} animationDuration={1000} />
          <Area type="monotone" dataKey="equity" stroke="#00D26A" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} isAnimationActive={true} animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const totalSubProfit = metrics.scalperProfit + metrics.runnerProfit || 1;
  const scalperPct = Math.round((metrics.scalperProfit / totalSubProfit) * 100);

  const kpis = [
    { label: "WIN RATE", value: `${metrics.winRate.toFixed(1)}%`, colorClass: "text-xiphos-green" },
    { label: "PROFIT FACTOR", value: metrics.profitFactor.toFixed(2), colorClass: "text-xiphos-blue" },
    { label: "SHARPE RATIO", value: metrics.sharpe.toFixed(2), colorClass: "text-yellow-500" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2 transition-all duration-300 hover:border-xiphos-blue/40">
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm flex flex-col flex-1 min-h-0">
        
        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40 shrink-0">
          <span className="text-3xl font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <BarChart3 className="h-4 w-4" />
            XIPHOS PERFORMANCE ANALYTICS & STRATEGY HISTORY
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: KPI cards */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden">
            <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              PERFORMANCE KPIs
            </span>

            {kpis.map(kpi => (
              <div key={kpi.label} className="bg-xiphos-bg/40 border border-slate-900/50 p-4 rounded flex items-center justify-between">
                <div>
                  <div className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider mb-1">{kpi.label}</div>
                  <div className={`text-[34px] font-black leading-none ${kpi.colorClass}`}>{kpi.value}</div>
                </div>
              </div>
            ))}

            {/* Strategy profit split */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-3">STRATEGY SPLIT</span>
              <div className="space-y-2">
                <div className="flex justify-between text-[16px] font-bold text-[#8e9aa8]">
                  <span>SCALPER (A)</span>
                  <span className="text-[#00D26A] font-black">{scalperPct}%</span>
                </div>
                <div className="flex justify-between text-[16px] font-bold text-[#8e9aa8]">
                  <span>RUNNER (B)</span>
                  <div className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider mb-2 flex items-center gap-2">
                    WIN RATE
                    <div className="h-1.5 w-16 bg-[#1a2332] rounded-full overflow-hidden">
                      <div className="h-full bg-xiphos-green" style={{ width: `${metrics.winRate}%` }}></div>
                    </div>
                  </div>
                  <div className="h-full bg-xiphos-blue flex-1" />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-950 pt-3">
              <div className="space-y-1.5 text-[16px] text-[#8e9aa8]">
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

          {/* RIGHT: History Log (7/12) */}
          <div className="col-span-7 flex flex-col min-h-0 shrink-0">
            {/* Table Header */}
            <div className="bg-[#070B14]/40 border border-slate-900/60 rounded-sm p-3.5 flex-shrink-0 h-[175px]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider">HISTORICAL EQUITY GROWTH CURVE</span>
                <span className="text-xiphos-green font-black text-[17px]">$127.45 USD</span>
              </div>
              <div className="flex-1 min-h-0 h-[120px]">
                {drawEquityChart()}
              </div>
            </div>

            {/* Trade history table */}
            <div className="flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-2 border-b border-slate-950 pb-1.5 flex-shrink-0">
                <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider">
                  TRADE HISTORY LOG
                </span>
                <div className="flex items-center gap-2">
                  <button title="Previous Page" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-[#6f7e90] hover:text-xiphos-blue disabled:opacity-30 disabled:hover:text-[#6f7e90]">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-white text-[16px]">{page + 1} / {totalPages}</span>
                  <button title="Next Page" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="text-[#6f7e90] hover:text-xiphos-blue disabled:opacity-30 disabled:hover:text-[#6f7e90]">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="overflow-hidden flex-1 min-h-0">
                <table className="w-full text-left text-[17px] border-collapse font-bold">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[15px]">
                      <th className="p-2.5 font-black">TICKET</th>
                      <th className="p-2.5 font-black">SYMBOL</th>
                      <th className="p-2.5 font-black">DIR</th>
                      <th className="p-2.5 font-black text-right">LOTS</th>
                      <th className="p-2.5 font-black text-right">PROFIT</th>
                      <th className="p-2.5 font-black text-right">CLOSE TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((t) => (
                        <tr key={t.ticket} className="border-b border-slate-900/50 hover:bg-xiphos-bg/60 transition-colors">
                          <td className="p-2.5 text-[#6f7e90]">#{t.ticket}</td>
                          <td className="p-2.5 text-white font-black">{t.symbol}</td>
                          <td className={`p-2.5 font-black ${t.type === "BUY" ? "text-xiphos-green" : "text-xiphos-red"}`}>{t.type}</td>
                          <td className="p-2.5 text-white">{t.volume.toFixed(2)}</td>
                          <td className={`p-2.5 text-right font-black ${t.profit >= 0 ? "text-xiphos-green" : "text-xiphos-red"}`}>
                          {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right text-[#425062]">{t.close_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="bg-xiphos-panel/60 p-2.5 px-4 border-t border-slate-900 flex justify-between items-center shrink-0">
              <div className="text-[16px] font-black text-[#6f7e90]">
                TOTAL TRADES TODAY: <span className="text-xiphos-green">14</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-green/20 shadow-[0_0_15px_rgba(0,210,106,0.05)] rounded-sm p-3 shrink-0">
        <div className="flex items-center justify-between text-[16px] font-black">
          <div className="flex items-center gap-2 text-xiphos-green">
            <TrendingUp className="h-4 w-4" />
            <span>PORTFOLIO STATISTICAL HEALTH AUDIT CONTEXT</span>
          </div>
          <span className="text-[#8e9aa8] text-[15px]">
            AGGREGATE SHARPE: <span className="text-xiphos-blue font-black">{metrics.sharpe.toFixed(2)} (OPTIMAL)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
