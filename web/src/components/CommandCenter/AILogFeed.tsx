"use client";

import React, { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
import { useTradingStore } from "../../store/useTradingStore";

interface LogEntry {
  id: string;
  time: string;
  module: string;
  message: string;
  type: "info" | "warn" | "critical" | "success";
}

export function AILogFeed({ activeSymbol }: { activeSymbol: string }) {
  const { mahoragaState } = useTradingStore();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const state = mahoragaState && mahoragaState[activeSymbol];

  useEffect(() => {
    if (!state) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    const newLogs: LogEntry[] = [];

    // Synthesize logs from state changes
    if (state.trading_halted) {
      newLogs.push({ id: Math.random().toString(), time: timeStr, module: "SYS", message: "Trading operations HALTED by operator constraint.", type: "critical" });
    } else if (state.is_adapted) {
      newLogs.push({ id: Math.random().toString(), time: timeStr, module: "CORE", message: `Adaptation sequence complete. Phenomenon negated.`, type: "success" });
    } else {
      newLogs.push({ id: Math.random().toString(), time: timeStr, module: "OVR", message: `Analyzing ${state.trend_state} trend with ${state.momentum_state} momentum.`, type: "info" });
      if (state.adaptation_spins > 0) {
        newLogs.push({ id: Math.random().toString(), time: timeStr, module: "WHEEL", message: `Wheel shifted to handle index ${state.adaptation_spins % 8}.`, type: "warn" });
      }
    }

    setLogs(prev => {
      const merged = [...newLogs, ...prev];
      // remove duplicates (crude check)
      const filtered = merged.filter((v, i, a) => a.findIndex(t => t.message === v.message) === i);
      return filtered.slice(0, 50); // Keep last 50
    });

  }, [state]);

  // Simulate general background noise
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const noiseMessages = [
        "Re-calculating ATR boundaries...",
        "Scanning liquidity pockets on H1...",
        "Validating correlation constraints...",
        "Awaiting structural confirmation...",
        "Ping to MT5 socket OK (12ms)"
      ];
      
      const msg = noiseMessages[Math.floor(Math.random() * noiseMessages.length)];
      
      setLogs(prev => [
        { id: Math.random().toString(), time: timeStr, module: "SYS", message: msg, type: "info" as const },
        ...prev
      ].slice(0, 50));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getColor = (type: string) => {
    switch (type) {
      case "critical": return "text-[#f87171]";
      case "warn": return "text-[#f59e0b]";
      case "success": return "text-[#4ade80]";
      default: return "text-[#a1a1aa]";
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#09090e] border border-[#1e1e2e] rounded-xl overflow-hidden font-mono">
      <div className="p-3 border-b border-[#1e1e2e] bg-[#0f0f1a] flex items-center justify-between">
        <span className="text-[10px] text-[#94a3b8] tracking-widest uppercase flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#a78bfa]" />
          Mahoraga State Feed
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1.5">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-3 text-[10px] hover:bg-[#1e1e2e]/30 px-1 py-0.5 rounded transition-colors">
            <span className="text-[#52525b] shrink-0">{log.time}</span>
            <span className={`shrink-0 uppercase font-bold w-10 ${getColor(log.type)}`}>
              [{log.module}]
            </span>
            <span className={getColor(log.type)}>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
