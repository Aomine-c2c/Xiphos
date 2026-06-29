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

export default function Home() {
  const { connectWebSocket } = useTradingStore();
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");

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
        {activeTab === "DASHBOARD" ? (
          <main className="flex-1 min-h-0 p-6 grid grid-cols-12 gap-6 overflow-hidden">
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

          </main>
        ) : (
          <main className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar w-full h-full">
            {activeTab === "RISK_MANAGER" && <RiskManagerView />}
            {activeTab === "TRADE_MANAGER" && <TradeManagerView />}
            {activeTab === "SETTINGS" && <SettingsView />}
            {activeTab === "ANALYTICS" && <AnalyticsView />}
            {activeTab === "MARKETS" && <MarketsView />}
            {activeTab === "POSITIONS" && <PositionsView />}
            {activeTab === "ORDERS" && <OrdersView />}
            {activeTab === "REPORTS" && <ReportsView />}
            {activeTab === "PORTFOLIO" && <PortfolioView />}
            {activeTab === "JOURNAL" && <JournalView />}
            {activeTab === "ADAPTATION" && <AdaptationEngineView />}
            {activeTab === "MONITORING" && <MonitoringView />}
            {activeTab === "ORACLE" && <OracleView />}
          </main>
        )}
      </div>
    </div>
  );
}
