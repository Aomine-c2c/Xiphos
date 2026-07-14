import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, BrainCircuit } from "lucide-react";
import { GlassCard } from "../ui/GlassCard";

interface LiveFeedProps {
  learningLog: string[];
  aiThoughts: string;
  isHalted: boolean;
}

export const LiveFeed = React.memo(function LiveFeed({ learningLog, aiThoughts, isHalted }: LiveFeedProps) {
  return (
    <div className="w-full lg:w-1/4 flex flex-col gap-3 shrink-0 min-h-0">
      <GlassCard className="p-3 flex-1 flex flex-col min-h-0">
        <h3 className="text-[#94a3b8] tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2 shrink-0">
          <Zap className="w-3 h-3 text-[#f59e0b]" /> Live Learning Feed
        </h3>
        <div className="flex-1 overflow-hidden space-y-1 flex flex-col justify-end text-[9px]">
          <AnimatePresence>
            {learningLog.map((log, idx) => (
              <motion.div 
                key={`learn-${idx}-${log.slice(0, 16)}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-xs border-l-2 pl-2 py-1 ${isHalted ? 'text-[#f87171] border-[#f87171]/50' : 'text-gray-400 border-[#f59e0b]/30'}`}
              >
                <span className={isHalted ? 'text-[#f87171] mr-2' : 'text-[#f59e0b] mr-2'}>{'>'}</span>{log}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </GlassCard>

      <GlassCard className={`p-3 shrink-0 border shadow-[0_0_20px_rgba(139,92,246,0.1)] ${isHalted ? 'border-[#f87171]/40' : 'border-[#8b5cf6]/30'}`}>
        <h3 className={`tracking-widest text-[10px] uppercase mb-4 font-bold flex items-center gap-2 ${isHalted ? 'text-[#f87171]' : 'text-[#a78bfa]'}`}>
          <BrainCircuit className="w-3 h-3" /> Live AI Thoughts
        </h3>
        <p className="text-gray-300 text-[10px] leading-tight italic">
          &quot;{aiThoughts}&quot;
        </p>
      </GlassCard>
    </div>
  );
});
