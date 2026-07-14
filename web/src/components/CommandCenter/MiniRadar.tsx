"use client";

import React from "react";
import { Activity } from "lucide-react";
import { useTradingStore } from "../../store/useTradingStore";

const SYMBOLS = ["EURUSD", "XAUUSD", "GBPJPY", "USDJPY", "BTCUSD", "ETHUSD"];

export function MiniRadar({ activeSymbol, onSelect }: { activeSymbol: string, onSelect: (sym: string) => void }) {
  const { marketWatch } = useTradingStore();

  return (
    <div className="flex flex-col h-full bg-[#09090e] border border-[#1e1e2e] rounded-xl overflow-hidden">
      <div className="p-3 border-b border-[#1e1e2e] bg-[#0f0f1a] flex items-center justify-between">
        <span className="text-[10px] font-mono text-[#94a3b8] tracking-widest uppercase flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#38bdf8]" />
          Mini Radar
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-2">
        {SYMBOLS.map((sym) => {
          const isActive = activeSymbol === sym;
          const data = marketWatch.find(m => m.symbol === sym);
          const isUp = data ? data.e13_dist > 0 : Math.random() > 0.5;
          
          return (
            <button
              key={sym}
              onClick={() => onSelect(sym)}
              className={`p-3 rounded-lg border text-left transition-all ${
                isActive 
                  ? "bg-[#8b5cf6]/10 border-[#8b5cf6]/50 shadow-[0_0_10px_rgba(139,92,246,0.1)]" 
                  : "bg-[#0f0f1a] border-[#1e1e2e] hover:border-[#52525b]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold font-mono tracking-wide ${isActive ? 'text-[#e8e8f0]' : 'text-[#a1a1aa]'}`}>
                  {sym}
                </span>
                {data && (
                  <span className={`text-[10px] font-mono ${isUp ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                    {data.price.toFixed(5)}
                  </span>
                )}
              </div>
              
              {/* Fake sparkline representation */}
              <div className="h-4 w-full flex items-end gap-0.5 opacity-70">
                {Array.from({ length: 15 }).map((_, i) => {
                  const height = 20 + Math.random() * 80;
                  return (
                    <div 
                      key={i} 
                      className={`flex-1 ${isUp ? 'bg-[#4ade80]' : 'bg-[#f87171]'}`} 
                      style={{ height: `${height}%`, opacity: 0.3 + (i / 15) * 0.7 }}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
