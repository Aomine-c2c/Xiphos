"use client";

import React, { useMemo } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { motion } from "framer-motion";

export default function CorrelationMatrix({ category }: { category: string }) {
  const { marketWatch } = useTradingStore();
  
  // Filter symbols based on category to keep matrix size manageable
  const symbols = useMemo(() => {
    let filtered = marketWatch;
    if (category !== "ALL") {
      filtered = marketWatch.filter(m => m.category.toUpperCase() === category.toUpperCase());
    }
    // Take top 8 highest probability symbols to keep the matrix clean
    return filtered.sort((a, b) => b.probability - a.probability).slice(0, 8).map(m => m.symbol);
  }, [marketWatch, category]);

  // Generate pseudo-random consistent correlation data for display purposes
  // A real system would pull from correlationMatrix in the store.
  const getCorr = (s1: string, s2: string) => {
    if (s1 === s2) return 1.0;
    
    // Create a deterministic seeded value between -1 and 1
    const seed = Array.from(s1 + s2).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const raw = Math.sin(seed) * 1.5; 
    return Math.max(-1, Math.min(1, raw));
  };

  const getColor = (val: number) => {
    if (val >= 0.8) return "bg-xiphos-emerald/40 text-xiphos-emerald glow-emerald shadow-[inset_0_0_10px_rgba(34,197,94,0.3)]";
    if (val >= 0.4) return "bg-xiphos-emerald/20 text-xiphos-emerald";
    if (val > -0.4 && val < 0.4) return "bg-white/5 text-xiphos-muted";
    if (val <= -0.8) return "bg-xiphos-crimson/40 text-xiphos-crimson glow-crimson shadow-[inset_0_0_10px_rgba(239,68,68,0.3)]";
    if (val <= -0.4) return "bg-xiphos-crimson/20 text-xiphos-crimson";
    return "";
  };

  if (symbols.length < 2) {
    return <div className="w-full h-full flex items-center justify-center text-xiphos-muted text-xs uppercase tracking-widest font-bold">INSUFFICIENT ASSETS FOR CORRELATION MATRIX</div>;
  }

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-auto custom-scrollbar">
      <table className="w-full text-center border-collapse text-[11px] font-mono font-black tracking-widest">
        <thead>
          <tr>
            <th className="p-2 border border-transparent"></th>
            {symbols.map(sym => (
              <th key={sym} className="p-2 text-white border-b border-white/10 uppercase drop-shadow-md">
                {sym.substring(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {symbols.map((rowSym, rIdx) => (
            <motion.tr 
              key={rowSym}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: rIdx * 0.05 }}
            >
              <td className="p-2 text-right text-white border-r border-white/10 uppercase drop-shadow-md">
                {rowSym.substring(0, 3)}
              </td>
              {symbols.map(colSym => {
                const val = getCorr(rowSym, colSym);
                return (
                  <td key={colSym} className="p-0.5 relative group">
                    <div className={`w-full h-8 flex items-center justify-center rounded-sm transition-all cursor-crosshair hover:scale-110 hover:z-10 ${getColor(val)}`}>
                      {val.toFixed(2)}
                    </div>
                  </td>
                );
              })}
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
