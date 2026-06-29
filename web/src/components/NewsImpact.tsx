"use client";

import React, { useState, useEffect } from "react";
import { Globe, TrendingUp, TrendingDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NewsItem {
  id: string;
  headline: string;
  impact: number;
  time: string;
  source: string;
}

export default function NewsImpact({ symbol }: { symbol: string }) {
  const [news, setNews] = useState<NewsItem[]>(() => [
    { id: "1", headline: `Institutional block orders detected on ${symbol}`, impact: 85, time: "2m ago", source: "BLOOMBERG" },
    { id: "2", headline: `Unexpected liquidity sweep in ${symbol} Asian session`, impact: -45, time: "14m ago", source: "REUTERS" },
    { id: "3", headline: `Hedge funds increase net-long positioning for ${symbol}`, impact: 60, time: "1h ago", source: "CFTC" },
    { id: "4", headline: `Macroeconomic data signals volatility for ${symbol} pairs`, impact: -75, time: "2h ago", source: "MACRO" },
  ]);

  useEffect(() => {

    // Simulate incoming news
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newImpact = Math.floor(Math.random() * 200) - 100; // -100 to 100
        const newItem: NewsItem = {
          id: Math.random().toString(),
          headline: `Algorithmic volume spike detected across ${symbol} dark pools`,
          impact: newImpact,
          time: "Just now",
          source: "DARK POOL"
        };
        setNews(prev => [newItem, ...prev].slice(0, 5));
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="flex flex-col h-full bg-[rgba(11,15,23,0.3)] rounded-lg border border-[rgba(255,255,255,0.05)] overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.5)]">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-xiphos-cyan" />
          <span className="text-xs font-bold text-xiphos-muted uppercase tracking-widest">LIVE NEWS & IMPACT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-xiphos-cyan opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-xiphos-cyan"></span>
          </span>
          <span className="text-[10px] text-xiphos-cyan font-bold tracking-widest uppercase glow-cyan">STREAMING</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
        <AnimatePresence>
          {news.map((item) => {
            const isPositive = item.impact > 0;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-3 bg-white/5 rounded-md border border-[rgba(255,255,255,0.02)] hover:bg-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-xiphos-muted font-black tracking-widest uppercase">{item.source} • {item.time}</span>
                  <div className={`flex items-center gap-1 text-xs font-black ${isPositive ? 'text-xiphos-emerald glow-emerald' : 'text-xiphos-crimson glow-crimson'}`}>
                    {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {isPositive ? '+' : ''}{item.impact}
                  </div>
                </div>
                <p className="text-sm text-white font-medium leading-snug">{item.headline}</p>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
