"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Crosshair, ShieldCheck, AlertTriangle, Database, 
  Zap, Activity, LogOut, Terminal, Cpu, Network, Server
} from "lucide-react";

// --- Types ---
type PipelineStage = {
  id: string;
  name: string;
  icon: React.ElementType;
  durationMs: number; // Simulated processing time
  message: string;
};

// --- Config ---
const STAGES: PipelineStage[] = [
  { id: "s-1", name: "Opportunity", icon: Crosshair, durationMs: 400, message: "Arbitrage gap detected on EUR/USD." },
  { id: "s-2", name: "Validation", icon: ShieldCheck, durationMs: 300, message: "Signal verified against macro filter." },
  { id: "s-3", name: "Risk Analysis", icon: AlertTriangle, durationMs: 500, message: "Drawdown tolerance verified. Max loss 0.1%." },
  { id: "s-4", name: "Capital Allocation", icon: Database, durationMs: 300, message: "Allocated $50,000 from liquidity pool." },
  { id: "s-5", name: "Execution", icon: Zap, durationMs: 200, message: "Order routed via FIX API. Filled at 1.0924." },
  { id: "s-6", name: "Monitoring", icon: Activity, durationMs: 1500, message: "Tracking tick-level momentum..." },
  { id: "s-7", name: "Exit", icon: LogOut, durationMs: 400, message: "Target hit. Closed position. Net +$124.50." },
];

export default function TradeManagerView() {
  const [activeStageIdx, setActiveStageIdx] = useState(-1);
  const [logs, setLogs] = useState<{ id: number; text: string; time: string; type: "info" | "success" | "warning" }[]>([]);
  const logCounter = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (text: string, type: "info" | "success" | "warning" = "info") => {
    logCounter.current += 1;
    const now = new Date();
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    const time = `${now.toLocaleTimeString()}.${ms}`;
    
    setLogs(prev => {
      const newLogs = [...prev, { id: logCounter.current, text, time, type }];
      if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
      return newLogs;
    });
  };

  // Auto-scroll logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Main Pipeline Animation Loop
  useEffect(() => {
    let isActive = true;
    
    const runPipeline = async () => {
      while (isActive) {
        // Wait before starting a new trade cycle
        setActiveStageIdx(-1);
        addLog("System idle. Scanning for anomalies...", "info");
        await new Promise(r => setTimeout(r, 1000 + Math.random() * 2000));
        if (!isActive) break;
        
        for (let i = 0; i < STAGES.length; i++) {
          if (!isActive) break;
          setActiveStageIdx(i);
          const stage = STAGES[i];
          
          // Add log for this stage
          const type = i === STAGES.length - 1 ? "success" : i === 2 ? "warning" : "info";
          addLog(`[${stage.name.toUpperCase()}] ${stage.message}`, type);
          
          // Simulate processing time
          await new Promise(r => setTimeout(r, stage.durationMs));
        }
      }
    };

    runPipeline();
    
    return () => { isActive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col w-full h-full bg-transparent font-mono select-none overflow-hidden animate-in fade-in">
      
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#09090e] border-b border-[#1e1e2e] shrink-0 z-10">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-[#8b5cf6]" />
          <h1 className="text-lg font-bold text-white uppercase tracking-widest">Autonomous Execution Engine</h1>
        </div>
        
        <div className="flex items-center gap-8 text-xs font-bold tracking-widest uppercase">
          <div className="flex flex-col gap-1">
            <span className="text-[#52525b]">Execution Speed</span>
            <span className="text-[#4ade80] flex items-center gap-1"><Zap className="w-3 h-3"/> &lt; 5ms</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#52525b]">Latency</span>
            <span className="text-[#4cc9f0] flex items-center gap-1"><Network className="w-3 h-3"/> 12ms</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#52525b]">Broker Status</span>
            <span className="text-[#a78bfa] flex items-center gap-1"><Server className="w-3 h-3"/> Connected - IBKR</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[#52525b]">Health</span>
            <span className="text-[#4ade80]">100%</span>
          </div>
        </div>
      </div>

      {/* Main Pipeline Display */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 relative">
        {/* Background Grid */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none" />
        
        <div className="w-full max-w-6xl relative z-10">
          
          {/* Connecting SVG Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-[#1e1e2e] -translate-y-1/2 z-0 rounded-full" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#8b5cf6] to-[#4ade80] -translate-y-1/2 z-0 transition-all duration-300 rounded-full shadow-[0_0_15px_rgba(74,222,128,0.5)]"
            style={{ 
              width: activeStageIdx === -1 ? "0%" : `${(activeStageIdx / (STAGES.length - 1)) * 100}%` 
            }}
          />

          <div className="flex justify-between items-center relative z-10">
            {STAGES.map((stage, idx) => {
              const isActive = activeStageIdx === idx;
              const isPast = activeStageIdx > idx;

              return (
                <div key={stage.id} className="flex flex-col items-center gap-4 relative">
                  
                  {/* Node Icon */}
                  <motion.div 
                    animate={{ 
                      scale: isActive ? 1.2 : 1,
                      backgroundColor: isActive ? "#0f0f1a" : isPast ? "#0f0f1a" : "#05050a",
                      borderColor: isActive ? "#4ade80" : isPast ? "#8b5cf6" : "#1e1e2e",
                      boxShadow: isActive ? "0 0 20px rgba(74,222,128,0.4)" : "none"
                    }}
                    className={`w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all duration-300`}
                  >
                    <stage.icon 
                      className={`w-6 h-6 transition-colors duration-300 ${
                        isActive ? "text-[#4ade80]" : isPast ? "text-[#8b5cf6]" : "text-[#52525b]"
                      }`} 
                    />
                  </motion.div>

                  {/* Node Label */}
                  <div className="flex flex-col items-center">
                    <span className={`text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                      isActive ? "text-white" : "text-[#52525b]"
                    }`}>
                      {stage.name}
                    </span>
                    
                    {/* Active Message (Only visible when active) */}
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute top-24 left-1/2 -translate-x-1/2 w-48 text-center"
                        >
                          <div className="text-[10px] text-[#4cc9f0] bg-[#4cc9f0]/10 border border-[#4cc9f0]/30 px-2 py-1 rounded backdrop-blur-sm">
                            {stage.message}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Execution Terminal Logger */}
      <div className="h-64 bg-[#09090e] border-t border-[#1e1e2e] flex flex-col shrink-0">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1e1e2e] bg-[#05050a]">
          <Terminal className="w-4 h-4 text-[#52525b]" />
          <span className="text-[10px] font-bold text-[#52525b] uppercase tracking-widest">Execution Micro-Log</span>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-1">
          {logs.map(log => {
            let colorClass = "text-[#94a3b8]";
            if (log.type === "success") colorClass = "text-[#4ade80]";
            if (log.type === "warning") colorClass = "text-[#f59e0b]";

            return (
              <div key={log.id} className="flex gap-4 text-[11px] leading-relaxed">
                <span className="text-[#52525b] shrink-0 w-24">[{log.time}]</span>
                <span className={colorClass}>{log.text}</span>
              </div>
            );
          })}
          {activeStageIdx !== -1 && (
            <div className="flex gap-4 text-[11px] leading-relaxed animate-pulse">
              <span className="text-[#52525b] shrink-0 w-24">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-[#4cc9f0]">{'>'} _</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
