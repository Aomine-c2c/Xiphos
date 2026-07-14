"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Radar, Target } from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";
import { ScannerBlip } from "../store/types";

interface Blip extends ScannerBlip {
  symbol: string;
}

export default function GlobalScannerRadar() {
  const [rotation, setRotation] = useState(0);
  
  // Wire to Zustand
  const storeBlips = useTradingStore(state => state.scannerBlips);
  
  // Local state for generated blips if store is empty
  const [localBlips, setLocalBlips] = useState<Blip[]>([]);

  const activeBlips = storeBlips.length > 0 ? (storeBlips as Blip[]) : localBlips;

  // Radar sweep animation
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    
    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;
      
      // Rotate 90 degrees per second
      setRotation(r => (r + (delta * 0.09)) % 360);
      
      // Update local blip ages and remove old ones
      setLocalBlips(prev => 
        prev.map(b => ({ ...b, age: b.age + delta }))
            .filter(b => b.age < 4000)
      );

      // Randomly spawn new blips if store is empty
      if (storeBlips.length === 0 && Math.random() > 0.98) {
        setLocalBlips(prev => {
          if (prev.length > 15) return prev;
          return [...prev, {
            id: Date.now(),
            r: 20 + Math.random() * 70,
            theta: Math.random() * 360,
            symbol: ["EURUSD", "BTCUSD", "US100", "XAUUSD"][Math.floor(Math.random() * 4)],
            intensity: 0.5 + Math.random() * 0.5,
            age: 0
          }];
        });
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [storeBlips.length]);

  return (
    <div className="relative w-48 h-48 bg-[#07070c] border border-[#1e1e2e] rounded-full overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.05)] select-none">
      
      {/* Background Grid & Circles */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="90" fill="none" stroke="#8b5cf6" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="30" fill="none" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="2 4" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="#8b5cf6" strokeWidth="0.5" opacity="0.5" />
      </svg>

      {/* Sweeping Beam */}
      <div 
        className="absolute inset-0 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, transparent 70%, rgba(139, 92, 246, 0.1) 95%, rgba(167, 139, 250, 0.8) 100%)',
          transform: `rotate(${rotation}deg)`,
          transformOrigin: 'center center'
        }}
      />

      {/* Center Node */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#a78bfa] rounded-full shadow-[0_0_10px_#a78bfa]"></div>

      {/* Render Blips */}
      <AnimatePresence>
        {activeBlips.map((blip) => {
          // Convert polar (r, theta) to cartesian (x, y) relative to center
          // 0 degrees is top. SVG/CSS rotation is clockwise.
          const rad = (blip.theta - 90) * (Math.PI / 180);
          const x = 100 + blip.r * Math.cos(rad);
          const y = 100 + blip.r * Math.sin(rad);
          const opacity = Math.max(0, 1 - (blip.age / 15)) * blip.intensity;

          return (
            <motion.div
              key={blip.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity }}
              exit={{ opacity: 0 }}
              className="absolute w-2 h-2 bg-[#4ade80] rounded-full shadow-[0_0_10px_#4ade80] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center group cursor-crosshair"
              style={{ left: `${(x / 200) * 100}%`, top: `${(y / 200) * 100}%` }}
            >
              <div className="absolute inset-0 rounded-full border border-[#4ade80] animate-ping opacity-75"></div>
              
              {/* Tooltip */}
              <div className="absolute left-4 top-0 bg-[#0f0f1a] border border-[#1e1e2e] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col pointer-events-none">
                <span className="text-[9px] font-bold text-[#e8e8f0] font-mono leading-none mb-0.5">{blip.symbol}</span>
                <span className="text-[7px] text-[#4ade80] font-mono leading-none tracking-wider">LIQUIDITY GAP</span>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Title */}
      <div className="absolute bottom-3 left-0 right-0 flex justify-center opacity-40">
        <span className="text-[7px] font-mono uppercase tracking-widest text-[#a78bfa] bg-[#05050a] px-2 py-0.5 rounded-full border border-[#1e1e2e]">
          Global Scanner Active
        </span>
      </div>
    </div>
  );
}
