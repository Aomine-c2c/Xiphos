"use client";

import React from "react";
import { 
  LayoutDashboard, 
  TrendingUp, 
  Briefcase, 
  FileText, 
  Shield, 
  Sliders, 
  BarChart3, 
  FileSpreadsheet, 
  Settings 
} from "lucide-react";
import { motion } from "framer-motion";

export type TabType = "DASHBOARD" | "RISK_MANAGER" | "TRADE_MANAGER" | "SETTINGS" | "ANALYTICS" | "MARKETS" | "POSITIONS" | "ORDERS" | "REPORTS";

interface LeftNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function LeftNav({ activeTab, setActiveTab }: LeftNavProps) {
  const getTabClass = (tab: TabType) => {
    const base = "flex items-center gap-4 px-4 py-3 my-1 w-full rounded-xl transition-all duration-300 cursor-pointer text-sm font-semibold tracking-wide select-none group relative overflow-hidden";
    if (activeTab === tab) {
      return `${base} bg-[rgba(139,92,246,0.1)] text-white border border-[rgba(139,92,246,0.3)] shadow-[0_0_15px_rgba(139,92,246,0.1)]`;
    }
    return `${base} hover:bg-white/5 text-xiphos-muted hover:text-white border border-transparent`;
  };

  const navItems = [
    { id: "DASHBOARD", icon: LayoutDashboard, label: "COMMAND CENTER" },
    { id: "MARKETS", icon: TrendingUp, label: "MARKETS" },
    { id: "POSITIONS", icon: Briefcase, label: "POSITIONS" },
    { id: "ORDERS", icon: FileText, label: "ORDERS" },
    { id: "RISK_MANAGER", icon: Shield, label: "RISK MANAGER" },
    { id: "TRADE_MANAGER", icon: Sliders, label: "TRADE MANAGER" },
    { id: "ANALYTICS", icon: BarChart3, label: "ANALYTICS" },
    { id: "REPORTS", icon: FileSpreadsheet, label: "REPORTS" },
    { id: "SETTINGS", icon: Settings, label: "SETTINGS" },
  ];

  return (
    <motion.div 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-[280px] h-full flex flex-col bg-[rgba(11,15,23,0.8)] backdrop-blur-xl border-r border-[rgba(255,255,255,0.05)] z-20 shadow-2xl shrink-0"
    >
      <div className="p-6 flex items-center gap-4 shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-xiphos-purple/20 border border-xiphos-purple/50 flex items-center justify-center animate-ai-pulse">
            <div className="w-4 h-4 rounded-full bg-xiphos-purple glow-purple"></div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-widest text-white glow-purple">XIPHOS</h1>
          <p className="text-[10px] text-xiphos-purple uppercase tracking-widest font-mono">Institutional AI</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={getTabClass(item.id as TabType)}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-xiphos-purple glow-purple" 
                />
              )}
              <Icon className={`w-5 h-5 transition-colors z-10 ${isActive ? "text-xiphos-purple" : "text-xiphos-muted group-hover:text-xiphos-purple"}`} />
              <span className={`z-10 tracking-wider ${isActive ? "glow-purple" : ""}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
      
      <div className="p-6 border-t border-[rgba(255,255,255,0.05)] text-sm text-xiphos-muted flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-center">
          <span className="tracking-wide">Kronos Link</span>
          <span className="text-xiphos-gold font-mono glow-gold font-bold">ACTIVE</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="tracking-wide">Data Stream</span>
          <span className="text-xiphos-cyan font-mono glow-cyan font-bold">SYNCED</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="tracking-wide">Latency</span>
          <span className="text-xiphos-emerald font-mono glow-emerald font-bold">14ms</span>
        </div>
      </div>
    </motion.div>
  );
}
