/* eslint-disable react/forbid-dom-props */
"use client";

import React, { useState } from "react";
import { MarketWatchItem } from "../store/types";
import TradingChart from "./TradingChart";
import NewsImpact from "./NewsImpact";
import { Activity, Maximize2, Minimize2 } from "lucide-react";

export default function AssetDeepDive({ asset }: { asset: MarketWatchItem }) {
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const isUp = asset.e13_dist > 0; // fallback to show color based on EMA dist

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 bg-[#0f0f1a] border border-[#1e1e2e] p-4 rounded-xl border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg flex items-center justify-center ${isUp ? 'bg-[#4ade80]/10' : 'bg-[#f87171]/10'}`}>
            <Activity className={`h-6 w-6 ${isUp ? 'text-[#4ade80]' : 'text-[#f87171]'}`} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white drop-shadow-md">{asset.symbol}</h1>
            <span className="text-xs text-[#94a3b8] font-bold uppercase tracking-widest">LIVE MARKET DATA</span>
          </div>
        </div>

        <div className="flex items-end gap-6 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">LIVE PRICE</span>
            <span className="text-xl font-semibold text-white">
              {asset.price.toFixed(asset.symbol.includes("USD") && !asset.symbol.startsWith("X") ? 5 : 3)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 min-h-0 flex gap-4">
        
        {/* Left Column: Chart */}
        <div className="flex-[0.7] flex flex-col gap-4 min-w-0">
          <div className="flex-1 min-h-0 bg-[#0f0f1a] border border-[#1e1e2e] p-4 rounded-xl border-[rgba(255,255,255,0.05)] relative flex flex-col">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <span className="px-3 py-1 bg-[rgba(11,15,23,0.8)] border border-[rgba(255,255,255,0.1)] rounded-md text-[10px] font-bold text-[#a78bfa] tracking-widest uppercase">
                INSTITUTIONAL M30
              </span>
            </div>
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsChartExpanded(true)}
                className="p-1.5 bg-[rgba(11,15,23,0.8)] border border-[rgba(255,255,255,0.1)] hover:border-[#8b5cf6] hover:text-[#a78bfa] text-[#94a3b8] rounded-md transition-colors"
                title="Expand Chart"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 pt-8 w-full">
              <TradingChart symbol={asset.symbol} timeframe="M30" />
            </div>
          </div>
        </div>

        {/* Right Column: Signals & News */}
        <div className="flex-[0.3] flex flex-col gap-4 min-w-0">
          <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl border-[rgba(255,255,255,0.05)] p-4 shrink-0">
            <h3 className="text-xs text-[#a78bfa] font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              MASTER SIGNAL
            </h3>
            
            <div className="flex justify-between items-center mt-2 p-3 bg-white/5 rounded-md border border-[#1e1e2e]">
              <span className="text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">CURRENT SIGNAL</span>
              <span className={`text-sm font-semibold tracking-widest px-2 py-1 rounded ${
                asset.signal === 'BUY' ? 'bg-[#4ade80]/20 text-[#4ade80]' : 
                asset.signal === 'SELL' ? 'bg-[#f87171]/20 text-[#f87171]' : 
                'bg-[#f59e0b]/20 text-[#f59e0b]'
              }`}>
                {asset.signal}
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">
                <span>E13 Dist</span>
                <span className={asset.e13_dist > 0 ? "text-[#4ade80]" : "text-[#f87171]"}>{asset.e13_dist.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">
                <span>E50 Dist</span>
                <span className={asset.e50_dist > 0 ? "text-[#4ade80]" : "text-[#f87171]"}>{asset.e50_dist.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] text-[#94a3b8] font-bold uppercase tracking-widest">
                <span>S200 Dist</span>
                <span className={asset.s200_dist > 0 ? "text-[#4ade80]" : "text-[#f87171]"}>{asset.s200_dist.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <NewsImpact symbol={asset.symbol} />
          </div>
        </div>

      </div>

      {/* Expanded Chart Overlay */}
      {isChartExpanded && (
        <div className="fixed inset-0 z-50 bg-[rgba(11,15,23,0.95)] backdrop-blur-md flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg flex items-center justify-center ${isUp ? 'bg-[#4ade80]/10' : 'bg-[#f87171]/10'}`}>
                <Activity className={`h-5 w-5 ${isUp ? 'text-[#4ade80]' : 'text-[#f87171]'}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-white drop-shadow-md">{asset.symbol}</h1>
                <span className="text-xs text-[#a78bfa] font-bold uppercase tracking-widest">INSTITUTIONAL M30</span>
              </div>
            </div>
            <button 
              onClick={() => setIsChartExpanded(false)}
              className="p-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-lg transition-colors text-white flex items-center gap-2 text-xs font-bold tracking-widest"
            >
              <Minimize2 className="h-4 w-4" /> COLLAPSE
            </button>
          </div>
          <div className="flex-1 min-h-0 bg-[#0f0f1a] border border-[#1e1e2e] p-4 rounded-xl border-[rgba(255,255,255,0.05)] relative">
            <div className="w-full h-full">
              <TradingChart symbol={asset.symbol} timeframe="M30" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
