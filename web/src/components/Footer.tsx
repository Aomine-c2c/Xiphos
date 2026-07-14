"use client";

import React, { useEffect, useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import {
  Activity, Clock, Layers, Zap, Cpu, Settings, Network,
  BrainCircuit, FlaskConical, Network as NetworkIcon, Globe2,
} from "lucide-react";

export type ExtensionType =
  | "NONE"
  | "INTELLIGENCE"
  | "EXECUTION"
  | "EVOLUTION"
  | "SIMULATION"
  | "PORTFOLIO"
  | "POSITIONS";

interface FooterProps {
  activeExtension: ExtensionType;
  onToggleExtension: (ext: ExtensionType) => void;
}

const EXTENSIONS: {
  id: ExtensionType;
  icon: React.ElementType;
  label: string;
  color: string;
  activeColor: string;
}[] = [
  { id: "INTELLIGENCE", icon: BrainCircuit,  label: "Intelligence Center", color: "text-[#52525b]", activeColor: "text-[#a78bfa]" },
  { id: "EXECUTION",    icon: Activity,       label: "Execution Engine",    color: "text-[#52525b]", activeColor: "text-[#4ade80]" },
  { id: "EVOLUTION",    icon: NetworkIcon,    label: "Evolution Hub",       color: "text-[#52525b]", activeColor: "text-[#4cc9f0]" },
  { id: "SIMULATION",   icon: FlaskConical,   label: "Simulation Lab",      color: "text-[#52525b]", activeColor: "text-[#f59e0b]" },
  { id: "PORTFOLIO",    icon: Globe2,         label: "Strategy Globe",      color: "text-[#52525b]", activeColor: "text-[#f472b6]" },
];

export default function Footer({ activeExtension, onToggleExtension }: FooterProps) {
  const { apiLatency, marketWatch, botRunning } = useTradingStore();
  const [cycleTime, setCycleTime] = useState("00:17:29");

  const formattedLatency = typeof apiLatency === "number" ? `${apiLatency.toFixed(0)}ms` : "12ms";

  useEffect(() => {
    const start = Date.now() - (17 * 60 + 29) * 1000;
    const interval = setInterval(() => {
      const diff = Date.now() - start;
      const hrs = Math.floor(diff / 3600000).toString().padStart(2, "0");
      const mins = Math.floor((diff % 3600000) / 60000).toString().padStart(2, "0");
      const secs = Math.floor((diff % 60000) / 1000).toString().padStart(2, "0");
      setCycleTime(`${hrs}:${mins}:${secs}`);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="h-9 bg-[#07070c] border-t border-[#151522] flex items-center justify-between px-4 text-[9px] font-mono text-[#52525b] select-none shrink-0 z-10 tracking-widest font-bold">

      {/* LEFT: SYSTEM STATS */}
      <div className="flex items-center gap-5 h-full pl-2">

        {/* SYSTEM UPTIME */}
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#52525b]" />
          <span className="text-[#a1a1aa]">120d 4h 32m</span>
        </div>

        {/* ADAPTATION CYCLE */}
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-[#a78bfa]" />
          <span className="text-[#a78bfa]">{cycleTime}</span>
        </div>

        {/* MARKETS MONITORED */}
        <div className="flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-[#52525b]" />
          <span className="text-[#e8e8f0]">{marketWatch?.length || 274} ASSETS</span>
        </div>
      </div>

      {/* RIGHT: EXTENSIONS + SYSTEM WIDGETS */}
      <div className="flex items-center gap-0 h-full">

        {/* ── EXTENSION BUTTONS (same pattern as Settings) ── */}
        {EXTENSIONS.map((ext) => {
          const isActive = activeExtension === ext.id;
          return (
            <button
              key={ext.id}
              onClick={() => onToggleExtension(ext.id)}
              title={ext.label}
              className={`h-full px-3 flex items-center justify-center border-l border-[#151522] cursor-pointer transition-colors relative ${
                isActive ? "bg-white/5" : "hover:bg-white/5"
              }`}
            >
              <ext.icon
                className={`w-4 h-4 transition-colors duration-150 ${
                  isActive ? ext.activeColor : ext.color + " hover:" + ext.activeColor
                }`}
              />
              {/* Active underline indicator */}
              {isActive && (
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full"
                  style={{
                    background: ext.activeColor
                      .replace("text-[", "")
                      .replace("]", ""),
                  }}
                />
              )}
            </button>
          );
        })}

        {/* SYSTEM MONITOR SPARKLINES */}
        <div className="flex items-center gap-3 h-full px-3 border-l border-[#151522] hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <div className="flex flex-col gap-0.5 w-10">
              <div className="h-1.5 w-full bg-[#0f0f1a] rounded-full overflow-hidden">
                <div className="h-full bg-[#8b5cf6] w-[42%]" />
              </div>
              <span className="text-[6.5px] leading-none uppercase">CPU 42%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Network className="w-3.5 h-3.5 text-[#f59e0b]" />
            <div className="flex flex-col gap-0.5 w-10">
              <div className="h-1.5 w-full bg-[#0f0f1a] rounded-full overflow-hidden">
                <div className="h-full bg-[#f59e0b] w-[78%]" />
              </div>
              <span className="text-[6.5px] leading-none uppercase">MEM 78%</span>
            </div>
          </div>
        </div>

        {/* AI AGENTS ONLINE */}
        <div className="flex items-center gap-1.5 h-full px-3 border-l border-[#151522] hover:bg-white/5 cursor-pointer transition-colors group">
          <div className="flex items-center -space-x-1">
            <div className="w-3.5 h-3.5 rounded-full bg-[#8b5cf6]/20 border border-[#8b5cf6] z-30" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#4ade80]/20 border border-[#4ade80] z-20" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b] z-10" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#3b82f6]/20 border border-[#3b82f6] z-0" />
          </div>
          <span className="text-[#e8e8f0] ml-1">6 Nodes</span>
        </div>

        {/* LATENCY */}
        <div className="flex items-center gap-1.5 h-full px-3 border-l border-[#151522]">
          <Zap className="w-3.5 h-3.5 text-[#4ade80]" />
          <span className="text-[#4ade80]">{formattedLatency}</span>
        </div>

        {/* SETTINGS */}
        <button className="h-full px-3 flex items-center justify-center hover:bg-white/5 hover:text-[#e8e8f0] transition-colors border-l border-[#151522] cursor-pointer">
          <Settings className="w-4 h-4" />
        </button>
      </div>

    </footer>
  );
}
