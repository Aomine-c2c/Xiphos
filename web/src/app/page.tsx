"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import CenterPanel from "../components/CenterPanel";
import ChatPanel from "../components/ChatPanel";
import DecisionFeed from "../components/DecisionFeed";
import DecisionCards from "../components/DecisionCards";
import ConfidenceEngine from "../components/ConfidenceEngine";
import RiskManagerView from "../components/RiskManagerView";
import TradeManagerView from "../components/TradeManagerView";
import SettingsView from "../components/SettingsView";
import AnalyticsView from "../components/AnalyticsView";
import MarketsView from "../components/MarketsView";
import PositionsView from "../components/PositionsView";
import OrdersView from "../components/OrdersView";
import ReportsView from "../components/ReportsView";
import { useTradingStore } from "../store/useTradingStore";
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

type TabType = "DASHBOARD" | "RISK_MANAGER" | "TRADE_MANAGER" | "SETTINGS" | "ANALYTICS" | "MARKETS" | "POSITIONS" | "ORDERS" | "REPORTS";

export default function Home() {
  const { connectWebSocket } = useTradingStore();
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const getTabClass = (tab: TabType) => {
    const base = "flex items-center gap-1.5 px-4.5 h-full transition-all cursor-pointer border-b-2 text-[10px] font-black tracking-wider select-none";
    if (activeTab === tab) {
      return `${base} bg-[#0E1525]/80 text-[#00A8FF] border-[#00A8FF]`;
    }
    return `${base} hover:bg-slate-950/40 hover:text-white border-transparent text-[#6f7e90]`;
  };

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#070B14] text-white font-mono select-none overflow-hidden scanline">
      
      {/* 1. TOP HEADER */}
      <Header />

      {/* 2. CORE COCKPIT PANEL LAYOUT */}
      {activeTab === "DASHBOARD" ? (
        <main className="flex-1 min-h-0 p-4 grid grid-cols-12 gap-4 overflow-hidden">
          {/* Column 1: Signal Decisions (3/12 width) */}
          <div className="col-span-3 flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-[0.40] shrink-0 overflow-hidden">
              <DecisionCards />
            </div>
            <div className="flex-[0.60] min-h-0 overflow-hidden">
              <DecisionFeed />
            </div>
          </div>

          {/* Column 2: Center Signal Command View (6/12 width) */}
          <div className="col-span-6 flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-1 min-h-0 overflow-hidden">
              <CenterPanel />
            </div>
          </div>

          {/* Column 3: Vincent AI Chat (3/12 width) */}
          <div className="col-span-3 flex flex-col gap-4 overflow-hidden h-full">
            <div className="flex-1 overflow-hidden">
              <ChatPanel />
            </div>
          </div>

        </main>
      ) : (
        <main className="flex-1 min-h-0 p-4 overflow-hidden w-full h-full">
          {activeTab === "RISK_MANAGER" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <RiskManagerView />
            </div>
          )}

          {activeTab === "TRADE_MANAGER" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <TradeManagerView />
            </div>
          )}

          {activeTab === "SETTINGS" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <SettingsView />
            </div>
          )}

          {activeTab === "ANALYTICS" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <AnalyticsView />
            </div>
          )}

          {activeTab === "MARKETS" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <MarketsView />
            </div>
          )}

          {activeTab === "POSITIONS" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <PositionsView />
            </div>
          )}

          {activeTab === "ORDERS" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <OrdersView />
            </div>
          )}

          {activeTab === "REPORTS" && (
            <div className="w-full h-full min-h-0 overflow-hidden">
              <ReportsView />
            </div>
          )}
        </main>
      )}

      {/* 3. GLOBAL BOTTOM NAVIGATION BAR / FOOTER */}
      <footer className="h-10 bg-[#070B14] border-t border-slate-900 flex items-center justify-between px-4 text-[10px] font-black tracking-wider text-[#6f7e90] shrink-0">
        
        {/* Left Side Tabs */}
        <div className="flex items-center h-full">
          
          <div 
            onClick={() => setActiveTab("DASHBOARD")}
            className={getTabClass("DASHBOARD")}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>COMMAND CENTER</span>
          </div>

          <div 
            onClick={() => setActiveTab("MARKETS")}
            className={getTabClass("MARKETS")}
          >
            <TrendingUp className="h-4 w-4" />
            <span>MARKETS</span>
          </div>

          <div 
            onClick={() => setActiveTab("POSITIONS")}
            className={getTabClass("POSITIONS")}
          >
            <Briefcase className="h-4 w-4" />
            <span>POSITIONS</span>
          </div>

          <div 
            onClick={() => setActiveTab("ORDERS")}
            className={getTabClass("ORDERS")}
          >
            <FileText className="h-4 w-4" />
            <span>ORDERS</span>
          </div>

          <div 
            onClick={() => setActiveTab("RISK_MANAGER")}
            className={getTabClass("RISK_MANAGER")}
          >
            <Shield className="h-4 w-4" />
            <span>RISK MANAGER</span>
          </div>

          <div 
            onClick={() => setActiveTab("TRADE_MANAGER")}
            className={getTabClass("TRADE_MANAGER")}
          >
            <Sliders className="h-4 w-4" />
            <span>TRADE MANAGER</span>
          </div>

          <div 
            onClick={() => setActiveTab("ANALYTICS")}
            className={getTabClass("ANALYTICS")}
          >
            <BarChart3 className="h-4 w-4" />
            <span>ANALYTICS</span>
          </div>

          <div 
            onClick={() => setActiveTab("REPORTS")}
            className={getTabClass("REPORTS")}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>REPORTS</span>
          </div>

          <div 
            onClick={() => setActiveTab("SETTINGS")}
            className={getTabClass("SETTINGS")}
          >
            <Settings className="h-4 w-4" />
            <span>SETTINGS</span>
          </div>

        </div>

        {/* Right Side Status & Slogan */}
        <div className="flex items-center gap-4.5 text-right">
          
          <div className="flex items-center gap-1.5 text-[9px] font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00D26A] animate-pulse" />
            <span>Uptime: 2d 14h 32m</span>
          </div>

          <span className="text-[9px] text-[#425062] font-black uppercase">
            XIPHOS MISSION CORE v2.1.0 - Built for Discipline. Engineered for Profit.
          </span>

        </div>

      </footer>

    </div>
  );
}
