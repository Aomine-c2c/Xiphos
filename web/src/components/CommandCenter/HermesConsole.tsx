"use client";

import React, { useState, useRef, useEffect } from "react";
import { Terminal, Send } from "lucide-react";
import { TypewriterText } from "../ui/TypewriterText";

interface ConsoleLog {
  time: string;
  tag: "HERMES" | "ADAPT" | "EXECUTION" | "RISK" | "SYSTEM";
  text: string;
  color: string;
}

export function HermesConsole() {
  const [input, setInput] = useState("");
  const [logs, setLogs] = useState<ConsoleLog[]>([
    { time: "10:42:10", tag: "HERMES", text: "Market scan complete. 12 opportunities identified.", color: "text-[#4ade80]" },
    { time: "10:42:12", tag: "ADAPT", text: "Adaptation cycle complete. New pattern recognized.", color: "text-[#a78bfa]" },
    { time: "10:42:14", tag: "EXECUTION", text: "Executing optimal trades...", color: "text-[#38bdf8]" },
    { time: "10:42:16", tag: "RISK", text: "Risk parameters within safe limits.", color: "text-[#e8e8f0]" },
    { time: "10:42:18", tag: "SYSTEM", text: "Mahoraga engine operating at peak efficiency.", color: "text-[#4ade80]" },
    { time: "10:42:20", tag: "HERMES", text: "All systems operational. Standing by for next cycle.", color: "text-[#4ade80]" },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const pills = ["/status", "/scan", "/adapt", "/report", "/optimize", "/help"];

  const handleSend = (cmdText: string) => {
    if (!cmdText.trim()) return;

    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    
    // Add user message
    const userLog: ConsoleLog = {
      time: timeStr,
      tag: "SYSTEM",
      text: `> EXECUTED: ${cmdText}`,
      color: "text-[#f59e0b]"
    };

    // Synthesize Hermes response based on command
    let responseText = "Command processed successfully.";
    if (cmdText.startsWith("/help")) {
      responseText = "Available commands: /status (Check system), /scan (Scan markets), /adapt (Trigger adaptation cycle).";
    } else if (cmdText.startsWith("/status")) {
      responseText = "System: OPTIMAL. Latency: 12ms. MT5: CONNECTED. Core: ACTIVE.";
    } else if (cmdText.startsWith("/scan")) {
      responseText = "Scanning 274 instruments... Complete. No new divergence detected.";
    } else if (cmdText.startsWith("/adapt")) {
      responseText = "Triggered adaptation sequence. Re-compiling state constraints...";
    }

    const hermesLog: ConsoleLog = {
      time: timeStr,
      tag: "HERMES",
      text: responseText,
      color: "text-[#a78bfa]"
    };

    setLogs(prev => [...prev, userLog, hermesLog]);
    setInput("");
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="flex flex-col gap-2 font-mono h-full">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[9px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#a78bfa]" />
          Hermes Console
        </h2>
        <button 
          onClick={() => setLogs([])}
          className="text-[8px] text-[#52525b] hover:text-[#e8e8f0] cursor-pointer tracking-wider font-bold"
        >
          CLEAR
        </button>
      </div>

      <div className="flex-1 bg-[#09090f] border border-[#151522] rounded-xl p-3 flex flex-col justify-between shadow-[0_0_10px_rgba(139,92,246,0.01)] min-h-[160px]">
        {/* LOG TERMINAL VIEW */}
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-2 mb-3 max-h-[85px]">
          {logs.map((log, idx) => (
            <div key={idx} className="text-[8px] leading-normal flex items-start gap-2 hover:bg-white/[0.01] px-1 py-0.5 rounded transition-colors">
              <span className="text-[#52525b] shrink-0 font-bold">[{log.time}]</span>
              <span className={`font-bold shrink-0 w-16 uppercase ${log.color}`}>
                [{log.tag}]
              </span>
              <span className={`${log.color} break-all`}>
                <TypewriterText text={log.text} speed={8} />
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>

        {/* INPUT AND SUGGESTIONS */}
        <div className="flex flex-col gap-2 shrink-0">
          {/* Pills */}
          <div className="flex items-center gap-1 overflow-x-auto custom-scrollbar-horizontal pb-1">
            {pills.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="px-2 py-0.5 bg-[#0f0f1a] hover:bg-[#8b5cf6]/10 border border-[#151522] hover:border-[#8b5cf6]/35 text-[7px] text-[#52525b] hover:text-[#a78bfa] font-bold rounded-lg cursor-pointer transition-all duration-200"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center bg-[#07070c] border border-[#151522] focus-within:border-[#8b5cf6]/50 rounded-xl overflow-hidden px-2.5 py-1.5 transition-all duration-200"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Hermes or type command..."
              className="flex-1 bg-transparent text-[8px] text-[#e8e8f0] font-mono outline-none border-none placeholder-[#52525b]"
            />
            <button 
              type="submit" 
              className="text-[#52525b] hover:text-[#a78bfa] cursor-pointer shrink-0 ml-1.5"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
