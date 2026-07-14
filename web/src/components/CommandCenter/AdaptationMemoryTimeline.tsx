"use client";

import React from "react";
import { motion } from "framer-motion";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
  color: string;
}

export function AdaptationMemoryTimeline() {
  const events: TimelineEvent[] = [
    {
      time: "10:35:12",
      title: "Pattern Learned",
      description: "Volatility breakout pattern identified.",
      color: "bg-[#8b5cf6] border-[#a78bfa] shadow-[0_0_10px_rgba(139,92,246,0.5)]"
    },
    {
      time: "10:36:45",
      title: "Parameter Updated",
      description: "Risk threshold adjusted to 0.78%.",
      color: "bg-[#ec4899] border-[#f472b6] shadow-[0_0_10px_rgba(236,72,153,0.5)]"
    },
    {
      time: "10:38:21",
      title: "Strategy Evolved",
      description: "Strategy #8 evolved into #12.",
      color: "bg-[#a78bfa] border-[#c084fc] shadow-[0_0_10px_rgba(167,139,250,0.5)]"
    },
    {
      time: "10:39:47",
      title: "Risk Adjusted",
      description: "Position sizing optimized.",
      color: "bg-[#8b5cf6] border-[#a78bfa] shadow-[0_0_10px_rgba(139,92,246,0.5)]"
    },
    {
      time: "10:41:09",
      title: "Confidence Boost",
      description: "Win probability increased +8.2%.",
      color: "bg-[#f59e0b] border-[#fbbf24] shadow-[0_0_10px_rgba(245,158,11,0.5)]"
    },
    {
      time: "10:42:31",
      title: "Adaptation Complete",
      description: "New edge locked and deployed.",
      color: "bg-[#4ade80] border-[#34d399] shadow-[0_0_10px_rgba(74,222,128,0.5)]"
    }
  ];

  return (
    <div className="flex flex-col gap-3 font-mono">
      <h2 className="text-[10px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase">
        Adaptation Memory Timeline
      </h2>
      <span className="text-[7.5px] text-[#52525b] uppercase font-bold tracking-widest block -mt-1">
        System Learning & Evolution
      </span>
      
      <div className="bg-[#09090f] border border-[#151522] rounded-xl p-5 relative shadow-[0_0_10px_rgba(139,92,246,0.01)] min-h-[120px] flex items-center">
        {/* Horizontal Line connecting nodes */}
        <div className="absolute left-[3.5rem] right-[3.5rem] h-[1px] bg-[#151522] z-0 overflow-hidden">
          <motion.div 
            className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#a78bfa] to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 4, ease: "linear", repeat: Infinity }}
          />
        </div>

        {/* Timeline nodes */}
        <div className="flex justify-between w-full relative z-10">
          {events.map((ev, idx) => (
            <div key={idx} className="flex flex-col items-center text-center w-28 shrink-0">
              <span className="text-[7.5px] text-[#52525b] font-bold mb-2">
                {ev.time}
              </span>
              
              {/* Circular Node */}
              <div className="relative mb-3 flex items-center justify-center w-3.5 h-3.5">
                <div className={`absolute inset-0 rounded-full border-2 ${ev.color}`} />
                {idx === events.length - 1 && (
                  <div className={`absolute w-full h-full rounded-full border-2 ${ev.color} animate-ping opacity-75`} style={{ animationDuration: '2s' }} />
                )}
                {idx !== events.length - 1 && (
                  <div className="w-1 h-1 rounded-full bg-[#151522]" />
                )}
              </div>
              
              <span className="text-[8px] font-bold text-[#e8e8f0] tracking-wide block">
                {ev.title}
              </span>
              <span className="text-[7px] text-[#52525b] mt-1 block leading-snug">
                {ev.description}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
