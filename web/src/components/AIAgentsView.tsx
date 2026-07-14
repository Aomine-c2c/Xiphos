"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, Cpu, BrainCircuit, ScanSearch, ShieldAlert, Target,
  Activity, Terminal, Send, ChevronRight, Zap, Orbit
} from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";

type Agent = {
  id: string;
  name: string;
  role: string;
  icon: React.ElementType;
  color: string;
  status: "ACTIVE" | "ANALYZING" | "IDLE" | "EXECUTING";
  cpu: number;
  memory: number;
  tasks: number;
  goal: string;
  confidence: number;
  timeline: number[];
};

const INITIAL_AGENTS: Agent[] = [
  { id: "hermes", name: "HERMES", role: "EXECUTION CORE", icon: Target, color: "#f59e0b", status: "IDLE", cpu: 12, memory: 45, tasks: 0, goal: "Awaiting Order Fulfillment", confidence: 99.9, timeline: [10, 15, 12, 10, 20, 15, 10] },
  { id: "athena", name: "ATHENA", role: "LOGIC SYNTHESIS", icon: BrainCircuit, color: "#8b5cf6", status: "ANALYZING", cpu: 85, memory: 72, tasks: 12, goal: "Correlating multi-timeframe divergence", confidence: 84.5, timeline: [40, 60, 55, 80, 85, 75, 85] },
  { id: "argus", name: "ARGUS", role: "MARKET SURVEILLANCE", icon: ScanSearch, color: "#4cc9f0", status: "ACTIVE", cpu: 65, memory: 90, tasks: 450, goal: "Scanning top 500 equities for liquidity gaps", confidence: 92.1, timeline: [60, 65, 60, 65, 60, 65, 65] },
  { id: "apollo", name: "APOLLO", role: "RISK ORACLE", icon: ShieldAlert, color: "#f87171", status: "ACTIVE", cpu: 42, memory: 38, tasks: 4, goal: "Simulating drawdowns on live exposure", confidence: 97.4, timeline: [20, 25, 40, 35, 45, 42, 42] },
  { id: "atlas", name: "ATLAS", role: "PORTFOLIO BALANCE", icon: Orbit, color: "#4ade80", status: "ANALYZING", cpu: 55, memory: 60, tasks: 2, goal: "Rebalancing exposure across USD pairs", confidence: 88.0, timeline: [30, 35, 40, 50, 55, 60, 55] },
];

export default function AIAgentsView() {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [missionInput, setMissionInput] = useState("");
  const [messages, setMessages] = useState<{id: number, sender: string, text: string, color: string, timestamp: string}[]>([
    { id: 1, sender: "SYSTEM", text: "Swarm Intelligence Hub initialized. Agents online.", color: "#4ade80", timestamp: new Date(Date.now() - 10000).toLocaleTimeString() }
  ]);
  
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Simulate telemetry and random communication
  useEffect(() => {
    const interval = setInterval(() => {
      // Fluctuate metrics
      setAgents(prev => prev.map(a => {
        const newCpu = Math.max(5, Math.min(100, a.cpu + (Math.random() * 20 - 10)));
        const newTimeline = [...a.timeline.slice(1), newCpu];
        return { ...a, cpu: newCpu, timeline: newTimeline };
      }));

      // Random chatter
      if (Math.random() > 0.7) {
        const chatterAgents = INITIAL_AGENTS.filter(a => a.status !== "IDLE");
        if (chatterAgents.length > 0) {
          const sender = chatterAgents[Math.floor(Math.random() * chatterAgents.length)];
          const chatLog = [
            `Detected localized volatility clustering in EUR/USD.`,
            `Processing new datastream from Binance WebSockets.`,
            `Recalculating VaR threshold, stand by.`,
            `Anomaly detected in volume profile. Flagging for Athena.`,
            `Optimizing routing path to minimize slippage.`
          ];
          setMessages(prev => [...prev, {
            id: Date.now(),
            sender: sender.name,
            text: chatLog[Math.floor(Math.random() * chatLog.length)],
            color: sender.color,
            timestamp: new Date().toLocaleTimeString()
          }].slice(-50));
        }
      }
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAssignMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!missionInput.trim()) return;
    
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: "OPERATOR",
      text: missionInput,
      color: "#ffffff",
      timestamp: new Date().toLocaleTimeString()
    }]);

    // Mock agent response
    setTimeout(() => {
      const targetAgent = agents.find(a => missionInput.toUpperCase().includes(a.name)) || agents[1]; // default to Athena
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: targetAgent.name,
        text: `Mission acknowledged. Re-prioritizing tasks and allocating compute...`,
        color: targetAgent.color,
        timestamp: new Date().toLocaleTimeString()
      }]);
    }, 1000);

    setMissionInput("");
  };

  return (
    <GlassPanel className="flex flex-col w-full h-full font-sans select-none overflow-hidden p-0 animate-in fade-in" noOverflowHidden>
      <PageHeader title="AUTONOMOUS AGENTS" icon={Bot} />

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-[#05050a]">
        
        {/* Agent Roster Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {agents.map(agent => (
              <GlassCard 
                key={agent.id}
                onClick={() => setSelectedAgent(agent.id === selectedAgent ? null : agent.id)}
                className={`p-5 flex flex-col gap-4 border cursor-pointer transition-all duration-300 relative overflow-hidden bg-[#09090e]/90
                  ${selectedAgent === agent.id ? "border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.2)]" : "border-[#1e1e2e] hover:border-[#3f3f46]"}
                `}
              >
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#05050a] border border-[#1e1e2e] shadow-[0_0_10px_currentColor]" style={{ color: agent.color }}>
                      <agent.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold tracking-widest text-white">{agent.name}</h3>
                      <p className="text-[10px] text-[#94a3b8] font-mono tracking-wider">{agent.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#05050a] border border-[#1e1e2e]">
                    <div className={`w-1.5 h-1.5 rounded-full ${agent.status === 'IDLE' ? 'bg-[#52525b]' : 'bg-[#4ade80] animate-pulse'}`} />
                    <span className="text-[9px] font-mono font-bold tracking-widest text-[#94a3b8]">{agent.status}</span>
                  </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-3 gap-4 border-y border-[#1e1e2e] py-4 my-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-[#52525b] font-mono uppercase tracking-widest">CPU LOAD</span>
                    <div className="flex items-end gap-2">
                      <span className="text-lg font-bold font-mono text-white">{Math.round(agent.cpu)}%</span>
                      {/* Mini sparkline */}
                      <svg className="w-full h-4 mb-1" viewBox="0 0 70 20" preserveAspectRatio="none">
                        <polyline 
                          points={agent.timeline.map((val, i) => `${i * 10},${20 - (val / 100) * 20}`).join(" ")}
                          fill="none" stroke={agent.color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-[#52525b] font-mono uppercase tracking-widest">MEMORY ALLOC</span>
                    <span className="text-lg font-bold font-mono text-white">{agent.memory}%</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[9px] text-[#52525b] font-mono uppercase tracking-widest">CONFIDENCE</span>
                    <span className="text-lg font-bold font-mono" style={{ color: agent.color }}>{agent.confidence.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Current Goal */}
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-[#52525b] font-mono uppercase tracking-widest">CURRENT OBJECTIVE</span>
                    <span className="text-[9px] text-[#a78bfa] font-mono font-bold">{agent.tasks} ACTIVE TASKS</span>
                  </div>
                  <div className="p-3 rounded bg-[#05050a] border border-[#1e1e2e]">
                    <p className="text-xs font-mono text-white/80 leading-relaxed truncate">{agent.goal}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Swarm Intelligence Hub (Terminal) */}
        <div className="w-full lg:w-96 border-l border-[#1e1e2e] bg-[#09090e] flex flex-col z-10 shrink-0">
          <div className="p-4 border-b border-[#1e1e2e] flex items-center justify-between bg-[#05050a]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-[10px] font-bold tracking-widest text-[#94a3b8] uppercase">Swarm Intel Hub</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse"></span>
              <span className="text-[9px] font-mono text-[#52525b]">LIVE</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 flex flex-col gap-3 font-mono text-xs">
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold tracking-widest" style={{ color: msg.color }}>{msg.sender}</span>
                  <span className="text-[9px] text-[#52525b]">{msg.timestamp}</span>
                </div>
                <p className="text-[#94a3b8] leading-relaxed break-words pl-2 border-l border-[#1e1e2e]">
                  {msg.text}
                </p>
              </motion.div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>
          
          {/* Mission Assignment Input */}
          <div className="p-4 border-t border-[#1e1e2e] bg-[#05050a]">
            <form onSubmit={handleAssignMission} className="flex flex-col gap-2">
              <label className="text-[9px] font-bold tracking-widest text-[#a78bfa] uppercase flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> ASSIGN MISSION TO SWARM
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={missionInput}
                  onChange={(e) => setMissionInput(e.target.value)}
                  placeholder="e.g. 'Athena, run cross-asset correlation'"
                  className="w-full bg-[#09090e] border border-[#1e1e2e] rounded p-3 pr-10 text-xs font-mono text-white placeholder-[#52525b] focus:outline-none focus:border-[#8b5cf6] transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!missionInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#52525b] hover:text-[#a78bfa] disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </GlassPanel>
  );
}
