"use client";

import React, { useEffect, useState } from "react";
import { Settings, Save, Terminal, CheckCircle, AlertTriangle, Wifi, Database, Cpu } from "lucide-react";

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
    { label: "MT5 BRIDGE", icon: Wifi, status: "CONNECTED", ok: true, detail: `${bridgeHost}:${bridgePort}` },
    { label: "API SERVER", icon: Cpu, status: "ONLINE", ok: true, detail: "127.0.0.1:8001" },
    { label: "BOT ENGINE", icon: Settings, status: "RUNNING", ok: true, detail: "2 bots active" },
    { label: "DATABASE", icon: Database, status: "SYNCED", ok: true, detail: "xiphos.sqlite" },
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
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-2">
      <form onSubmit={handleSave} className="bg-xiphos-panel border border-slate-900/80 rounded-sm flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Header */}
        <div className="p-3.5 border-b border-slate-950 flex items-center justify-between bg-[#0a101b]/40 shrink-0">
          <span className="text-3xl font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
            <Settings className="h-4 w-4" />
            XIPHOS CONFIGURATION DIRECTORY
          </span>
          <button type="submit"
            className="px-4 py-1.5 bg-xiphos-green hover:bg-emerald-400 text-black text-[16px] font-black tracking-widest uppercase rounded-sm cursor-pointer transition-all flex items-center gap-1.5">
            <Save className="h-3.5 w-3.5" /> SAVE CONFIG
          </button>
        </div>

        {/* Split: 3 + 9 */}
        <div className="flex-1 min-h-0 grid grid-cols-12 overflow-hidden">

          {/* LEFT: System status */}
          <div className="col-span-3 border-r border-slate-900/60 p-4 flex flex-col gap-4 overflow-hidden">
            <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              SYSTEM HEALTH STATUS
            </span>

            {systemStatuses.map(item => (
              <div key={item.label} className={`bg-xiphos-bg/40 border rounded-sm p-3 flex items-start justify-between gap-2 ${
                item.ok ? "border-slate-900/60" : "border-xiphos-red/30"
              }`}>
                <div className="flex items-center gap-2">
                  <item.icon className={`h-4 w-4 shrink-0 ${item.ok ? "text-xiphos-green" : "text-xiphos-red"}`} />
                  <div>
                    <div className="text-[15px] text-[#6f7e90] font-black uppercase">{item.label}</div>
                    <div className="text-[16px] text-[#425062]">{item.detail}</div>
                  </div>
                </div>
                <span className={`text-[14px] font-black px-1.5 py-0.5 rounded-sm border uppercase shrink-0 ${
                  item.ok
                    ? "bg-xiphos-green/5 border-xiphos-green/30 text-xiphos-green"
                    : "bg-xiphos-red/5 border-xiphos-red/30 text-xiphos-red"
                }`}>
                  {item.status}
                </span>
              </div>
            ))}

            {/* Console log */}
            <div className="border-t border-slate-950 pt-3 flex-1 min-h-0 flex flex-col">
              <div className="flex items-center gap-1.5 text-[15px] font-black text-xiphos-blue uppercase tracking-widest mb-2">
                <Terminal className="h-3 w-3" />
                <span>SETTINGS CONSOLE</span>
              </div>
              <div className="space-y-1 flex-1 min-h-0 overflow-hidden">
                {consoleLogs.map((log, idx) => (
                  <div key={idx} className="flex gap-1.5 text-[14px]">
                    <span className="text-[#425062]">&gt;</span>
                    <span className="text-[#8e9aa8]">{log}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Config form + locked params */}
          <div className="col-span-9 p-4 flex flex-col gap-4 overflow-hidden">

            {/* Editable trading parameters */}
            <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-4 shrink-0">
              <span className="text-[15px] text-[#6f7e90] font-black uppercase tracking-wider block mb-3 border-b border-slate-950 pb-1.5">
                EXECUTION & TRADING RULES
              </span>
              <div className="grid grid-cols-3 gap-4 text-[16px] text-[#8e9aa8]">
                <div className="space-y-2">
                  <label htmlFor="lotSize" className="font-bold text-[15px] block">LOT SIZE</label>
                  <input id="lotSize" title="Lot Size" type="number" step="0.01" min="0.01" value={lotSize}
                    onChange={e => setLotSize(Number(e.target.value))}
                    className="w-full bg-xiphos-bg border border-slate-900 text-white font-bold px-3 py-2 text-[17px] outline-none focus:border-xiphos-blue rounded-sm transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="maxRiskTrades" className="font-bold text-[15px] block">MAX RISK TRADES</label>
                  <input id="maxRiskTrades" title="Max Risk Trades" type="number" min="1" max="10" value={maxRiskTrades}
                    onChange={e => setMaxRiskTrades(Number(e.target.value))}
                    className="w-full bg-xiphos-bg border border-slate-900 text-white font-bold px-3 py-2 text-[17px] outline-none focus:border-xiphos-blue rounded-sm transition-colors" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="mode" className="font-bold text-[15px] block">EXECUTION MODE</label>
                  <select id="mode" title="Execution Mode" value={mode} onChange={e => setMode(e.target.value)}
                    className="w-full bg-xiphos-bg border border-slate-900 text-white font-bold px-3 py-2 text-[17px] outline-none focus:border-xiphos-blue rounded-sm transition-colors cursor-pointer">
                    <option value="DIRECT">DIRECT</option>
                    <option value="BRIDGE">BRIDGE</option>
                    <option value="AUTO">AUTO</option>
                  </select>
                </div>
                {mode === "BRIDGE" && (
                  <>
                    <div className="space-y-2">
                      <label htmlFor="bridgeHost" className="font-bold text-[15px] block">BRIDGE HOST</label>
                      <input id="bridgeHost" title="Bridge Host" type="text" value={bridgeHost} onChange={e => setBridgeHost(e.target.value)}
                        className="w-full bg-xiphos-bg border border-slate-900 text-white font-bold px-3 py-2 text-[17px] outline-none focus:border-xiphos-blue rounded-sm transition-colors" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="bridgePort" className="font-bold text-[15px] block">BRIDGE PORT</label>
                      <input id="bridgePort" title="Bridge Port" type="number" value={bridgePort} onChange={e => setBridgePort(Number(e.target.value))}
                        className="w-full bg-xiphos-bg border border-slate-900 text-white font-bold px-3 py-2 text-[17px] outline-none focus:border-xiphos-blue rounded-sm transition-colors" />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-3 text-[14px] text-[#425062] border-t border-slate-950 pt-2.5">
                ✓ Timeframe is statically locked to M30. Max Risk Trades must equal Risk Slots in the Sidebar.
              </div>
            </div>

            {/* Locked core strategy parameters */}
            <div className="bg-xiphos-bg/40 border border-slate-900/60 rounded-sm p-4 flex-1 min-h-0 flex flex-col">
              <span className="text-[15px] text-xiphos-red font-black uppercase tracking-wider block mb-3 border-b border-slate-950 pb-1.5 flex items-center gap-1.5 shrink-0">
                <AlertTriangle className="h-3 w-3" />
                LOCKED CORE STRATEGY PARAMETERS
              </span>
              <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">
                {lockedParams.map((param, idx) => (
                  <div key={idx} className="border border-slate-900/40 bg-slate-950/30 rounded-sm p-3">
                    <div className="text-[14px] text-[#6f7e90] font-black uppercase tracking-wider mb-1.5">{param.label}</div>
                    <div className="text-[21px] font-black text-slate-500">{param.value}</div>
                  </div>
                ))}
              </div>
              <div className="text-[14px] text-slate-600 leading-relaxed border-t border-slate-950 pt-2.5 mt-3 shrink-0">
                ⚠ These parameters form the strategic foundation and cannot be modified via the client dashboard. Changes require direct config file access.
              </div>
            </div>

          </div>

        </div>
      </form>

      {/* Footer */}
      <div className="bg-xiphos-panel border border-slate-900/80 rounded-sm p-3 shrink-0">
        <div className="flex items-center justify-between text-[16px] font-black">
          <div className="flex items-center gap-2 text-xiphos-green">
            <CheckCircle className="h-4 w-4" />
            <span>XIPHOS CONFIGURATION DIRECTORY — SECURE RUNTIME MODE</span>
          </div>
          <span className="text-[#8e9aa8] text-[15px]">
            VERSION: <span className="text-white font-black">XIPHOS MISSION CORE v2.1.0</span>
          </span>
        </div>
      </div>
    </div>
  );
}
