"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTradingStore } from "../store/useTradingStore";
import { MessageSquare, AlertTriangle, ShieldCheck, Award, TrendingUp } from "lucide-react";

type ChatTabType = "CONSOLE" | "ANALYSIS" | "RECOMMENDATIONS" | "RISK";

export default function ChatPanel() {
  const { chatMessages, sendChatMessage, marketWatch, positions } = useTradingStore();
  const [activeTab, setActiveTab] = useState<ChatTabType>("CONSOLE");
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(inputText);
    setInputText("");
  };

  const triggerShortcut = (text: string) => {
    sendChatMessage(text);
  };

  const getTabClass = (tab: ChatTabType) => {
    const base = "flex-1 py-2 text-center border-b font-black text-[9px] tracking-wider transition-all cursor-pointer uppercase";
    if (activeTab === tab) {
      return `${base} border-xiphos-blue text-xiphos-blue bg-[#070b14]/50`;
    }
    return `${base} border-transparent text-[#6f7e90] hover:text-white`;
  };

  // Evolve Typography: Title +40% (text-[11px] -> text-[15px])
  // Section Headers +30% (text-[10px] -> text-[13px])
  return (
    <div className="w-full h-full bg-[#0E1525] border border-slate-900/80 flex flex-col font-mono select-none overflow-hidden">
      
      {/* Header (+40% scaled: text-[15px]) */}
      <div className="flex-shrink-0 p-2.5 border-b border-slate-950 flex items-center bg-[#0a101b]/40">
        <span className="text-[15px] font-black text-xiphos-blue uppercase tracking-widest flex items-center gap-1.5">
          <Award className="h-4 w-4 text-xiphos-blue" />
          VINCENT CHIEF TRADING OFFICER (CTO) PANEL
        </span>
      </div>

      {/* Tabs Selector Row */}
      <div className="flex bg-[#0a101b]/60 border-b border-slate-950/80">
        <div onClick={() => setActiveTab("CONSOLE")} className={getTabClass("CONSOLE")}>CONSOLE</div>
        <div onClick={() => setActiveTab("ANALYSIS")} className={getTabClass("ANALYSIS")}>ANALYSIS</div>
        <div onClick={() => setActiveTab("RECOMMENDATIONS")} className={getTabClass("RECOMMENDATIONS")}>CTO RECS</div>
        <div onClick={() => setActiveTab("RISK")} className={getTabClass("RISK")}>RISK ALERTS</div>
      </div>

      {/* Main View Area based on Selected Tab */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        
        {/* Tab 1: COMMAND CONSOLE (Chat feed) */}
        {activeTab === "CONSOLE" && (
          <div className="flex-1 min-h-0 flex overflow-hidden">
            {/* Chat Messages */}
            <div
              ref={scrollRef}
              className="flex-1 p-2.5 overflow-y-auto space-y-2 bg-[#070B14]/40"
            >
              {chatMessages.slice(-2).map((msg, i) => {
                const isVincent = msg.sender === "vincent";
                return (
                  <div key={i} className="grid grid-cols-12 gap-2 text-[11px] items-start">
                    <div className="col-span-3 flex items-center gap-1 text-[#6f7e90] font-black uppercase text-[9px] truncate">
                      {isVincent ? (
                        <span className="text-xiphos-blue">CTO Vincent</span>
                      ) : (
                        <span>OPERATOR</span>
                      )}
                    </div>
                    <div className="col-span-8">
                      <div className={`p-2 rounded-sm text-[11px] leading-relaxed border ${
                        isVincent
                          ? "bg-[#0A101B] border-slate-900 text-white/95"
                          : "bg-[#0d1624]/60 border-slate-900/60 text-[#8e9aa8]"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                    <div className="col-span-1 text-right text-[8px] text-[#425062] pt-1.5 font-bold">
                      {msg.timestamp}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cyborg image block */}
            <div className="w-[80px] shrink-0 border-l border-slate-900/50 bg-[#070B14]/40 relative overflow-hidden flex items-end">
              <img
                src="/cyborg.png"
                alt="Vincent CTO AI"
                className="w-full h-full object-cover opacity-85 object-center"
              />
            </div>
          </div>
        )}

        {/* Tab 2: LIVE MARKET ANALYSIS */}
        {activeTab === "ANALYSIS" && (
          <div className="flex-1 p-3.5 bg-[#070B14]/40 overflow-y-auto space-y-3 text-[10.5px] text-[#8e9aa8]">
            <span className="text-[13px] text-white font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              LIVE MARKET INTELLIGENCE REPORT
            </span>
            <div className="space-y-2">
              <div className="p-2 border border-slate-900 bg-[#0E1525]/50 rounded-sm">
                <span className="text-xiphos-blue font-black block uppercase text-[9.5px]">MA FAN STRUCTURES</span>
                <p className="text-white/80 leading-relaxed mt-0.5">
                  M30 alignments show EURUSD and XAUUSD holding strong bullish momentum. Prices reside comfortably above the EMA13/EMA50 channels.
                </p>
              </div>
              <div className="p-2 border border-slate-900 bg-[#0E1525]/50 rounded-sm">
                <span className="text-xiphos-blue font-black block uppercase text-[9.5px]">CORRELATION PROFILE</span>
                <p className="text-white/80 leading-relaxed mt-0.5">
                  Precious metals group (XAU/XAG) holds 89% correlation. Currency group (EUR/GBP) holds 92% correlation. Cross-category correlation is negligible.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: CTO RECOMMENDATIONS */}
        {activeTab === "RECOMMENDATIONS" && (
          <div className="flex-1 p-3.5 bg-[#070B14]/40 overflow-y-auto space-y-3 text-[10.5px] text-[#8e9aa8]">
            <span className="text-[13px] text-white font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              CTO ADVISORY DIRECTIVE
            </span>
            <div className="space-y-2.5">
              <div className="p-2.5 border border-emerald-950/60 bg-[#00D26A]/5 rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-[#00D26A] font-black uppercase block text-[9.5px]">DIRECTIVE #1: EURUSD BUY</span>
                  <p className="text-white/85 text-[10px] mt-0.5">Limit at 1.08900 | TP 1.09200 | SL 1.08230</p>
                </div>
                <span className="px-2 py-0.5 border border-[#00D26A]/45 text-[#00D26A] bg-[#00D26A]/5 text-[8.5px] font-black uppercase rounded-sm">
                  ACTIVE
                </span>
              </div>
              <div className="p-2.5 border border-xiphos-blue/40 bg-[#00A8FF]/5 rounded-sm flex items-center justify-between">
                <div>
                  <span className="text-xiphos-blue font-black uppercase block text-[9.5px]">DIRECTIVE #2: XAUUSD BUY</span>
                  <p className="text-white/85 text-[10px] mt-0.5">Engage Runner target | Entry 2408.20 | TP 2450.00</p>
                </div>
                <span className="px-2 py-0.5 border border-xiphos-blue/45 text-xiphos-blue bg-[#00A8FF]/5 text-[8.5px] font-black uppercase rounded-sm">
                  SECURED
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: RISK ALERTS */}
        {activeTab === "RISK" && (
          <div className="flex-1 p-3.5 bg-[#070B14]/40 overflow-y-auto space-y-3 text-[10.5px] text-[#8e9aa8]">
            <span className="text-[13px] text-[#FFB020] font-black uppercase tracking-wider block border-b border-slate-950 pb-1.5">
              RISK MITIGATION ALERTS
            </span>
            <div className="space-y-2">
              <div className="p-2 border border-red-950/45 bg-[#FF4D4D]/5 rounded-sm flex items-center gap-2.5 text-white/90">
                <AlertTriangle className="h-4 w-4 text-[#FF4D4D]" />
                <div>
                  <span className="text-[#FF4D4D] font-black block uppercase text-[9.5px]">RISK SLOTS CONGESTION</span>
                  <p className="text-[10px] leading-relaxed mt-0.5">
                    Portfolio is utilizing 4 of 4 maximum risk-bearing trade slots. New signal entries are locked.
                  </p>
                </div>
              </div>
              <div className="p-2 border border-amber-950/40 bg-[#FFB020]/5 rounded-sm flex items-center gap-2.5 text-white/90">
                <AlertTriangle className="h-4 w-4 text-[#FFB020]" />
                <div>
                  <span className="text-[#FFB020] font-black block uppercase text-[9.5px]">CORRELATION EXCLUSION</span>
                  <p className="text-[10px] leading-relaxed mt-0.5">
                    GBPUSD execution blocked. EURUSD holds major risk allocation. Correlation coefficient exceeds safety limits.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Console Input & Shortcuts: Only visible in Chat Console Tab */}
      {activeTab === "CONSOLE" && (
        <>
          {/* Quick Commands (+30% scaled section header: text-[13px]) */}
          <div className="flex-shrink-0 px-3 py-2 border-t border-slate-950/60 bg-[#0a101b]/20 flex gap-2 overflow-x-auto text-[9.5px] font-black tracking-wider">
            <button
              onClick={() => triggerShortcut("Explain EURUSD entry decision")}
              className="px-2.5 py-1 border border-slate-800 hover:border-xiphos-blue/40 text-[#8e9aa8] hover:text-[#00A8FF] rounded-sm transition-all cursor-pointer whitespace-nowrap bg-[#070B14]"
            >
              [EXPLAIN ENTRY]
            </button>
            <button
              onClick={() => triggerShortcut("Explain GBPUSD correlation block")}
              className="px-2.5 py-1 border border-slate-800 hover:border-xiphos-blue/40 text-[#8e9aa8] hover:text-[#00A8FF] rounded-sm transition-all cursor-pointer whitespace-nowrap bg-[#070B14]"
            >
              [EXPLAIN BLOCK]
            </button>
          </div>

          <form onSubmit={handleSend} className="flex-shrink-0 p-2.5 border-t border-slate-950 flex gap-2 bg-[#0a101b]/60">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Query Vincent CTO..."
              className="flex-1 bg-[#070B14] border border-slate-900 focus:border-xiphos-blue/50 text-[11px] text-white px-3 py-2 outline-none rounded-sm"
            />
            <button
              type="submit"
              className="p-2 bg-[#0A101B] border border-slate-900 hover:border-xiphos-blue/30 text-xiphos-blue flex items-center justify-center rounded-sm transition-all cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </form>
        </>
      )}

    </div>
  );
}
