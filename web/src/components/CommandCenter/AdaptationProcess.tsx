"use client";

import React from "react";
import { CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { motion, Variants } from "framer-motion";

interface ProcessStep {
  title: string;
  description: string;
  duration: string;
  status: "complete" | "running" | "failed";
}

export function AdaptationProcess() {
  const steps: ProcessStep[] = [
    { title: "Detected Anomaly", description: "Unusual volume spike detected.", duration: "00:00:02", status: "complete" },
    { title: "Comparing Patterns", description: "Scanning 4,300 historical patterns.", duration: "00:00:04", status: "complete" },
    { title: "Rejected Possibilities", description: "87 patterns rejected.", duration: "00:00:06", status: "complete" },
    { title: "Selected Strategy", description: "Strategy #12 selected.", duration: "00:00:08", status: "complete" },
    { title: "Confidence Level", description: "Confidence increased to 91.3%.", duration: "00:00:10", status: "complete" },
    { title: "Deploying Execution", description: "Execution in progress...", duration: "00:00:12", status: "running" }
  ];

  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants: Variants = {
    initial: { opacity: 0, x: -12 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 120, damping: 16 }
    }
  };

  return (
    <div className="flex flex-col gap-2 font-mono h-full">
      <div className="flex flex-col gap-0.5 shrink-0">
        <h2 className="text-[9px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase">
          Adaptation Process
        </h2>
        <span className="text-[7px] text-[#52525b] uppercase font-bold tracking-widest block mt-0.5">
          Real-Time Decision Making
        </span>
      </div>
      
      <motion.div 
        whileHover={{ y: -4, boxShadow: "0 10px 25px rgba(139,92,246,0.04)", borderColor: "rgba(139,92,246,0.25)" }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex-1 bg-[#09090f] border border-[#151522] rounded-xl p-2.5 flex flex-col gap-1.5 shadow-[0_0_10px_rgba(139,92,246,0.01)] overflow-hidden transition-all duration-300"
      >
        {steps.map((st, idx) => {
          return (
            <motion.div 
              key={idx} 
              variants={itemVariants}
              className="flex items-start justify-between text-[7.5px] border-b border-[#151522]/30 pb-1.5 last:border-b-0 last:pb-0 relative group"
            >
              <div className="flex items-start gap-2">
                {/* Status Icon with connecting line */}
                <div className="mt-0.5 shrink-0 relative z-10">
                  <div className="bg-[#09090f] rounded-full">
                    {st.status === "complete" && <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />}
                    {st.status === "running" && <RefreshCw className="w-3 h-3 text-[#f59e0b] animate-spin" />}
                    {st.status === "failed" && <AlertCircle className="w-3 h-3 text-[#f87171]" />}
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="absolute top-3 left-1.5 w-px h-[22px] bg-gradient-to-b from-[#151522] to-transparent -z-10 group-hover:from-[#a78bfa]/30 transition-colors" />
                  )}
                  {st.status === "running" && idx > 0 && (
                     <motion.div 
                       className="absolute bottom-3 left-1.5 w-px h-[22px] bg-gradient-to-b from-[#f59e0b]/50 to-transparent -z-10"
                       animate={{ opacity: [0.3, 1, 0.3] }}
                       transition={{ duration: 1.5, repeat: Infinity }}
                     />
                  )}
                </div>
                
                <div className="flex flex-col min-w-0">
                  <span className={`font-bold tracking-wide ${
                    st.status === "running" ? "text-[#f59e0b]" : st.status === "failed" ? "text-[#f87171]" : "text-[#e8e8f0]"
                  }`}>
                    {st.title}
                  </span>
                  {st.status === "running" ? (
                    <motion.span 
                      animate={{ opacity: [0.5, 1, 0.5] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="text-[#f59e0b]/80 text-[7px] leading-tight truncate mt-0.5 drop-shadow-[0_0_2px_rgba(245,158,11,0.5)]"
                    >
                      {st.description}
                    </motion.span>
                  ) : (
                    <span className="text-[#52525b] text-[7px] leading-tight truncate mt-0.5">
                      {st.description}
                    </span>
                  )}
                </div>
              </div>

              <span className="text-[#52525b] font-bold shrink-0 ml-2">
                {st.duration}
              </span>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
