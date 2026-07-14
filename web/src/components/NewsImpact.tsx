"use client";

import React from "react";
import { Globe, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTradingStore } from "../store/useTradingStore";

export default function NewsImpact({ symbol }: { symbol: string }) {
  const { news } = useTradingStore();

  const isPositive = news?.sentiment === "POSITIVE";
  const isNegative = news?.sentiment === "NEGATIVE";
  const sentimentColor = isPositive ? "text-[#4ade80]" : isNegative ? "text-[#f87171]" : "text-[#94a3b8]";

  return (
    <div className="flex flex-col h-full bg-[rgba(11,15,23,0.3)] rounded-lg border border-[rgba(255,255,255,0.05)] overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.5)]">
        <div className="flex items-center gap-2">
          <Globe className={`h-4 w-4 ${sentimentColor}`} />
          <span className="text-xs font-bold text-[#94a3b8] uppercase tracking-widest">LIVE NEWS</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isPositive ? 'bg-[#4ade80]' : isNegative ? 'bg-[#f87171]' : 'bg-[#94a3b8]'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isPositive ? 'bg-[#4ade80]' : isNegative ? 'bg-[#f87171]' : 'bg-[#94a3b8]'}`}></span>
          </span>
          <span className={`text-[10px] font-bold tracking-widest uppercase ${sentimentColor}`}>
            {news?.sentiment || "NO DATA"}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
        <AnimatePresence>
          {news?.recent_headlines?.map((headline, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-white/5 rounded-md border border-[rgba(255,255,255,0.02)] hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-[#94a3b8] font-semibold tracking-widest uppercase">NewsAPI • RECENT</span>
                <div className={`flex items-center gap-1 text-xs font-semibold ${sentimentColor}`}>
                  {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                </div>
              </div>
              <p className="text-sm text-white font-medium leading-snug">{headline}</p>
            </motion.div>
          ))}
          {!news?.recent_headlines?.length && (
            <div className="p-4 text-center text-[#94a3b8] text-xs font-semibold uppercase tracking-widest">
              No recent news fetched.
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
