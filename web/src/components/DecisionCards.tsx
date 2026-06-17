"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Check, ShieldAlert, Cpu } from "lucide-react";

export default function DecisionCards() {
  const { gates, sendCommand } = useTradingStore();

  const handleEngage = () => {
    alert("Signal engaged. Dispatched order execution package to direct broker link.");
    sendCommand("force_cycle");
  };

  const handleDismiss = () => {
    alert("Signal dismissed. Purging current cycle candidate.");
  };

  return (
    <div className="bg-[#0E1525] border border-slate-900/80 rounded-sm flex flex-col overflow-hidden font-mono select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-950 flex items-center bg-[#0a101b]/40">
        <span className="text-[11px] font-black text-xiphos-blue uppercase tracking-widest">
          DYNAMIC DECISION CARD
        </span>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-4 bg-[#070B14]/30">
        
        {/* Core signal header */}
        <div className="flex justify-between items-start border-b border-slate-950 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-white">EURUSD</span>
              <span className="text-[9px] bg-[#00D26A] text-black font-black px-2 py-0.5 rounded-sm">
                BUY
              </span>
            </div>
            <span className="text-[9px] text-[#425062] font-bold">
              TRIGGER TIME: <span className="text-white">14:30:00</span>
            </span>
          </div>

          <div className="text-right space-y-1">
            <span className="text-[10px] text-[#8e9aa8] uppercase font-bold block leading-none">DISTANCE</span>
            <span className="text-xl font-black text-[#00A8FF] glow-blue leading-none">
              715 <span className="text-[10px] text-[#8e9aa8] font-bold">pts</span>
            </span>
          </div>
        </div>

        {/* Gate Status Checklist */}
        <div className="space-y-2">
          <span className="text-[9px] text-[#6f7e90] font-black uppercase tracking-wider block">
            GATES SYSTEM INTEGRITY
          </span>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 1, name: "RISK SLOTS", status: "PASS", color: "#00D26A" },
              { id: 2, name: "CORRELATION", status: "PASS", color: "#00D26A" },
              { id: 3, name: "FAN ALIGNMENT", status: "PASS", color: "#00D26A" },
              { id: 4, name: "PRIORITY RANK", status: "PASS", color: "#00D26A" }
            ].map((gate) => (
              <div key={gate.id} className="flex items-center justify-between border border-slate-950 p-2 rounded-sm bg-slate-950/20 text-[10px]">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#00A8FF] font-black text-[8px]">G{gate.id}</span>
                  <span className="text-white font-bold">{gate.name}</span>
                </div>
                <span className="text-[#00D26A] font-black text-[9px] flex items-center gap-0.5">
                  <Check className="h-3 w-3" /> PASS
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 pt-1 border-t border-slate-950">
          <button
            onClick={handleEngage}
            className="flex-1 py-2 bg-[#00D26A] hover:bg-emerald-400 text-black text-[10px] font-black tracking-widest uppercase rounded-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            ENGAGE TARGET
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 py-2 border border-[#FF4D4D]/40 hover:bg-[#FF4D4D]/10 text-[#FF4D4D] text-[10px] font-black tracking-widest uppercase rounded-sm transition-all flex items-center justify-center gap-1 cursor-pointer"
          >
            DISMISS SIGNAL
          </button>
        </div>

      </div>
    </div>
  );
}
