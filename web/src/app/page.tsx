"use client";

import React, { useEffect, useState, useCallback } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ExtensionType } from "../components/Footer";

// MAIN DASHBOARD
import OverviewTab from "../components/OverviewTab";
import PositionsView from "../components/PositionsView";

// EXTENSION PANELS
import IntelligenceCenterView from "../components/IntelligenceCenterView";
import TradeManagerView from "../components/TradeManagerView";
import EvolutionCenter from "../components/EvolutionCenter";
import SimulationLab from "../components/SimulationLab";
import PortfolioView from "../components/PortfolioView";

// MODALS & OVERLAYS
import HermesConsolePanel from "../components/HermesConsolePanel";
import SlideOutPanel from "../components/ui/SlideOutPanel";

import { motion } from "framer-motion";

export default function Home() {
  const [activeExtension, setActiveExtension] = useState<ExtensionType>("NONE");
  const [consoleOpen, setConsoleOpen] = useState(false);

  useEffect(() => {
    import("../lib/websocket").then(({ connectTradingSystem }) =>
      connectTradingSystem()
    );
  }, []);

  const toggleConsole = useCallback(() => setConsoleOpen((v) => !v), []);
  const closeConsole = useCallback(() => setConsoleOpen(false), []);

  const toggleExtension = (ext: ExtensionType) => {
    setActiveExtension((current) => (current === ext ? "NONE" : ext));
  };

  const closeExtension = () => setActiveExtension("NONE");

  return (
    <div className="h-screen max-h-screen flex flex-col bg-[#05050a] text-[#e8e8f0] font-sans select-none overflow-hidden relative">
      {/* HEADER */}
      <Header 
        onHermesToggle={toggleConsole} 
        onToggleExtension={toggleExtension}
      />

      {/* MAIN DASHBOARD CANVAS */}
      <div className="flex-1 w-full overflow-hidden flex flex-col min-h-0">
        <OverviewTab />
      </div>

      {/* FOOTER */}
      <Footer activeExtension={activeExtension} onToggleExtension={toggleExtension} />

      {/* ── GLOBAL PANELS (fixed, root-level, same as HermesConsolePanel) ── */}
      <HermesConsolePanel isOpen={consoleOpen} onClose={closeConsole} />

      <SlideOutPanel
        isOpen={activeExtension === "INTELLIGENCE"}
        onClose={closeExtension}
        title="INTELLIGENCE CENTER"
        position="left"
        width="w-[560px]"
      >
        <IntelligenceCenterView />
      </SlideOutPanel>

      <SlideOutPanel
        isOpen={activeExtension === "EXECUTION"}
        onClose={closeExtension}
        title="EXECUTION ENGINE"
        position="left"
        width="w-[520px]"
      >
        <TradeManagerView />
      </SlideOutPanel>

      <SlideOutPanel
        isOpen={activeExtension === "EVOLUTION"}
        onClose={closeExtension}
        title="EVOLUTION HUB"
        position="left"
        width="w-[640px]"
      >
        <EvolutionCenter />
      </SlideOutPanel>

      <SlideOutPanel
        isOpen={activeExtension === "SIMULATION"}
        onClose={closeExtension}
        title="SIMULATION LAB"
        position="left"
        width="w-[640px]"
      >
        <SimulationLab />
      </SlideOutPanel>

      <SlideOutPanel
        isOpen={activeExtension === "PORTFOLIO"}
        onClose={closeExtension}
        title="STRATEGY GLOBE"
        position="right"
        width="w-[600px]"
      >
        <PortfolioView />
      </SlideOutPanel>

      <SlideOutPanel
        isOpen={activeExtension === "POSITIONS"}
        onClose={closeExtension}
        title="ACTIVE DEPLOYMENTS & ORDERS"
        position="bottom"
        width="h-[400px]"
      >
        <PositionsView />
      </SlideOutPanel>
    </div>
  );
}
