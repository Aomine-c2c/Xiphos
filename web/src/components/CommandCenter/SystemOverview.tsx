"use client";

import React from "react";
import { useTradingStore } from "../../store/useTradingStore";
import { Play, ZoomIn, Compass, Percent, Layers } from "lucide-react";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { motion } from "framer-motion";

export function SystemOverview() {
  const { marketWatch, performanceMetrics } = useTradingStore();

  const activeStrCount = 6;
  const marketsScanned = marketWatch?.length || 274;
  const oppsCount = 12;
  const winRate = performanceMetrics?.win_rate || 64.2;

  const items = [
    {
      icon: Play,
      label: "Active Strategies",
      value: activeStrCount,
      decimals: 0,
      suffix: "",
      sub: "Running",
      colorClass: "text-[#4ade80]",
      iconColor: "text-[#4ade80]",
      sparkline: true,
      sparklineColor: "#4ade80",
      sparklineData: "M0,8 Q5,4 10,8 T20,2 T30,6 T40,1"
    },
    {
      icon: ZoomIn,
      label: "Market Scanned",
      value: marketsScanned,
      decimals: 0,
      suffix: "",
      sub: "Markets",
      colorClass: "text-[#38bdf8]",
      iconColor: "text-[#38bdf8]"
    },
    {
      icon: Compass,
      label: "Opportunities",
      value: oppsCount,
      decimals: 0,
      suffix: "",
      sub: "High Probability",
      colorClass: "text-[#f59e0b]",
      iconColor: "text-[#f59e0b]"
    },
    {
      icon: Percent,
      label: "Win Rate (Live)",
      value: winRate,
      decimals: 1,
      suffix: "%",
      sub: "Optimal",
      colorClass: "text-[#4ade80]",
      iconColor: "text-[#4ade80]",
      sparkline: true,
      sparklineColor: "#4ade80",
      sparklineData: "M0,9 L8,6 L15,8 L25,3 L32,5 L40,0"
    },
    {
      icon: Layers,
      label: "Adaptation Score",
      value: 87.6,
      decimals: 1,
      suffix: "%",
      sub: "Evolving",
      colorClass: "text-[#a78bfa]",
      iconColor: "text-[#a78bfa]",
      sparkline: true,
      sparklineColor: "#a78bfa",
      sparklineData: "M0,10 C10,8 15,2 20,4 S30,0 40,2"
    }
  ];

  return (
    <div className="flex flex-col gap-2 font-mono">
      <h2 className="text-[9px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase">
        System Overview
      </h2>
      
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.25)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="bg-[#09090f] border border-[#151522] rounded-xl p-3 flex flex-col gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.01)] transition-all duration-300"
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div 
              key={idx} 
              className="flex items-center justify-between py-1.5 border-b border-[#151522]/30 last:border-b-0"
            >
              <div className="flex items-center gap-2">
                <Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                <div className="flex flex-col">
                  <span className="text-[8.5px] text-[#e8e8f0] font-bold tracking-wider">
                    {item.label}
                  </span>
                  <span className="text-[7px] text-[#52525b] font-bold uppercase mt-0.5">
                    {item.sub}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {item.sparkline && (
                  <div className="w-10 h-3 opacity-60 mt-1 shrink-0 hidden sm:block">
                    <svg viewBox="0 0 40 10" className="w-full h-full overflow-visible">
                      <motion.path 
                        d={item.sparklineData}
                        fill="none" 
                        stroke={item.sparklineColor} 
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", repeatDelay: 5 }}
                      />
                    </svg>
                  </div>
                )}
                <span className={`text-[10px] font-black tracking-wide ${item.colorClass}`}>
                  <AnimatedNumber 
                    value={item.value} 
                    decimals={item.decimals} 
                    suffix={item.suffix} 
                  />
                </span>
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
