"use client";

import React, { useMemo } from "react";
import { 
  PieChart as PieChartIcon, 
  Download, 
  TrendingUp, 
  Activity, 
  FileText,
  Clock,
  Target
} from "lucide-react";
import { 
  AreaChart, Area, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { useTradingStore } from "../store/useTradingStore";

import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";


const MetricCard = ({ label, value, sub, colorClass }: { label: string, value: string, sub?: string, colorClass?: string }) => (
  <GlassCard className="p-4 flex flex-col justify-center">
    <span className="text-[10px] text-xiphos-muted font-bold uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-2xl font-black ${colorClass || "text-white"}`}>{value}</span>
    {sub && <span className="text-[9px] text-xiphos-muted uppercase tracking-widest mt-1 opacity-70">{sub}</span>}
  </GlassCard>
);

export default function PortfolioView() {
  const { account, performanceMetrics, positions } = useTradingStore();

  // 1. Mock Data / Calculations for missing metrics
  const balanceHistory = performanceMetrics?.equity_curve || [100, 105, 103, 110, 115, 112, 120];
  const equityHistory = balanceHistory.map((b, i) => b * (1 + (((i * 7) % 100) / 100 * 0.05 - 0.02)));
  
  const roi = ((account.balance - 40000) / 40000) * 100; // Mock initial balance 40k
  const sortinoRatio = (performanceMetrics?.sharpe_ratio || 2.84) * 1.3; // Mock
  const expectancy = 15.42; // Mock
  const avgTradeDuration = "4h 15m";
  
  const topAssets = [
    { symbol: "XAUUSD", profit: 2450.00, winRate: 85 },
    { symbol: "EURUSD", profit: 1240.50, winRate: 78 },
    { symbol: "US30", profit: 890.20, winRate: 72 },
  ];
  
  const worstAssets = [
    { symbol: "GBPUSD", profit: -340.00, winRate: 42 },
    { symbol: "XAGUSD", profit: -120.50, winRate: 48 },
  ];

  // Asset Allocation Mock
  const assetAllocation = [
    { name: "Forex", value: 45000, color: "#4CC9F0" },
    { name: "Crypto", value: 25000, color: "#8B5CF6" },
    { name: "Indices", value: 20000, color: "#F59E0B" },
    { name: "Commodities", value: 10000, color: "#10B981" },
  ];

  // Daily Returns Calendar Mock
  const generateCalendar = () => {
    const days = [];
    for (let i = 0; i < 30; i++) {
      const val = (((i * 13) % 100) / 100 * 4) - 1.5; // -1.5% to +2.5%
      days.push({ day: i + 1, return: val });
    }
    return days;
  };
  const calendarDays = useMemo(() => generateCalendar(), []);

  // Monthly Returns Mock
  const generateMonths = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map(m => ({
      month: m,
      return: (Math.random() * 10) - 3 // -3% to +7%
    }));
  };
  const monthlyReturns = useMemo(() => generateMonths(), []);

  // Equity Chart
  const drawEquityChart = () => {
    const data = balanceHistory.map((bal, i) => ({
      index: i,
      balance: bal,
      equity: equityHistory[i]
    }));

    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CC9F0" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#4CC9F0" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#22C55E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: "rgba(11,15,23,0.9)", borderColor: "rgba(255,255,255,0.1)", color: "#fff", fontSize: "10px", fontFamily: "monospace", borderRadius: "8px" }} 
            itemStyle={{ fontWeight: "bold" }}
          />
          <Area type="step" dataKey="balance" stroke="#4CC9F0" fillOpacity={1} fill="url(#colorBalance)" />
          <Area type="monotone" dataKey="equity" stroke="#22C55E" fillOpacity={1} fill="url(#colorEquity)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    );
  };
  return (
    <GlassPanel glowColor="emerald" className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300 animate-in fade-in zoom-in-95">
      
      {/* 1. TOP HEADER */}
      <PageHeader
        title="INSTITUTIONAL PORTFOLIO DASHBOARD"
        icon={PieChartIcon}
        glowColor="cyan"
        actions={
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold tracking-widest text-xiphos-muted uppercase">DOWNLOAD REPORTS:</span>
            <div className="flex gap-2">
              <Button icon={FileText} label="PDF" className="text-xiphos-cyan" onClick={() => {}} />
              <Button icon={Download} label="EXCEL" className="text-xiphos-emerald" onClick={() => {}} />
            </div>
          </div>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-4 pb-4">
        
        {/* 2. TOP METRICS ROW */}
        <div className="grid grid-cols-7 gap-4 shrink-0">
          <MetricCard label="Current Balance" value={`$${account.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}`} />
          <MetricCard label="Equity" value={`$${account.equity.toLocaleString(undefined, {minimumFractionDigits: 2})}`} colorClass="text-xiphos-cyan glow-cyan" />
          <MetricCard label="Margin" value={`$${account.margin.toLocaleString(undefined, {minimumFractionDigits: 2})}`} colorClass="text-xiphos-purple glow-purple" />
          <MetricCard label="Free Margin" value={`$${account.margin_free.toLocaleString(undefined, {minimumFractionDigits: 2})}`} colorClass="text-xiphos-emerald glow-emerald" />
          <MetricCard label="Max Drawdown" value={`-${performanceMetrics?.max_drawdown.toFixed(2)}%`} colorClass="text-xiphos-crimson glow-crimson" />
          <MetricCard label="ROI (YTD)" value={`+${roi.toFixed(2)}%`} colorClass="text-xiphos-emerald glow-emerald" />
          <GlassCard className="p-4 flex flex-col justify-center bg-xiphos-purple/10 border-xiphos-purple/30 group hover:bg-xiphos-purple/20 transition-colors">
            <span className="text-[10px] text-xiphos-purple font-bold uppercase tracking-widest mb-1">Risk Adjusted Return</span>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-xl font-black text-white">{performanceMetrics?.sharpe_ratio.toFixed(2)}</span>
                <span className="text-[9px] ml-1 text-xiphos-muted">SHARPE</span>
              </div>
              <div>
                <span className="text-xl font-black text-white">{sortinoRatio.toFixed(2)}</span>
                <span className="text-[9px] ml-1 text-xiphos-muted">SORTINO</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 3. MIDDLE ROW: CHARTS & CALENDAR */}
        <div className="grid grid-cols-12 gap-4 shrink-0 h-80">
          {/* Equity Chart */}
          <GlassCard className="col-span-5 p-4 flex flex-col relative group">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 group-hover:text-xiphos-cyan transition-colors">
                <TrendingUp className="w-4 h-4 text-xiphos-cyan" /> HISTORICAL GROWTH
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-xiphos-cyan"></span> BALANCE</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-xiphos-emerald"></span> EQUITY</span>
              </div>
            </div>
            <div className="flex-1 min-h-0 w-full">
              {drawEquityChart()}
            </div>
          </GlassCard>

          {/* Asset Allocation Pie Chart */}
          <GlassCard className="col-span-3 p-4 flex flex-col group">
            <h3 className="text-sm font-black tracking-widest uppercase mb-2 shrink-0 group-hover:text-white transition-colors">ASSET ALLOCATION</h3>
            <div className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={assetAllocation} innerRadius="60%" outerRadius="80%" paddingAngle={5} dataKey="value" stroke="none">
                    {assetAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "rgba(11,15,23,0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", fontFamily: "monospace", fontWeight: "bold" }}
                    itemStyle={{ color: "#fff" }}
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-6">
                <div className="text-center">
                  <span className="block text-2xl font-black text-white">4</span>
                  <span className="block text-[9px] text-xiphos-muted tracking-widest uppercase">CLASSES</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Performance Calendar */}
          <GlassCard className="col-span-2 p-4 flex flex-col group">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 group-hover:text-xiphos-purple transition-colors">
                <Target className="w-4 h-4 text-xiphos-purple" /> DAILY RETURNS
              </h3>
              <span className="text-[10px] text-xiphos-muted font-bold uppercase">30D Heatmap</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-5 gap-1.5">
                {calendarDays.map((day, i) => {
                  const isPos = day.return > 0;
                  const intensity = Math.min(1, Math.abs(day.return) / 2);
                  const bg = isPos ? `rgba(34, 197, 94, ${0.1 + intensity * 0.5})` : `rgba(239, 68, 68, ${0.1 + intensity * 0.5})`;
                  const border = isPos ? `rgba(34, 197, 94, ${intensity})` : `rgba(239, 68, 68, ${intensity})`;
                  return (
                    <div 
                      key={i} 
                      className="aspect-square rounded-sm flex items-center justify-center text-[10px] font-black border hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: bg, borderColor: border, color: "white" }}
                      title={`Day ${day.day}: ${day.return > 0 ? "+" : ""}${day.return.toFixed(2)}%`}
                    >
                      {day.day}
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>

          {/* Monthly Returns */}
          <GlassCard className="col-span-2 p-4 flex flex-col group">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 group-hover:text-xiphos-purple transition-colors">
                <Target className="w-4 h-4 text-xiphos-purple" /> MONTHLY
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex flex-col gap-1 justify-end h-full text-[9px] font-black">
                {monthlyReturns.map((m, i) => {
                  const isPos = m.return > 0;
                  const intensity = Math.min(1, Math.abs(m.return) / 5);
                  const bg = isPos ? `rgba(34, 197, 94, ${0.2 + intensity * 0.8})` : `rgba(239, 68, 68, ${0.2 + intensity * 0.8})`;
                  return (
                    <div key={i} className="flex items-center gap-1 group/bar cursor-pointer" title={`${m.month}: ${m.return > 0 ? "+" : ""}${m.return.toFixed(2)}%`}>
                      <span className="w-5 text-xiphos-muted">{m.month}</span>
                      <div className="flex-1 h-3 bg-[rgba(11,15,23,0.5)] rounded-sm overflow-hidden flex relative">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/5 z-10" />
                        <div className="w-1/2 flex justify-end items-center h-full">
                          {!isPos && <div className="h-full rounded-l-sm" style={{ width: `${Math.min(100, Math.abs(m.return)*10)}%`, backgroundColor: bg }} />}
                        </div>
                        <div className="w-1/2 flex justify-start items-center h-full">
                          {isPos && <div className="h-full rounded-r-sm" style={{ width: `${Math.min(100, m.return*10)}%`, backgroundColor: bg }} />}
                        </div>
                      </div>
                      <span className={`w-7 text-right ${isPos ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>
                        {m.return > 0 ? "+" : ""}{m.return.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 4. BOTTOM ROW: TABLES & METRICS */}
        <div className="grid grid-cols-12 gap-4 flex-1 min-h-[250px] shrink-0">
          
          {/* Winning & Worst Assets */}
          <GlassCard className="col-span-4 p-4 flex flex-col gap-4">
            <div className="flex-1 flex flex-col overflow-hidden group">
              <h3 className="text-[11px] text-xiphos-muted font-bold tracking-widest uppercase mb-2 group-hover:text-white transition-colors">WINNING ASSETS</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {topAssets.map(a => (
                  <div key={a.symbol} className="flex justify-between items-center p-2 bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.02)] rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <span className="font-bold text-white text-sm">{a.symbol}</span>
                    <div className="text-right">
                      <span className="block text-sm font-black text-xiphos-emerald glow-emerald">+${a.profit.toFixed(2)}</span>
                      <span className="block text-[9px] text-xiphos-muted">WR: {a.winRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden group">
              <h3 className="text-[11px] text-xiphos-muted font-bold tracking-widest uppercase mb-2 group-hover:text-white transition-colors">WORST ASSETS</h3>
              <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {worstAssets.map(a => (
                  <div key={a.symbol} className="flex justify-between items-center p-2 bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.02)] rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                    <span className="font-bold text-white text-sm">{a.symbol}</span>
                    <div className="text-right">
                      <span className="block text-sm font-black text-xiphos-crimson glow-crimson">-${Math.abs(a.profit).toFixed(2)}</span>
                      <span className="block text-[9px] text-xiphos-muted">WR: {a.winRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Operational Metrics */}
          <div className="col-span-8 grid grid-cols-2 gap-4">
            <GlassCard className="p-4 flex flex-col justify-between group">
              <div>
                <h3 className="text-xs text-xiphos-cyan font-bold tracking-widest uppercase flex items-center gap-2 mb-4 group-hover:text-white transition-colors">
                  <Activity className="w-4 h-4 text-xiphos-cyan" /> PROFIT BREAKDOWN (M30)
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-xiphos-muted uppercase mb-1">
                      <span>LONG POSITIONS</span>
                      <span className="text-xiphos-emerald">$12,450.00</span>
                    </div>
                    <div className="h-1.5 w-full bg-[rgba(11,15,23,0.8)] rounded-full overflow-hidden">
                      <div className="h-full bg-xiphos-emerald glow-emerald w-[70%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-xiphos-muted uppercase mb-1">
                      <span>SHORT POSITIONS</span>
                      <span className="text-xiphos-crimson">$4,210.00</span>
                    </div>
                    <div className="h-1.5 w-full bg-[rgba(11,15,23,0.8)] rounded-full overflow-hidden">
                      <div className="h-full bg-xiphos-crimson glow-crimson w-[30%]" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)] grid grid-cols-2 gap-4">
                 <div>
                   <span className="block text-[10px] text-xiphos-muted font-bold uppercase mb-1">EXPECTANCY</span>
                   <span className="text-2xl font-black text-white">${expectancy}</span>
                 </div>
                 <div>
                   <span className="block text-[10px] text-xiphos-muted font-bold uppercase mb-1">AVG TRADE DURATION</span>
                   <span className="text-2xl font-black text-white flex items-center gap-2">
                     <Clock className="w-4 h-4 text-xiphos-purple" /> {avgTradeDuration}
                   </span>
                 </div>
              </div>
            </GlassCard>

            <GlassCard className="p-4 flex flex-col justify-between group">
              <div>
                <h3 className="text-xs text-xiphos-gold font-bold tracking-widest uppercase flex items-center gap-2 mb-4 group-hover:text-white transition-colors">
                  <PieChartIcon className="w-4 h-4 text-xiphos-gold" /> CAPITAL UTILIZATION
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 transform -rotate-90">
                      <path
                        className="text-[rgba(255,255,255,0.05)]"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="text-xiphos-gold glow-gold transition-all duration-1000 ease-out"
                        strokeDasharray={`${(account.margin_free / account.equity) * 100}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-black text-white">{Math.round((account.margin_free / account.equity) * 100)}%</span>
                      <span className="text-[7px] text-xiphos-muted uppercase tracking-widest">FREE</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-center bg-[rgba(11,15,23,0.4)] p-2 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                      <span className="text-[10px] text-xiphos-muted font-bold uppercase">OPEN POSITIONS</span>
                      <span className="text-sm font-black text-xiphos-cyan">{positions.length}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[rgba(11,15,23,0.4)] p-2 rounded hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                      <span className="text-[10px] text-xiphos-muted font-bold uppercase">CLOSED POSITIONS</span>
                      <span className="text-sm font-black text-white">{performanceMetrics?.total_trades || 482}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                <span className="block text-[10px] text-xiphos-muted font-bold uppercase mb-2">ALLOCATION STATUS</span>
                <div className="w-full bg-[rgba(11,15,23,0.8)] rounded p-3 flex justify-between items-center border border-[rgba(255,255,255,0.05)]">
                  <span className="text-xs font-bold text-white">HEALTHY</span>
                  <span className="text-[10px] text-xiphos-emerald glow-emerald font-black uppercase tracking-widest">MARGIN LEVEL: {account.margin_level}%</span>
                </div>
              </div>
            </GlassCard>
          </div>

        </div>

      </div>
    </GlassPanel>
  );
}
