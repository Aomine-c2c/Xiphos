"use client";

import React, { useState } from "react";
import { Sliders, ShieldCheck, Terminal } from "lucide-react";

import { useTradingStore } from "../store/useTradingStore";

export default function TradeManagerView() {
  const { logs } = useTradingStore();
  const [scalperActive, setScalperActive] = useState(true);
  const [runnerActive, setRunnerActive] = useState(true);

  const bots = [
    { id: "135001", name: "TRADE A — SCALPER", role: "Scalper", active: scalperActive, lastSignal: "08:24:11", symbol: "EURUSD M30", color: "#FFB020" as const },
    { id: "135002", name: "TRADE B — RUNNER", role: "Runner", active: runnerActive, lastSignal: "08:22:44", symbol: "XAUUSD M30", color: "#00A8FF" as const },
  ];

  const rules = [
    { rule: "INITIAL STOP LOSS", scalper: "SMA200", runner: "SMA200" },
    { rule: "TRAILING INHIBIT LEVEL", scalper: "EMA50", runner: "SMA200" },
    { rule: "MOMENTUM TARGET", scalper: "EMA13 CROSS", runner: "MACRO TREND" },
    { rule: "NO-WIDENING ENFORCE", scalper: "ENABLED", runner: "ENABLED" },
    { rule: "BREAKEVEN TRIGGER", scalper: "1:1 RR", runner: "1:1 RR" },
    { rule: "TIMEFRAME LOCK", scalper: "M30 ONLY", runner: "M30 ONLY" },
    { rule: "PARTIAL CLOSE RULE", scalper: "50% AT BE+20", runner: "50% AT BE+20" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2 transition-all duration-300 hover:border-xiphos-blue/40">
      <div className="bg-[#0E1525]/60 backdrop-blur-xl border border-xiphos-blue/20 shadow-[0_0_15px_rgba(0,168,255,0.05)] rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center bg-[#0a101b]/40 flex-shrink-0">
          <span className="text-3xl font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="h-4 w-4" />
            STRATEGY ROUTING POLICY CONFIGURATOR
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: Bot status cards */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden">
            <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              BOT RUNTIME STATUS
            </span>

            {bots.map(bot => (
              <div key={bot.id}
                className={`bg-[#070B14]/40 border rounded-sm p-3.5 flex flex-col gap-3 transition-all ${
                  bot.active ? "border-slate-900/60" : "border-slate-950 opacity-55"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[16px] font-black uppercase" style={{ color: bot.color }}>{bot.name}</span>
                  <span className={`px-1.5 py-0.5 rounded-sm text-[14px] font-black uppercase ${
                    bot.active ? "bg-[#00D26A] text-black" : "bg-slate-800 text-slate-500"
                  }`}>
                    {bot.active ? "ACTIVE" : "BYPASSED"}
                  </span>
                </div>
                <div className="space-y-1.5 text-[16px] text-[#8e9aa8]">
                  {[
                    ["MAGIC NO.", bot.id],
                    ["ROLE", bot.role],
                    ["LAST SIGNAL", bot.lastSignal],
                    ["ACTIVE SYMBOL", bot.symbol],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-slate-950/40 pb-1 last:border-none">
                      <span>{k}</span>
                      <span className="text-white font-bold">{v}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => bot.id === "135001" ? setScalperActive(!scalperActive) : setRunnerActive(!runnerActive)}
                  className={`w-full py-1.5 text-[15px] font-black tracking-widest uppercase rounded-sm border cursor-pointer transition-all ${
                    bot.active
                      ? "border-[#FFB020]/40 text-[#FFB020] hover:bg-[#FFB020]/5"
                      : "border-[#00D26A]/40 text-[#00D26A] hover:bg-[#00D26A]/5"
                  }`}
                >
                  {bot.active ? "BYPASS ROUTE" : "ENGAGE ROUTE"}
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT: Rules table + execution log */}
          <div className="col-span-9 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Rules comparison table */}
            <div className="flex-1 min-h-0 flex flex-col">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-2 border-b border-slate-950 pb-1.5 flex-shrink-0">
                ACTIVE STRATEGY RULES COMPARISON
              </span>
              <div className="overflow-hidden flex-1 min-h-0">
                <table className="w-full text-left text-[17px] border-collapse font-bold">
                  <thead>
                    <tr className="bg-slate-950/80 border-b border-slate-900 text-[#6f7e90] uppercase text-[15px]">
                      <th className="p-2.5 font-black">RULE PARAMETER</th>
                      <th className="p-2.5 font-black text-center text-[#FFB020]">SCALPER (135001)</th>
                      <th className="p-2.5 font-black text-center text-xiphos-blue">RUNNER (135002)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((rule, idx) => (
                      <tr key={idx} className="border-b border-slate-950/60 hover:bg-[#070B14]/40 transition-colors">
                        <td className="p-2.5 text-[#8e9aa8]">{rule.rule}</td>
                        <td className="p-2.5 text-center font-black text-[#FFB020]">{rule.scalper}</td>
                        <td className="p-2.5 text-center font-black text-xiphos-blue">{rule.runner}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live execution log */}
            <div className="bg-[#070B14]/60 border border-slate-900/60 rounded-sm p-3.5 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-[15px] font-black text-xiphos-blue uppercase tracking-widest mb-2.5 border-b border-slate-950 pb-1.5">
                <Terminal className="h-3 w-3" />
                <span>LIVE EXECUTION LOG</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D26A] animate-pulse ml-auto" />
              </div>
              <div className="space-y-1.5 overflow-hidden">
                {logs.slice(-6).map((log, idx) => (
                  <div key={idx} className="flex gap-2 text-[15px]">
                    <span className="text-[#425062] shrink-0">&gt;</span>
                    <span className="text-[#ccd6e0]">{log.formatted}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#0E1525]/60 backdrop-blur-xl border border-[#00D26A]/20 shadow-[0_0_15px_rgba(0,210,106,0.05)] rounded-sm p-3 flex-shrink-0">
        <div className="flex items-center justify-between text-[16px] font-black">
          <div className="flex items-center gap-2 text-[#00D26A]">
            <ShieldCheck className="h-4 w-4" />
            <span>SUB-STRATEGY SPLIT ROUTING PROTOCOLS ENFORCED</span>
          </div>
          <span className="text-[#8e9aa8] text-[15px]">
            ACTIVE ALIGN: <span className="text-white">Close &gt; EMA13 &gt; EMA50 &gt; SMA200</span>
          </span>
        </div>
      </div>
    </div>
  );
}
