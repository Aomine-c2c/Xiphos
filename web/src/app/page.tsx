"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import LeftNav, { TabType } from "../components/LeftNav";
import CenterPanel from "../components/CenterPanel";
import ChatPanel from "../components/ChatPanel";
import DecisionFeed from "../components/DecisionFeed";
import DecisionCards from "../components/DecisionCards";
import RiskManagerView from "../components/RiskManagerView";
import TradeManagerView from "../components/TradeManagerView";
import SettingsView from "../components/SettingsView";
import AnalyticsView from "../components/AnalyticsView";
import MarketsView from "../components/MarketsView";
import PositionsView from "../components/PositionsView";
import OrdersView from "../components/OrdersView";
import ReportsView from "../components/ReportsView";
import PortfolioView from "../components/PortfolioView";
import JournalView from "../components/JournalView";
import AdaptationEngineView from "../components/AdaptationEngineView";
import MonitoringView from "../components/MonitoringView";
import OracleView from "../components/OracleView";
import { useTradingStore } from "../store/useTradingStore";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { connectWebSocket } = useTradingStore();
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [portfolioSubTab, setPortfolioSubTab] = useState<"STATS" | "POSITIONS" | "ORDERS">("STATS");
  const [reportsSubTab, setReportsSubTab] = useState<"CURVE" | "JOURNAL">("CURVE");
  const [monitoringSubTab, setMonitoringSubTab] = useState<"HEALTH" | "ORACLE">("HEALTH");

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  return (
    <div className="h-screen max-h-screen flex bg-xiphos-bg text-white font-sans select-none overflow-hidden">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <LeftNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP HEADER / GLOBAL STATUS BAR */}
        <Header />

        {/* CORE COCKPIT PANEL LAYOUT */}
        <AnimatePresence mode="wait">
          {activeTab === "DASHBOARD" ? (
            <motion.main 
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0 p-6 grid grid-cols-12 gap-6 overflow-hidden"
            >
              {/* Column 1: Signal Decisions (3/12 width) */}
              <div className="col-span-3 flex flex-col gap-6 overflow-hidden h-full">
                <div className="flex-[0.40] shrink-0 overflow-hidden">
                  <DecisionCards />
                </div>
                <div className="flex-[0.60] min-h-0 overflow-hidden">
                  <DecisionFeed />
                </div>
              </div>

              {/* Column 2: Center Signal Command View (6/12 width) */}
              <div className="col-span-6 flex flex-col gap-6 overflow-hidden h-full">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <CenterPanel />
                </div>
              </div>

              {/* Column 3: Vincent AI Chat (3/12 width) */}
              <div className="col-span-3 flex flex-col gap-6 overflow-hidden h-full">
                <div className="flex-1 overflow-hidden">
                  <ChatPanel />
                </div>
              </div>
            </motion.main>
          ) : (
            <motion.main 
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar w-full h-full flex flex-col"
            >
              {activeTab === "RISK_MANAGER" && <RiskManagerView />}
              {activeTab === "TRADE_MANAGER" && <TradeManagerView />}
              {activeTab === "SETTINGS" && <SettingsView />}
              {activeTab === "ANALYTICS" && <AnalyticsView />}
              {activeTab === "MARKETS" && <MarketsView />}
              {activeTab === "ADAPTATION" && <AdaptationEngineView />}
              
              {activeTab === "PORTFOLIO" && (
                <div className="flex flex-col h-full w-full gap-4">
                  <div className="flex gap-2 border-b border-white/5 pb-2 shrink-0">
                    <button onClick={() => setPortfolioSubTab("STATS")} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border cursor-pointer transition-all ${portfolioSubTab === "STATS" ? "bg-xiphos-purple/20 text-white border-xiphos-purple glow-white shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "bg-black/40 text-xiphos-muted border-transparent hover:text-white"}`}>Portfolio Stats</button>
                    <button onClick={() => setPortfolioSubTab("POSITIONS")} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border cursor-pointer transition-all ${portfolioSubTab === "POSITIONS" ? "bg-xiphos-purple/20 text-white border-xiphos-purple glow-white shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "bg-black/40 text-xiphos-muted border-transparent hover:text-white"}`}>Active Positions</button>
                    <button onClick={() => setPortfolioSubTab("ORDERS")} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border cursor-pointer transition-all ${portfolioSubTab === "ORDERS" ? "bg-xiphos-purple/20 text-white border-xiphos-purple glow-white shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "bg-black/40 text-xiphos-muted border-transparent hover:text-white"}`}>Pending Orders</button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
                    {portfolioSubTab === "STATS" && <PortfolioView />}
                    {portfolioSubTab === "POSITIONS" && <PositionsView />}
                    {portfolioSubTab === "ORDERS" && <OrdersView />}
                  </div>
                </div>
              )}
              
              {activeTab === "REPORTS" && (
                <div className="flex flex-col h-full w-full gap-4">
                  <div className="flex gap-2 border-b border-white/5 pb-2 shrink-0">
                    <button onClick={() => setReportsSubTab("CURVE")} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border cursor-pointer transition-all ${reportsSubTab === "CURVE" ? "bg-xiphos-purple/20 text-white border-xiphos-purple glow-white shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "bg-black/40 text-xiphos-muted border-transparent hover:text-white"}`}>Equity Curve</button>
                    <button onClick={() => setReportsSubTab("JOURNAL")} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border cursor-pointer transition-all ${reportsSubTab === "JOURNAL" ? "bg-xiphos-purple/20 text-white border-xiphos-purple glow-white shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "bg-black/40 text-xiphos-muted border-transparent hover:text-white"}`}>Trading Journal</button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
                    {reportsSubTab === "CURVE" && <ReportsView />}
                    {reportsSubTab === "JOURNAL" && <JournalView />}
                  </div>
                </div>
              )}
              
              {activeTab === "MONITORING" && (
                <div className="flex flex-col h-full w-full gap-4">
                  <div className="flex gap-2 border-b border-white/5 pb-2 shrink-0">
                    <button onClick={() => setMonitoringSubTab("HEALTH")} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border cursor-pointer transition-all ${monitoringSubTab === "HEALTH" ? "bg-xiphos-purple/20 text-white border-xiphos-purple glow-white shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "bg-black/40 text-xiphos-muted border-transparent hover:text-white"}`}>System Monitor</button>
                    <button onClick={() => setMonitoringSubTab("ORACLE")} className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded border cursor-pointer transition-all ${monitoringSubTab === "ORACLE" ? "bg-xiphos-purple/20 text-white border-xiphos-purple glow-white shadow-[0_0_10px_rgba(139,92,246,0.2)]" : "bg-black/40 text-xiphos-muted border-transparent hover:text-white"}`}>Oracle Engine</button>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar relative">
                    {monitoringSubTab === "HEALTH" && <MonitoringView />}
                    {monitoringSubTab === "ORACLE" && <OracleView />}
                  </div>
                </div>
              )}
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
