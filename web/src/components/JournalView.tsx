"use client";

import React, { useState, useMemo } from "react";
import { useTradingStore, JournalEntry } from "../store/useTradingStore";
import { Search, Download, Calendar as CalendarIcon, CheckCircle, Clock, BookOpen, BrainCircuit, AlertTriangle, X, PlayCircle, BarChart3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";

export default function JournalView() {
  const { journal } = useTradingStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrade, setSelectedTrade] = useState<JournalEntry | null>(null);

  // Filters
  const [assetFilter, setAssetFilter] = useState("ALL");
  const [strategyFilter, setStrategyFilter] = useState("ALL");
  const [outcomeFilter, setOutcomeFilter] = useState("ALL");
  const [sessionFilter, setSessionFilter] = useState("ALL");

  const filteredJournal = useMemo(() => {
    return journal.filter(trade => {
      const matchSearch = trade.asset.toLowerCase().includes(searchQuery.toLowerCase()) || trade.notes.toLowerCase().includes(searchQuery.toLowerCase());
      const matchAsset = assetFilter === "ALL" || trade.asset === assetFilter;
      const matchStrategy = strategyFilter === "ALL" || trade.strategy === strategyFilter;
      const matchOutcome = outcomeFilter === "ALL" || trade.winLoss === outcomeFilter;
      const matchSession = sessionFilter === "ALL" || trade.session === sessionFilter;
      return matchSearch && matchAsset && matchStrategy && matchOutcome && matchSession;
    });
  }, [journal, searchQuery, assetFilter, strategyFilter, outcomeFilter, sessionFilter]);

  const totalTrades = filteredJournal.length;
  const wins = filteredJournal.filter(t => t.winLoss === "WIN").length;
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
  const totalPnL = filteredJournal.reduce((acc, trade) => acc + trade.profit, 0);

  const assets = ["ALL", ...Array.from(new Set(journal.map(t => t.asset)))];
  const strategies = ["ALL", ...Array.from(new Set(journal.map(t => t.strategy)))];
  const sessions = ["ALL", "London", "NY", "Asian"];

  // Deterministic pseudo-random for heatmap so render stays pure
  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed * 9999) * 10000;
    return x - Math.floor(x);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-mono text-sm relative">
      <GlassPanel glowColor="cyan" className="p-0 gap-6" noOverflowHidden>
      {/* HEADER & CONTROLS */}
      <PageHeader
        title="TRADING JOURNAL"
        icon={BookOpen}
        subtitle="Review, replay, and refine your edge."
        actions={
          <Button variant="secondary" glowColor="cyan" icon={Download} label="EXPORT" />
        }
      />

      {/* FILTER BAR */}
      <div className="flex gap-4 shrink-0 px-6">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-xiphos-muted" />
          <input 
            type="text" 
            placeholder="Search notes or assets..." 
            className="w-full bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] rounded-md py-2 pl-9 pr-3 text-white focus:outline-none focus:border-xiphos-purple transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <select className="bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] rounded-md px-3 py-2 text-white focus:outline-none" value={assetFilter} onChange={e => setAssetFilter(e.target.value)}>
          {assets.map(a => <option key={a} value={a}>{a === "ALL" ? "All Assets" : a}</option>)}
        </select>

        <select className="bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] rounded-md px-3 py-2 text-white focus:outline-none" value={strategyFilter} onChange={e => setStrategyFilter(e.target.value)}>
          {strategies.map(s => <option key={s} value={s}>{s === "ALL" ? "All Strategies" : s}</option>)}
        </select>

        <select className="bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] rounded-md px-3 py-2 text-white focus:outline-none" value={outcomeFilter} onChange={e => setOutcomeFilter(e.target.value)}>
          <option value="ALL">All Outcomes</option>
          <option value="WIN">Wins Only</option>
          <option value="LOSS">Losses Only</option>
        </select>

        <select className="bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] rounded-md px-3 py-2 text-white focus:outline-none" value={sessionFilter} onChange={e => setSessionFilter(e.target.value)}>
          {sessions.map(s => <option key={s} value={s}>{s === "ALL" ? "All Sessions" : s}</option>)}
        </select>
      </div>

      <div className="flex gap-6 flex-1 min-h-0 px-6 pb-6">
        {/* STATS & CALENDAR COLUMN */}
        <div className="w-[300px] flex flex-col gap-6 shrink-0">
          <GlassCard className="p-5">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <BarChart3 className="w-3 h-3" /> Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xiphos-muted">Total PnL</span>
                <span className={`font-black ${totalPnL >= 0 ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>
                  ${Math.abs(totalPnL).toLocaleString(undefined, {minimumFractionDigits: 2})}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xiphos-muted">Win Rate</span>
                <span className="font-bold text-white">{winRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xiphos-muted">Total Trades</span>
                <span className="font-bold text-white">{totalTrades}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-5 flex-1 min-h-0 flex flex-col">
            <h3 className="text-xiphos-muted tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
              <CalendarIcon className="w-3 h-3" /> Monthly Heatmap
            </h3>
            {/* Simple mock calendar */}
            <div className="grid grid-cols-7 gap-1 flex-1 content-start">
              {Array.from({ length: 35 }).map((_, i) => {
                const intensity = pseudoRandom(i);
                const isWin = pseudoRandom(i + 100) > 0.5;
                const isEmpty = pseudoRandom(i + 200) > 0.7;
                
                let colorClass = "bg-[rgba(255,255,255,0.02)]";
                if (!isEmpty) {
                  colorClass = isWin 
                    ? (intensity > 0.5 ? "bg-xiphos-emerald/60" : "bg-xiphos-emerald/30") 
                    : (intensity > 0.5 ? "bg-xiphos-crimson/60" : "bg-xiphos-crimson/30");
                }

                return (
                  <div key={i} className={`rounded-sm w-full aspect-square ${colorClass} transition-colors hover:border hover:border-white cursor-pointer`} title="Daily PnL Activity" />
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* JOURNAL LIST COLUMN */}
        <GlassCard className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar relative">
          {filteredJournal.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-xiphos-muted">
              <BookOpen className="w-12 h-12 mb-4 opacity-50" />
              <p>No journal entries match the current filters.</p>
            </div>
          ) : (
            filteredJournal.map(trade => (
              <motion.div 
                key={trade.id}
                layoutId={`trade-${trade.id}`}
                onClick={() => setSelectedTrade(trade)}
                className="bg-[rgba(11,15,23,0.4)] border border-[rgba(255,255,255,0.05)] p-4 rounded-lg cursor-pointer hover:border-xiphos-purple/50 transition-all group"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <StatusBadge 
                      label={trade.direction} 
                      variant={trade.direction === "BUY" ? "success" : "danger"} 
                    />
                    <span className="font-bold text-lg">{trade.asset}</span>
                    <span className="text-xiphos-muted text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(trade.date).toLocaleString()}
                    </span>
                  </div>
                  <div className={`font-black text-lg ${trade.winLoss === "WIN" ? "text-xiphos-emerald" : "text-xiphos-crimson"}`}>
                    {trade.profit > 0 ? "+" : ""}{trade.profit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                </div>

                <div className="flex gap-4 text-xs text-xiphos-muted mb-3">
                  <span className="bg-white/5 px-2 py-1 rounded-sm">Strategy: {trade.strategy}</span>
                  <span className="bg-white/5 px-2 py-1 rounded-sm">Session: {trade.session}</span>
                  <span className="bg-white/5 px-2 py-1 rounded-sm">Entry: {trade.entryPrice} → Exit: {trade.exitPrice}</span>
                </div>

                <p className="text-sm text-gray-300 line-clamp-2">
                  {trade.notes}
                </p>
              </motion.div>
            ))
          )}
        </GlassCard>
      </div>

      {/* TRADE REVIEW MODAL */}
      <AnimatePresence>
        {selectedTrade && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[rgba(5,8,15,0.8)] backdrop-blur-xl flex items-center justify-center p-8"
          >
            <motion.div 
              layoutId={`trade-${selectedTrade.id}`}
              className="bg-xiphos-bg w-full h-full border border-xiphos-purple/30 shadow-[0_0_50px_rgba(139,92,246,0.15)] rounded-2xl flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-xs rounded-sm font-black ${selectedTrade.direction === "BUY" ? "bg-xiphos-emerald/20 text-xiphos-emerald glow-emerald" : "bg-xiphos-crimson/20 text-xiphos-crimson glow-crimson"}`}>
                    {selectedTrade.direction}
                  </span>
                  <h2 className="text-2xl font-black text-white">{selectedTrade.asset}</h2>
                  <span className="text-xiphos-muted text-sm">{new Date(selectedTrade.date).toLocaleString()}</span>
                  <span className="bg-xiphos-purple/20 text-xiphos-purple px-2 py-1 text-xs font-bold rounded-sm border border-xiphos-purple/30 ml-4">
                    {selectedTrade.id}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className={`text-2xl font-black ${selectedTrade.winLoss === "WIN" ? "text-xiphos-emerald glow-emerald" : "text-xiphos-crimson glow-crimson"}`}>
                    {selectedTrade.profit > 0 ? "+" : ""}{selectedTrade.profit.toLocaleString(undefined, {minimumFractionDigits: 2})}
                  </div>
                  <button onClick={() => setSelectedTrade(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6 text-xiphos-muted hover:text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
                
                {/* Left Column: Visuals & Notes */}
                <div className="flex-1 flex flex-col gap-6">
                  <div className="relative w-full aspect-video bg-[rgba(11,15,23,0.6)] border border-[rgba(255,255,255,0.05)] rounded-xl overflow-hidden group flex items-center justify-center shrink-0">
                    <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-screen" style={{ backgroundImage: `url(${selectedTrade.screenshotUrl})` }} />
                    <Button variant="secondary" glowColor="cyan" className="relative z-10 bg-black/50 hover:bg-black/80 group-hover:scale-105" icon={PlayCircle} label="REPLAY TRADE" />
                  </div>

                  <GlassCard className="p-6 flex-1">
                    <h3 className="text-xiphos-muted tracking-widest text-xs uppercase mb-3 font-bold flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Trader Notes
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedTrade.notes}
                    </p>
                  </GlassCard>
                </div>

                {/* Right Column: AI Analysis */}
                <div className="w-full lg:w-[400px] flex flex-col gap-4">
                  <GlassCard className="p-5 border-l-2 border-l-xiphos-purple shadow-[0_0_15px_rgba(139,92,246,0.05)]">
                    <h3 className="text-xiphos-purple tracking-widest text-xs uppercase mb-3 font-bold flex items-center gap-2">
                      <BrainCircuit className="w-4 h-4" /> AI Explanation
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedTrade.ai_explanation}
                    </p>
                  </GlassCard>

                  <GlassCard className="p-5 border-l-2 border-l-xiphos-gold shadow-[0_0_15px_rgba(234,179,8,0.05)]">
                    <h3 className="text-xiphos-gold tracking-widest text-xs uppercase mb-3 font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Mistake Analysis
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedTrade.mistake_analysis}
                    </p>
                  </GlassCard>

                  <GlassCard className="p-5 border-l-2 border-l-xiphos-cyan shadow-[0_0_15px_rgba(6,182,212,0.05)] flex-1">
                    <h3 className="text-xiphos-cyan tracking-widest text-xs uppercase mb-3 font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" /> Lessons Learned
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                      {selectedTrade.lessons_learned}
                    </p>
                  </GlassCard>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </GlassPanel>
    </div>
  );
}
