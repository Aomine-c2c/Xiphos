import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Fingerprint } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface MahoragaWheelProps {
  adaptationSpins: number;
  isHalted: boolean;
  isFullyAdapted: boolean;
  activeHandle: string;
  activeIndex: number;
  rotation: number;
  handles: { label: string; deg: number }[];
  getNodeTooltip: (label: string) => string;
}

export const MahoragaWheel = React.memo(function MahoragaWheel({ 
  adaptationSpins, isHalted, isFullyAdapted, activeHandle, activeIndex, rotation, handles, getNodeTooltip 
}: MahoragaWheelProps) {
  return (
    <GlassCard className="flex-1 flex flex-col items-center justify-center p-4 relative overflow-hidden min-h-0">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at center, #8B5CF6 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      <h3 className="absolute top-5 left-5 text-[#94a3b8] tracking-widest text-[10px] uppercase font-bold flex items-center gap-2">
        <Fingerprint className="w-3 h-3" /> Adaptive Core
      </h3>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <AnimatePresence>
          {adaptationSpins > 0 && !isHalted && (
            <motion.div
              key={`shockwave-${adaptationSpins}`}
              initial={{ scale: 1, opacity: 0.8, borderWidth: '10px' }}
              animate={{ scale: 2.5, opacity: 0, borderWidth: '1px' }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`absolute rounded-full pointer-events-none ${isFullyAdapted ? 'border-[#FACC15]' : 'border-[#8b5cf6]'}`}
              style={{ width: '170px', height: '170px' }}
            />
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ rotate: isHalted ? 0 : rotation }}
          transition={{ type: "spring", stiffness: 120, damping: 12, mass: 1.5 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg viewBox="0 0 200 200" className={`w-full h-full overflow-visible drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] ${isHalted ? 'opacity-30' : ''}`}>
            <circle cx="100" cy="100" r="30" fill="none" stroke={isHalted ? "#f87171" : "white"} strokeWidth="4" />
            <circle cx="100" cy="100" r="20" fill="none" stroke={isHalted ? "#f87171" : "rgba(255,255,255,0.5)"} strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="100" cy="100" r="10" fill={isHalted ? "#f87171" : "white"} className={isHalted ? "" : "animate-pulse"} />
            
            {handles.map((handle, i) => (
              <g key={handle.label} transform={`rotate(${handle.deg} 100 100)`}>
                <line x1="100" y1="70" x2="100" y2="20" stroke={isHalted ? "#f87171" : "white"} strokeWidth="6" strokeLinecap="round" />
                <line x1="100" y1="70" x2="100" y2="20" stroke={isHalted ? "#991b1b" : isFullyAdapted || i === activeIndex ? "#FACC15" : "#8B5CF6"} strokeWidth="2" strokeLinecap="round" className={!isHalted && (isFullyAdapted || i === activeIndex) ? "animate-pulse" : ""} />
                <circle cx="100" cy="20" r="8" fill="#0b0f17" stroke={isHalted ? "#f87171" : isFullyAdapted || i === activeIndex ? "#FACC15" : "white"} strokeWidth="3" />
              </g>
            ))}
            
            <circle cx="100" cy="100" r="85" fill="none" stroke={isHalted ? "rgba(248,113,113,0.3)" : isFullyAdapted ? "rgba(250,204,21,0.5)" : "rgba(255,255,255,0.1)"} strokeWidth={isFullyAdapted || isHalted ? 3 : 1} />
          </svg>
        </motion.div>

        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center pt-2">
          <span className={`text-[7px] tracking-[0.2em] mb-1 ${isHalted ? 'text-[#f87171]' : 'text-[#94a3b8]'}`}>{isHalted ? "SUSPENDED" : isFullyAdapted ? "ADAPTATION" : "ADAPTING"}</span>
          <span className={`text-[11px] font-semibold tracking-widest uppercase text-center w-full ${isHalted ? 'text-[#f87171]' : isFullyAdapted ? 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,1)] animate-pulse' : 'text-[#f59e0b]'}`}>
            {isHalted ? "HALTED" : isFullyAdapted ? "COMPLETE" : activeHandle}
          </span>
        </div>

        <div className="absolute inset-0 pointer-events-none">
          {handles.map((handle, i) => {
            const rad = (handle.deg - 90) * (Math.PI / 180);
            const radius = 170;
            const x = Math.cos(rad) * radius;
            const y = Math.sin(rad) * radius;
            const isActive = !isHalted && (i === activeIndex || isFullyAdapted);
            return (
              <div 
                key={handle.label}
                className={`absolute font-bold text-[10px] tracking-widest uppercase transition-all duration-500 cursor-pointer pointer-events-auto group z-20 ${
                  isHalted ? 'text-[#f87171]/50' :
                  isActive 
                    ? 'text-[#fbbf24] scale-110 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]' 
                    : 'text-[#c084fc] hover:text-white opacity-85 hover:opacity-100 transition-opacity'
                }`}
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                {handle.label}
                <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2.5 bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.8)] text-[9px] text-[#94a3b8] font-mono normal-case tracking-normal w-40 text-center z-50 transition-opacity duration-200">
                  <div className="font-bold text-[#e8e8f0] uppercase mb-1">{handle.label} NODE</div>
                  <div>{getNodeTooltip(handle.label)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
});
