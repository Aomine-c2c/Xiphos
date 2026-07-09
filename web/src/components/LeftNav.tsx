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
  Settings,
  PieChart,
  BookOpen,
  Terminal,
  Eye,
  Network
} from "lucide-react";
import { motion } from "framer-motion";

export type TabType = "DASHBOARD" | "MARKETS" | "PORTFOLIO" | "RISK_MANAGER" | "TRADE_MANAGER" | "ANALYTICS" | "REPORTS" | "ADAPTATION" | "MONITORING" | "SETTINGS";

interface LeftNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function LeftNav({ activeTab, setActiveTab }: LeftNavProps) {
  const getTabClass = (tab: TabType) => {
    const base =
      "flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] group";
    if (activeTab === tab) {
      return `${base} bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.35)]`;
    }
    return `${base} border border-transparent hover:bg-white/[0.04] hover:border-[rgba(255,255,255,0.06)]`;
  };

  const navItems = [
    { id: "DASHBOARD", icon: LayoutDashboard, label: "COMMAND CENTER" },
    { id: "MARKETS", icon: TrendingUp, label: "MARKETS" },
    { id: "PORTFOLIO", icon: PieChart, label: "PORTFOLIO & TRADES" },
    { id: "RISK_MANAGER", icon: Shield, label: "RISK MANAGER" },
    { id: "TRADE_MANAGER", icon: Sliders, label: "TRADE MANAGER" },
    { id: "ANALYTICS", icon: BarChart3, label: "ANALYTICS" },
    { id: "REPORTS", icon: FileSpreadsheet, label: "REPORTS & JOURNAL" },
    { id: "ADAPTATION", icon: Network, label: "ADAPTATION ENGINE" },
    { id: "MONITORING", icon: Terminal, label: "SYSTEM MONITORING" },
    { id: "SETTINGS", icon: Settings, label: "SETTINGS" },
  ];

  return (
    <motion.div 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="w-[52px] h-full flex flex-col items-center bg-[#0f0f1a] border-r border-[#1e1e2e] z-20 shrink-0"
    >
      <div className="py-6 flex flex-col items-center shrink-0">
        <div className="w-10 h-10 relative flex items-center justify-center">
          <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
            <circle cx="100" cy="100" r="30" fill="none" stroke="white" strokeWidth="8" />
            <circle cx="100" cy="100" r="12" fill="white" />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg} 100 100)`}>
                <line x1="100" y1="70" x2="100" y2="20" stroke="white" strokeWidth="8" strokeLinecap="round" />
                <circle cx="100" cy="20" r="12" fill="#0b0f17" stroke="white" strokeWidth="4" />
              </g>
            ))}
          </svg>
        </div>
      </div>
      
      <div className="flex-1 px-1.5 py-2 w-full flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={getTabClass(item.id as TabType)}
              title={item.label}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#8b5cf6] rounded-r-full"
                />
              )}
              <Icon
                className={`w-5 h-5 transition-colors z-10 ${
                  isActive ? "text-[#8b5cf6]" : "text-[#52525b] group-hover:text-[#a1a1aa]"
                }`}
              />
            </button>
          );
        })}
      </div>
      
      <div className="py-5 border-t border-[#1e1e2e] w-full flex flex-col items-center gap-3 shrink-0">
        <div className="w-2 h-2 rounded-full bg-[#f59e0b]" title="Kronos Link: ACTIVE" />
        <div className="w-2 h-2 rounded-full bg-[#4ade80]" title="Data Stream: SYNCED" />
        <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" title="API: CONNECTED" />
      </div>
    </motion.div>
  );
}
