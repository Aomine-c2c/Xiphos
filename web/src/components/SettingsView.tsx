"use client";

import React, { useState } from "react";
import { 
  Settings, Save, CheckCircle, 
  Palette, BrainCircuit, Cpu, Zap, ShieldCheck, 
  Briefcase, Bell, Key, Settings2, HardDrive, 
  BadgeCheck, Terminal, Eye, EyeOff, Globe, 
  Cloud, SlidersHorizontal, User, Smartphone, RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";
import { CollapsiblePanel } from "./ui/CollapsiblePanel";

export default function SettingsView() {
  const [saveIndicator, setSaveIndicator] = useState(false);
  const [themePreview, setThemePreview] = useState("deep-space");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaveIndicator(true);
    setTimeout(() => setSaveIndicator(false), 2000);
  };

  return (
    <div className="flex flex-col w-full h-full font-sans select-none overflow-hidden gap-4 transition-all duration-300 animate-in fade-in relative">
      <form onSubmit={handleSave} className="flex-1 min-h-0 flex flex-col relative">
        <GlassPanel className="flex flex-col h-full p-0" noOverflowHidden>

          {/* Header */}
          <PageHeader 
            title="PLATFORM CONFIGURATION" 
            icon={Settings} 
            actions={
              <>
                <AnimatePresence>
                  {saveIndicator && (
                    <motion.span 
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="text-xs text-[#4ade80] font-semibold tracking-widest uppercase flex items-center gap-1 font-sans"
                    >
                      <CheckCircle className="w-3 h-3" /> CONFIG SAVED
                    </motion.span>
                  )}
                </AnimatePresence>
                <Button type="submit" variant="primary" icon={Save} label="APPLY CHANGES" />
              </>
            }
          />

          {/* Content Layout */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 z-10">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 max-w-7xl mx-auto">
              
              <div className="flex flex-col gap-6">
                {/* 1. APPEARANCE */}
                <CollapsiblePanel title="Appearance" icon={Palette} headerColor="text-[#a78bfa]" defaultOpen>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-theme" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">THEME ENGINE</label>
                      <select 
                        id="settings-theme" 
                        title="Theme engine" 
                        value={themePreview}
                        onChange={(e) => setThemePreview(e.target.value)}
                        className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 text-white p-2.5 text-sm outline-none focus:border-[#8b5cf6] rounded transition-all w-full cursor-pointer"
                      >
                        <option value="deep-space">Deep Space Dark (Default)</option>
                        <option value="oled">High Contrast OLED</option>
                        <option value="institutional">Institutional Gray</option>
                      </select>
                    </div>
                    
                    {/* Live Preview UI */}
                    <div className="mt-2 flex flex-col gap-2">
                      <span className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">LIVE PREVIEW</span>
                      <div className={`p-4 rounded border transition-colors duration-500 ${themePreview === 'deep-space' ? 'bg-[#0f0f1a] border-[#8b5cf6]/30' : themePreview === 'oled' ? 'bg-black border-white/20' : 'bg-[#1e1e2e] border-white/10'}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${themePreview === 'deep-space' ? 'bg-[#a78bfa]' : themePreview === 'oled' ? 'bg-white' : 'bg-gray-400'}`}></div>
                            <span className={`text-xs font-semibold ${themePreview === 'deep-space' ? 'text-white' : themePreview === 'oled' ? 'text-white' : 'text-gray-200'}`}>Xiphos UI Component</span>
                          </div>
                          <span className={`text-[10px] ${themePreview === 'deep-space' ? 'text-[#8b5cf6]' : 'text-gray-400'}`}>Active</span>
                        </div>
                        <div className={`h-2 rounded w-full mb-2 ${themePreview === 'deep-space' ? 'bg-[#1e1e2e]' : themePreview === 'oled' ? 'bg-gray-900' : 'bg-gray-700'}`}>
                          <div className={`h-full rounded w-2/3 ${themePreview === 'deep-space' ? 'bg-gradient-to-r from-[#8b5cf6] to-[#4ade80]' : themePreview === 'oled' ? 'bg-white' : 'bg-gray-400'}`}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 2. AI MODELS */}
                <CollapsiblePanel title="AI Models" icon={BrainCircuit} headerColor="text-[#a78bfa]">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-local-llm" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> LOCAL LLM ENGINE
                      </label>
                      <select id="settings-local-llm" title="Local LLM engine" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 text-white p-2.5 text-sm outline-none focus:border-[#8b5cf6] rounded transition-all w-full cursor-pointer">
                        <option>Llama-3.1-8B-Instruct (Ollama)</option>
                        <option>Mistral-Nemo-12B (Ollama)</option>
                        <option>Phi-3-Mini (LMStudio)</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-cloud-llm" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase flex items-center gap-1">
                        <Cloud className="w-3 h-3" /> CLOUD LLM ENGINE
                      </label>
                      <select id="settings-cloud-llm" title="Cloud LLM engine" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#8b5cf6]/50 focus:ring-1 focus:ring-[#8b5cf6]/30 text-white p-2.5 text-sm outline-none focus:border-[#8b5cf6] rounded transition-all w-full cursor-pointer">
                        <option>Gemini 1.5 Pro (Google)</option>
                        <option>Claude 3.5 Sonnet (Anthropic)</option>
                        <option>GPT-4o (OpenAI)</option>
                      </select>
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 3. MAHORAGA ENGINE */}
                <CollapsiblePanel title="Mahoraga Engine" icon={Cpu} headerColor="text-[#f59e0b]">
                  <div className="flex flex-col gap-4">
                    <div>
                      <label htmlFor="settings-learning-speed" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase flex items-center gap-1 mb-2">
                        <SlidersHorizontal className="w-3 h-3" /> LEARNING SPEED
                      </label>
                      <div className="flex items-center gap-3 bg-[#0f0f1a] p-2.5 rounded border border-[#1e1e2e]">
                        <span className="text-[10px] text-white">Conservative</span>
                        <input id="settings-learning-speed" title="Mahoraga learning speed" type="range" min="1" max="100" defaultValue="75" className="flex-1 accent-[#f59e0b] cursor-pointer" />
                        <span className="text-[10px] text-[#f87171] font-semibold">Aggressive</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-adapt-limit" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">ADAPTATION LIMIT (%)</label>
                      <input id="settings-adapt-limit" title="Adaptation Limit" type="number" defaultValue={15} step="1" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/30 text-white p-2.5 text-sm outline-none focus:border-[#f59e0b] rounded transition-all" />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 4. HERMES */}
                <CollapsiblePanel title="Hermes" icon={Zap} headerColor="text-[#4ade80]">
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex justify-between items-center">
                      <div className="flex flex-col gap-1 pr-4">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          Websocket Data Feed
                        </div>
                        <div className="text-[9px] text-[#94a3b8] leading-tight">Enable ultra-low latency price streams.</div>
                      </div>
                      <div className="relative inline-block w-10 h-5 rounded-full bg-[#4ade80] cursor-pointer shrink-0">
                        <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-white transition-all shadow"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-feed-source" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">FEED SOURCE PRIORITY</label>
                      <select id="settings-feed-source" title="Feed Source" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#4ade80]/50 focus:ring-1 focus:ring-[#4ade80]/30 text-white p-2.5 text-sm outline-none focus:border-[#4ade80] rounded transition-all w-full cursor-pointer">
                        <option>FIX API (Primary)</option>
                        <option>Broker Websocket</option>
                        <option>REST Polling (Fallback)</option>
                      </select>
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 5. SECURITY */}
                <CollapsiblePanel title="Security" icon={ShieldCheck} headerColor="text-[#f87171]">
                  <div className="flex flex-col gap-3">
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex justify-between items-center">
                      <div className="flex flex-col gap-1 pr-4">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5" /> Two-Factor Auth (2FA)
                        </div>
                        <div className="text-[9px] text-[#94a3b8] leading-tight">Require TOTP code on login and risk changes.</div>
                      </div>
                      <div className="relative inline-block w-10 h-5 rounded-full bg-[#f87171] cursor-pointer shrink-0">
                        <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-white transition-all shadow"></div>
                      </div>
                    </div>
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex justify-between items-center">
                      <div className="flex flex-col gap-1 pr-4">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" /> Biometric Auth
                        </div>
                        <div className="text-[9px] text-[#94a3b8] leading-tight">Use WebAuthn for quick unlocks.</div>
                      </div>
                      <div className="relative inline-block w-10 h-5 rounded-full bg-white/10 cursor-pointer border border-[#1e1e2e] shrink-0">
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[#52525b] transition-all shadow"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 mt-2">
                      <label htmlFor="settings-session-timeout" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">SESSION TIMEOUT (MINUTES)</label>
                      <input id="settings-session-timeout" title="Session Timeout" type="number" defaultValue={30} className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#f87171]/50 focus:ring-1 focus:ring-[#f87171]/30 text-white p-2.5 text-sm outline-none focus:border-[#f87171] rounded transition-all" />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 6. BROKER INTEGRATIONS */}
                <CollapsiblePanel title="Broker Integrations" icon={Briefcase} headerColor="text-[#38bdf8]">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-broker" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">PRIMARY BROKER</label>
                      <select id="settings-broker" title="Primary broker" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#38bdf8]/50 focus:ring-1 focus:ring-[#38bdf8]/30 text-white p-2.5 text-sm outline-none focus:border-[#38bdf8] rounded transition-all w-full cursor-pointer">
                        <option>IC Markets (Raw Spread)</option>
                        <option>Pepperstone (Razor)</option>
                        <option>OANDA (Core)</option>
                        <option>Custom FIX API</option>
                      </select>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase mb-2">MT5 ACCOUNTS</h3>
                      <div className="flex flex-col gap-2">
                        <div className="bg-[#0f0f1a] border border-[#4ade80]/30 p-2.5 rounded flex justify-between items-center">
                          <div>
                            <div className="text-xs text-white font-semibold">ICMarkets-Demo</div>
                            <div className="text-[9px] text-[#94a3b8] font-mono mt-0.5">Login: 10492850 | Server: ICMarketsSC-Demo</div>
                          </div>
                          <StatusBadge label="CONNECTED" variant="success" />
                        </div>
                        <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-2.5 rounded flex justify-between items-center opacity-60">
                          <div>
                            <div className="text-xs text-white font-semibold">Pepperstone-Live</div>
                            <div className="text-[9px] text-[#94a3b8] font-mono mt-0.5">Login: 994821 | Server: Pepperstone-Live02</div>
                          </div>
                          <StatusBadge label="OFFLINE" variant="neutral" />
                        </div>
                        <Button type="button" variant="ghost" className="w-full text-[10px] mt-1" label="+ ADD ACCOUNT" />
                      </div>
                    </div>
                  </div>
                </CollapsiblePanel>
              </div>

              {/* Second Column */}
              <div className="flex flex-col gap-6">
                
                {/* 7. NOTIFICATIONS */}
                <CollapsiblePanel title="Notifications" icon={Bell} headerColor="text-[#a78bfa]">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Email Alerts</span>
                        <input title="Email alerts enabled" type="checkbox" defaultChecked className="accent-[#a78bfa] w-4 h-4 cursor-pointer" />
                      </div>
                      <input title="Email alerts address" type="email" placeholder="alerts@xiphos.ai" className="bg-black border border-[#1e1e2e] hover:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/30 text-white p-2 text-xs rounded outline-none focus:border-[#a78bfa] transition-all font-mono" />
                    </div>
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Discord Webhook</span>
                        <input title="Discord webhook enabled" type="checkbox" defaultChecked className="accent-[#a78bfa] w-4 h-4 cursor-pointer" />
                      </div>
                      <input title="Discord webhook URL" type="text" placeholder="https://discord.com/api/webhooks/..." className="bg-black border border-[#1e1e2e] hover:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/30 text-white p-2 text-xs rounded outline-none focus:border-[#a78bfa] transition-all font-mono" />
                    </div>
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-white">Telegram Bot</span>
                        <input title="Telegram bot enabled" type="checkbox" className="accent-[#a78bfa] w-4 h-4 cursor-pointer" />
                      </div>
                      <input title="Telegram bot token" type="text" placeholder="Bot Token..." className="bg-black border border-[#1e1e2e] hover:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/30 text-white p-2 text-xs rounded outline-none focus:border-[#a78bfa] transition-all font-mono" />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 8. API KEYS */}
                <CollapsiblePanel title="API Keys" icon={Key} headerColor="text-[#f59e0b]">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-cloud-api" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">CLOUD API KEY</label>
                      <div className="relative">
                        <input 
                          id="settings-cloud-api" 
                          title="Cloud API key" 
                          type={showApiKey ? "text" : "password"} 
                          defaultValue="sk-ant-api03-xxxxxxxxxxxx" 
                          className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/30 text-white p-2.5 text-sm outline-none focus:border-[#f59e0b] rounded transition-all w-full font-mono pr-10" 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-custom-api" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">CUSTOM WEBHOOK SECRET</label>
                      <input id="settings-custom-api" title="Custom Webhook Secret" type="password" placeholder="Enter secret..." className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/30 text-white p-2.5 text-sm outline-none focus:border-[#f59e0b] rounded transition-all w-full font-mono" />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 9. AUTOMATION */}
                <CollapsiblePanel title="Automation" icon={Settings2} headerColor="text-[#4ade80]">
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex justify-between items-center">
                      <div className="flex flex-col gap-1 pr-4">
                        <div className="text-xs font-bold text-white">Auto-Trade Execution</div>
                        <div className="text-[9px] text-[#94a3b8] leading-tight">Allow Xiphos to place orders automatically.</div>
                      </div>
                      <div className="relative inline-block w-10 h-5 rounded-full bg-[#4ade80] cursor-pointer shrink-0">
                        <div className="absolute top-0.5 left-5 w-4 h-4 rounded-full bg-white transition-all shadow"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-max-trades" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">MAX TRADES PER DAY</label>
                      <input id="settings-max-trades" title="Max trades" type="number" defaultValue={20} className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#4ade80]/50 focus:ring-1 focus:ring-[#4ade80]/30 text-white p-2.5 text-sm outline-none focus:border-[#4ade80] rounded transition-all" />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 10. BACKUPS */}
                <CollapsiblePanel title="Backups" icon={HardDrive} headerColor="text-[#a78bfa]">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-db-path" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">DATABASE PATH</label>
                      <input id="settings-db-path" title="Database path" type="text" defaultValue="./storage/xiphos.sqlite" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/30 text-white p-2.5 text-sm font-mono outline-none focus:border-[#a78bfa] rounded transition-all" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-log-rotation" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">LOG ROTATION</label>
                      <select id="settings-log-rotation" title="Log rotation" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#a78bfa]/50 focus:ring-1 focus:ring-[#a78bfa]/30 text-white p-2.5 text-sm outline-none focus:border-[#a78bfa] rounded transition-all w-full cursor-pointer">
                        <option>10 MB / 7 Days</option>
                        <option>50 MB / 30 Days</option>
                        <option>No Limit</option>
                      </select>
                    </div>
                    <div className="pt-2 flex justify-between items-center bg-[#0f0f1a] p-3 rounded border border-[#1e1e2e]">
                      <div>
                        <div className="text-xs font-bold text-white">System Backups</div>
                        <div className="text-[10px] text-[#94a3b8] mt-0.5">Last: Today, 08:00 AM (Auto)</div>
                      </div>
                      <Button type="button" variant="secondary" icon={HardDrive} label="BACKUP NOW" className="text-[10px] px-3 py-1.5" />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 11. LICENSING */}
                <CollapsiblePanel title="Licensing" icon={BadgeCheck} headerColor="text-[#f59e0b]">
                  <div className="flex flex-col gap-4">
                    <div className="bg-[rgba(245,158,11,0.1)] border border-[#f59e0b]/30 p-4 rounded flex flex-col gap-2 items-center justify-center text-center">
                      <BadgeCheck className="w-8 h-8 text-[#f59e0b] mb-1" />
                      <div className="text-sm font-bold text-white uppercase tracking-widest">Enterprise Edition</div>
                      <div className="text-[10px] text-[#f59e0b]">Valid until Dec 31, 2099</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-license-key" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">LICENSE KEY</label>
                      <input id="settings-license-key" title="License Key" type="password" defaultValue="XIPH-XXXX-XXXX-XXXX" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#f59e0b]/50 focus:ring-1 focus:ring-[#f59e0b]/30 text-[#f59e0b] p-2.5 text-sm outline-none focus:border-[#f59e0b] rounded transition-all font-mono" />
                    </div>
                  </div>
                </CollapsiblePanel>

                {/* 12. DEVELOPER MODE */}
                <CollapsiblePanel title="Developer Mode" icon={Terminal} headerColor="text-[#f87171]">
                  <div className="flex flex-col gap-4">
                    <div className="bg-[#0f0f1a] border border-[#f87171]/30 p-3 rounded flex justify-between items-center">
                      <div className="flex flex-col pr-2">
                        <div className="text-[10px] font-bold text-[#f87171] flex items-center gap-1.5">
                          Enable Developer Tools
                        </div>
                        <div className="text-[8px] text-[#94a3b8] mt-0.5">Unlocks hidden configurations and verbose logging.</div>
                      </div>
                      <div className="relative inline-block w-8 h-4 rounded-full bg-[#f87171] cursor-pointer border border-[#f87171]/50 shrink-0">
                        <div className="absolute top-0.5 left-4 w-3 h-3 rounded-full bg-white transition-all shadow"></div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label htmlFor="settings-log-level" className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">LOG LEVEL</label>
                      <select id="settings-log-level" title="Log level" className="bg-[#0f0f1a] border border-[#1e1e2e] hover:border-[#f87171]/50 focus:ring-1 focus:ring-[#f87171]/30 text-white p-2.5 text-sm outline-none focus:border-[#f87171] rounded transition-all w-full cursor-pointer">
                        <option>INFO</option>
                        <option>WARN</option>
                        <option>DEBUG</option>
                        <option>TRACE</option>
                      </select>
                    </div>
                    <div className="bg-[#0f0f1a] border border-[#1e1e2e] p-3 rounded flex justify-between items-center opacity-60">
                      <div className="flex flex-col pr-2">
                        <div className="text-[10px] font-bold text-white flex items-center gap-1.5">
                          Mock Live Data
                        </div>
                        <div className="text-[8px] text-[#94a3b8] mt-0.5">Inject fake ticks for UI testing.</div>
                      </div>
                      <div className="relative inline-block w-8 h-4 rounded-full bg-white/10 cursor-pointer border border-[#1e1e2e] shrink-0">
                        <div className="absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-[#52525b] transition-all"></div>
                      </div>
                    </div>
                  </div>
                </CollapsiblePanel>

              </div>
            </div>
          </div>
        </GlassPanel>
      </form>
    </div>
  );
}
