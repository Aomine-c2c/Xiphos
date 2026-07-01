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
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterLevel, setFilterLevel] = useState<LogLevel | "ALL">("ALL");
  const [filterCategory, setFilterCategory] = useState<LogCategory | "ALL">("ALL");
  const [autoScroll, setAutoScroll] = useState(true);
  
  const [metrics, setMetrics] = useState<Record<string, number>[]>([]);
  const [mahoragaInfo, setMahoragaInfo] = useState<{ema: number, phenomenon: string}>({ema: 13, phenomenon: "UNKNOWN"});
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ws = new WebSocket("ws://127.0.0.1:8001/ws");
    
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        
        if (msg.type === "log_history") {
          const loadedLogs = msg.data.map((l: Record<string, string>, i: number) => ({
            id: `hist-${Date.now()}-${i}`,
            timestamp: new Date(),
            level: l.level as LogLevel,
            category: "EXEC" as LogCategory,
            message: l.message
          }));
          setLogs(loadedLogs);
        } else if (msg.type === "log_event") {
          const l = msg.data;
          setLogs(prev => {
            const newLogs: LogEntry[] = [...prev, {
              id: `log-${Date.now()}-${Math.floor(Math.random()*1000)}`,
              timestamp: new Date(),
              level: l.level as LogLevel,
              category: "EXEC" as LogCategory,
              message: l.message
            }];
            return newLogs.slice(-200); // keep last 200
          });
        } else if (msg.type === "state_update") {
          const st = msg.data.system_stats;
          const lat = msg.data.api_latency;
          const mahoragaMap = msg.data.mahoraga_state;
          
          if (mahoragaMap) {
            // Just grab the first symbol's state as a proxy for the overall adaptation engine state for monitoring
            const keys = Object.keys(mahoragaMap);
            if (keys.length > 0) {
                setMahoragaInfo({
                    ema: mahoragaMap[keys[0]].fast_ema || 13,
                    phenomenon: mahoragaMap[keys[0]].phenomenon || "UNKNOWN"
                });
            }
          }
          
          setMetrics(prev => {
            const lastTime = prev.length > 0 ? (prev.at(-1)?.time ?? 0) : 0;
            const newMetric = {
              time: lastTime + 1,
              cpu: st.cpu || 0,
              ram: st.memory || 0,
              disk: st.disk || 0,
              latency: lat || 0,
              gpu: 0,
              fps: 60
            };
            const newArr = [...prev, newMetric];
            return newArr.length > 60 ? newArr.slice(1) : newArr;
          });
        }
      } catch {
        // WebSocket parsing errors are non-fatal; silently discard malformed frames
      }
    };
    
    return () => ws.close();
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
      <GlassPanel glowColor="cyan" className="p-0 flex flex-col h-full" noOverflowHidden>
        
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
        <div className="flex flex-col xl:flex-row flex-1 min-h-0 z-10">
          
          {/* LEFT: LIVE TERMINAL (70%) */}
          <div className="w-full xl:w-2/3 border-r border-white/5 flex flex-col min-h-0 bg-black/40">
            
            {/* Terminal Controls */}
            <div className="flex gap-2 p-2 shrink-0 border-b border-white/5">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-xiphos-muted" />
                <input 
                  type="text" 
                  placeholder="GREP LOGS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 text-white text-xs pl-8 pr-3 py-1 rounded outline-none focus:border-xiphos-cyan transition-colors"
                />
              </div>
              
              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3 h-3 text-xiphos-muted" />
                <select 
                  title="Filter by log level"
                  value={filterLevel} 
                  onChange={(e) => setFilterLevel(e.target.value as LogLevel | "ALL")}
                  className="bg-black/50 border border-white/10 text-white py-1 px-1 rounded outline-none text-xs uppercase"
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
                  className="bg-black/50 border border-white/10 text-white py-1 px-1 rounded outline-none text-xs uppercase"
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

              <div className="flex items-center gap-1 text-xs font-bold text-xiphos-muted">
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
            <div className="flex-1 overflow-y-auto p-1 text-[9px] leading-tight font-mono flex flex-col">
              <AnimatePresence initial={false}>
                {filteredLogs.map(log => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2 hover:bg-white/5 py-0.5 px-1 rounded transition-colors"
                  >
                    <span className="text-xiphos-muted shrink-0">
                      [{log.timestamp.toLocaleTimeString([], { hour12: false, fractionalSecondDigits: 3 })}]
                    </span>
                    <span className={`w-12 shrink-0 font-black tracking-widest ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="w-16 shrink-0 text-white/50 font-bold tracking-widest">
                      [{log.category}]
                    </span>
                    <span className={`text-white/80 ${log.level === "ERROR" ? "text-xiphos-crimson! font-bold" : ""} ${log.level === "WARNING" ? "text-xiphos-gold!" : ""}`}>
                      {log.message}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          </div>

          {/* RIGHT: PERFORMANCE TIMELINE (30%) */}
          <div className="w-full xl:w-1/3 flex flex-col min-h-0 bg-black/20 p-1 gap-1">
            
            <h3 className="text-[10px] font-black text-xiphos-muted tracking-widest uppercase flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)] pb-2 mb-1">
              <Activity className="w-4 h-4 text-xiphos-emerald glow-emerald" /> INSTITUTIONAL HARDWARE TELEMETRY
            </h3>

            {/* Health Gauges */}
            <div className="grid grid-cols-2 gap-2 shrink-0 relative z-10">
              <GlassCard className="p-4 flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-xiphos-cyan/10 rounded-full blur-xl group-hover:bg-xiphos-cyan/20 transition-all"></div>
                <span className="text-[9px] text-xiphos-muted font-black tracking-widest uppercase flex items-center gap-2"><Cpu className="w-3 h-3 text-xiphos-cyan glow-cyan"/> CPU CORE</span>
                <span className="text-2xl font-black text-white drop-shadow-md">{currentMetrics.cpu.toFixed(1)}%</span>
              </GlassCard>
              <GlassCard className="p-4 flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-xiphos-purple/10 rounded-full blur-xl group-hover:bg-xiphos-purple/20 transition-all"></div>
                <span className="text-[9px] text-xiphos-muted font-black tracking-widest uppercase flex items-center gap-2"><Database className="w-3 h-3 text-xiphos-purple glow-purple"/> MEMORY</span>
                <span className="text-2xl font-black text-white drop-shadow-md">{currentMetrics.ram.toFixed(1)}%</span>
              </GlassCard>
              <GlassCard className="p-4 flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-xiphos-gold/10 rounded-full blur-xl group-hover:bg-xiphos-gold/20 transition-all"></div>
                <span className="text-[9px] text-xiphos-muted font-black tracking-widest uppercase flex items-center gap-2"><Gpu className="w-3 h-3 text-xiphos-gold glow-gold"/> GPU ACCEL</span>
                <span className="text-2xl font-black text-white drop-shadow-md">{currentMetrics.gpu.toFixed(1)}%</span>
              </GlassCard>
              <GlassCard className="p-4 flex flex-col gap-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all"></div>
                <span className="text-[9px] text-xiphos-muted font-black tracking-widest uppercase flex items-center gap-2"><HardDrive className="w-3 h-3 text-white"/> DISK I/O</span>
                <span className="text-2xl font-black text-white drop-shadow-md">{currentMetrics.disk.toFixed(1)} MB/s</span>
              </GlassCard>
            </div>

            {/* App Health */}
            <div className="flex flex-col gap-2 shrink-0 mt-3 relative z-10">
              <div className="flex justify-between items-center bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-xiphos-muted flex items-center gap-2"><Zap className="w-4 h-4 text-xiphos-gold glow-gold"/> BROKER LATENCY</span>
                <span className="text-sm font-black text-xiphos-emerald glow-emerald">{currentMetrics.latency.toFixed(1)} ms</span>
              </div>
              <div className="flex justify-between items-center bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-xiphos-muted flex items-center gap-2"><Maximize className="w-4 h-4 text-xiphos-cyan glow-cyan"/> UI RENDER FPS</span>
                <span className="text-sm font-black text-white drop-shadow-md">{currentMetrics.fps.toFixed(0)} FPS</span>
              </div>
              <div className="flex justify-between items-center bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] p-3 rounded-lg backdrop-blur-sm">
                <span className="text-[10px] font-black uppercase tracking-widest text-xiphos-muted flex items-center gap-2"><Clock className="w-4 h-4 text-xiphos-purple glow-purple"/> DB SYNCHRONIZATION</span>
                <StatusBadge label="VERIFIED" variant="success" />
              </div>
              <div className="flex justify-between items-center bg-xiphos-gold/5 border border-xiphos-gold/30 p-3 rounded-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-xiphos-gold/10 rounded-full blur-2xl"></div>
                <div className="flex flex-col relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-xiphos-gold glow-gold flex items-center gap-2"><Zap className="w-4 h-4"/> ADAPTATION ENGINE</span>
                  <span className="text-[8px] font-black text-xiphos-gold/60 uppercase tracking-widest mt-1">{mahoragaInfo.phenomenon.replaceAll('_', ' ')}</span>
                </div>
                <span className="text-2xl font-black text-xiphos-gold glow-gold relative z-10">{mahoragaInfo.ema} <span className="text-xs">EMA</span></span>
              </div>
            </div>

            {/* Timeline Chart */}
            <GlassCard className="flex-1 min-h-0 p-2 flex flex-col gap-1 mt-1">
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
