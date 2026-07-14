import React, { useState, useEffect } from "react";
import { ShieldOff, ShieldAlert, AlertTriangle, Network } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface OperatorOverridesProps {
  isHalted: boolean;
  strictness: string;
  maxLotMultiplier: number;
  maxSlExpansion: number;
  minEmaSpeed: number;
  toggleTradingHalt: () => void;
  updateMahoragaConstraint: (key: string, value: any) => void;
  setMaxLotMultiplier: (val: number) => void;
  setMaxSlExpansion: (val: number) => void;
  setMinEmaSpeed: (val: number) => void;
  handleSliderCommit: (key: string, value: number) => void;
}

export const OperatorOverrides = React.memo(function OperatorOverrides({ 
  isHalted, strictness, maxLotMultiplier, maxSlExpansion, minEmaSpeed,
  toggleTradingHalt, updateMahoragaConstraint,
  setMaxLotMultiplier, setMaxSlExpansion, setMinEmaSpeed, handleSliderCommit
}: OperatorOverridesProps) {
  return (
    <div className="w-full lg:w-[320px] flex flex-col gap-3 shrink-0 min-h-0">
      
      {/* MASTER HALT OVERRIDE */}
      <GlassCard className="p-3 shrink-0 flex items-center justify-between border-2 border-[#f87171]/20 bg-[#f87171]/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#f87171]">EMERGENCY</span>
          <span className="text-[#94a3b8] text-[9px] uppercase">Suspend AI execution</span>
        </div>
        <button 
          onClick={toggleTradingHalt}
          className={`px-4 py-2 font-bold tracking-widest uppercase text-[10px] rounded transition-all flex items-center gap-2 ${
            isHalted 
              ? "bg-[#4ade80]/20 text-[#4ade80] hover:bg-[#4ade80] hover:text-black border border-[#4ade80]/50" 
              : "bg-[#f87171]/20 text-[#f87171] hover:bg-[#f87171] hover:text-black border border-[#f87171]/50"
          }`}
        >
          {isHalted ? <><ShieldAlert className="w-3 h-3" /> RESUME TRADING</> : <><ShieldOff className="w-3 h-3" /> HALT TRADING</>}
        </button>
      </GlassCard>

      {/* Filter Strictness Override */}
      <GlassCard className="p-3 shrink-0">
        <h3 className="text-[#94a3b8] tracking-widest text-[10px] uppercase mb-3 font-bold flex items-center gap-2">
          <AlertTriangle className="w-3 h-3 text-[#f59e0b]" /> Filter Strictness
        </h3>
        <div className="flex bg-black/40 rounded border border-[#8b5cf6]/20 p-1 w-full gap-1">
          {["AUTO", "STRICT", "NORMAL", "LOOSE"].map(level => {
            const isActive = strictness === level || (strictness !== "STRICT" && strictness !== "NORMAL" && strictness !== "LOOSE" && level === "AUTO");
            return (
              <button 
                key={level}
                onClick={() => updateMahoragaConstraint("filter_strictness", level)}
                className={`flex-1 py-1 text-[9px] font-bold tracking-widest transition-colors rounded ${
                  isActive ? "bg-[#8b5cf6] text-white" : "text-[#94a3b8] hover:text-white"
                }`}
              >
                {level}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Constraints */}
      <GlassCard className="p-3 shrink-0 flex-1 flex flex-col overflow-hidden min-h-0">
        <h3 className="text-[#94a3b8] tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2">
          <Network className="w-3 h-3" /> AI Boundary Constraints
        </h3>
        
        <div className="space-y-6 flex-1 justify-center flex flex-col px-1">
          
          {/* Max Lot Sizing */}
          <div>
            <div className="flex justify-between text-[10px] mb-2 text-white uppercase tracking-widest font-bold">
              <span>Max Lot Multiplier</span>
              <span className="text-[#4ade80]">{maxLotMultiplier.toFixed(1)}x</span>
            </div>
            <input 
              type="range" min="1.0" max="5.0" step="0.1" 
              value={maxLotMultiplier}
              onChange={(e) => setMaxLotMultiplier(parseFloat(e.target.value))}
              onMouseUp={(e) => handleSliderCommit("max_lot_multiplier", parseFloat((e.target as HTMLInputElement).value))}
              className="w-full accent-[#8b5cf6] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-[#94a3b8] mt-1">
              <span>1.0x</span><span>5.0x</span>
            </div>
          </div>

          {/* Max SL Expansion */}
          <div>
            <div className="flex justify-between text-[10px] mb-2 text-white uppercase tracking-widest font-bold">
              <span>Max SL Expansion</span>
              <span className="text-[#f87171]">{maxSlExpansion.toFixed(1)}x</span>
            </div>
            <input 
              type="range" min="1.0" max="3.0" step="0.1" 
              value={maxSlExpansion}
              onChange={(e) => setMaxSlExpansion(parseFloat(e.target.value))}
              onMouseUp={(e) => handleSliderCommit("max_sl_multiplier", parseFloat((e.target as HTMLInputElement).value))}
              className="w-full accent-[#f87171] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-[#94a3b8] mt-1">
              <span>1.0x</span><span>3.0x</span>
            </div>
          </div>

          {/* Minimum EMA Speed */}
          <div>
            <div className="flex justify-between text-[10px] mb-2 text-white uppercase tracking-widest font-bold">
              <span>Minimum Fast EMA</span>
              <span className="text-[#a78bfa]">{minEmaSpeed} periods</span>
            </div>
            <input 
              type="range" min="3" max="50" step="1" 
              value={minEmaSpeed}
              onChange={(e) => setMinEmaSpeed(parseInt(e.target.value))}
              onMouseUp={(e) => handleSliderCommit("min_fast_ema", parseInt((e.target as HTMLInputElement).value))}
              className="w-full accent-[#a78bfa] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[8px] text-[#94a3b8] mt-1">
              <span>3</span><span>50</span>
            </div>
          </div>

        </div>
      </GlassCard>

    </div>
  );
});
