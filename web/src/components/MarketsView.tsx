"use client";

import React, { useState, useMemo } from "react";
import { useTradingStore, MarketWatchItem } from "../store/useTradingStore";
import { Activity, Search, Star, LayoutGrid, BarChart2, Hexagon } from "lucide-react";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import AssetDeepDive from "./AssetDeepDive";
import HeatMapPanel from "./HeatMapPanel";
import CorrelationMatrix from "./CorrelationMatrix";

type ViewMode = "MATRIX" | "ANALYTICS";
type Category = "ALL" | "FOREX" | "CRYPTO" | "INDICES" | "STOCKS" | "COMMODITIES" | "SYNTHETICS";

const CATEGORIES: Category[] = ["ALL", "FOREX", "CRYPTO", "INDICES", "STOCKS", "COMMODITIES", "SYNTHETICS"];

export default function MarketsView() {
  const { marketWatch, toggleFavorite } = useTradingStore();
  const [viewMode, setViewMode] = useState<ViewMode>("MATRIX");
  const [category, setCategory] = useState<Category>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<MarketWatchItem | null>(() => marketWatch.length > 0 ? marketWatch[0] : null);

  const filteredMarkets = useMemo(() => {
    return marketWatch.filter((m) => {
      const matchSearch = m.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = category === "ALL" || m.category.toUpperCase() === category;
      const matchFavorite = !showFavoritesOnly || m.is_favorite;
      return matchSearch && matchCategory && matchFavorite;
    });
  }, [marketWatch, searchQuery, category, showFavoritesOnly]);

  const drawMiniSparkline = (history: number[] | undefined, color: string) => {
    if (!history || history.length < 2) return null;
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const height = 16;
    const width = 60;

    const coords = history.map((val, idx) => ({
      x: (idx / (history.length - 1)) * width,
      y: height - ((val - min) / range) * height + 1,
    }));

    let pathD = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const xc = (coords[i].x + coords[i + 1].x) / 2;
      const yc = (coords[i].y + coords[i + 1].y) / 2;
      pathD += ` Q ${coords[i].x} ${coords[i].y}, ${xc} ${yc}`;
    }
    pathD += ` L ${coords.at(-1)!.x} ${coords.at(-1)!.y}`;

    return (
      <svg width={width + 2} height={height + 2} className="overflow-visible opacity-80">
        <path fill="none" stroke={color} strokeWidth="1.5" d={pathD} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  };

  return (
    <GlassPanel glowColor="cyan" className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300">
      
      {/* 1. TOP NAVIGATION / TOOLBAR */}
      <GlassCard className="flex flex-col shrink-0 border border-[rgba(255,255,255,0.05)] overflow-hidden">
        
        {/* Top row: Branding & Search */}
        <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.6)]">
          <div className="flex items-center gap-3">
            <Hexagon className="h-6 w-6 text-xiphos-cyan animate-pulse glow-cyan" />
            <span className="text-xl font-black text-white uppercase tracking-widest drop-shadow-md">INSTITUTIONAL MARKET WATCH</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              title="Toggle favorites filter" aria-label="Toggle favorites filter"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`p-2 rounded-md border transition-colors flex items-center justify-center ${
                showFavoritesOnly 
                  ? "bg-xiphos-gold/20 border-xiphos-gold/50 text-xiphos-gold glow-gold" 
                  : "bg-[rgba(11,15,23,0.5)] border-[rgba(255,255,255,0.1)] text-xiphos-muted hover:text-white"
              }`}
            >
              <Star className="h-4 w-4" fill={showFavoritesOnly ? "currentColor" : "none"} />
            </button>

            <div className="flex items-center bg-[rgba(11,15,23,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg px-4 py-2 gap-3 transition-colors focus-within:border-xiphos-cyan/50 focus-within:shadow-[0_0_15px_rgba(76,201,240,0.1)]">
              <Search className="h-4 w-4 text-xiphos-muted" />
              <input
                type="text"
                placeholder="SEARCH SYMBOL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-xiphos-muted focus:outline-none w-48 text-sm font-bold tracking-widest uppercase"
              />
            </div>
            
            <div className="flex items-center bg-[rgba(11,15,23,0.6)] border border-[rgba(255,255,255,0.1)] rounded-lg overflow-hidden p-1">
              <button 
                onClick={() => setViewMode("MATRIX")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
                  viewMode === "MATRIX" ? "bg-xiphos-cyan/20 text-xiphos-cyan" : "text-xiphos-muted hover:text-white"
                }`}
              >
                <LayoutGrid className="h-4 w-4" /> MATRIX
              </button>
              <button 
                onClick={() => setViewMode("ANALYTICS")}
                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors ${
                  viewMode === "ANALYTICS" ? "bg-xiphos-cyan/20 text-xiphos-cyan" : "text-xiphos-muted hover:text-white"
                }`}
              >
                <BarChart2 className="h-4 w-4" /> ANALYTICS
              </button>
            </div>
          </div>
        </div>

        {/* Bottom row: Category Tabs */}
        <div className="flex items-center gap-2 p-2 bg-[rgba(11,15,23,0.3)] overflow-x-auto custom-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-md text-xs font-bold tracking-widest uppercase transition-all whitespace-nowrap ${
                category === cat 
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                  : "text-xiphos-muted hover:bg-white/10 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
        
        {viewMode === "MATRIX" && (
          <>
            {/* LEFT PANE: Asset List */}
            <GlassCard className="w-80 shrink-0 border border-[rgba(255,255,255,0.05)] flex flex-col overflow-hidden">
              <div className="p-3 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] flex justify-between items-center shrink-0">
                <span className="text-[10px] text-xiphos-muted font-bold tracking-widest uppercase">ASSET LIST ({filteredMarkets.length})</span>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
                {filteredMarkets.length === 0 ? (
                  <div className="text-center p-8 text-xiphos-muted text-xs uppercase tracking-widest font-bold">NO ASSETS MATCH FILTERS</div>
                ) : (
                  filteredMarkets.map(item => {
                    const isUp = item.change ? !item.change.startsWith("-") : true;
                    const isSelected = selectedAsset?.symbol === item.symbol;
                    return (
                      <div 
                        key={item.symbol}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedAsset(item)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedAsset(item); }}
                        className={`group p-3 rounded-lg border cursor-pointer transition-all flex flex-col gap-2 ${
                          isSelected 
                            ? "bg-[rgba(76,201,240,0.1)] border-xiphos-cyan/30 shadow-[inset_0_0_20px_rgba(76,201,240,0.05)]" 
                            : "bg-[rgba(11,15,23,0.3)] border-transparent hover:bg-white/5 hover:border-white/10"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <button 
                              title="Toggle favorite" aria-label={`Toggle favorite for ${item.symbol}`}
                              onClick={(e) => { e.stopPropagation(); toggleFavorite(item.symbol); }}
                              className="text-xiphos-muted hover:text-xiphos-gold transition-colors"
                            >
                              <Star className="h-3 w-3" fill={item.is_favorite ? "#D4AF37" : "none"} stroke={item.is_favorite ? "#D4AF37" : "currentColor"} />
                            </button>
                            <span className={`text-sm font-black tracking-widest ${isSelected ? 'text-xiphos-cyan' : 'text-white'}`}>{item.symbol}</span>
                          </div>
                          <span className={`text-xs font-black ${isUp ? 'text-xiphos-emerald glow-emerald' : 'text-xiphos-crimson glow-crimson'}`}>
                            {item.change}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">
                              {item.price.toFixed(item.symbol.includes("USD") && !item.symbol.startsWith("X") ? 5 : 3)}
                            </span>
                            <span className="text-[9px] text-xiphos-muted font-bold tracking-widest uppercase">{item.signal} • {item.probability}%</span>
                          </div>
                          <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                            {drawMiniSparkline(item.history, isUp ? "#22C55E" : "#EF4444")}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </GlassCard>

            {/* RIGHT PANE: Asset Deep Dive */}
            <div className="flex-1 min-w-0 overflow-hidden">
              {selectedAsset ? (
                <AssetDeepDive asset={selectedAsset} />
              ) : (
                <GlassCard className="w-full h-full border border-[rgba(255,255,255,0.05)] flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="h-12 w-12 text-xiphos-muted mx-auto mb-4 opacity-30" />
                    <span className="text-sm text-xiphos-muted font-bold uppercase tracking-widest">SELECT AN ASSET TO VIEW DETAILS</span>
                  </div>
                </GlassCard>
              )}
            </div>
          </>
        )}

        {viewMode === "ANALYTICS" && (
          <div className="flex-1 min-h-0 flex gap-4 overflow-hidden">
            {/* HEATMAP */}
            <GlassCard className="flex-1 border border-[rgba(255,255,255,0.05)] flex flex-col overflow-hidden">
               <div className="p-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] shrink-0">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Activity className="h-4 w-4 text-xiphos-cyan" /> 
                   {category} HEATMAP
                 </h2>
                 <p className="text-[10px] text-xiphos-muted mt-1 uppercase tracking-widest">Sized by Probability, Colored by AI Bias</p>
               </div>
               <div className="flex-1 overflow-hidden p-2">
                 <HeatMapPanel category={category} />
               </div>
            </GlassCard>

            {/* CORRELATION MATRIX */}
            <GlassCard className="flex-1 border border-[rgba(255,255,255,0.05)] flex flex-col overflow-hidden">
               <div className="p-4 border-b border-[rgba(255,255,255,0.05)] bg-[rgba(11,15,23,0.4)] shrink-0">
                 <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                   <Hexagon className="h-4 w-4 text-xiphos-cyan" /> 
                   {category} CORRELATION MATRIX
                 </h2>
                 <p className="text-[10px] text-xiphos-muted mt-1 uppercase tracking-widest">Cross-Asset Pearson Correlation</p>
               </div>
               <div className="flex-1 overflow-hidden">
                 <CorrelationMatrix category={category} />
               </div>
            </GlassCard>
          </div>
        )}

      </div>

    </GlassPanel>
  );
}
