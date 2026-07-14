"use client";

import React from "react";
import { useTradingStore } from "../../store/useTradingStore";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { motion } from "framer-motion";

export function CapitalOverview() {
  const { account } = useTradingStore();

  const totalCapital = account?.balance ?? 1250.00;

  // allocations
  const deployedVal = totalCapital * 0.65;
  const reservedVal = totalCapital * 0.15;
  const availableVal = totalCapital * 0.20;

  // SVG parameters
  const radius = 32;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  // stroke offsets (cumulative)
  const deployedOffset = circumference - (0.65 * circumference);
  const reservedOffset = circumference - (0.15 * circumference);
  const availableOffset = circumference - (0.20 * circumference);

  return (
    <div className="flex flex-col gap-2 font-mono">
      <h2 className="text-[9px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase">
        Capital Overview
      </h2>
      
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.25)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="bg-[#09090f] border border-[#151522] rounded-xl p-3 flex items-center gap-4 shadow-[0_0_10px_rgba(139,92,246,0.01)] min-h-[125px] transition-all duration-300"
      >
        
        {/* DONUT CHART (Left) */}
        <div className="relative flex items-center justify-center w-[90px] h-[90px] shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background base circle */}
            <circle cx="45" cy="45" r={radius} fill="none" stroke="#151522" strokeWidth={strokeWidth} />
            
            {/* Deployed - Purple */}
            <motion.circle 
              cx="45" cy="45" r={radius} fill="none" 
              stroke="#8b5cf6" strokeWidth={strokeWidth} 
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: deployedOffset }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              strokeLinecap="round"
            />

            {/* Reserved - Pink */}
            <motion.circle 
              cx="45" cy="45" r={radius} fill="none" 
              stroke="#ec4899" strokeWidth={strokeWidth} 
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: reservedOffset }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              transform="rotate(234 45 45)"
              strokeLinecap="round"
            />

            {/* Available - Yellow */}
            <motion.circle 
              cx="45" cy="45" r={radius} fill="none" 
              stroke="#f59e0b" strokeWidth={strokeWidth} 
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: availableOffset }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              transform="rotate(288 45 45)"
              strokeLinecap="round"
            />

            {/* Continuous Flow Particle */}
            <motion.circle
              cx="45" cy="45" r={radius} fill="none"
              stroke="#a78bfa" strokeWidth={strokeWidth - 2}
              strokeDasharray={`${circumference * 0.15} ${circumference * 0.85}`}
              animate={{ strokeDashoffset: [circumference, 0] }}
              transition={{ duration: 4, ease: "linear", repeat: Infinity }}
              strokeLinecap="round"
              className="opacity-60 drop-shadow-[0_0_3px_rgba(167,139,250,0.8)] mix-blend-screen"
            />
          </svg>
          
          {/* Inner circle texts */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[6.5px] text-[#52525b] uppercase tracking-widest font-bold">Capital</span>
            <span className="text-[9px] font-black tracking-wide text-[#e8e8f0]">
              $<AnimatedNumber value={totalCapital} decimals={0} />
            </span>
          </div>
        </div>

        {/* DETAILS TABLE (Right) */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          {/* Deployed */}
          <div className="flex items-center justify-between text-[8.5px] border-b border-[#151522]/30 pb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] shrink-0" />
              <span className="text-[#71717a] font-bold truncate">Deployed</span>
            </div>
            <span className="text-[#e8e8f0] font-bold">
              $<AnimatedNumber value={deployedVal} decimals={0} />
            </span>
          </div>

          {/* Reserved */}
          <div className="flex items-center justify-between text-[8.5px] border-b border-[#151522]/30 pb-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ec4899] shrink-0" />
              <span className="text-[#71717a] font-bold truncate">Reserved</span>
            </div>
            <span className="text-[#e8e8f0] font-bold">
              $<AnimatedNumber value={reservedVal} decimals={0} />
            </span>
          </div>

          {/* Available */}
          <div className="flex items-center justify-between text-[8.5px]">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
              <span className="text-[#71717a] font-bold truncate">Available</span>
            </div>
            <span className="text-[#e8e8f0] font-bold">
              $<AnimatedNumber value={availableVal} decimals={0} />
            </span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
