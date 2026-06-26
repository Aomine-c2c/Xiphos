"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { motion } from "framer-motion";

export default function HeatMapPanel({ category }: { category: string }) {
  const { marketWatch } = useTradingStore();
  
  // Filter by category or show all
  const data = category === "ALL" ? marketWatch : marketWatch.filter(m => m.category.toUpperCase() === category.toUpperCase());

  if (data.length === 0) {
    return <div className="w-full h-full flex items-center justify-center text-xiphos-muted text-xs uppercase tracking-widest font-bold">NO DATA</div>;
  }

  // Find max/min AI Bias to map to -1 to 1 for coloring
  const getColor = (bias: number) => {
    // Bias is -100 to 100
    if (bias > 50) return "bg-xiphos-emerald/40 border-xiphos-emerald/60 text-xiphos-emerald glow-emerald shadow-[inset_0_0_20px_rgba(34,197,94,0.3)]";
    if (bias > 10) return "bg-xiphos-emerald/20 border-xiphos-emerald/40 text-xiphos-emerald shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]";
    if (bias > -10) return "bg-xiphos-gold/20 border-xiphos-gold/40 text-xiphos-gold shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]";
    if (bias > -50) return "bg-xiphos-crimson/20 border-xiphos-crimson/40 text-xiphos-crimson shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]";
    return "bg-xiphos-crimson/40 border-xiphos-crimson/60 text-xiphos-crimson glow-crimson shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]";
  };

  const getWidth = (probability: number) => {
    return \`\${Math.max(10, probability)}%\`;
  };

  return (
    <div className="w-full h-full flex flex-wrap content-start gap-1 p-2 overflow-y-auto custom-scrollbar">
      {data.sort((a, b) => b.probability - a.probability).map((item, idx) => (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: idx * 0.02 }}
          key={item.symbol}
          className={\`relative flex flex-col justify-between p-2 border rounded-sm transition-all cursor-crosshair hover:brightness-125 \${getColor(item.ai_bias)}\`}
          style={{ 
            flexGrow: item.probability / 10,
            flexBasis: getWidth(item.probability),
            minHeight: '80px',
            maxWidth: '100%'
          }}
        >
          <div className="flex justify-between items-start">
            <span className="font-black text-sm tracking-wider text-white mix-blend-overlay drop-shadow-md">{item.symbol}</span>
            <span className="text-[10px] font-black tracking-widest uppercase opacity-80">{item.trend.substring(0,4)}</span>
          </div>
          
          <div className="flex justify-between items-end mt-2">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-widest opacity-60">BIAS</span>
              <span className="font-black text-lg leading-none">{item.ai_bias > 0 ? '+' : ''}{item.ai_bias}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[9px] uppercase tracking-widest opacity-60">PROB</span>
              <span className="font-black text-sm leading-none">{item.probability}%</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
