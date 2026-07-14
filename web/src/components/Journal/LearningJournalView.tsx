"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Hash, FileText, ChevronRight, 
  GitCommit, Network, Folder, Calendar, Activity, Zap
} from "lucide-react";

// Types
type Tag = "architecture" | "risk" | "logic" | "anomaly" | "optimization";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  tags: Tag[];
  problem: string;
  observation: string;
  solution: string;
  adaptation: string;
  confidenceChange: number;
  impact: string;
}

// Mock Data
const MOCK_ENTRIES: JournalEntry[] = [
  {
    id: "evt-001",
    date: "2026-07-14",
    title: "Volatility Clustering Mitigation",
    tags: ["risk", "logic"],
    problem: "Stop-losses were being triggered prematurely during high-frequency volatility clusters.",
    observation: "Standard standard deviation bands failed to account for micro-structural liquidity vacuums lasting < 500ms.",
    solution: "Implemented an adaptive trailing volatility matrix based on tick-level volume delta.",
    adaptation: "Re-weighted Risk Oracle parameters. Integrated dynamic spread tolerance.",
    confidenceChange: 4.2,
    impact: "Reduced false-positive stopouts by 18%."
  },
  {
    id: "evt-002",
    date: "2026-07-12",
    title: "Cross-Asset Liquidity Drain",
    tags: ["anomaly", "architecture"],
    problem: "Sudden correlation breakdown between gold and USD pairs during Tokyo open.",
    observation: "Identified a hidden iceberg order absorbing all bid-side liquidity across major brokers simultaneously.",
    solution: "Halted aggressive market orders. Shifted to passive limit accumulation.",
    adaptation: "Added structural anomaly detection node to Argus agent.",
    confidenceChange: 2.1,
    impact: "Prevented 3.5% drawdown during flash event."
  },
  {
    id: "evt-003",
    date: "2026-07-10",
    title: "Neural Weight Decay Optimization",
    tags: ["optimization"],
    problem: "Athena agent was over-fitting to recent short-term trends, ignoring macro structure.",
    observation: "Learning rate was static, causing the model to forget deep historical patterns (catastrophic forgetting).",
    solution: "Applied elastic weight consolidation (EWC) to preserve critical historical weights.",
    adaptation: "Updated continuous learning pipeline with a dynamic decay factor.",
    confidenceChange: 6.8,
    impact: "Improved out-of-sample forward test accuracy by 12%."
  }
];

// Helper to render basic markdown
const renderMarkdown = (text: string) => {
  // Bold
  let html = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold text-[#8b5cf6]">$1</span>');
  // Highlights
  html = html.replace(/`(.*?)`/g, '<span class="px-1 py-0.5 bg-[#1e1e2e] text-[#4cc9f0] rounded text-xs font-mono">$1</span>');
  
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

export default function LearningJournalView() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<Tag | "all">("all");
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(MOCK_ENTRIES[0].id);

  // Filter logic
  const filteredEntries = MOCK_ENTRIES.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(search.toLowerCase()) || 
                          entry.problem.toLowerCase().includes(search.toLowerCase());
    const matchesTag = activeTag === "all" || entry.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const selectedEntry = MOCK_ENTRIES.find(e => e.id === selectedEntryId);

  return (
    <div className="flex w-full h-full bg-[#05050a] text-sm overflow-hidden select-none border border-[#1e1e2e] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      
      {/* Left Sidebar (Folders / Tags) */}
      <div className="w-64 bg-[#09090e] border-r border-[#1e1e2e] flex flex-col shrink-0">
        <div className="p-4 border-b border-[#1e1e2e]">
          <h2 className="text-xs font-bold tracking-widest text-[#94a3b8] uppercase mb-4 flex items-center gap-2">
            <Network className="w-4 h-4 text-[#8b5cf6]" />
            Knowledge Graph
          </h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b]" />
            <input 
              type="text" 
              placeholder="Search neurons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0f0f1a] border border-[#1e1e2e] rounded text-white text-xs px-9 py-2 focus:outline-none focus:border-[#8b5cf6] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {/* Tags */}
          <div className="mb-4">
            <div className="px-2 py-1 text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-1">Taxonomy</div>
            <div 
              className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${activeTag === "all" ? "bg-[#1e1e2e] text-white" : "text-[#94a3b8] hover:bg-[#1e1e2e]/50"}`}
              onClick={() => setActiveTag("all")}
            >
              <Hash className="w-3 h-3" /> All Events
            </div>
            {["architecture", "risk", "logic", "anomaly", "optimization"].map(tag => (
              <div 
                key={tag}
                className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${activeTag === tag ? "bg-[#1e1e2e] text-[#8b5cf6]" : "text-[#94a3b8] hover:bg-[#1e1e2e]/50"}`}
                onClick={() => setActiveTag(tag as Tag)}
              >
                <Hash className="w-3 h-3" /> {tag}
              </div>
            ))}
          </div>

          {/* Directory */}
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-[#52525b] uppercase tracking-widest mb-1 flex items-center gap-1">
              <Folder className="w-3 h-3" /> Observations
            </div>
            {filteredEntries.map(entry => (
              <div 
                key={entry.id}
                onClick={() => setSelectedEntryId(entry.id)}
                className={`flex flex-col gap-1 px-3 py-2 rounded cursor-pointer transition-colors mb-1 ${selectedEntryId === entry.id ? "bg-[#8b5cf6]/10 border border-[#8b5cf6]/30" : "hover:bg-[#1e1e2e] border border-transparent"}`}
              >
                <span className={`truncate text-xs ${selectedEntryId === entry.id ? "text-white font-medium" : "text-[#94a3b8]"}`}>
                  {entry.title}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-[#52525b]">
                  <Calendar className="w-3 h-3" />
                  {entry.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Editor View */}
      <div className="flex-1 bg-[#05050a] relative overflow-hidden flex flex-col">
        {selectedEntry ? (
          <motion.div 
            key={selectedEntry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 overflow-y-auto custom-scrollbar p-12 max-w-4xl mx-auto w-full"
          >
            {/* Header */}
            <div className="mb-12 border-b border-[#1e1e2e] pb-8">
              <div className="flex items-center gap-3 mb-4">
                {selectedEntry.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-[#a78bfa] bg-[#8b5cf6]/10 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
              <h1 className="text-4xl font-bold text-white tracking-tight mb-4">
                {selectedEntry.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-[#52525b]">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#4cc9f0]" />
                  {selectedEntry.date}
                </div>
                <div className="flex items-center gap-2">
                  <GitCommit className="w-4 h-4 text-[#4ade80]" />
                  {selectedEntry.id}
                </div>
              </div>
            </div>

            {/* Content (Markdown simulated) */}
            <div className="space-y-10 text-[#94a3b8] leading-relaxed">
              
              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#f87171]" />
                  Problem Statement
                </h2>
                <div className="p-4 bg-[#09090e] border border-[#1e1e2e] rounded-lg shadow-inner">
                  {renderMarkdown(selectedEntry.problem)}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#4cc9f0]" />
                  Observation
                </h2>
                <div className="p-4 border-l-2 border-[#4cc9f0] pl-6 text-[#e2e8f0]">
                  {renderMarkdown(selectedEntry.observation)}
                </div>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#f59e0b]" />
                  Solution Implemented
                </h2>
                <p>{renderMarkdown(selectedEntry.solution)}</p>
              </section>

              <section>
                <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-[#8b5cf6]" />
                  Structural Adaptation
                </h2>
                <div className="p-6 bg-gradient-to-r from-[#8b5cf6]/10 to-transparent border border-[#8b5cf6]/20 rounded-lg">
                  <p className="text-white font-medium">{renderMarkdown(selectedEntry.adaptation)}</p>
                </div>
              </section>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#1e1e2e]">
                <div className="p-6 bg-[#09090e] border border-[#1e1e2e] rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] text-[#52525b] uppercase tracking-widest font-bold">Confidence Delta</span>
                  <div className="text-3xl font-bold text-[#4ade80]">
                    +{selectedEntry.confidenceChange.toFixed(1)}%
                  </div>
                </div>
                <div className="p-6 bg-[#09090e] border border-[#1e1e2e] rounded-xl flex flex-col gap-2">
                  <span className="text-[10px] text-[#52525b] uppercase tracking-widest font-bold">System Impact</span>
                  <div className="text-lg text-white font-medium leading-tight">
                    {selectedEntry.impact}
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-[#52525b]">
            <FileText className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a neuron to view adaptation history.</p>
          </div>
        )}
      </div>

    </div>
  );
}

// Additional icons needed for the markdown layout
function Eye(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function GitBranch(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="3" x2="6" y2="15" />
      <circle cx="18" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M18 9a9 9 0 0 1-9 9" />
    </svg>
  );
}
