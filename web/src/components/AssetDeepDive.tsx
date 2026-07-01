/* eslint-disable react/forbid-dom-props */
"use client";

import React, { useState } from "react";
import { MarketWatchItem } from "../store/useTradingStore";
import TradingChart from "./TradingChart";
import NewsImpact from "./NewsImpact";
import { Activity, Target, Shield, Crosshair, Maximize2, Minimize2, Zap } from "lucide-react";

const StatBox = ({ label, value, icon, colorClass = "text-white" }: { label: string, value: string | number, icon?: React.ReactNode, colorClass?: string }) => (
  <div className="flex flex-col bg-[rgba(11,15,23,0.4)] p-3 rounded-md border border-[rgba(255,255,255,0.05)]">
    <span className="text-[9px] text-xiphos-muted font-bold tracking-widest uppercase mb-1 flex items-center gap-1">
      {icon}
      {label}
    </span>
    <span className={`text-base font-black ${colorClass}`}>{value}</span>
  </div>
);

export default function AssetDeepDive({ asset }: { asset: MarketWatchItem }) {
  const [isChartExpanded, setIsChartExpanded] = useState(false);
  const isUp = asset.change && !asset.change.startsWith("-");

  return (
    <div className="flex flex-col h-full overflow-hidden font-mono gap-4 animate-in fade-in slide-in-from-right-4 duration-300">
      
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 glass-panel p-4 rounded-xl border border-[rgba(255,255,255,0.05)]">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-lg flex items-center justify-center ${isUp ? 'bg-xiphos-emerald/10' : 'bg-xiphos-crimson/10'}`}>
            <Activity className={`h-6 w-6 ${isUp ? 'text-xiphos-emerald glow-emerald' : 'text-xiphos-crimson glow-crimson'}`} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white drop-shadow-md">{asset.symbol}</h1>
            <span className="text-xs text-xiphos-muted font-bold uppercase tracking-widest">{asset.category} • {asset.volume} VOL</span>
          </div>
        </div>

        <div className="flex items-end gap-6 text-right">
          <div className="flex flex-col">
            <span className="text-[10px] text-xiphos-muted font-bold uppercase tracking-widest">LIVE PRICE</span>
            <span className="text-3xl font-black text-white">
              {asset.price.toFixed(asset.symbol.includes("USD") && !asset.symbol.startsWith("X") ? 5 : 3)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-xiphos-muted font-bold uppercase tracking-widest">24H DELTA</span>
            <span className={`text-xl font-black ${isUp ? 'text-xiphos-emerald glow-emerald' : 'text-xiphos-crimson glow-crimson'}`}>
              {asset.change}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 min-h-0 flex gap-4">
        
        {/* Left Column: Chart & Zones */}
        <div className="flex-[0.7] flex flex-col gap-4 min-w-0">
          <div className="flex-[0.6] min-h-0 glass-panel rounded-xl border border-[rgba(255,255,255,0.05)] p-4 relative flex flex-col">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <span className="px-3 py-1 bg-[rgba(11,15,23,0.8)] border border-[rgba(255,255,255,0.1)] rounded-md text-[10px] font-bold text-xiphos-cyan tracking-widest uppercase">
                INSTITUTIONAL M30
              </span>
              {asset.fair_value_gaps && (
                <span className="px-3 py-1 bg-xiphos-gold/20 border border-xiphos-gold/40 rounded-md text-[10px] font-bold text-xiphos-gold tracking-widest uppercase glow-gold">
                  FVG DETECTED
                </span>
              )}
            </div>
            <div className="absolute top-4 right-4 z-10">
              <button 
                onClick={() => setIsChartExpanded(true)}
                className="p-1.5 bg-[rgba(11,15,23,0.8)] border border-[rgba(255,255,255,0.1)] hover:border-xiphos-cyan hover:text-xiphos-cyan text-xiphos-muted rounded-md transition-colors"
                title="Expand Chart"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 min-h-0 pt-8 w-full">
              <TradingChart symbol={asset.symbol} />
            </div>
          </div>

          <div className="flex-[0.4] min-h-0 grid grid-cols-2 grid-rows-1 gap-4">
             {/* Technical Metrics */}
             <div className="glass-panel min-h-0 rounded-xl border border-[rgba(255,255,255,0.05)] p-4 flex flex-col overflow-y-auto custom-scrollbar">
               <h3 className="text-xs text-xiphos-cyan font-bold tracking-widest uppercase mb-3 flex items-center gap-2 shrink-0">
                 <Target className="h-4 w-4" /> QUANTITATIVE METRICS
               </h3>
               <div className="grid grid-cols-2 gap-2">
                 <StatBox label="Spread" value={asset.spread} icon={<Zap className="h-3 w-3" />} />
                 <StatBox label="ATR" value={asset.atr} icon={<Activity className="h-3 w-3" />} />
                 <StatBox label="Trend" value={asset.trend} colorClass={asset.trend === "BULLISH" ? "text-xiphos-emerald" : asset.trend === "BEARISH" ? "text-xiphos-crimson" : "text-xiphos-gold"} />
                 <StatBox label="Volatility" value={asset.volatility} colorClass={asset.volatility === "HIGH" ? "text-xiphos-crimson" : "text-white"} />
                 <StatBox label="Market Struct" value={asset.market_structure} />
                 <StatBox label="Liquidity" value={asset.liquidity} />
               </div>
             </div>

             {/* Smart Money Zones */}
             <div className="glass-panel min-h-0 rounded-xl border border-[rgba(255,255,255,0.05)] p-4 flex flex-col overflow-y-auto custom-scrollbar">
               <h3 className="text-xs text-xiphos-cyan font-bold tracking-widest uppercase mb-3 flex items-center gap-2 shrink-0">
                 <Shield className="h-4 w-4" /> LIQUIDITY POOLS & ZONES
               </h3>
               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center bg-xiphos-crimson/10 border border-xiphos-crimson/20 p-2 rounded-md">
                   <span className="text-[10px] text-xiphos-crimson font-bold uppercase tracking-widest">Resistance</span>
                   <span className="text-sm font-black text-xiphos-crimson glow-crimson">{asset.resistance}</span>
                 </div>
                 <div className="flex justify-between items-center bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] p-2 rounded-md">
                   <span className="text-[10px] text-xiphos-muted font-bold uppercase tracking-widest flex flex-col">
                     <span>Smart Money</span>
                     <span className="text-[8px] opacity-50">Sell Side</span>
                   </span>
                   <span className="text-sm font-black text-white">{asset.smart_money_zones?.[1] || "-"}</span>
                 </div>
                 <div className="flex justify-between items-center bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] p-2 rounded-md">
                   <span className="text-[10px] text-xiphos-muted font-bold uppercase tracking-widest flex flex-col">
                     <span>Smart Money</span>
                     <span className="text-[8px] opacity-50">Buy Side</span>
                   </span>
                   <span className="text-sm font-black text-white">{asset.smart_money_zones?.[0] || "-"}</span>
                 </div>
                 <div className="flex justify-between items-center bg-xiphos-emerald/10 border border-xiphos-emerald/20 p-2 rounded-md">
                   <span className="text-[10px] text-xiphos-emerald font-bold uppercase tracking-widest">Support</span>
                   <span className="text-sm font-black text-xiphos-emerald glow-emerald">{asset.support}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: AI Bias & News */}
        <div className="flex-[0.3] flex flex-col gap-4 min-w-0">
          <div className="glass-panel rounded-xl border border-[rgba(255,255,255,0.05)] p-4 shrink-0">
            <h3 className="text-xs text-xiphos-cyan font-bold tracking-widest uppercase mb-4 flex items-center gap-2">
              <Crosshair className="h-4 w-4" /> AI PREDICTIVE ENGINE
            </h3>
            
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-[10px] font-bold text-xiphos-muted uppercase tracking-widest mb-1">
                  <span>AI Bias Direction</span>
                  <span className={asset.ai_bias > 0 ? "text-xiphos-emerald" : "text-xiphos-crimson"}>
                    {asset.ai_bias > 0 ? "BULLISH" : "BEARISH"} ({asset.ai_bias})
                  </span>
                </div>
                <div className="h-2 w-full bg-[rgba(11,15,23,0.8)] rounded-full overflow-hidden flex">
                  <div className="h-full bg-xiphos-crimson transition-all" style={{ width: `${Math.max(0, -asset.ai_bias)}%` }} />
                  <div className="h-full bg-xiphos-emerald transition-all" style={{ width: `${Math.max(0, asset.ai_bias)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-bold text-xiphos-muted uppercase tracking-widest mb-1">
                  <span>Setup Probability</span>
                  <span className="text-white">{asset.probability}%</span>
                </div>
                <div className="h-2 w-full bg-[rgba(11,15,23,0.8)] rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all bg-xiphos-cyan shadow-[0_0_10px_rgba(76,201,240,0.5)]" 
                    style={{ width: `${asset.probability}%` }} 
                  />
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 p-3 bg-white/5 rounded-md border border-white/10">
                <span className="text-[10px] text-xiphos-muted font-bold uppercase tracking-widest">Master Signal</span>
                <span className={`text-sm font-black tracking-widest px-2 py-1 rounded ${
                  asset.signal === 'BUY' ? 'bg-xiphos-emerald/20 text-xiphos-emerald glow-emerald' : 
                  asset.signal === 'SELL' ? 'bg-xiphos-crimson/20 text-xiphos-crimson glow-crimson' : 
                  'bg-xiphos-gold/20 text-xiphos-gold glow-gold'
                }`}>
                  {asset.signal}
                </span>
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
              <div className={`p-2 rounded-lg flex items-center justify-center ${isUp ? 'bg-xiphos-emerald/10' : 'bg-xiphos-crimson/10'}`}>
                <Activity className={`h-5 w-5 ${isUp ? 'text-xiphos-emerald glow-emerald' : 'text-xiphos-crimson glow-crimson'}`} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white drop-shadow-md">{asset.symbol}</h1>
                <span className="text-xs text-xiphos-cyan font-bold uppercase tracking-widest">INSTITUTIONAL M30</span>
              </div>
            </div>
            <button 
              onClick={() => setIsChartExpanded(false)}
              className="p-2 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] rounded-lg transition-colors text-white flex items-center gap-2 text-xs font-bold tracking-widest"
            >
              <Minimize2 className="h-4 w-4" /> COLLAPSE
            </button>
          </div>
          <div className="flex-1 min-h-0 glass-panel rounded-xl border border-[rgba(255,255,255,0.05)] p-4 relative">
             <div className="w-full h-full">
               <TradingChart symbol={asset.symbol} />
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
