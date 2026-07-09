"use client";

import React, { useRef, useEffect } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { motion, AnimatePresence } from "framer-motion";

export default function DecisionFeed() {
  const { logs } = useTradingStore();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [logs]);

  const getRowColor = (message: string): string => {
    const lower = message.toLowerCase();
    if (lower.includes("blocked") || lower.includes("violate")) return "text-[#f87171]";
    if (lower.includes("warn") || lower.includes("released")) return "text-[#f59e0b]";
    return "text-[#a1a1aa]";
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg">
      <div className="shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
        <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Decision Feed</span>
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
          <span className="text-[9px] font-mono text-[#4ade80] uppercase tracking-widest">Live</span>
        </span>
      </div>
      <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar py-1">
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <div className="flex h-full items-center justify-center text-[#52525b] text-xs font-sans p-4">
              Awaiting data stream...
            </div>
          ) : (
            logs.slice(-30).map((log, i) => (
              <motion.div key={`${log.timestamp}-${i}`}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                className="flex items-baseline gap-2.5 px-4 py-1.5 hover:bg-white/[0.02] border-b border-[#1e1e2e] last:border-0">
                <span className="text-[9px] font-mono text-[#52525b] shrink-0 tabular-nums">{log.timestamp}</span>
                <span className={`text-[11px] font-mono leading-relaxed break-all ${getRowColor(log.message)}`}>
                  {log.message}
                </span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
