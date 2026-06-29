"use client";

import React, { useState } from "react";
import { 
  Settings, Save, Globe, User, Bell, BrainCircuit, ShieldAlert, 
  Database, ShieldCheck, Blocks, CheckCircle, Smartphone, Key, 
  Cloud, HardDrive, RefreshCw, FlaskConical, SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";

type TabType = "GENERAL" | "ACCOUNTS" | "NOTIFICATIONS" | "AI_MODELS" | "RISK" | "SYSTEM" | "SECURITY" | "PLUGINS";

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<TabType>("GENERAL");
  const [saveIndicator, setSaveIndicator] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  const tabs: { id: TabType; icon: React.ElementType; label: string }[] = [
    { id: "GENERAL", icon: Globe, label: "General" },
    { id: "ACCOUNTS", icon: User, label: "Accounts & Brokers" },
    { id: "NOTIFICATIONS", icon: Bell, label: "Notifications" },
    { id: "AI_MODELS", icon: BrainCircuit, label: "AI & Models" },
    { id: "RISK", icon: ShieldAlert, label: "Risk Limits" },
    { id: "SYSTEM", icon: Database, label: "System & Data" },
    { id: "SECURITY", icon: ShieldCheck, label: "Security" },
    { id: "PLUGINS", icon: Blocks, label: "Plugins & Updates" },
  ];

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative">
      <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col relative">
        <GlassPanel glowColor="purple">

          {/* Header */}
          <PageHeader 
            title="PLATFORM CONFIGURATION" 
            icon={Settings} 
            glowColor="purple" 
            actions={
              <>
                <AnimatePresence>
                  {saveIndicator && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-xs text-xiphos-emerald font-black tracking-widest uppercase flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> CONFIG SAVED
                    </motion.span>
                  )}
                </AnimatePresence>
                <Button type="submit" variant="primary" glowColor="purple" icon={Save} label="APPLY CHANGES" />
              </>
            }
          />

        {/* Layout Split: Sidebar + Content */}
        <div className="flex-1 min-h-0 flex overflow-hidden z-10">
          
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="w-64 border-r border-white/5 bg-black/20 flex flex-col p-4 gap-2 overflow-y-auto shrink-0">
            {tabs.map(tab => (
              <div 
                key={tab.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setActiveTab(tab.id); }}
                className={`flex items-center gap-3 p-3 rounded cursor-pointer transition-all text-xs font-black tracking-widest uppercase ${activeTab === tab.id ? "bg-xiphos-purple/20 text-xiphos-purple border border-xiphos-purple/50 shadow-[0_0_10px_rgba(139,92,246,0.1)]" : "text-xiphos-muted hover:bg-white/5 hover:text-white border border-transparent"}`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "glow-purple" : ""}`} />
                {tab.label}
              </div>
            ))}
          </div>

          {/* RIGHT CONTENT AREA */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl flex flex-col gap-8 pb-12"
              >
                
                {activeTab === "GENERAL" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <Globe className="w-5 h-5 text-xiphos-cyan" /> General Settings
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-theme" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">THEME ENGINE</label>
                        <select id="settings-theme" title="Theme engine" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all w-full max-w-sm">
                          <option>Deep Space Dark (Default)</option>
                          <option>High Contrast OLED</option>
                          <option>Institutional Gray</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-lang" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">SYSTEM LANGUAGE</label>
                        <select id="settings-lang" title="System language" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all w-full max-w-sm">
                          <option>English (US)</option>
                          <option>Japanese (日本語)</option>
                          <option>German (Deutsch)</option>
                          <option>French (Français)</option>
                        </select>
                      </div>
                    </GlassCard>
                  </>
                )}

                {activeTab === "ACCOUNTS" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <User className="w-5 h-5 text-xiphos-gold" /> Accounts & Brokers
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-broker" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">PRIMARY BROKER</label>
                        <select id="settings-broker" title="Primary broker" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all w-full max-w-sm">
                          <option>IC Markets (Raw Spread)</option>
                          <option>Pepperstone (Razor)</option>
                          <option>OANDA (Core)</option>
                          <option>Custom FIX API</option>
                        </select>
                      </div>
                      <div className="border-t border-white/10 pt-4 mt-2">
                        <h3 className="text-sm font-bold text-white mb-4">MT5 ACCOUNTS</h3>
                        <div className="flex flex-col gap-3">
                          <div className="bg-black/40 border border-xiphos-emerald/30 p-3 rounded flex justify-between items-center">
                            <div>
                              <div className="text-xs text-white font-black">ICMarkets-Demo</div>
                              <div className="text-[10px] text-xiphos-muted">Login: 10492850 | Server: ICMarketsSC-Demo</div>
                            </div>
                            <StatusBadge label="CONNECTED" variant="success" />
                          </div>
                          <div className="bg-black/40 border border-white/10 p-3 rounded flex justify-between items-center opacity-60">
                            <div>
                              <div className="text-xs text-white font-black">Pepperstone-Live</div>
                              <div className="text-[10px] text-xiphos-muted">Login: 994821 | Server: Pepperstone-Live02</div>
                            </div>
                            <StatusBadge label="OFFLINE" variant="neutral" />
                          </div>
                          <Button type="button" variant="ghost" className="w-fit" label="+ ADD ACCOUNT" />
                        </div>
                      </div>
                    </GlassCard>
                  </>
                )}

                {activeTab === "NOTIFICATIONS" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <Bell className="w-5 h-5 text-xiphos-purple" /> Notifications
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/40 border border-white/10 p-4 rounded flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Email Alerts</span>
                            <input type="checkbox" defaultChecked className="accent-xiphos-purple w-4 h-4" />
                          </div>
                          <input title="Email alerts address" type="email" placeholder="alerts@xiphos.ai" className="bg-black border border-white/10 text-white p-2 text-xs rounded" />
                        </div>
                        <div className="bg-black/40 border border-white/10 p-4 rounded flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Discord Webhook</span>
                            <input title="Discord webhook enabled" type="checkbox" defaultChecked className="accent-xiphos-purple w-4 h-4" />
                          </div>
                          <input title="Discord webhook URL" type="text" placeholder="https://discord.com/api/webhooks/..." className="bg-black border border-white/10 text-white p-2 text-xs rounded" />
                        </div>
                        <div className="bg-black/40 border border-white/10 p-4 rounded flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Telegram Bot</span>
                            <input title="Telegram bot enabled" type="checkbox" className="accent-xiphos-purple w-4 h-4" />
                          </div>
                          <input title="Telegram bot token" type="text" placeholder="Bot Token..." className="bg-black border border-white/10 text-white p-2 text-xs rounded" />
                        </div>
                        <div className="bg-black/40 border border-white/10 p-4 rounded flex flex-col gap-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-white">Slack Channel</span>
                            <input title="Slack channel enabled" type="checkbox" className="accent-xiphos-purple w-4 h-4" />
                          </div>
                          <input title="Slack webhook URL" type="text" placeholder="Webhook URL..." className="bg-black border border-white/10 text-white p-2 text-xs rounded" />
                        </div>
                      </div>
                    </GlassCard>
                  </>
                )}

                {activeTab === "AI_MODELS" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <BrainCircuit className="w-5 h-5 text-xiphos-cyan" /> AI & Models
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-local-llm" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase flex items-center gap-1">
                          <HardDrive className="w-3 h-3" /> LOCAL LLM ENGINE
                        </label>
                        <select id="settings-local-llm" title="Local LLM engine" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all w-full max-w-sm">
                          <option>Llama-3.1-8B-Instruct (Ollama)</option>
                          <option>Mistral-Nemo-12B (Ollama)</option>
                          <option>Phi-3-Mini (LMStudio)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-cloud-llm" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase flex items-center gap-1">
                          <Cloud className="w-3 h-3" /> CLOUD LLM ENGINE
                        </label>
                        <select id="settings-cloud-llm" title="Cloud LLM engine" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all w-full max-w-sm">
                          <option>Claude 3.5 Sonnet (Anthropic)</option>
                          <option>GPT-4o (OpenAI)</option>
                          <option>Gemini 1.5 Pro (Google)</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-api-key" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase flex items-center gap-1">
                          <Key className="w-3 h-3" /> CLOUD API KEY
                        </label>
                        <input id="settings-api-key" title="Cloud API key" type="password" defaultValue="sk-ant-api03-xxxxxxxxxxxx" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all w-full max-w-sm font-mono" />
                      </div>
                      <div className="border-t border-white/10 pt-4 mt-2">
                        <label htmlFor="settings-learning-speed" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase flex items-center gap-1 mb-4">
                          <SlidersHorizontal className="w-3 h-3" /> MAHORAGA LEARNING SPEED
                        </label>
                        <div className="flex items-center gap-4 max-w-md">
                          <span className="text-xs text-white">Conservative</span>
                          <input id="settings-learning-speed" title="Mahoraga learning speed" type="range" min="1" max="100" defaultValue="75" className="flex-1 accent-xiphos-purple" />
                          <span className="text-xs text-xiphos-crimson font-black">Aggressive</span>
                        </div>
                      </div>
                    </GlassCard>
                  </>
                )}

                {activeTab === "RISK" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <ShieldAlert className="w-5 h-5 text-xiphos-crimson" /> Risk Limits
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label htmlFor="settings-lot-size" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">DEFAULT LOT SIZE</label>
                          <input id="settings-lot-size" title="Default lot size" type="number" defaultValue={0.1} step="0.01" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="settings-max-dd" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">MAX DRAWDOWN (%)</label>
                          <input id="settings-max-dd" title="Max drawdown percent" type="number" defaultValue={5} step="0.1" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="settings-max-corr" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">MAX CORRELATION</label>
                          <input id="settings-max-corr" title="Max correlation" type="number" defaultValue={75} className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all" />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label htmlFor="settings-max-pos" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">MAX OPEN POSITIONS</label>
                          <input id="settings-max-pos" title="Max open positions" type="number" defaultValue={8} className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all" />
                        </div>
                      </div>
                    </GlassCard>
                  </>
                )}

                {activeTab === "SYSTEM" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <Database className="w-5 h-5 text-xiphos-emerald" /> System & Data
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-db-path" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">DATABASE PATH</label>
                        <input id="settings-db-path" title="Database path" type="text" defaultValue="./storage/xiphos.sqlite" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm font-mono outline-none focus:border-xiphos-purple rounded transition-all" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label htmlFor="settings-log-rotation" className="text-[11px] font-black text-xiphos-muted tracking-widest uppercase">LOG ROTATION</label>
                        <select id="settings-log-rotation" title="Log rotation" className="bg-black/40 border border-white/10 text-white p-2.5 text-sm outline-none focus:border-xiphos-purple rounded transition-all w-full max-w-sm">
                          <option>10 MB / 7 Days</option>
                          <option>50 MB / 30 Days</option>
                          <option>No Limit</option>
                        </select>
                      </div>
                      <div className="border-t border-white/10 pt-4 mt-2 flex justify-between items-center bg-black/40 p-4 rounded border border-white/5">
                        <div>
                          <div className="text-sm font-bold text-white">System Backups</div>
                          <div className="text-xs text-xiphos-muted">Last backup: Today, 08:00 AM (Auto)</div>
                        </div>
                        <Button type="button" variant="secondary" icon={HardDrive} label="BACKUP NOW" />
                      </div>
                    </GlassCard>
                  </>
                )}

                {activeTab === "SECURITY" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <ShieldCheck className="w-5 h-5 text-xiphos-gold" /> Security
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      <div className="bg-black/40 border border-white/10 p-4 rounded flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> Two-Factor Authentication (2FA)
                          </div>
                          <div className="text-xs text-xiphos-muted">Require TOTP code on login and critical risk changes.</div>
                        </div>
                        <div className="relative inline-block w-12 h-6 rounded-full bg-xiphos-emerald cursor-pointer">
                          <div className="absolute top-1 left-7 w-4 h-4 rounded-full bg-white transition-all shadow"></div>
                        </div>
                      </div>
                      <div className="bg-black/40 border border-white/10 p-4 rounded flex justify-between items-center">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            <User className="w-4 h-4" /> Biometric Auth (WebAuthn)
                          </div>
                          <div className="text-xs text-xiphos-muted">Use Fingerprint/FaceID for quick unlocks.</div>
                        </div>
                        <div className="relative inline-block w-12 h-6 rounded-full bg-white/10 cursor-pointer border border-white/10">
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-xiphos-muted transition-all shadow"></div>
                        </div>
                      </div>
                    </GlassCard>
                  </>
                )}

                {activeTab === "PLUGINS" && (
                  <>
                    <h2 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2 border-b border-white/10 pb-2">
                      <Blocks className="w-5 h-5 text-xiphos-purple" /> Plugins & Updates
                    </h2>
                    <GlassCard className="p-5 flex flex-col gap-6">
                      
                      <div className="flex justify-between items-center bg-xiphos-purple/10 border border-xiphos-purple/30 p-4 rounded">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-white flex items-center gap-2">
                            Xiphos Core <span className="bg-xiphos-purple text-black text-[9px] px-1.5 rounded-sm tracking-widest">v2.4.1</span>
                          </div>
                          <div className="text-xs text-xiphos-purple">Your system is up to date.</div>
                        </div>
                        <Button type="button" variant="primary" glowColor="purple" icon={RefreshCw} label="CHECK UPDATES" />
                      </div>

                      <div className="border-t border-white/10 pt-4 mt-2">
                        <h3 className="text-sm font-bold text-white mb-4">INSTALLED PLUGINS</h3>
                        <div className="flex flex-col gap-3">
                          <div className="bg-black/40 border border-white/10 p-3 rounded flex justify-between items-center">
                            <div>
                              <div className="text-xs text-white font-black">News Sentiment Analyzer (Alpha)</div>
                              <div className="text-[10px] text-xiphos-muted">Parses ForexFactory and Bloomberg RSS.</div>
                            </div>
                            <div className="relative inline-block w-8 h-4 rounded-full bg-xiphos-emerald cursor-pointer">
                              <div className="absolute top-0.5 left-4 w-3 h-3 rounded-full bg-white transition-all shadow"></div>
                            </div>
                          </div>
                          <div className="bg-black/40 border border-white/10 p-3 rounded flex justify-between items-center opacity-60">
                            <div>
                              <div className="text-xs text-white font-black">Binance Spot Bridge</div>
                              <div className="text-[10px] text-xiphos-muted">Connects to Binance API for spot trading.</div>
                            </div>
                            <div className="relative inline-block w-8 h-4 rounded-full bg-white/10 cursor-pointer border border-white/10">
                              <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-xiphos-muted transition-all shadow"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-black/40 border border-xiphos-gold/30 p-4 rounded flex justify-between items-center mt-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-bold text-xiphos-gold flex items-center gap-2">
                            <FlaskConical className="w-4 h-4" /> Experimental Features
                          </div>
                          <div className="text-xs text-xiphos-muted">Enable unstable UI and logic features. Use at your own risk.</div>
                        </div>
                        <div className="relative inline-block w-12 h-6 rounded-full bg-white/10 cursor-pointer border border-white/10">
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-xiphos-muted transition-all shadow"></div>
                        </div>
                      </div>

                    </GlassCard>
                  </>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        </GlassPanel>
      </form>
    </div>
  );
}
