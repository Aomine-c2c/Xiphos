"use client";

import React, { useState, useEffect } from "react";
import { Shield, AlertTriangle, Activity, Lock, Target, Zap, ActivitySquare, Crosshair } from "lucide-react";

// --- Types ---
type RiskMetric = {
  id: string;
  name: string;
  value: number; // For gauge fill (0-100 normally)
  displayValue: string;
  maxLabel?: string;
  color: string;
  icon: React.ElementType;
  angle: number; // Position on the circle (0-360)
};

// --- Mock Data ---
const METRICS: RiskMetric[] = [
  { id: "m-1", name: "Exposure", value: 68, displayValue: "68%", color: "#4cc9f0", icon: Activity, angle: 0 },
  { id: "m-2", name: "Drawdown", value: 42, displayValue: "4.2%", maxLabel: "Max 10%", color: "#f87171", icon: AlertTriangle, angle: 45 },
  { id: "m-3", name: "Leverage", value: 42, displayValue: "2.1x", maxLabel: "Max 5x", color: "#a78bfa", icon: Crosshair, angle: 90 },
  { id: "m-4", name: "Correlation", value: 15, displayValue: "0.15", maxLabel: "Max 0.8", color: "#3b82f6", icon: ActivitySquare, angle: 135 },
  { id: "m-5", name: "Portfolio Risk", value: 55, displayValue: "12.4%", maxLabel: "Target 10%", color: "#f59e0b", icon: Target, angle: 180 },
  { id: "m-6", name: "Capital Protection", value: 94, displayValue: "94%", color: "#4ade80", icon: Lock, angle: 225 },
  { id: "m-7", name: "Stress Level", value: 22, displayValue: "LOW", maxLabel: "22 / 100", color: "#fbbf24", icon: Zap, angle: 270 },
  { id: "m-8", name: "Daily Limits", value: 45, displayValue: "45%", maxLabel: "Consumed", color: "#ec4899", icon: Shield, angle: 315 },
];

export default function RiskManagerView() {
  const [pulseScale, setPulseScale] = useState(1);
  const systemStress = 22; // 0-100
  const isHighStress = systemStress > 70;

  // Simulate a living, breathing pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseScale(prev => prev === 1 ? (isHighStress ? 1.05 : 1.02) : 1);
    }, isHighStress ? 800 : 2000);
    return () => clearInterval(interval);
  }, [isHighStress]);

  // Radius for the layout circle
  const layoutRadius = 320; 
  const centerOffset = 50; // CSS percentage

  const getCoordinates = (angle: number) => {
    const rad = (angle - 90) * (Math.PI / 180);
    return {
      x: layoutRadius * Math.cos(rad),
      y: layoutRadius * Math.sin(rad)
    };
  };

  return (
    <div className="relative w-full h-full bg-[#05050a] overflow-hidden flex items-center justify-center animate-in fade-in select-none">
      
      {/* Background Pulse Overlays */}
      <div 
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.05)_0%,transparent_60%)] transition-all duration-[2000ms]`}
        style={{ transform: `scale(${pulseScale * 1.5})` }}
      />
      <div 
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,222,128,0.02)_0%,transparent_80%)] transition-all duration-[2000ms]`}
        style={{ transform: `scale(${pulseScale * 2})` }}
      />

      {/* Center Shield Container */}
      <div 
        className="absolute z-20 flex items-center justify-center transition-all duration-1000 ease-in-out"
        style={{ transform: `scale(${pulseScale})` }}
      >
        {/* Shield Glow Rings */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-[#4ade80]/20 animate-[spin_10s_linear_infinite]" />
        <div className="absolute w-[350px] h-[350px] rounded-full border-2 border-dashed border-[#4ade80]/30 animate-[spin_15s_linear_infinite_reverse]" />
        <div className="absolute w-[250px] h-[250px] rounded-full bg-[#4ade80]/10 blur-2xl" />

        {/* Core Shield SVG */}
        <div className="relative w-48 h-48 flex items-center justify-center">
          <svg className="absolute inset-0 w-full h-full text-[#4ade80]/20 drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <Shield className="w-20 h-20 text-[#4ade80] z-10" strokeWidth={1.5} />
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center mt-12 z-20">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#4ade80] bg-[#05050a] px-2 py-0.5 rounded border border-[#4ade80]/30 shadow-[0_0_10px_rgba(74,222,128,0.5)]">
              Secure
            </span>
          </div>
        </div>
      </div>

      {/* Orbiting Gauges Container */}
      <div className="absolute inset-0 z-30">
        {METRICS.map(metric => {
          const coords = getCoordinates(metric.angle);
          const gaugeRadius = 45;
          const circumference = 2 * Math.PI * gaugeRadius;
          const strokeDashoffset = circumference - (metric.value / 100) * circumference;

          return (
            <div 
              key={metric.id}
              className="absolute flex flex-col items-center justify-center group"
              style={{
                left: `calc(${centerOffset}% + ${coords.x}px)`,
                top: `calc(${centerOffset}% + ${coords.y}px)`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Circular Gauge SVG */}
              <div className="relative w-[120px] h-[120px] flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Track */}
                  <circle
                    cx="60" cy="60" r={gaugeRadius}
                    fill="none"
                    stroke="#1e1e2e"
                    strokeWidth="6"
                  />
                  {/* Fill */}
                  <circle
                    cx="60" cy="60" r={gaugeRadius}
                    fill="none"
                    stroke={metric.color}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                    style={{ filter: `drop-shadow(0 0 8px ${metric.color}80)` }}
                  />
                </svg>

                {/* Inner Icon & Value */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#05050a]/50 rounded-full backdrop-blur-sm m-2 border border-white/5">
                  <metric.icon className="w-4 h-4 mb-1" style={{ color: metric.color }} />
                  <span className="text-[13px] font-bold font-mono text-white leading-none shadow-black drop-shadow-md">
                    {metric.displayValue}
                  </span>
                </div>
              </div>

              {/* Labels */}
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-bold text-white tracking-wider uppercase mb-0.5" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                  {metric.name}
                </span>
                {metric.maxLabel && (
                  <span className="text-[10px] text-[#94a3b8] font-mono tracking-wide px-1.5 py-0.5 bg-[#0f0f1a]/80 border border-[#1e1e2e] rounded">
                    {metric.maxLabel}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
