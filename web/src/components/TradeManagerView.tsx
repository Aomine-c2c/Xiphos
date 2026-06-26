"use client";

import React, { useState } from "react";
import { Sliders, ShieldCheck, Terminal, Cpu } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";
import { motion } from "framer-motion";

export default function TradeManagerView() {
  const { logs } = useTradingStore();
  const [scalperActive, setScalperActive] = useState(true);
  const [runnerActive, setRunnerActive] = useState(true);

  const bots = [
    { id: "135001", name: "TRADE A — SCALPER", role: "Scalper", active: scalperActive, lastSignal: "08:24:11", symbol: "EURUSD M30", color: "#D4AF37", glow: "glow-gold" },
    { id: "135002", name: "TRADE B — RUNNER", role: "Runner", active: runnerActive, lastSignal: "08:22:44", symbol: "XAUUSD M30", color: "#4CC9F0", glow: "glow-cyan" },
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
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300">
      <div className="glass-panel flex flex-col overflow-hidden flex-1 min-h-0 relative">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-xiphos-gold opacity-5 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center bg-black/20 shrink-0 z-10">
          <span className="text-2xl font-black text-xiphos-gold uppercase tracking-widest flex items-center gap-2 glow-gold">
            <Sliders className="h-5 w-5" />
            STRATEGY ROUTING POLICY CONFIGURATOR
          </span>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden z-10">

          {/* LEFT: Bot status cards */}
          <div className="col-span-3 border-r border-white/5 p-5 flex flex-col gap-6 overflow-hidden bg-black/20">
            <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-2">
              BOT RUNTIME STATUS
            </span>

            {bots.map(bot => (
              <div key={bot.id}
                className={`glass-card p-4 flex flex-col gap-4 transition-all ${
                  bot.active ? "border-white/10" : "border-white/5 opacity-50 grayscale"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-black uppercase ${bot.active ? bot.glow : ""}`} style={{ color: bot.active ? bot.color : "#94A3B8" }}>
                    {bot.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border ${
                    bot.active ? "bg-xiphos-emerald/20 text-xiphos-emerald border-xiphos-emerald/30" : "bg-white/10 text-xiphos-muted border-white/10"
                  }`}>
                    {bot.active ? "ACTIVE" : "BYPASSED"}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs text-xiphos-muted">
                  {[
                    ["MAGIC NO.", bot.id],
                    ["ROLE", bot.role],
                    ["LAST SIGNAL", bot.lastSignal],
                    ["ACTIVE SYMBOL", bot.symbol],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-white/5 pb-1 last:border-none">
                      <span className="font-black tracking-wider">{k}</span>
                      <span className="text-white font-mono">{v}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => bot.id === "135001" ? setScalperActive(!scalperActive) : setRunnerActive(!runnerActive)}
                  className={`w-full py-2 text-xs font-black tracking-widest uppercase rounded border cursor-pointer transition-all flex items-center justify-center gap-2 ${
                    bot.active
                      ? "border-xiphos-gold/40 text-xiphos-gold hover:bg-xiphos-gold hover:text-black"
                      : "border-xiphos-emerald/40 text-xiphos-emerald hover:bg-xiphos-emerald hover:text-black"
                  }`}
                >
                  <Cpu className="w-3 h-3" />
                  {bot.active ? "BYPASS ROUTE" : "ENGAGE ROUTE"}
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT: Rules table + execution log */}
          <div className="col-span-9 p-5 flex flex-col gap-6 overflow-hidden">

            {/* Rules comparison table */}
            <div className="flex-1 min-h-0 flex flex-col glass-card">
              <div className="p-3 border-b border-white/5 bg-black/20 flex justify-between items-center">
                <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider">
                  ACTIVE STRATEGY RULES COMPARISON
                </span>
                <span className="text-xs text-xiphos-emerald glow-emerald font-black tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ENFORCED
                </span>
              </div>
              <div className="overflow-hidden flex-1 min-h-0">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-black/40">
                    <tr className="text-xiphos-muted text-[11px] tracking-widest uppercase">
                      <th className="p-3 pl-4 font-black">LOGIC PARAMETER</th>
                      <th className="p-3 font-black text-xiphos-gold">SCALPER ROUTE (A)</th>
                      <th className="p-3 font-black text-xiphos-cyan">RUNNER ROUTE (B)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rules.map((r, i) => (
                      <motion.tr 
                        key={r.rule} 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.05 }}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-3 pl-4 font-black text-white tracking-wider">{r.rule}</td>
                        <td className="p-3 font-mono text-xiphos-gold">{r.scalper}</td>
                        <td className="p-3 font-mono text-xiphos-cyan">{r.runner}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mini Console Log */}
            <div className="shrink-0 h-32 glass-card border border-white/5 bg-black/40 flex flex-col overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <div className="w-2 h-2 rounded-full bg-xiphos-purple animate-pulse shadow-[0_0_8px_#8B5CF6]" />
              </div>
              <div className="text-[10px] text-xiphos-muted font-black tracking-widest uppercase p-2 border-b border-white/5 bg-black/40 flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                EXECUTION LOGSTREAM
              </div>
              <div className="flex-1 p-2 overflow-y-auto text-xs font-mono leading-relaxed opacity-80 flex flex-col gap-1">
                {logs.slice(-4).map((log, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-xiphos-muted shrink-0">[{log.timestamp}]</span>
                    <span className={log.level === 'CRITICAL' || log.level === 'ERROR' ? 'text-xiphos-crimson' : log.level === 'WARN' ? 'text-xiphos-gold' : 'text-xiphos-purple'}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
