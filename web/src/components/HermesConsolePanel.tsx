"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { X, Terminal, Zap, ChevronRight, Hash, Code, Loader2, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HermesConsolePanelProps { 
  isOpen: boolean; 
  onClose: () => void; 
}

const COMMANDS = ["scan", "adapt", "execute", "simulate", "forecast", "report", "train", "help"];

type LogEntry = {
  id: string;
  type: "command" | "response" | "system";
  content: string;
  timestamp: string;
};

const TypewriterText = ({ text, speed = 10, onComplete }: { text: string; speed?: number; onComplete?: () => void }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return <span>{displayedText}</span>;
};

export default function HermesConsolePanel({ isOpen, onClose }: HermesConsolePanelProps) {
  const [input, setInput] = useState("");
  const [ghostText, setGhostText] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", type: "system", content: "Hermes Console v4.2 Online. AI Swarm ready.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  const endOfLogsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      inputRef.current?.focus();
    }
  }, [logs, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Handle Autocomplete Ghost Text
  useEffect(() => {
    if (!input) {
      setGhostText("");
      return;
    }
    const match = COMMANDS.find(cmd => cmd.startsWith(input.toLowerCase()));
    if (match) {
      setGhostText(input + match.slice(input.length));
    } else {
      setGhostText("");
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      if (ghostText) {
        setInput(ghostText);
        setGhostText("");
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[history.length - 1 - nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setInput(history[history.length - 1 - prevIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput("");
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleExecute();
    }
  };

  const generateMockResponse = (cmd: string) => {
    const baseCmd = cmd.toLowerCase().split(" ")[0];
    switch (baseCmd) {
      case "scan": return "Initiating deep market scan. Analyzing 5,420 assets for liquidity pockets...\n[Result]: Found 3 anomalies in EUR/USD.";
      case "adapt": return "Running evolutionary algorithm. Adjusting logic weights.\n[Status]: Strategy adapted. Expected edge increased by 2.4%.";
      case "execute": return "Executing payload.\n{ 'status': 'filled', 'asset': 'BTC', 'size': 0.5 }";
      case "simulate": return "Starting Monte Carlo simulation (10,000 paths).\n[Result]: 82% probability of success. Max Drawdown: 2.1%.";
      case "forecast": return "Projecting short-term volatility.\n[Warning]: High expected volatility at 14:30 GMT due to CPI release.";
      case "report": return "Generating PnL and risk exposure report.\n[Done]: Report mailed to admins.";
      case "train": return "Retraining Neural Engine on last 24h data.\n[Done]: Model accuracy improved to 94.2%.";
      case "help": return "Available commands:\n- scan: Search markets for setups\n- adapt: Force strategy evolution\n- execute: Deploy capital\n- simulate: Run Monte Carlo\n- forecast: Project volatility\n- report: Generate metrics\n- train: Update model weights";
      default: return `Command not recognized: '${baseCmd}'. Type 'help' for available commands.`;
    }
  };

  const handleExecute = () => {
    if (!input.trim() || isProcessing) return;

    const cmd = input.trim();
    setHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    
    const newLogCmd: LogEntry = {
      id: Date.now().toString(),
      type: "command",
      content: cmd,
      timestamp: new Date().toLocaleTimeString()
    };

    setLogs(prev => [...prev, newLogCmd]);
    setInput("");
    setGhostText("");
    setIsProcessing(true);

    setTimeout(() => {
      const response = generateMockResponse(cmd);
      const newLogRes: LogEntry = {
        id: (Date.now() + 1).toString(),
        type: "response",
        content: response,
        timestamp: new Date().toLocaleTimeString()
      };
      setLogs(prev => [...prev, newLogRes]);
      setIsProcessing(false);
    }, 800 + Math.random() * 1000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.aside
          key="hermes-console-panel"
          initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-16 bottom-0 w-[400px] bg-[#07070c] border-l border-[#1e1e2e] z-50 flex flex-col shadow-2xl font-mono"
        >
          {/* Header */}
          <div className="h-10 flex items-center justify-between px-4 border-b border-[#1e1e2e] shrink-0 bg-[#0a0a10]">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#8b5cf6]" />
              <span className="text-[10px] font-bold text-[#e8e8f0] uppercase tracking-widest">Hermes Console</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]"></span>
                </span>
                <span className="text-[9px] text-[#4ade80] uppercase tracking-wider font-bold">Connected</span>
              </div>
              <button onClick={onClose} aria-label="Close Console panel"
                className="w-6 h-6 flex items-center justify-center rounded text-[#94a3b8] hover:text-[#e8e8f0] hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-[#050508] relative">
            
            <div className="absolute inset-0 pointer-events-none" 
              style={{
                backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.03) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            />

            <div className="space-y-4 relative z-10">
              {logs.map((log) => (
                <div key={log.id} className="text-[11px] leading-relaxed">
                  {log.type === "system" && (
                    <div className="flex items-start gap-2 text-[#94a3b8]">
                      <Hash className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-50" />
                      <div>
                        <span className="opacity-50">[{log.timestamp}]</span>{" "}
                        <span className="text-[#a78bfa]">{log.content}</span>
                      </div>
                    </div>
                  )}

                  {log.type === "command" && (
                    <div className="flex items-start gap-2 text-[#e8e8f0]">
                      <ChevronRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#f59e0b]" />
                      <div>
                        <span className="font-bold">{log.content}</span>
                      </div>
                    </div>
                  )}

                  {log.type === "response" && (
                    <div className="flex items-start gap-2 text-[#4ade80] pl-5">
                      <div className="whitespace-pre-wrap">
                        <TypewriterText text={log.content} speed={15} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex items-center gap-2 text-[#8b5cf6] pl-5 text-[11px]">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Processing...</span>
                </div>
              )}
              
              <div ref={endOfLogsRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-[#1e1e2e] bg-[#0a0a10] shrink-0">
            <div className="flex items-center gap-2 bg-[#0f0f1a] border border-[#1e1e2e] rounded-md px-3 py-2 focus-within:border-[#8b5cf6]/50 transition-colors relative">
              <ChevronRight className="w-4 h-4 text-[#8b5cf6]" />
              
              <div className="relative flex-1 flex items-center">
                {/* Ghost Text */}
                {ghostText && (
                  <span className="absolute left-0 top-0 text-[11px] text-[#52525b] pointer-events-none">
                    {ghostText}
                  </span>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isProcessing}
                  spellCheck={false}
                  autoComplete="off"
                  className="w-full bg-transparent text-[11px] text-[#e8e8f0] outline-none disabled:opacity-50 relative z-10"
                />
              </div>

              {ghostText && (
                <span className="text-[9px] text-[#52525b] uppercase tracking-wider hidden sm:block">
                  Press Tab
                </span>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
