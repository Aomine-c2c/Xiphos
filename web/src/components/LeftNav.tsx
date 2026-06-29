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

export type TabType = "DASHBOARD" | "RISK_MANAGER" | "TRADE_MANAGER" | "SETTINGS" | "ANALYTICS" | "MARKETS" | "POSITIONS" | "ORDERS" | "REPORTS" | "PORTFOLIO" | "JOURNAL" | "ADAPTATION" | "MONITORING" | "ORACLE";

interface LeftNavProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function LeftNav({ activeTab, setActiveTab }: LeftNavProps) {
  const getTabClass = (tab: TabType) => {
    const base = "flex items-center justify-center py-3 my-2 w-12 h-12 mx-auto rounded-xl transition-all duration-300 cursor-pointer text-sm font-semibold tracking-wide select-none group relative overflow-hidden";
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
    { id: "PORTFOLIO", icon: PieChart, label: "PORTFOLIO" },
    { id: "JOURNAL", icon: BookOpen, label: "JOURNAL" },
    { id: "ADAPTATION", icon: Network, label: "ADAPTATION ENGINE" },
    { id: "MONITORING", icon: Terminal, label: "SYSTEM MONITORING" },
    { id: "ORACLE", icon: Eye, label: "ORACLE ENGINE" },
    { id: "SETTINGS", icon: Settings, label: "SETTINGS" },
  ];

  return (
    <motion.div 
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      className="w-[80px] h-full flex flex-col items-center bg-[rgba(11,15,23,0.8)] backdrop-blur-xl border-r border-[rgba(255,255,255,0.05)] z-20 shadow-2xl shrink-0"
    >
      <div className="py-6 flex flex-col items-center shrink-0">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-xiphos-purple/20 border border-xiphos-purple/50 flex items-center justify-center animate-ai-pulse">
            <div className="w-4 h-4 rounded-full bg-xiphos-purple glow-purple"></div>
          </div>
        </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2 py-2 w-full custom-scrollbar">
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
                  className="absolute left-0 top-0 bottom-0 w-1 bg-xiphos-purple glow-purple" 
                />
              )}
              <Icon className={`w-6 h-6 transition-colors z-10 ${isActive ? "text-xiphos-purple" : "text-xiphos-muted group-hover:text-xiphos-purple"}`} />
            </button>
          );
        })}
      </div>
      
      <div className="py-6 border-t border-[rgba(255,255,255,0.05)] w-full flex flex-col items-center gap-4 shrink-0">
        <div className="w-2 h-2 rounded-full bg-xiphos-gold glow-gold" title="Kronos Link: ACTIVE"></div>
        <div className="w-2 h-2 rounded-full bg-xiphos-cyan glow-cyan" title="Data Stream: SYNCED"></div>
        <div className="w-2 h-2 rounded-full bg-xiphos-emerald glow-emerald" title="Latency: 14ms"></div>
      </div>
    </motion.div>
  );
}
