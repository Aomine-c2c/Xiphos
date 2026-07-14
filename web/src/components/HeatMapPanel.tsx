"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { motion } from "framer-motion";

export default function HeatMapPanel() {
  const { marketWatch } = useTradingStore();
  
  const data = marketWatch;

  if (data.length === 0) {
  return <div className="w-full h-full flex items-center justify-center text-[#94a3b8] text-xs uppercase tracking-widest font-bold">NO DATA</div>;
  }

  const getColor = (dist: number) => {
  if (dist > 50) return "bg-[#4ade80]/40 border-[#4ade80]/60 text-[#4ade80] shadow-[inset_0_0_20px_rgba(34,197,94,0.3)]";
  if (dist > 10) return "bg-[#4ade80]/20 border-[#4ade80]/40 text-[#4ade80] shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]";
  if (dist > -10) return "bg-[#f59e0b]/20 border-[#f59e0b]/40 text-[#f59e0b] shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]";
  if (dist > -50) return "bg-[#f87171]/20 border-[#f87171]/40 text-[#f87171] shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]";
  return "bg-[#f87171]/40 border-[#f87171]/60 text-[#f87171] shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]";
  };

  const getWidth = (probability: number) => {
  return `${Math.max(10, probability)}%`;
  };

  return (
  <div className="w-full h-full flex flex-wrap content-start gap-1 p-2 overflow-y-auto custom-scrollbar">
  {data.map((item, idx) => (
  <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.3, delay: idx * 0.02 }}
  key={item.symbol}
  className={`relative flex flex-col justify-between p-2 border rounded-sm transition-all cursor-crosshair hover:brightness-125 ${getColor(item.e13_dist)}`}
  style={{ 
  flexGrow: 1,
  flexBasis: getWidth(Math.abs(item.e13_dist) * 100),
  minHeight: '80px',
  maxWidth: '100%'
  }}
  >
  <div className="flex justify-between items-start">
  <span className="font-semibold text-sm tracking-wider text-white mix-blend-overlay drop-shadow-md">{item.symbol}</span>
  <span className="text-[10px] font-semibold tracking-widest uppercase opacity-80">{item.signal}</span>
  </div>
  
  <div className="flex justify-between items-end mt-2">
  <div className="flex flex-col">
  <span className="text-[9px] uppercase tracking-widest opacity-60">DIST</span>
  <span className="font-semibold text-lg leading-none">{item.e13_dist.toFixed(2)}</span>
  </div>
  </div>
  </motion.div>
  ))}
  </div>
  );
}
