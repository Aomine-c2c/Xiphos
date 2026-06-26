"use client";

import React, { useState } from "react";
import { Shield, CheckCircle, Lock } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";
import { motion } from "framer-motion";

export default function RiskManagerView() {
  const { account, positions } = useTradingStore();
  const [maxRiskSlots, setMaxRiskSlots] = useState(4);
  const [correlationLimit, setCorrelationLimit] = useState(70);

  const usedSlots = positions.filter(p => p.risk_status === "RISK").length;
  const slotPct = Math.round((usedSlots / maxRiskSlots) * 100);
  const currentDrawdown = 1.2; // Could derive from performanceMetrics in the future
  const drawdownLimit = 5.0;
  const drawdownPct = Math.round((currentDrawdown / drawdownLimit) * 100);

  const currencyLots = positions.filter(p => ["EURUSD","GBPUSD"].includes(p.symbol)).reduce((a,p) => a+p.volume, 0);
  const metalLots = positions.filter(p => ["XAUUSD","XAGUSD"].includes(p.symbol)).reduce((a,p) => a+p.volume, 0);
  const totalLots = (currencyLots + metalLots) || 1;
  const currencyWeight = Math.round((currencyLots / totalLots) * 100);
  const metalWeight = 100 - currencyWeight;

  const symbolRiskData = positions.map(p => {
    const isCurrency = ["EURUSD", "GBPUSD"].includes(p.symbol);
    const pnlPct = account.balance > 0 ? (p.profit / account.balance) * 100 : 0;
    
    return {
      symbol: p.symbol,
      group: isCurrency ? "G1" : "G2",
      exposure: `${p.volume.toFixed(2)} lots`,
      pnl: `${pnlPct > 0 ? '+' : ''}${pnlPct.toFixed(2)}%`,
      pnlPos: pnlPct >= 0,
      status: p.risk_status === "RISK" ? "WARN" : "SAFE"
    };
  });

  const marginMeters = [
    { label: "Margin Alarm Threshold", val: "200% MIN", progress: 85, color: "#00D26A" },
    { label: "Absolute Drawdown Cap", val: "5% MAX", progress: 95, color: "#00D26A" },
    { label: "Emergency Equity Stop", val: "80% BAL", progress: 90, color: "#00D26A" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300">
      <div className="glass-panel flex flex-col overflow-hidden flex-1 min-h-0 relative">
        
        {/* Subtle Background Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-xiphos-purple opacity-5 blur-[120px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center bg-black/20 shrink-0 z-10">
          <span className="text-2xl font-black text-xiphos-purple uppercase tracking-widest flex items-center gap-2 glow-purple">
            <Shield className="h-5 w-5" />
            RISK ALLOCATION & SEGREGATION PROFILE
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden z-10">

          {/* LEFT: Slot gauge + drawdown + controls */}
          <div className="col-span-3 border-r border-white/5 p-5 flex flex-col gap-6 overflow-hidden bg-black/20">

            {/* Slot usage */}
            <div>
              <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block mb-3">RISK SLOT USAGE</span>
              <div className="flex items-end gap-2 mb-3">
                <span className={`text-4xl font-black leading-none ${slotPct > 75 ? "text-xiphos-crimson glow-crimson" : slotPct > 50 ? "text-xiphos-gold glow-gold" : "text-xiphos-emerald glow-emerald"}`}>
                  {usedSlots}
                </span>
                <span className="text-xl text-xiphos-muted font-black mb-1">/ {maxRiskSlots}</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 mb-2 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${slotPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute top-0 left-0 h-full"
                  style={{
                    backgroundColor: slotPct > 75 ? "#EF4444" : slotPct > 50 ? "#D4AF37" : "#22C55E",
                    boxShadow: `0 0 10px ${slotPct > 75 ? "#EF4444" : slotPct > 50 ? "#D4AF37" : "#22C55E"}`
                  }} 
                />
              </div>
              <div className="flex justify-between text-xs text-xiphos-muted font-black">
                <span>0 SLOTS</span><span>MAX: {maxRiskSlots}</span>
              </div>
            </div>

            {/* Drawdown vs limit */}
            <div className="border-t border-white/5 pt-5">
              <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block mb-3">DRAWDOWN VS LIMIT</span>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-3xl font-black leading-none text-xiphos-emerald glow-emerald">{currentDrawdown}%</span>
                <span className="text-lg text-xiphos-muted font-bold mb-0.5">/ {drawdownLimit}%</span>
              </div>
              <div className="h-2 w-full bg-black/50 rounded-full overflow-hidden border border-white/5 mb-2 relative">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${drawdownPct}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="absolute top-0 left-0 h-full bg-xiphos-emerald shadow-[0_0_10px_#22C55E]" 
                />
              </div>
              <div className="flex justify-between text-xs text-xiphos-muted font-black">
                <span>0%</span><span>LIMIT: {drawdownLimit}%</span>
              </div>
            </div>

            {/* Config Sliders */}
            <div className="border-t border-white/5 pt-5 flex flex-col gap-4 mt-auto">
              <div>
                <div className="flex justify-between mb-2 text-xs font-black text-xiphos-muted uppercase tracking-widest">
                  <span>MAX RISK SLOTS</span>
                  <span className="text-white">{maxRiskSlots}</span>
                </div>
                <input type="range" min="1" max="8" value={maxRiskSlots} onChange={(e) => setMaxRiskSlots(Number(e.target.value))} className="w-full accent-xiphos-purple" />
              </div>
              <div>
                <div className="flex justify-between mb-2 text-xs font-black text-xiphos-muted uppercase tracking-widest">
                  <span>CORRELATION CEILING</span>
                  <span className="text-white">{correlationLimit}%</span>
                </div>
                <input type="range" min="30" max="100" step="5" value={correlationLimit} onChange={(e) => setCorrelationLimit(Number(e.target.value))} className="w-full accent-xiphos-purple" />
              </div>
            </div>
          </div>

          {/* RIGHT: Correlation guard + details */}
          <div className="col-span-9 p-5 flex flex-col gap-6 overflow-hidden">

            <div className="grid grid-cols-2 gap-6 h-48 shrink-0">
              {/* Correlation Group Weights */}
              <div className="glass-card flex flex-col p-4">
                <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-2 mb-3">
                  CORRELATION GROUP WEIGHTS
                </span>
                <div className="flex flex-1 gap-6 items-center">
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-black text-white">G1 : CURRENCY</span>
                      <span className="text-xiphos-cyan glow-cyan text-xl font-black">{currencyWeight}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${currencyWeight}%` }} transition={{ duration: 1 }} className="h-full bg-xiphos-cyan shadow-[0_0_8px_#4CC9F0]" />
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <span className="text-lg font-black text-white">G2 : COMMODITY</span>
                      <span className="text-xiphos-gold glow-gold text-xl font-black">{metalWeight}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${metalWeight}%` }} transition={{ duration: 1, delay: 0.1 }} className="h-full bg-xiphos-gold shadow-[0_0_8px_#D4AF37]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Safety Margin Meters */}
              <div className="glass-card flex flex-col p-4">
                <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-2 mb-3">
                  HARD SAFETY METERS
                </span>
                <div className="flex flex-col justify-center flex-1 gap-4">
                  {marginMeters.map((m, i) => (
                    <div key={m.label}>
                      <div className="flex justify-between items-center text-xs text-xiphos-muted font-black tracking-widest mb-1.5">
                        <span className="flex items-center gap-1.5"><Lock className="w-3 h-3 text-xiphos-emerald" /> {m.label}</span>
                        <span className="text-white">{m.val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden border border-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${m.progress}%` }} transition={{ duration: 1, delay: 0.2 + (i*0.1) }} className="h-full bg-xiphos-emerald shadow-[0_0_8px_#22C55E]" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Active Position Risk Matrix */}
            <div className="flex-1 min-h-0 flex flex-col glass-card">
              <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider">
                  ACTIVE POSITION RISK MATRIX
                </span>
                <span className="text-xs text-xiphos-purple glow-purple font-black tracking-widest flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> LIVE SYNC
                </span>
              </div>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-left text-sm border-collapse whitespace-nowrap">
                  <thead className="bg-black/40 sticky top-0 z-10 backdrop-blur-md">
                    <tr className="text-xiphos-muted text-[11px] tracking-widest uppercase">
                      <th className="p-3 pl-4 font-black">SYMBOL</th>
                      <th className="p-3 font-black">GROUP</th>
                      <th className="p-3 font-black">TOTAL EXPOSURE</th>
                      <th className="p-3 font-black">RISK CAPACITY</th>
                      <th className="p-3 pr-4 text-right font-black">DRAWDOWN IMPACT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symbolRiskData.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center p-8 text-xiphos-muted font-black tracking-widest">
                          NO ACTIVE EXPOSURE
                        </td>
                      </tr>
                    ) : (
                      symbolRiskData.map(row => (
                        <tr key={row.symbol} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-3 pl-4 font-bold text-white tracking-wider">{row.symbol}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${row.group === 'G1' ? 'bg-xiphos-cyan/20 text-xiphos-cyan border border-xiphos-cyan/30' : 'bg-xiphos-gold/20 text-xiphos-gold border border-xiphos-gold/30'}`}>
                              {row.group}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-white">{row.exposure}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest border ${row.status === 'SAFE' ? 'bg-xiphos-emerald/20 text-xiphos-emerald border-xiphos-emerald/30' : 'bg-xiphos-crimson/20 text-xiphos-crimson border-xiphos-crimson/30'}`}>
                              {row.status}
                            </span>
                          </td>
                          <td className={`p-3 pr-4 text-right font-mono font-bold ${row.pnlPos ? "text-xiphos-emerald" : "text-xiphos-crimson"}`}>
                            {row.pnl}
                          </td>
                        </tr>
                      ))
                    )}
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
