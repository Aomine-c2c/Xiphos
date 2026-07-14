"use client";

import React, { useState, useCallback } from "react";
import { SystemOverview } from "./CommandCenter/SystemOverview";
import { CapitalOverview } from "./CommandCenter/CapitalOverview";
import { MahoragaWheel } from "./CommandCenter/MahoragaWheel";
import { AdaptationMemoryTimeline } from "./CommandCenter/AdaptationMemoryTimeline";
import { LiveIntelligenceFeed } from "./CommandCenter/LiveIntelligenceFeed";
import { AdaptationProcess } from "./CommandCenter/AdaptationProcess";
import GlobalScannerRadar from "./GlobalScannerRadar";
import { motion } from "framer-motion";

export default function OverviewTab() {
  // 8 spoke weight states mapping spoke ID to weight (0.1 to 1.0)
  const [spokeWeights, setSpokeWeights] = useState<Record<number, number>>({
    0: 1.0, // NEWS ADAPTATION
    1: 1.0, // VOLATILITY ADAPTATION
    2: 1.0, // CORRELATION MAPPING
    3: 1.0, // TREND & REGIME DETECTION
    4: 1.0, // RISK MANAGEMENT
    5: 1.0, // LIQUIDITY AWARENESS
    6: 1.0, // EXECUTION OPTIMIZATION
    7: 1.0, // SENTIMENT ANALYSIS
  });

  const handleWeightChange = useCallback((id: number, weight: number) => {
    setSpokeWeights((prev) => ({
      ...prev,
      [id]: weight,
    }));
  }, []);

  return (
    <div className="w-full h-full flex flex-row p-5 gap-5 overflow-hidden bg-[#05050a] select-none relative">
      
      {/* BACKGROUND NEURAL CONNECTIONS & CIRCUITS */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-20 select-none" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="neuralGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Neural connection line 1: SystemOverview to Wheel */}
        <path d="M 230 180 L 270 180" stroke="url(#neuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="230" cy="180" r="2" fill="#8b5cf6" />
        <circle cx="270" cy="180" r="2" fill="#f59e0b" />

        {/* Neural connection line 2: CapitalOverview to Wheel */}
        <path d="M 230 380 L 270 380" stroke="url(#neuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="230" cy="380" r="2" fill="#8b5cf6" />
        <circle cx="270" cy="380" r="2" fill="#f59e0b" />

        {/* Neural connection line 3: Wheel to LiveIntelligenceFeed */}
        <path d="M 750 180 L 790 180" stroke="url(#neuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="750" cy="180" r="2" fill="#f59e0b" />
        <circle cx="790" cy="180" r="2" fill="#8b5cf6" />

        {/* Neural connection line 4: Wheel to AdaptationProcess */}
        <path d="M 750 340 L 790 340" stroke="url(#neuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="750" cy="340" r="2" fill="#f59e0b" />
        <circle cx="790" cy="340" r="2" fill="#8b5cf6" />

        {/* Neural connection line 5: Wheel to HermesConsole */}
        <path d="M 750 500 L 790 500" stroke="url(#neuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="750" cy="500" r="2" fill="#f59e0b" />
        <circle cx="790" cy="500" r="2" fill="#8b5cf6" />

        {/* Neural connection line 6: Wheel to Timeline */}
        <path d="M 490 620 L 490 660" stroke="url(#neuralGlow)" strokeWidth="1.2" strokeDasharray="3 3" />
        <circle cx="490" cy="620" r="2" fill="#f59e0b" />
        <circle cx="490" cy="660" r="2" fill="#8b5cf6" />

        {/* Animated energy packets moving along paths */}
        <circle r="2" fill="#a78bfa" className="shadow-[0_0_8px_#a78bfa]">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M 270 180 L 230 180" />
        </circle>
        <circle r="2" fill="#a78bfa" className="shadow-[0_0_8px_#a78bfa]">
          <animateMotion dur="3.6s" repeatCount="indefinite" path="M 270 380 L 230 380" />
        </circle>
        <circle r="2" fill="#f59e0b" className="shadow-[0_0_8px_#f59e0b]">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M 750 180 L 790 180" />
        </circle>
        <circle r="2" fill="#f59e0b" className="shadow-[0_0_8px_#f59e0b]">
          <animateMotion dur="3.8s" repeatCount="indefinite" path="M 750 340 L 790 340" />
        </circle>
        <circle r="2" fill="#f59e0b" className="shadow-[0_0_8px_#f59e0b]">
          <animateMotion dur="4.4s" repeatCount="indefinite" path="M 750 500 L 790 500" />
        </circle>
        <circle r="2" fill="#a78bfa" className="shadow-[0_0_8px_#a78bfa]">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M 490 620 L 490 660" />
        </circle>
      </svg>

      {/* LEFT SECTION (Overview Stats, Mahoraga Wheel, and Timeline) */}
      <div className="flex-1 h-full flex flex-col gap-5 min-w-0 z-10">
        
        {/* TOP ROW: Stats + Wheel */}
        <div className="flex-1 min-h-0 grid grid-cols-[260px_1fr] gap-5 items-stretch">
          
          {/* Column 1: System and Capital stats (Gentle float animations with delays) */}
          <div className="flex flex-col gap-5 min-h-0">
            <motion.div 
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
              className="shrink-0"
            >
              <SystemOverview />
            </motion.div>
            
            <motion.div 
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.9 }}
              className="flex-1 min-h-0"
            >
              <CapitalOverview />
            </motion.div>
          </div>

          {/* Column 2: Glowing Mahoraga Wheel */}
          <div className="border border-[#151522] bg-[#07070c]/90 rounded-2xl flex items-center justify-center relative shadow-[0_0_20px_rgba(139,92,246,0.01)] min-h-0 overflow-visible z-20">
            <MahoragaWheel 
              spokeWeights={spokeWeights} 
              onWeightChange={handleWeightChange} 
            />
          </div>

        </div>

        {/* BOTTOM ROW: System learning timeline */}
        <motion.div 
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.4 }}
          className="h-[140px] shrink-0"
        >
          <AdaptationMemoryTimeline />
        </motion.div>

      </div>

      {/* RIGHT SECTION (Unified Vertical Intelligence Column: Feed, Process, Console) */}
      <div className="w-[320px] h-full flex flex-col gap-5 shrink-0 min-h-0 z-10">
        
        {/* Card 1: Live Intelligence Feed */}
        <motion.div 
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.2 }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <LiveIntelligenceFeed spokeWeights={spokeWeights} />
        </motion.div>

        {/* Card 2: Adaptation steps */}
        <motion.div 
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 7.5, ease: "easeInOut", delay: 0.6 }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <AdaptationProcess />
        </motion.div>

        {/* Card 3: Global Scanner Radar */}
        <motion.div 
          animate={{ y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 8.2, ease: "easeInOut", delay: 1.1 }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <GlobalScannerRadar />
        </motion.div>

      </div>

    </div>
  );
}
