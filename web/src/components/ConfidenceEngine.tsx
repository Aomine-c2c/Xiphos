"use client";

import React from "react";
import { BrainCircuit } from "lucide-react";

export default function ConfidenceEngine() {
  return (
    <div className="glass-panel w-full h-full flex flex-col p-5 font-mono select-none overflow-hidden transition-all duration-300">
      <div className="shrink-0 mb-4 flex items-center gap-3 border-b border-[rgba(255,255,255,0.05)] pb-3">
        <BrainCircuit className="h-5 w-5 text-xiphos-purple glow-purple" />
        <span className="text-sm text-white font-bold uppercase tracking-widest block glow-purple">
          KRONOS CONFIDENCE ENGINE
        </span>
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 items-center min-h-0">
        {/* Left: 4 Progress quality bars (col-span-8) */}
        <div className="col-span-8 space-y-4">
          {[
            { label: "Trend Strength", val: "STRONG", progress: 95, colorClass: "text-xiphos-emerald glow-emerald", bgClass: "bg-xiphos-emerald" },
            { label: "Volatility Structure", val: "STABLE", progress: 85, colorClass: "text-xiphos-cyan glow-cyan", bgClass: "bg-xiphos-cyan" },
            { label: "Signal Density", val: "HIGH", progress: 90, colorClass: "text-xiphos-gold glow-gold", bgClass: "bg-xiphos-gold" },
            { label: "Risk Buffer", val: "SAFE", progress: 92, colorClass: "text-xiphos-purple glow-purple", bgClass: "bg-xiphos-purple" }
          ].map((metric) => (
            <div key={metric.label} className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-xiphos-muted tracking-widest leading-none">
                <span>{metric.label}</span>
                <span className={metric.colorClass}>{metric.val}</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${metric.bgClass}`}
                  style={{ width: `${metric.progress}%`, boxShadow: `0 0 10px var(--tw-colors-xiphos-${metric.bgClass.split('-')[2]})` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Mahoraga Wheel (col-span-4) */}
        <div className="col-span-4 flex flex-col items-center justify-center border-l border-[rgba(255,255,255,0.05)] pl-4 h-full relative">
          <span className="text-[10px] text-xiphos-muted uppercase font-bold tracking-widest leading-none mb-3">
            CONVERGENCE
          </span>
          
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* The Mahoraga Wheel Animation */}
            <svg 
              className="absolute inset-0 w-full h-full animate-[spin_10s_linear_infinite]" 
              viewBox="0 0 100 100" 
              fill="none"
              style={{ filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))" }}
            >
              {/* Inner ring */}
              <circle cx="50" cy="50" r="28" stroke="#D4AF37" strokeWidth="2" strokeDasharray="4 2" className="opacity-80" />
              {/* Outer ring */}
              <circle cx="50" cy="50" r="38" stroke="#D4AF37" strokeWidth="1" className="opacity-50" />
              
              {/* 8 Handles */}
              {[...Array(8)].map((_, i) => (
                <g key={i} transform={`rotate(${i * 45} 50 50)`}>
                  <line x1="50" y1="12" x2="50" y2="22" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
                  <circle cx="50" cy="10" r="3" fill="#D4AF37" />
                </g>
              ))}
            </svg>
            
            {/* Pulsing core */}
            <div className="absolute inset-0 m-auto w-12 h-12 bg-xiphos-gold/20 rounded-full animate-ping opacity-50" />
            <div className="absolute inset-0 m-auto w-14 h-14 border border-xiphos-gold/40 rounded-full animate-[spin_3s_linear_infinite_reverse]" style={{ borderTopColor: 'transparent' }} />
            
            <span className="text-2xl font-black text-xiphos-gold glow-gold z-10">
              92%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
