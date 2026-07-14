"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Activity, Zap, Shield, Target, BrainCircuit, Network, BookOpen } from "lucide-react";
import { PageHeader } from "./ui/PageHeader";

// Import the journal and memory views
import LearningJournalView from "./Journal/LearningJournalView";
import AdaptationMemoryView from "./AdaptationMemoryView";

export default function EvolutionCenter() {
  const [activeTab, setActiveTab] = useState<"MEMORY" | "JOURNAL">("MEMORY");

  return (
    <div className="flex flex-col w-full h-full bg-transparent text-[#e8e8f0] font-sans overflow-hidden border-none rounded-xl">
      <div className="flex-1 min-h-0 flex flex-col relative bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="h-14 border-b border-[#1e1e2e] flex items-center justify-between px-6 shrink-0 bg-[#0a0a10]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-[#a78bfa]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#e8e8f0] uppercase tracking-widest">Evolution Hub</span>
              <span className="text-[9px] font-mono text-[#94a3b8] uppercase tracking-wider">Unified Adaptation Memory & Logs</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#05050a] p-1 rounded-lg border border-[#1e1e2e]">
            <button
              onClick={() => setActiveTab("MEMORY")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${
                activeTab === "MEMORY" 
                  ? "bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30" 
                  : "text-[#52525b] hover:text-[#94a3b8]"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Neural Pathway</span>
            </button>
            <button
              onClick={() => setActiveTab("JOURNAL")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${
                activeTab === "JOURNAL" 
                  ? "bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30" 
                  : "text-[#52525b] hover:text-[#94a3b8]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Learning Journal</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {activeTab === "MEMORY" && (
              <motion.div
                key="memory"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <AdaptationMemoryView />
              </motion.div>
            )}
            {activeTab === "JOURNAL" && (
              <motion.div
                key="journal"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                className="absolute inset-0 p-4"
              >
                <LearningJournalView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
