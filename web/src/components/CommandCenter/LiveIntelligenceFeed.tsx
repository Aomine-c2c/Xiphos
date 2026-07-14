"use client";

import React from "react";
import { AnimatedNumber } from "../ui/AnimatedNumber";
import { motion } from "framer-motion";

interface LiveIntelligenceFeedProps {
  spokeWeights: Record<number, number>;
}

export function LiveIntelligenceFeed({ spokeWeights }: LiveIntelligenceFeedProps) {
  const oppsCount = 12;

  // Calculate dynamic confidence level based on the average weight of the spokes
  const baseConfidence = 91.3;
  const weightsArr = Object.values(spokeWeights);
  const avgWeight = weightsArr.reduce((a, b) => a + b, 0) / weightsArr.length;
  
  // Scale confidence dynamically (from 10% to 100%)
  const dynamicConfidence = Math.max(10.0, Math.min(100.0, baseConfidence * avgWeight));

  // Dynamically scale expected R:R depending on the Risk Management spoke weight (ID 4)
  const riskWeight = spokeWeights[4] ?? 1.0;
  const dynamicRRNum = (2.0 + riskWeight * 0.84);

  // Radar/spider chart drawing values
  const center = 45;
  const radius = 35;
  
  // Outer hexagon coordinates
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 2 * Math.PI) / 6;
    points.push({
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    });
  }
  const hexPointsString = points.map(p => `${p.x},${p.y}`).join(" ");

  // Dotted inner hexagon coordinates
  const innerPoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 2 * Math.PI) / 6;
    innerPoints.push({
      x: center + (radius * 0.5) * Math.cos(angle),
      y: center + (radius * 0.5) * Math.sin(angle),
    });
  }
  const innerHexPointsString = innerPoints.map(p => `${p.x},${p.y}`).join(" ");

  // Map spoke weights directly to the spider chart nodes for high-fidelity interactive sync!
  const spiderWeights = [
    spokeWeights[0] ?? 1.0,
    spokeWeights[1] ?? 1.0,
    spokeWeights[3] ?? 1.0,
    spokeWeights[4] ?? 1.0,
    spokeWeights[5] ?? 1.0,
    spokeWeights[7] ?? 1.0,
  ];

  const valuePoints = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * 2 * Math.PI) / 6;
    const signalFactor = 0.5 + spiderWeights[i] * 0.45;
    valuePoints.push({
      x: center + (radius * signalFactor) * Math.cos(angle),
      y: center + (radius * signalFactor) * Math.sin(angle),
    });
  }
  const valueHexPointsString = valuePoints.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col gap-3 font-mono h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-[10px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase">
          Live Intelligence Feed
        </h2>
        <span className="text-[7.5px] text-[#52525b] uppercase font-bold tracking-widest">
          {oppsCount} Opportunities Detected
        </span>
      </div>
      
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.25)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        className="flex-1 bg-[#09090f] border border-[#151522] rounded-xl p-3 flex flex-col justify-between shadow-[0_0_10px_rgba(139,92,246,0.01)] min-h-0 transition-all duration-300"
      >
        
        {/* TOP OPPORTUNITY DETAILS */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[7.5px] text-[#52525b] uppercase font-bold tracking-widest">Top Opportunity</span>
              <span className="bg-[#4ade80]/10 border border-[#4ade80]/20 text-[#4ade80] text-[6.5px] font-black px-1.5 py-0.5 rounded tracking-widest uppercase">
                High Confidence
              </span>
            </div>
            
            <div className="grid grid-cols-[70px_1fr] gap-x-2 gap-y-1 text-[7.5px] mt-1.5">
              <span className="text-[#52525b] font-bold">Type</span>
              <span className="text-[#e8e8f0] font-bold">Trend Continuation</span>

              <span className="text-[#52525b] font-bold">Confidence</span>
              <div className="flex items-center gap-2">
                <span className="text-[#4ade80] font-black w-10">
                  <AnimatedNumber value={dynamicConfidence} decimals={1} suffix="%" />
                </span>
                <div className="h-1.5 w-16 bg-[#151522] rounded-full overflow-hidden shrink-0">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${dynamicConfidence}%` }}
                    transition={{ type: "spring", stiffness: 90, damping: 18 }}
                    className="h-full bg-gradient-to-r from-[#059669] to-[#4ade80] shadow-[0_0_8px_rgba(74,222,128,0.5)]" 
                  />
                </div>
              </div>

              <span className="text-[#52525b] font-bold">Expected RR</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#e8e8f0] font-bold w-7">
                  1:<AnimatedNumber value={dynamicRRNum} decimals={1} />
                </span>
                <div className="flex h-1.5 w-16 bg-[#151522] rounded-full overflow-hidden shrink-0">
                  <div className="h-full bg-[#ef4444]" style={{ width: '25%' }} />
                  <div className="h-full bg-[#4ade80]" style={{ width: '75%' }} />
                </div>
              </div>

              <span className="text-[#52525b] font-bold">Adaptation State</span>
              <span className="text-[#a78bfa] font-bold">Adapting</span>

              <span className="text-[#52525b] font-bold">Market Regime</span>
              <span className="text-[#e8e8f0] font-bold">Volatile Expansion</span>

              <span className="text-[#52525b] font-bold">Reasoning</span>
              <span className="text-[#a1a1aa] font-bold leading-normal relative">
                <motion.span 
                  animate={{ opacity: [0.6, 1, 0.6] }} 
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  Strong momentum + positive sentiment + liquidity increase + news alignment.
                </motion.span>
              </span>

              <span className="text-[#52525b] font-bold">Action</span>
              <span className="text-[#f59e0b] font-bold">Monitoring Execution</span>
            </div>
          </div>
          
          {/* RADAR/SPIDER CHART */}
          <div className="w-[80px] h-[80px] relative flex items-center justify-center shrink-0 ml-4 border border-[#151522] bg-[#050508]/60 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(139,92,246,0.02)]">
            <svg viewBox="0 0 90 90" className="w-full h-full">
              {/* Outer hexagonal border */}
              <polygon points={hexPointsString} fill="none" stroke="#151522" strokeWidth="1" />
              
              {/* Inner dotted hexagon */}
              <polygon points={innerHexPointsString} fill="none" stroke="#26263f" strokeWidth="1" strokeDasharray="2, 2" />
              
              {/* Axis lines */}
              {points.map((p, idx) => (
                <line key={idx} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#151522" strokeWidth="1" />
              ))}

              {/* Glowing value shape with smooth spring morphing */}
              <motion.polygon 
                animate={{ points: valueHexPointsString }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                fill="rgba(139, 92, 246, 0.15)" 
                stroke="#a78bfa" 
                strokeWidth="1.5" 
                className="drop-shadow-[0_0_4px_rgba(167,139,250,0.4)]"
              />
              
              {/* Center point */}
              <circle cx={center} cy={center} r="2" fill="#8b5cf6" />
            </svg>
          </div>
        </div>

        {/* BUTTON */}
        <motion.button 
          whileHover={{ scale: 1.01, backgroundColor: "rgba(139,92,246,0.15)", borderColor: "rgba(139,92,246,0.3)" }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-1.5 bg-[#0f0f1a] border border-[#151522] text-[8px] font-bold tracking-widest text-[#a78bfa] rounded-lg mt-2 cursor-pointer transition-all duration-200"
        >
          VIEW FULL ANALYSIS
        </motion.button>

      </motion.div>
    </div>
  );
}
