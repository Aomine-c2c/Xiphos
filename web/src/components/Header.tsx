"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { ShieldCheck, TrendingUp, Cpu, Wallet, Award, Activity } from "lucide-react";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { motion } from "framer-motion";
import type { ExtensionType } from "./Footer";

interface HeaderProps {
  onHermesToggle: () => void;
  onToggleExtension?: (ext: ExtensionType) => void;
}

export default function Header({ onHermesToggle, onToggleExtension }: HeaderProps) {
  const { 
    account, 
    performanceMetrics, 
    botRunning, 
    positions, 
    orders, 
    activePositionsTab, 
    setActivePositionsTab 
  } = useTradingStore();

  const equityVal = account?.equity ?? 1250.00;
  const balanceVal = account?.balance ?? 1250.00;
  const totalProfitVal = performanceMetrics?.total_profit ?? 87.64;
  
  const dailyGainPct = balanceVal > 0 ? Math.min((totalProfitVal / balanceVal) * 100, 999) : 0;
  const capitalDeployedVal = 812.50;
  const deployedPct = (capitalDeployedVal / balanceVal * 100);

  // Active positions stats
  const activePositions = positions?.length || 0;
  const totalPnL = positions?.reduce((acc, p) => acc + p.profit, 0) || 0;
  const riskBearingCount = positions?.filter(p => p.risk_status === "RISK").length || 0;
  const riskFreeCount = positions?.filter(p => p.risk_status === "FREE").length || 0;

  return (
    <header className="h-16 bg-[#07070c] border-b border-[#151522] flex items-center justify-between px-6 select-none shrink-0 z-10 font-mono">
      
      {/* HEADER STATS GRID */}
      <div className="flex items-center gap-8 flex-1 min-w-0">
        
        {/* SYSTEM STATUS */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold">System Status</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${botRunning ? "bg-[#4ade80]" : "bg-[#f59e0b]"} animate-pulse`} />
              <span className={`text-[10px] font-bold tracking-wider ${botRunning ? "text-[#4ade80]" : "text-[#f59e0b]"}`}>
                {botRunning ? "OPTIMAL" : "STANDBY"}
              </span>
            </div>
            <span className="text-[7px] text-[#52525b] uppercase font-bold mt-0.5">All Systems Online</span>
          </div>
        </div>
        
        <div className="w-px h-8 bg-[#151522]" />

        {/* RISK NEXUS HUD */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-8 h-8 rounded-lg bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center transition-all group-hover:bg-[#ef4444]/20">
            <ShieldCheck className="w-4 h-4 text-[#ef4444]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ef4444]"></span>
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold group-hover:text-[#94a3b8] transition-colors">Risk Level</span>
            <span className="text-[10px] font-bold text-[#ef4444] tracking-wider mt-0.5">
              ELEVATED
            </span>
            <span className="text-[7px] text-[#ef4444] uppercase font-bold mt-0.5">Exp: $42,150</span>
          </div>
        </div>
        
        <div className="w-px h-8 bg-[#151522]" />

        {/* ADAPTATION LEVEL */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold">Adaptation Level</span>
            <span className="text-[10px] font-bold text-[#e8e8f0] tracking-wider mt-0.5">
              <AnimatedNumber value={87.6} decimals={1} suffix="%" />
              <span className="text-[#a78bfa] text-[8px] font-medium ml-1">EVOLVING</span>
            </span>
            {/* Sparkline SVG with drawing animation */}
            <div className="h-2 w-16 mt-1 opacity-70">
              <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                <motion.path 
                  d="M0,15 L15,12 L30,17 L45,8 L60,11 L75,3 L90,14 L100,5" 
                  fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: "easeInOut" }}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-px h-8 bg-[#151522]" />

        {/* NEURAL ACTIVITY */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold">Neural Activity</span>
            <span className="text-[10px] font-bold text-[#4ade80] tracking-wider mt-0.5">HIGH</span>
            {/* Sparkline SVG with drawing animation */}
            <div className="h-2 w-16 mt-1 opacity-70">
              <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
                <motion.path 
                  d="M0,10 L10,18 L20,3 L30,15 L40,5 L50,16 L60,4 L70,12 L80,2 L90,14 L100,8" 
                  fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, ease: "easeInOut", delay: 0.2 }}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="w-px h-8 bg-[#151522]" />

        {/* CAPITAL DEPLOYED */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold">Capital Deployed</span>
            <span className="text-[10px] font-bold text-[#e8e8f0] tracking-wider mt-0.5">
              $<AnimatedNumber value={capitalDeployedVal} decimals={2} />
            </span>
            <span className="text-[7px] text-[#4ade80] font-bold mt-0.5">
              +<AnimatedNumber value={deployedPct} decimals={1} suffix="%" />
            </span>
          </div>
        </div>

        <div className="w-px h-8 bg-[#151522]" />

        {/* TODAY'S PERFORMANCE */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold">Today's Performance</span>
            <span className="text-[10px] font-bold text-[#4ade80] tracking-wider mt-0.5">
              +$<AnimatedNumber value={totalProfitVal} decimals={2} />
            </span>
            <span className="text-[7px] text-[#4ade80] font-bold mt-0.5">
              +<AnimatedNumber value={dailyGainPct} decimals={2} suffix="%" />
            </span>
          </div>
        </div>

      </div>

      {/* RIGHT SIDE: CONTROLS & TRADING STATS */}
      <div className="flex items-center gap-6 shrink-0">
        
        {/* ACTIVE TRADING STATS WIDGET */}
        <div className="flex items-center gap-4 bg-[#09090e] border border-[#151522] rounded-xl px-4 py-1.5 shadow-[0_0_15px_rgba(139,92,246,0.02)]">
          <button 
            onClick={() => {
              setActivePositionsTab("ACTIVE");
              if (onToggleExtension) onToggleExtension("POSITIONS");
            }}
            className={`flex flex-col gap-0.5 text-left transition-colors cursor-pointer ${activePositionsTab === "ACTIVE" ? "" : "opacity-50 hover:opacity-100"}`}
          >
            <span className={`text-[8px] uppercase tracking-widest font-bold ${activePositionsTab === "ACTIVE" ? "text-[#4ade80]" : "text-[#52525b]"}`}>Positions</span>
            <span className="text-[10px] font-bold text-[#e8e8f0] tracking-wider mt-0.5">{activePositions}</span>
          </button>

          <div className="w-px h-6 bg-[#151522]" />

          <button 
            onClick={() => {
              setActivePositionsTab("PENDING");
              if (onToggleExtension) onToggleExtension("POSITIONS");
            }}
            className={`flex flex-col gap-0.5 text-left transition-colors cursor-pointer ${activePositionsTab === "PENDING" ? "" : "opacity-50 hover:opacity-100"}`}
          >
            <span className={`text-[8px] uppercase tracking-widest font-bold ${activePositionsTab === "PENDING" ? "text-[#a78bfa]" : "text-[#52525b]"}`}>Orders</span>
            <span className="text-[10px] font-bold text-[#e8e8f0] tracking-wider mt-0.5">{orders?.length || 0}</span>
          </button>

          <div className="w-px h-6 bg-[#151522]" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold">Floating PnL</span>
            <span className={`text-[10px] font-bold tracking-wider mt-0.5 ${totalPnL >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>
              ${totalPnL.toFixed(2)}
            </span>
          </div>

          <div className="w-px h-6 bg-[#151522]" />

          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] text-[#52525b] uppercase tracking-widest font-bold">Exposure</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-[#4cc9f0] tracking-wider">{riskFreeCount} <span className="text-[7px] text-[#52525b]">FREE</span></span>
              <span className="text-[10px] font-bold text-[#f59e0b] tracking-wider">{riskBearingCount} <span className="text-[7px] text-[#52525b]">RISK</span></span>
            </div>
          </div>
        </div>

        {/* HERMES CONSOLE TOGGLE BUTTON */}
        <motion.button
          whileHover={{ y: -3, scale: 1.02, backgroundColor: "rgba(139,92,246,0.15)", borderColor: "rgba(139,92,246,0.3)" }}
          whileTap={{ scale: 0.98 }}
          onClick={onHermesToggle}
          className="flex items-center gap-2 px-4 py-2 bg-[#0f0f1a] border border-[#151522] text-[#a78bfa] rounded-xl text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-200"
        >
          <span>Console</span>
        </motion.button>
      </div>
      
    </header>
  );
}
