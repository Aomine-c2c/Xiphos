"use client";

import React, { useEffect, useState } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { MessageSquare, Radio, ShieldCheck } from "lucide-react";

export default function Header({ onVincentToggle }: { onVincentToggle: () => void }) {
  const { apiLatency, mt5Connected } = useTradingStore();
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC",
        })
      );
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className="h-10 bg-[#0f0f1a] border-b border-[#1e1e2e] flex items-center justify-between px-4 select-none shrink-0 z-10">
      <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-[#52525b]">
        Xiphos Trading System
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${mt5Connected ? "bg-[#4ade80]" : "bg-[#f87171]"}`} />
          <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">MT5</span>
        </div>
        <div className="w-px h-3.5 bg-[#1e1e2e]" />
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
          <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">Risk On</span>
        </div>
        <div className="w-px h-3.5 bg-[#1e1e2e]" />
        <div className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-[#52525b]" />
          <span className="text-[10px] font-mono text-[#52525b]">{apiLatency}ms</span>
        </div>
        <div className="w-px h-3.5 bg-[#1e1e2e]" />
        <span className="text-[10px] font-mono text-[#52525b]">{time} UTC</span>
        <div className="w-px h-3.5 bg-[#1e1e2e]" />
        <button
          id="vincent-toggle-btn"
          onClick={onVincentToggle}
          title="Open Vincent AI"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#1e1e2e] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.08)] transition-all duration-150 cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#8b5cf6]" />
          <span className="text-[10px] font-sans font-medium text-[#8b5cf6] uppercase tracking-widest">Vincent</span>
        </button>
      </div>
    </header>
  );
}
