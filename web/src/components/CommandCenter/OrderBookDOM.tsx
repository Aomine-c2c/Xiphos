"use client";

import React, { useEffect, useState } from "react";
import { AlignLeft, ArrowRight } from "lucide-react";

interface DOMLevel {
  price: number;
  volume: number;
  isAsk: boolean;
}

interface TapeEntry {
  id: string;
  price: number;
  size: number;
  time: string;
  isBuy: boolean;
}

export function OrderBookDOM({ activeSymbol, currentPrice }: { activeSymbol: string; currentPrice?: number }) {
  const [dom, setDom] = useState<DOMLevel[]>([]);
  const [tape, setTape] = useState<TapeEntry[]>([]);

  const basePrice = currentPrice || 1.1050; // Fallback

  // Simulate High-Frequency DOM updates
  useEffect(() => {
    const generateDOM = () => {
      const asks: DOMLevel[] = Array.from({ length: 8 }).map((_, i) => ({
        price: basePrice + (8 - i) * 0.0001,
        volume: Math.floor(Math.random() * 50) + 10,
        isAsk: true,
      }));
      const bids: DOMLevel[] = Array.from({ length: 8 }).map((_, i) => ({
        price: basePrice - (i + 1) * 0.0001,
        volume: Math.floor(Math.random() * 50) + 10,
        isAsk: false,
      }));
      setDom([...asks, ...bids]);
    };

    generateDOM();
    const interval = setInterval(generateDOM, 800);
    return () => clearInterval(interval);
  }, [basePrice]);

  // Simulate Execution Tape
  useEffect(() => {
    const pushTape = () => {
      const now = new Date();
      const isBuy = Math.random() > 0.5;
      const newEntry: TapeEntry = {
        id: Math.random().toString(36).substr(2, 9),
        price: basePrice + (Math.random() * 0.0002 - 0.0001),
        size: Math.floor(Math.random() * 5) + 1,
        time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`,
        isBuy
      };

      setTape(prev => [newEntry, ...prev].slice(0, 15));
    };

    const interval = setInterval(pushTape, 1200);
    return () => clearInterval(interval);
  }, [basePrice]);

  const maxVolume = Math.max(...dom.map(d => d.volume), 1);

  return (
    <div className="flex flex-col h-full bg-[#09090e] border border-[#1e1e2e] rounded-xl overflow-hidden font-mono">
      <div className="p-3 border-b border-[#1e1e2e] bg-[#0f0f1a] flex items-center justify-between">
        <span className="text-[10px] text-[#94a3b8] tracking-widest uppercase flex items-center gap-2">
          <AlignLeft className="w-3.5 h-3.5 text-[#f59e0b]" />
          Order Book (DOM)
        </span>
      </div>

      <div className="flex-1 overflow-hidden grid grid-cols-2 divide-x divide-[#1e1e2e]">
        {/* DOM */}
        <div className="flex flex-col h-full overflow-hidden">
          <div className="grid grid-cols-[1fr_auto] px-3 py-1.5 border-b border-[#1e1e2e] text-[8px] text-[#52525b] uppercase">
            <span>Price</span>
            <span>Size</span>
          </div>
          <div className="flex-1 overflow-hidden flex flex-col justify-center">
            {dom.map((level, i) => (
              <div key={i} className="relative grid grid-cols-[1fr_auto] px-3 py-[2px] items-center text-[10px]">
                <div 
                  className={`absolute top-0 right-0 h-full opacity-10 ${level.isAsk ? 'bg-[#f87171]' : 'bg-[#4ade80]'}`} 
                  style={{ width: `${(level.volume / maxVolume) * 100}%` }}
                />
                <span className={`z-10 ${level.isAsk ? 'text-[#f87171]' : 'text-[#4ade80]'}`}>
                  {level.price.toFixed(5)}
                </span>
                <span className="z-10 text-[#a1a1aa]">{level.volume}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tape */}
        <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0f]">
          <div className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-1.5 border-b border-[#1e1e2e] text-[8px] text-[#52525b] uppercase">
            <span>Time</span>
            <span>Price</span>
            <span>Vol</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {tape.map(t => (
              <div key={t.id} className="grid grid-cols-[auto_1fr_auto] gap-2 px-3 py-1 text-[9px] hover:bg-[#1e1e2e]/50 transition-colors">
                <span className="text-[#52525b]">{t.time}</span>
                <span className={`flex items-center gap-1 ${t.isBuy ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                  {t.isBuy ? <ArrowRight className="w-2.5 h-2.5 rotate-[-45deg]" /> : <ArrowRight className="w-2.5 h-2.5 rotate-[45deg]" />}
                  {t.price.toFixed(5)}
                </span>
                <span className="text-[#e8e8f0]">{t.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
