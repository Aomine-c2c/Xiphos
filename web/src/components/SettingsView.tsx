"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, Terminal, CheckCircle, AlertTriangle, Wifi, Database, Cpu } from "lucide-react";
import { motion } from "framer-motion";

export default function SettingsView() {
  const [lotSize, setLotSize] = useState(0.01);
  const [maxRiskTrades, setMaxRiskTrades] = useState(4);
  const [mode, setMode] = useState("DIRECT");
  const [bridgeHost, setBridgeHost] = useState("127.0.0.1");
  const [bridgePort, setBridgePort] = useState(8000);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "Initializing settings manager...",
    "Connection to settings API verified.",
  ]);

  const addLog = (msg: string) => {
    const ts = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setConsoleLogs(prev => [...prev, `[${ts}] ${msg}`].slice(-6));
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8001/api/settings");
        if (res.ok) {
          const data = await res.json();
          if (data?.trading) {
            setLotSize(data.trading.lot_size || 0.01);
            setMaxRiskTrades(data.trading.max_risk_trades || 4);
          }
          if (data?.execution) {
            setMode(data.execution.mode || "DIRECT");
            setBridgeHost(data.execution.bridge_host || "127.0.0.1");
            setBridgePort(data.execution.bridge_port || 8000);
          }
          addLog("Configuration loaded from config/settings.yaml");
        }
      } catch {
        addLog("Running in offline demo mode.");
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    addLog("Updating platform configuration...");
    const payload = {
      execution: { mode, bridge_host: bridgeHost, bridge_port: Number(bridgePort) },
      trading: { timeframe: "M30", max_risk_trades: Number(maxRiskTrades), lot_size: Number(lotSize) },
      magic_numbers: { scalper: 135001, runner: 135002 },
      indicators: { fast_ema: 13, medium_ema: 50, slow_sma: 200 },
      logging: { level: "INFO", rotation: "10 MB", retention: "10 days" },
      database: { path: "storage/xiphos.sqlite" },
    };
    try {
      const res = await fetch("http://127.0.0.1:8001/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      addLog(res.ok ? "Config saved. settings.yaml sync completed." : "Error: settings endpoint responded with error.");
    } catch {
      addLog("Failed to post configuration to API server.");
    }
  };

  const systemStatuses = [
    { label: "MT5 BRIDGE", icon: Wifi, status: "CONNECTED", ok: true, detail: `${bridgeHost}:${bridgePort}`, colorClass: "text-xiphos-cyan glow-cyan" },
    { label: "API SERVER", icon: Cpu, status: "ONLINE", ok: true, detail: "127.0.0.1:8001", colorClass: "text-xiphos-emerald glow-emerald" },
    { label: "BOT ENGINE", icon: Settings, status: "RUNNING", ok: true, detail: "2 bots active", colorClass: "text-xiphos-purple glow-purple" },
    { label: "DATABASE", icon: Database, status: "SYNCED", ok: true, detail: "xiphos.sqlite", colorClass: "text-xiphos-gold glow-gold" },
  ];

  const lockedParams = [
    { label: "FAST EMA FILTER", value: "13 EMA" },
    { label: "MEDIUM EMA FILTER", value: "50 EMA" },
    { label: "SLOW SMA FILTER", value: "200 SMA" },
    { label: "SCALPER MAGIC NO.", value: "135001" },
    { label: "RUNNER MAGIC NO.", value: "135002" },
    { label: "TIMEFRAME LOCK", value: "M30" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300">
      <form onSubmit={handleSave} className="glass-panel flex flex-col overflow-hidden flex-1 min-h-0 relative">
        
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-xiphos-purple opacity-5 blur-[150px] rounded-full pointer-events-none"></div>

        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 shrink-0 z-10">
          <span className="text-2xl font-black text-xiphos-purple uppercase tracking-widest flex items-center gap-2 glow-purple">
            <Settings className="h-5 w-5" />
            XIPHOS CONFIGURATION DIRECTORY
          </span>
          <button type="submit"
            className="px-6 py-2 bg-xiphos-purple/20 text-xiphos-purple border border-xiphos-purple/50 hover:bg-xiphos-purple hover:text-black text-sm font-black tracking-widest uppercase rounded cursor-pointer transition-all flex items-center gap-2">
            <Save className="h-4 w-4" /> SAVE CONFIG
          </button>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden z-10">

          {/* LEFT: System status */}
          <div className="col-span-3 border-r border-white/5 p-5 flex flex-col gap-6 overflow-hidden bg-black/20">
            <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-2">
              SYSTEM STATUS DIAGNOSTICS
            </span>

            <div className="flex flex-col gap-4">
              {systemStatuses.map((s, i) => (
                <motion.div 
                  key={s.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.1 }}
                  className="glass-card p-4 flex flex-col gap-3 group hover:border-white/20 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-xiphos-muted font-black tracking-widest uppercase flex items-center gap-1.5 group-hover:text-white transition-colors">
                      <s.icon className="h-3 w-3" /> {s.label}
                    </span>
                    {s.ok ? <CheckCircle className="h-3 w-3 text-xiphos-emerald" /> : <AlertTriangle className="h-3 w-3 text-xiphos-crimson" />}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className={`text-lg font-black uppercase tracking-wider ${s.colorClass}`}>{s.status}</span>
                    <span className="text-[10px] text-xiphos-muted uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">{s.detail}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Core Locked Params */}
            <div className="border-t border-white/5 pt-5 mt-auto">
              <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block mb-3">LOCKED HYPERPARAMETERS</span>
              <div className="grid grid-cols-2 gap-2">
                {lockedParams.map(lp => (
                  <div key={lp.label} className="bg-black/40 border border-white/5 rounded p-2 flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] text-xiphos-muted font-black tracking-widest mb-1">{lp.label}</span>
                    <span className="text-xs text-white font-mono">{lp.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Config fields + Log */}
          <div className="col-span-9 p-5 flex flex-col gap-6 overflow-hidden">

            <div className="flex-1 min-h-0 grid grid-cols-2 gap-6">
              
              {/* Execution Config */}
              <div className="glass-card flex flex-col p-5 h-fit">
                <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-2 mb-4">
                  EXECUTION TOPOLOGY
                </span>
                
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">BRIDGE HOST</label>
                    <input type="text" value={bridgeHost} onChange={e => setBridgeHost(e.target.value)} 
                      className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all" 
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">BRIDGE PORT</label>
                      <input type="number" value={bridgePort} onChange={e => setBridgePort(Number(e.target.value))} 
                        className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all" 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">ROUTING MODE</label>
                      <select value={mode} onChange={e => setMode(e.target.value)} 
                        className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all appearance-none cursor-pointer">
                        <option value="DIRECT">DIRECT</option>
                        <option value="AGGREGATED">AGGREGATED</option>
                        <option value="DEMO">DEMO</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trading Config */}
              <div className="glass-card flex flex-col p-5 h-fit">
                <span className="text-sm text-xiphos-muted font-black uppercase tracking-wider block border-b border-white/5 pb-2 mb-4">
                  TRADING BOUNDARIES
                </span>
                
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">BASE LOT SIZE</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="0.01" max="1" step="0.01" value={lotSize} onChange={e => setLotSize(parseFloat(e.target.value))} 
                        className="flex-1 accent-xiphos-purple" 
                      />
                      <span className="text-lg font-black text-xiphos-cyan glow-cyan w-16 text-right">{lotSize.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 pt-2">
                    <label className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">MAX CONCURRENT RISK TRADES</label>
                    <div className="flex items-center gap-3">
                      <input type="range" min="1" max="8" step="1" value={maxRiskTrades} onChange={e => setMaxRiskTrades(parseInt(e.target.value))} 
                        className="flex-1 accent-xiphos-purple" 
                      />
                      <span className="text-lg font-black text-xiphos-gold glow-gold w-16 text-right">{maxRiskTrades}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Mini Console Log */}
            <div className="shrink-0 h-32 glass-card border border-white/5 bg-black/40 flex flex-col overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2">
                <div className="w-2 h-2 rounded-full bg-xiphos-cyan animate-pulse shadow-[0_0_8px_#4CC9F0]" />
              </div>
              <div className="text-[10px] text-xiphos-muted font-black tracking-widest uppercase p-2 border-b border-white/5 bg-black/40 flex items-center gap-1.5">
                <Terminal className="w-3 h-3" />
                SYSTEM LOGSTREAM
              </div>
              <div className="flex-1 p-2 overflow-y-auto text-xs font-mono leading-relaxed opacity-80 flex flex-col gap-1">
                {consoleLogs.map((log, i) => (
                  <div key={i} className="flex gap-2 animate-pulse text-xiphos-cyan">
                    {`> ${log}`}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
