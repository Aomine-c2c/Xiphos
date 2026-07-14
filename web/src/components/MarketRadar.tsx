"use client";

import React from "react";
import { useTradingStore } from "../store/useTradingStore";
import { Activity } from "lucide-react";

export default function MarketRadar() {
 const { marketWatch } = useTradingStore();

 const getDistColor = (dist: number) => {
 const d = Math.abs(dist);
 if (d > 500) return "text-[#f87171]";
 if (d > 200) return "text-[#f59e0b]";
 return "text-[#4ade80]";
 };

 const getSignalClass = (signal: string) => {
 if (signal === "BUY") return "bg-[#4ade80]/10 border-[#4ade80]/40 text-[#4ade80]";
 if (signal === "SELL") return "bg-[#f87171]/10 border-[#f87171]/40 text-[#f87171]";
 return "bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-[#94a3b8]";
 };



 // Evolve Typography: Title +40% (text-[17px] -> text-[21px])
 // Section Headers +30% (text-[15px] -> text-[17px])
 return (
 <div className="bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg flex flex-col overflow-hidden font-mono select-none h-full justify-between transition-all duration-300">
 
 {/* Title Header */}
 <div className="p-3 border-b border-[rgba(255,255,255,0.05)] flex items-center justify-between bg-[rgba(11,15,23,0.4)] shrink-0">
 <span className="text-sm font-semibold text-white uppercase tracking-widest flex items-center gap-2">
 <Activity className="h-4 w-4 text-[#a78bfa] animate-pulse" />
 <span>MA FAN DISTANCES</span>
 </span>
 </div>

 {/* Main List */}
 <div className="p-3 space-y-1 bg-[rgba(11,15,23,0.2)] flex-1 overflow-hidden flex flex-col justify-between">
 <div className="w-full overflow-x-hidden flex-1 min-h-0 custom-scrollbar overflow-y-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead>
 <tr className="border-b border-[rgba(255,255,255,0.05)] text-[#94a3b8] uppercase text-[10px] select-none tracking-widest bg-[rgba(11,15,23,0.4)]">
 <th className="p-2 font-semibold">SYMBOL</th>
 <th className="p-2 font-semibold text-right">E13 DIST</th>
 <th className="p-2 font-semibold text-right">E50 DIST</th>
 <th className="p-2 font-semibold text-right">S200 DIST</th>
 <th className="p-2 font-semibold text-center">SIGNAL</th>
 </tr>
 </thead>
 <tbody>
 {marketWatch.slice(0, 6).map((item) => {
 return (
 <tr
 key={item.symbol}
 className="border-b border-[rgba(255,255,255,0.02)] hover:bg-white/5 transition-colors group cursor-crosshair"
 >
 <td className="p-3 text-white text-sm font-semibold group-hover:text-[#a78bfa] transition-colors">{item.symbol}</td>
 <td className={`p-3 text-right text-sm font-semibold ${getDistColor(item.e13_dist)}`}>{item.e13_dist}</td>
 <td className={`p-3 text-right text-sm font-semibold ${getDistColor(item.e50_dist)}`}>{item.e50_dist}</td>
 <td className={`p-3 text-right text-sm font-semibold ${getDistColor(item.s200_dist)}`}>{item.s200_dist}</td>
 <td className="p-2 text-center">
 <span className={`px-2 py-1 rounded-md text-[10px] font-semibold border uppercase tracking-widest inline-flex items-center justify-center gap-1 ${getSignalClass(item.signal)}`}>
 {item.signal}
 </span>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>

 {/* Dynamic status tracker footer */}
 <div className="text-[10px] font-semibold tracking-widest text-[#94a3b8] border-t border-[rgba(255,255,255,0.05)] pt-3 mt-2 flex items-center justify-between">
 <span className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 bg-[#8b5cf6] rounded-full animate-pulse " /> REALTIME DISTANCE TRACKING ACTIVE
 </span>
 <span>LIMIT: 6 SCAN SLOTS</span>
 </div>
 </div>

 </div>
 );
}
