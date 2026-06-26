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
              <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CC9F0" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4CC9F0" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "rgba(11,15,23,0.9)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "10px", fontFamily: "monospace", borderRadius: "8px", backdropFilter: "blur(10px)" }} 
            itemStyle={{ fontWeight: "bold" }}
          />
          <Area type="step" dataKey="balance" stroke="#D4AF37" fillOpacity={1} fill="url(#colorBalance)" isAnimationActive={true} animationDuration={1000} />
          <Area type="monotone" dataKey="equity" stroke="#4CC9F0" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} isAnimationActive={true} animationDuration={1000} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const totalSubProfit = metrics.scalperProfit + metrics.runnerProfit || 1;
  const scalperPct = Math.round((metrics.scalperProfit / totalSubProfit) * 100);

  const kpis = [
    { label: "WIN RATE", value: `${metrics.winRate.toFixed(1)}%`, colorClass: "text-xiphos-emerald glow-emerald" },
    { label: "PROFIT FACTOR", value: metrics.profitFactor.toFixed(2), colorClass: "text-xiphos-cyan glow-cyan" },
    { label: "SHARPE RATIO", value: metrics.sharpe.toFixed(2), colorClass: "text-xiphos-gold glow-gold" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-6 transition-all duration-300">
      <div className="glass-panel flex flex-col flex-1 min-h-0">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[rgba(11,15,23,0.4)] shrink-0">
          <span className="text-xl font-bold text-white uppercase tracking-widest flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-xiphos-purple animate-pulse glow-purple" />
            <span className="glow-purple">PERFORMANCE ANALYTICS</span>
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden p-6 gap-6">

          {/* LEFT: KPI cards */}
          <div className="col-span-3 flex flex-col gap-4 overflow-hidden">
            <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest block border-b border-[rgba(255,255,255,0.05)] pb-2">
              PERFORMANCE KPIs
            </span>

            {kpis.map(kpi => (
              <div key={kpi.label} className="glass-card p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-xiphos-muted font-bold uppercase tracking-widest mb-1">{kpi.label}</div>
                  <div className={`text-4xl font-black leading-none ${kpi.colorClass}`}>{kpi.value}</div>
                </div>
              </div>
            ))}

            {/* Strategy profit split */}
            <div className="border-t border-[rgba(255,255,255,0.05)] pt-4 mt-2">
              <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest block mb-4">STRATEGY SPLIT</span>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-bold text-xiphos-muted">
                  <span>SCALPER (A)</span>
                  <span className="text-xiphos-cyan glow-cyan font-black">{scalperPct}%</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-xiphos-muted">
                  <span>RUNNER (B)</span>
                  <div className="text-xs text-xiphos-muted font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                    WIN RATE
                    <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-xiphos-cyan glow-cyan" style={{ width: `${metrics.winRate}%` }}></div>
                    </div>
                  </div>
                  <div className="h-full bg-xiphos-purple glow-purple flex-1" />
                </div>
              </div>
            </div>

            <div className="border-t border-[rgba(255,255,255,0.05)] pt-4 mt-2">
              <div className="space-y-2 text-sm text-xiphos-muted font-bold tracking-widest">
                <div className="flex justify-between">
                  <span>EXPECTANCY</span>
                  <span className="text-white">${metrics.expectancy.toFixed(2)}/trade</span>
                </div>
                <div className="flex justify-between">
                  <span>TOTAL TRADES</span>
                  <span className="text-white">{history.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: History Log (7/12) */}
          <div className="col-span-9 flex flex-col min-h-0 shrink-0 gap-6">
            {/* Table Header */}
            <div className="glass-card p-5 shrink-0 h-[220px] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest">HISTORICAL EQUITY GROWTH CURVE</span>
                <span className="text-xiphos-emerald glow-emerald font-black text-xl">$127.45 USD</span>
              </div>
              <div className="flex-1 min-h-0">
                {drawEquityChart()}
              </div>
            </div>

            {/* Trade history table */}
            <div className="glass-card flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.05)] shrink-0">
                <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest">
                  TRADE HISTORY LOG
                </span>
                <div className="flex items-center gap-3">
                  <button title="Previous Page" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="text-xiphos-muted hover:text-white disabled:opacity-30 disabled:hover:text-xiphos-muted transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-white font-bold text-sm tracking-widest">{page + 1} / {totalPages}</span>
                  <button title="Next Page" onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="text-xiphos-muted hover:text-white disabled:opacity-30 disabled:hover:text-xiphos-muted transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto flex-1 min-h-0 custom-scrollbar p-2">
                <table className="w-full text-left text-sm border-collapse font-bold">
                  <thead>
                    <tr className="text-xiphos-muted uppercase tracking-widest">
                      <th className="p-3 font-bold">TICKET</th>
                      <th className="p-3 font-bold">SYMBOL</th>
                      <th className="p-3 font-bold">DIR</th>
                      <th className="p-3 font-bold text-right">LOTS</th>
                      <th className="p-3 font-bold text-right">PROFIT</th>
                      <th className="p-3 font-bold text-right">CLOSE TIME</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedHistory.map((t) => (
                        <tr key={t.ticket} className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-colors">
                          <td className="p-3 text-xiphos-muted">#{t.ticket}</td>
                          <td className="p-3 text-white">{t.symbol}</td>
                          <td className={`p-3 ${t.type === "BUY" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>{t.type}</td>
                          <td className="p-3 text-white text-right">{t.volume.toFixed(2)}</td>
                          <td className={`p-3 text-right ${t.profit >= 0 ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>
                          {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                        </td>
                        <td className="p-3 text-right text-xiphos-muted">{t.close_time}</td>
                      </tr>
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
