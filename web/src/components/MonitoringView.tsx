"use client";

import React, { useState, useEffect, useRef } from "react";
import { Terminal, Download, Search, Filter, Cpu, Database, Activity, HardDrive, Zap, Clock, Maximize, Cpu as Gpu } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";

type LogLevel = "INFO" | "WARNING" | "ERROR";
type LogCategory = "EXEC" | "BROKER" | "LEARN" | "PREDICT" | "ADAPT" | "RISK";

interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
}

export default function MonitoringView() {
  const [logs, setLogs] = useState<LogEntry[]>(() => {
    const initialLogs: LogEntry[] = [];
    const now = new Date();
    for (let i = 0; i < 30; i++) {
      initialLogs.push({
        id: `init-${i}`,
        timestamp: new Date(now.getTime() - (30 - i) * 1000),
        level: i % 7 === 0 ? "WARNING" : (i % 13 === 0 ? "ERROR" : "INFO") as LogLevel,
        category: ["EXEC", "BROKER", "LEARN", "PREDICT", "ADAPT", "RISK"][i % 6] as LogCategory,
        message: `System initialization step ${i} completed successfully.`
      });
    }
    return initialLogs;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<LogLevel | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<LogCategory | "ALL">("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  
  const [metrics, setMetrics] = useState<Record<string, number>[]>(() => {
    const initialMetrics = [];
    for (let i = 0; i < 60; i++) {
      initialMetrics.push({
        time: i,
        cpu: 20 + Math.random() * 30,
        ram: 40 + Math.random() * 10,
        gpu: 5 + Math.random() * 20,
        disk: Math.random() * 5,
        latency: 12 + Math.random() * 5,
        fps: 58 + Math.random() * 2,
      });
    }
    return initialMetrics;
  });
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Live Simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      // Add random log
      if (Math.random() > 0.4) {
        const categories: LogCategory[] = ["EXEC", "BROKER", "LEARN", "PREDICT", "ADAPT", "RISK"];
        const randCat = categories[Math.floor(Math.random() * categories.length)];
        const randNum = Math.random();
        const randLevel: LogLevel = randNum > 0.95 ? "ERROR" : (randNum > 0.85 ? "WARNING" : "INFO");
        
        const messages = {
          EXEC: ["Order placed EURUSD", "Order filled GBPUSD", "Trailing stop updated"],
          BROKER: ["Ping 14ms", "Heartbeat ok", "FIX session active"],
          LEARN: ["Backprop epoch 45 completed", "Gradient norm stable", "Loss converging"],
          PREDICT: ["EURUSD up probability 64%", "Volatility spike detected", "Pattern match: Double Bottom"],
          ADAPT: ["Regime shift detected", "Adjusting risk weights", "Mahoraga cycle step"],
          RISK: ["Exposure limit checked", "Drawdown within bounds", "VaR updated"]
        };

        const msgList = messages[randCat];
        const newLog: LogEntry = {
          id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
          timestamp: new Date(),
          level: randLevel,
          category: randCat,
          message: msgList[Math.floor(Math.random() * msgList.length)] + (randLevel === "ERROR" ? " (FAILED)" : "")
        };

        setLogs(prev => [...prev, newLog].slice(-200)); // keep last 200 logs
      }

      // Add new metric tick
      setMetrics(prev => {
        const last = prev.at(-1);
        if (!last) return prev;
        
        const newMetric = {
          time: last.time + 1,
          cpu: Math.max(0, Math.min(100, last.cpu + (Math.random() - 0.5) * 10)),
          ram: Math.max(0, Math.min(100, last.ram + (Math.random() - 0.5) * 2)),
          gpu: Math.max(0, Math.min(100, last.gpu + (Math.random() - 0.5) * 15)),
          disk: Math.max(0, 100 * Math.random() * (Math.random() > 0.9 ? 1 : 0.1)),
          latency: Math.max(5, last.latency + (Math.random() - 0.5) * 4),
          fps: Math.max(30, Math.min(60, last.fps + (Math.random() - 0.5) * 2)),
        };
        return [...prev.slice(1), newMetric];
      });

    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const handleExport = () => {
    const logText = logs.map(l => `[${l.timestamp.toISOString()}] [${l.level}] [${l.category}] ${l.message}`).join("\n");
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xiphos_system_logs_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    if (filterLevel !== "ALL" && log.level !== filterLevel) return false;
    if (filterCategory !== "ALL" && log.category !== filterCategory) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getLevelColor = (level: LogLevel) => {
    switch (level) {
      case "ERROR": return "text-xiphos-crimson";
      case "WARNING": return "text-xiphos-gold";
      case "INFO": return "text-xiphos-cyan";
    }
  };

  const currentMetrics = metrics.at(-1) || { cpu: 0, ram: 0, gpu: 0, disk: 0, latency: 0, fps: 0 };

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative">
      <GlassPanel glowColor="cyan">
        
        {/* Header */}
        <PageHeader 
          title="SYSTEM MONITORING" 
          icon={Terminal} 
          glowColor="cyan" 
          actions={
            <Button onClick={handleExport} icon={Download} label="EXPORT LOGS" />
          }
        />

        {/* Layout Split */}
        <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-hidden z-10">
          
          {/* LEFT: LIVE TERMINAL (70%) */}
          <div className="w-full xl:w-2/3 border-r border-white/5 flex flex-col min-h-0 bg-black/40">
            
            {/* Terminal Controls */}
            <div className="p-3 border-b border-white/5 flex flex-wrap gap-4 items-center bg-black/20">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-xiphos-muted" />
                <input 
                  type="text" 
                  placeholder="GREP LOGS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white text-xs pl-8 pr-3 py-1.5 rounded outline-none focus:border-xiphos-cyan transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <Filter className="w-3 h-3 text-xiphos-muted" />
                <select 
                  title="Filter by log level"
                  value={filterLevel} 
                  onChange={(e) => setFilterLevel(e.target.value as LogLevel | "ALL")}
                  className="bg-black/50 border border-white/10 text-white py-1.5 px-2 rounded outline-none text-xs uppercase"
                >
                  <option value="ALL">ALL LEVELS</option>
                  <option value="INFO">INFO</option>
                  <option value="WARNING">WARNING</option>
                  <option value="ERROR">ERROR</option>
                </select>
                <select 
                  title="Filter by category"
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value as LogCategory | "ALL")}
                  className="bg-black/50 border border-white/10 text-white py-1.5 px-2 rounded outline-none text-xs uppercase"
                >
                  <option value="ALL">ALL CATEGORIES</option>
                  <option value="EXEC">EXECUTION</option>
                  <option value="BROKER">BROKER</option>
                  <option value="LEARN">LEARNING</option>
                  <option value="PREDICT">PREDICTION</option>
                  <option value="ADAPT">ADAPTATION</option>
                  <option value="RISK">RISK</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-xiphos-muted">
                <input 
                  id="auto-scroll-toggle"
                  title="Toggle auto-scroll"
                  type="checkbox" 
                  checked={autoScroll} 
                  onChange={(e) => setAutoScroll(e.target.checked)} 
                  className="accent-xiphos-cyan"
                />
                <label htmlFor="auto-scroll-toggle">AUTO-SCROLL</label>
              </div>
            </div>

            {/* Log Feed */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-[11px] leading-relaxed font-mono">
              <AnimatePresence initial={false}>
                {filteredLogs.map(log => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-3 hover:bg-white/5 py-0.5 px-2 rounded transition-colors"
                  >
                    <span className="text-xiphos-muted shrink-0">
                      [{log.timestamp.toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}]
                    </span>
                    <span className={`w-16 shrink-0 font-black tracking-widest ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="w-20 shrink-0 text-white/50 font-bold tracking-widest">
                      [{log.category}]
                    </span>
                    <span className={log.level === "ERROR" ? "text-xiphos-crimson font-bold" : (log.level === "WARNING" ? "text-xiphos-gold" : "text-white/80")}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* RIGHT: PERFORMANCE TIMELINE (30%) */}
          <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-black/20 p-5 gap-6 overflow-y-auto custom-scrollbar">
            
            <h3 className="text-sm font-black text-xiphos-muted tracking-widest uppercase flex items-center gap-2 border-b border-white/5 pb-2">
              <Activity className="w-4 h-4 text-xiphos-emerald" /> Hardware Telemetry
            </h3>

            {/* Health Gauges */}
            <div className="grid grid-cols-2 gap-4 shrink-0">
              <GlassCard className="p-3 flex flex-col gap-1">
                <span className="text-[10px] text-xiphos-muted font-bold flex items-center gap-1"><Cpu className="w-3 h-3 text-xiphos-cyan"/> CPU CORE</span>
                <span className="text-lg font-black text-white">{currentMetrics.cpu.toFixed(1)}%</span>
              </GlassCard>
              <GlassCard className="p-3 flex flex-col gap-1">
                <span className="text-[10px] text-xiphos-muted font-bold flex items-center gap-1"><Database className="w-3 h-3 text-xiphos-purple"/> MEMORY</span>
                <span className="text-lg font-black text-white">{currentMetrics.ram.toFixed(1)}%</span>
              </GlassCard>
              <GlassCard className="p-3 flex flex-col gap-1">
                <span className="text-[10px] text-xiphos-muted font-bold flex items-center gap-1"><Gpu className="w-3 h-3 text-xiphos-gold"/> GPU ACCEL</span>
                <span className="text-lg font-black text-white">{currentMetrics.gpu.toFixed(1)}%</span>
              </GlassCard>
              <GlassCard className="p-3 flex flex-col gap-1">
                <span className="text-[10px] text-xiphos-muted font-bold flex items-center gap-1"><HardDrive className="w-3 h-3 text-white"/> DISK I/O</span>
                <span className="text-lg font-black text-white">{currentMetrics.disk.toFixed(1)} MB/s</span>
              </GlassCard>
            </div>

            {/* App Health */}
            <div className="flex flex-col gap-3 shrink-0 mt-2">
              <div className="flex justify-between items-center bg-black/40 border border-white/10 p-3 rounded">
                <span className="text-xs font-bold text-xiphos-muted flex items-center gap-2"><Zap className="w-4 h-4 text-xiphos-gold"/> Broker Latency</span>
                <span className="text-sm font-black text-xiphos-emerald glow-emerald">{currentMetrics.latency.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between items-center bg-black/40 border border-white/10 p-3 rounded">
                <span className="text-xs font-bold text-xiphos-muted flex items-center gap-2"><Maximize className="w-4 h-4 text-xiphos-cyan"/> UI FPS</span>
                <span className="text-sm font-black text-white">{currentMetrics.fps.toFixed(0)} FPS</span>
              </div>
              <div className="flex justify-between items-center bg-black/40 border border-white/10 p-3 rounded">
                <span className="text-xs font-bold text-xiphos-muted flex items-center gap-2"><Clock className="w-4 h-4 text-xiphos-purple"/> DB Health</span>
                <StatusBadge label="SYNCED" variant="success" />
              </div>
            </div>

            {/* Timeline Chart */}
            <GlassCard className="flex-1 min-h-[200px] p-4 flex flex-col gap-2 mt-2">
              <span className="text-[10px] text-xiphos-muted font-bold tracking-widest uppercase mb-2">UTILIZATION TIMELINE (60s)</span>
              <div className="flex-1 w-full h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={metrics} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" hide />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickCount={5} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "rgba(5, 8, 15, 0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "4px", fontSize: "10px" }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#4CC9F0" strokeWidth={1.5} dot={false} isAnimationActive={false} name="CPU %" />
                    <Line type="monotone" dataKey="ram" stroke="#8B5CF6" strokeWidth={1.5} dot={false} isAnimationActive={false} name="RAM %" />
                    <Line type="monotone" dataKey="gpu" stroke="#D4AF37" strokeWidth={1.5} dot={false} isAnimationActive={false} name="GPU %" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

          </div>
        </div>

      </GlassPanel>
    </div>
  );
}
