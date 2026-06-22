"use client";

import React, { useState } from "react";
import { Shield, CheckCircle, Lock } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";

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
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2 transition-all duration-300 hover:border-xiphos-blue/40">
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center bg-[#0a101b]/40 shrink-0">
          <span className="text-3xl font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="h-4 w-4" />
            RISK ALLOCATION & SEGREGATION PROFILE
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: Slot gauge + drawdown + controls */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Slot usage */}
            <div>
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">RISK SLOT USAGE</span>
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-[36px] font-black leading-none ${slotPct > 75 ? "text-xiphos-red" : slotPct > 50 ? "text-xiphos-orange" : "text-xiphos-green"}`}>
                  {usedSlots}
                </span>
                <span className="text-[20px] text-[#425062] font-black mb-1">/ {maxRiskSlots}</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50 mb-1">
                <div className="h-full transition-all" style={{
                  width: `${slotPct}%`,
                  backgroundColor: slotPct > 75 ? "#FF4D4D" : slotPct > 50 ? "#FFB020" : "#00D26A"
                }} />
              </div>
              <div className="flex justify-between text-[14px] text-[#425062]">
                <span>0 SLOTS</span><span>MAX: {maxRiskSlots}</span>
              </div>
            </div>

            {/* Drawdown vs limit */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">DRAWDOWN VS LIMIT</span>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-[30px] font-black leading-none text-xiphos-green">{currentDrawdown}%</span>
                <span className="text-[17px] text-[#425062] font-bold mb-0.5">/ {drawdownLimit}%</span>
              </div>
              <div className="h-3 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50 mb-1">
                <div className="h-full bg-xiphos-green transition-all" style={{ width: `${drawdownPct}%` }} />
              </div>
              <div className="flex justify-between text-[14px] text-[#425062]">
                <span>0%</span><span>LIMIT: {drawdownLimit}%</span>
              </div>
            </div>

            {/* Slot selector */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">MAX SLOTS CONFIG</span>
              <div className="flex gap-1">
                {[2,3,4,5,6].map(n => (
                  <button key={n} onClick={() => setMaxRiskSlots(n)}
                    className={`flex-1 py-1.5 text-[16px] font-black border rounded-sm cursor-pointer transition-all ${
                      maxRiskSlots === n ? "bg-xiphos-blue/10 border-xiphos-blue text-xiphos-blue" : "border-slate-900 text-[#6f7e90] hover:text-white"
                    }`}>{n}</button>
                ))}
              </div>
            </div>

            {/* Correlation threshold */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">CORRELATION THRESHOLD</span>
              <div className="flex gap-1">
                {[50,60,70,80,90].map(p => (
                  <button key={p} onClick={() => setCorrelationLimit(p)}
                    className={`flex-1 py-1.5 text-[15px] font-black border rounded-sm cursor-pointer transition-all ${
                      correlationLimit === p ? "bg-xiphos-orange/10 border-xiphos-orange text-xiphos-orange" : "border-slate-900 text-[#6f7e90] hover:text-white"
                    }`}>{p}%</button>
                ))}
              </div>
            </div>

            {/* System Resources */}
            <div className="border-t border-slate-950 pt-3">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2">SYSTEM RESOURCES</span>
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-[14px] font-bold text-[#8e9aa8] mb-1">
                    <span>CPU LOAD</span>
                    <span className="text-xiphos-blue">24%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-sm overflow-hidden">
                    <div className="h-full bg-xiphos-blue" style={{ width: "24%" }} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between text-[14px] font-bold text-[#8e9aa8] mb-1">
                    <span>RAM USAGE</span>
                    <span className="text-xiphos-orange">48%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-sm overflow-hidden">
                    <div className="h-full bg-xiphos-orange" style={{ width: "48%" }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency lock */}
            <div className="border-t border-slate-950 pt-3 mt-auto">
              <button
                onClick={() => alert("Safety lock engaged. System-wide entries suspended.")}
                className="w-full py-2 bg-xiphos-red/8 hover:bg-xiphos-red hover:text-black border border-xiphos-red/40 text-xiphos-red text-[15px] font-black tracking-widest uppercase rounded-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <Lock className="h-3 w-3" /> LOCK SYSTEM ENTRIES
              </button>
            </div>

          </div>

          {/* RIGHT: Risk breakdown + correlation guard */}
          <div className="col-span-9 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Per-symbol risk breakdown */}
            <div className="flex-1 min-h-0 flex flex-col">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2 border-b border-slate-950 pb-1.5 shrink-0">
                PER-SYMBOL RISK BREAKDOWN
              </span>
              <div className="overflow-hidden flex-1 min-h-0">
                <table className="w-full text-left text-[17px] border-collapse font-bold">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[15px]">
                      <th className="p-2.5 font-black">SYMBOL</th>
                      <th className="p-2.5 font-black">CORR GROUP</th>
                      <th className="p-2.5 font-black text-right">EXPOSURE</th>
                      <th className="p-2.5 font-black text-right">POSITION P&L</th>
                      <th className="p-2.5 font-black text-center">RISK STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {symbolRiskData.map((row, idx) => (
                      <tr key={idx} className="border-b border-slate-950/60 hover:bg-xiphos-bg/40 transition-colors">
                        <td className="p-2.5 text-white font-black text-[18px]">{row.symbol}</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 text-[14px] font-black rounded-sm border border-xiphos-blue/30 text-xiphos-blue bg-xiphos-blue/5 uppercase">
                            GROUP {row.group.replace("G","")}
                          </span>
                        </td>
                        <td className="p-2.5 text-right text-[#ccd6e0]">{row.exposure}</td>
                        <td className={`p-2.5 text-right font-black ${row.pnlPos ? "text-xiphos-green" : "text-xiphos-red"}`}>{row.pnl}</td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 text-[14px] font-black rounded-sm border border-xiphos-green/30 text-xiphos-green bg-xiphos-green/5 uppercase">
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Correlation guard + margin meters */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              {/* Correlation guard */}
              <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-3.5">
                <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-3">CORRELATION GUARD STATUS</span>
                <div className="space-y-3">
                  {[
                    { label: "Group 1 (Currencies)", weight: currencyWeight, color: "#00A8FF" },
                    { label: "Group 2 (Metals)", weight: metalWeight, color: "#FFB020" },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[16px] font-bold text-[#8e9aa8] mb-1">
                        <span>{item.label}</span>
                        <span style={{ color: item.weight > correlationLimit ? "#FF4D4D" : item.color }} className="font-black">{item.weight}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                        <div className="h-full transition-all" style={{
                          width: `${Math.min(item.weight, 100)}%`,
                          backgroundColor: item.weight > correlationLimit ? "#FF4D4D" : item.color
                        }} />
                      </div>
                      <div className="text-[14px] text-[#425062] mt-0.5">LIMIT: {correlationLimit}%</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Margin meters */}
              <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-3.5">
                <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-3">MARGIN PROTECTION METERS</span>
                <div className="space-y-3">
                  {marginMeters.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-[16px] font-bold text-[#8e9aa8] mb-1">
                        <span>{item.label}</span>
                        <span style={{ color: item.color }} className="font-black">{item.val}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-sm overflow-hidden border border-slate-900/50">
                        <div className="h-full" style={{ width: `${item.progress}%`, backgroundColor: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-xiphos-panel/60 backdrop-blur-xl border border-xiphos-green/20 shadow-[0_0_15px_rgba(0,210,106,0.05)] rounded-sm p-3 shrink-0">
        <div className="flex items-center justify-between text-[16px] font-black">
          <div className="flex items-center gap-2 text-xiphos-green">
            <CheckCircle className="h-4 w-4" />
            <span>RISK ENGINE PASSIVE ALIGNMENT SECURED</span>
          </div>
          <span className="text-[#8e9aa8] text-[15px]">
            ACTIVE EXPOSURE: <span className="text-xiphos-blue font-black">2.46% (SAFE)</span>
          </span>
        </div>
      </div>
    </div>
  );
}
