"use client";

import React, { useMemo } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { motion } from "framer-motion";

 export default function CorrelationMatrix() {
  const { marketWatch, correlationMatrix } = useTradingStore();
  
  // Take top 8 symbols to keep the matrix clean
  const symbols = useMemo(() => {
    return marketWatch.slice(0, 8).map(m => m.symbol);
  }, [marketWatch]);

  const getCorr = (s1: string, s2: string) => {
    if (s1 === s2) return 1.0;
    
    if (correlationMatrix && correlationMatrix[s1] && correlationMatrix[s1][s2]) {
        return parseFloat(correlationMatrix[s1][s2]);
    }
    
    return 0.0;
  };

 const getColor = (val: number) => {
 if (val >= 0.8) return "bg-[#4ade80]/40 text-[#4ade80] shadow-[inset_0_0_10px_rgba(34,197,94,0.3)]";
 if (val >= 0.4) return "bg-[#4ade80]/20 text-[#4ade80]";
 if (val > -0.4 && val < 0.4) return "bg-white/5 text-[#94a3b8]";
 if (val <= -0.8) return "bg-[#f87171]/40 text-[#f87171] shadow-[inset_0_0_10px_rgba(239,68,68,0.3)]";
 if (val <= -0.4) return "bg-[#f87171]/20 text-[#f87171]";
 return "";
 };

 if (symbols.length < 2) {
 return <div className="w-full h-full flex items-center justify-center text-[#94a3b8] text-xs uppercase tracking-widest font-bold">INSUFFICIENT ASSETS FOR CORRELATION MATRIX</div>;
 }

 return (
 <div className="w-full h-full flex flex-col p-4 overflow-auto custom-scrollbar">
 <table className="w-full text-center border-collapse text-[11px] font-mono font-semibold tracking-widest">
 <thead>
 <tr>
 <th className="p-2 border border-transparent"></th>
 {symbols.map(sym => (
 <th key={sym} className="p-2 text-white border-b border-[#1e1e2e] uppercase drop-shadow-md">
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
 <td className="p-2 text-right text-white border-r border-[#1e1e2e] uppercase drop-shadow-md">
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
