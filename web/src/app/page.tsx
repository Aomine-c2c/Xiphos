"use client";

import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import LeftNav, { TabType } from "../components/LeftNav";
import CenterPanel from "../components/CenterPanel";
import DecisionFeed from "../components/DecisionFeed";
import DecisionCards from "../components/DecisionCards";
import VincentPanel from "../components/VincentPanel";
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
  const { connectWebSocket, account, performanceMetrics, positions } = useTradingStore();
  const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
  const [portfolioSubTab, setPortfolioSubTab] = useState<"STATS" | "POSITIONS" | "ORDERS">("STATS");
  const [reportsSubTab, setReportsSubTab] = useState<"CURVE" | "JOURNAL">("CURVE");
  const [monitoringSubTab, setMonitoringSubTab] = useState<"HEALTH" | "ORACLE">("HEALTH");
  const [vincentOpen, setVincentOpen] = useState(false);

  useEffect(() => { connectWebSocket(); }, [connectWebSocket]);

  const toggleVincent = useCallback(() => setVincentOpen((v) => !v), []);
  const closeVincent = useCallback(() => setVincentOpen(false), []);

  const totalFloatPnl = positions.reduce((sum, p) => sum + (p.profit ?? 0), 0);
  const formattedEquity = account.equity
    ? "$" + account.equity.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : "$0";
  const formattedPnl =
    (totalFloatPnl >= 0 ? "+" : "-") + "$" +
    Math.abs(totalFloatPnl).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const winRatePct = performanceMetrics.win_rate
    ? (performanceMetrics.win_rate * 100).toFixed(1) : "0.0";
  const drawdownPct = performanceMetrics.max_drawdown
    ? Math.abs(performanceMetrics.max_drawdown * 100).toFixed(1) : "0.0";

  const SubTabBtn = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
    <button onClick={onClick}
      className={`px-4 py-1.5 text-[10px] font-sans font-medium uppercase tracking-widest rounded border cursor-pointer transition-all ${
        active
          ? "bg-[rgba(139,92,246,0.12)] text-[#e8e8f0] border-[rgba(139,92,246,0.35)]"
          : "bg-transparent text-[#52525b] border-transparent hover:text-[#a1a1aa]"
      }`}>{label}</button>
  );

  return (
    <div className="h-screen max-h-screen flex bg-[#0a0a0f] text-[#e8e8f0] font-sans select-none overflow-hidden">
      <LeftNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onVincentToggle={toggleVincent} />

        {/* KPI Strip — Dashboard only */}
        {activeTab === "DASHBOARD" && (
          <div className="h-14 flex items-center px-6 border-b border-[#1e1e2e] bg-[#0f0f1a] shrink-0">
            <div className="flex flex-col gap-0.5 pr-6">
              <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Equity</span>
              <span className="text-sm font-mono font-bold text-[#e8e8f0] tabular-nums">{formattedEquity}</span>
            </div>
            <div className="w-px h-7 bg-[#1e1e2e]" />
            <div className="flex flex-col gap-0.5 px-6">
              <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Float P&L</span>
              <span className={`text-sm font-mono font-bold tabular-nums ${totalFloatPnl >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>{formattedPnl}</span>
            </div>
            <div className="w-px h-7 bg-[#1e1e2e]" />
            <div className="flex flex-col gap-0.5 px-6">
              <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Win Rate</span>
              <span className="text-sm font-mono font-bold text-[#e8e8f0] tabular-nums">{winRatePct}%</span>
            </div>
            <div className="w-px h-7 bg-[#1e1e2e]" />
            <div className="flex flex-col gap-0.5 px-6">
              <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Open</span>
              <span className="text-sm font-mono font-bold text-[#e8e8f0] tabular-nums">{positions.length}</span>
            </div>
            <div className="w-px h-7 bg-[#1e1e2e]" />
            <div className="flex flex-col gap-0.5 pl-6">
              <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Max DD</span>
              <span className={`text-sm font-mono font-bold tabular-nums ${parseFloat(drawdownPct) > 5 ? "text-[#f87171]" : "text-[#f59e0b]"}`}>-{drawdownPct}%</span>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "DASHBOARD" ? (
            <motion.main key="dashboard"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0 p-4 grid grid-cols-[1fr_300px] gap-4 overflow-hidden">
              <div className="min-h-0 overflow-hidden"><CenterPanel /></div>
              <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex-[0.45] min-h-0 overflow-hidden"><DecisionCards /></div>
                <div className="flex-[0.55] min-h-0 overflow-hidden"><DecisionFeed /></div>
              </div>
            </motion.main>
          ) : (
            <motion.main key={activeTab}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar w-full flex flex-col">
              {activeTab === "RISK_MANAGER" && <RiskManagerView />}
              {activeTab === "TRADE_MANAGER" && <TradeManagerView />}
              {activeTab === "SETTINGS" && <SettingsView />}
              {activeTab === "ANALYTICS" && <AnalyticsView />}
              {activeTab === "MARKETS" && <MarketsView />}
              {activeTab === "ADAPTATION" && <AdaptationEngineView />}

              {activeTab === "PORTFOLIO" && (
                <div className="flex flex-col h-full w-full gap-4">
                  <div className="flex gap-2 border-b border-[#1e1e2e] pb-2 shrink-0">
                    <SubTabBtn active={portfolioSubTab === "STATS"} onClick={() => setPortfolioSubTab("STATS")} label="Portfolio Stats" />
                    <SubTabBtn active={portfolioSubTab === "POSITIONS"} onClick={() => setPortfolioSubTab("POSITIONS")} label="Active Positions" />
                    <SubTabBtn active={portfolioSubTab === "ORDERS"} onClick={() => setPortfolioSubTab("ORDERS")} label="Pending Orders" />
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    {portfolioSubTab === "STATS" && <PortfolioView />}
                    {portfolioSubTab === "POSITIONS" && <PositionsView />}
                    {portfolioSubTab === "ORDERS" && <OrdersView />}
                  </div>
                </div>
              )}

              {activeTab === "REPORTS" && (
                <div className="flex flex-col h-full w-full gap-4">
                  <div className="flex gap-2 border-b border-[#1e1e2e] pb-2 shrink-0">
                    <SubTabBtn active={reportsSubTab === "CURVE"} onClick={() => setReportsSubTab("CURVE")} label="Equity Curve" />
                    <SubTabBtn active={reportsSubTab === "JOURNAL"} onClick={() => setReportsSubTab("JOURNAL")} label="Trading Journal" />
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    {reportsSubTab === "CURVE" && <ReportsView />}
                    {reportsSubTab === "JOURNAL" && <JournalView />}
                  </div>
                </div>
              )}

              {activeTab === "MONITORING" && (
                <div className="flex flex-col h-full w-full gap-4">
                  <div className="flex gap-2 border-b border-[#1e1e2e] pb-2 shrink-0">
                    <SubTabBtn active={monitoringSubTab === "HEALTH"} onClick={() => setMonitoringSubTab("HEALTH")} label="System Monitor" />
                    <SubTabBtn active={monitoringSubTab === "ORACLE"} onClick={() => setMonitoringSubTab("ORACLE")} label="Oracle Engine" />
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    {monitoringSubTab === "HEALTH" && <MonitoringView />}
                    {monitoringSubTab === "ORACLE" && <OracleView />}
                  </div>
                </div>
              )}
            </motion.main>
          )}
        </AnimatePresence>
      </div>

      <VincentPanel isOpen={vincentOpen} onClose={closeVincent} />
    </div>
  );
}
