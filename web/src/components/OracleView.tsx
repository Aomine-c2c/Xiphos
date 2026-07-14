"use client";

import React, { useState } from "react";
import { Eye, Search, Database, Network, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";

interface DecisionExplanation {
 id: string;
 query: string;
 type: "TRADE" | "ADAPTATION" | "RISK_REJECTION";
 timestamp: string;
 dataCore: {
 event: string;
 details: string;
 };
 mahoraga: {
 reasoning: string;
 adjustment: string;
 };
 riskGuardian: {
 check: string;
 status: "APPROVED" | "REJECTED";
 details: string;
 };
 xiphos: {
 action: string;
 latency: string;
 };
}

export default function OracleView() {
 const [searchQuery, setSearchQuery] = useState("");
 const [decisions, setDecisions] = useState<DecisionExplanation[]>([]);
 const [selectedDecision, setSelectedDecision] = useState<DecisionExplanation | null>(null);

 React.useEffect(() => {
 const fetchDecisions = async () => {
 try {
 const host = typeof window !== "undefined" ? window.location.host : "127.0.0.1:8001";
 const protocol = typeof window !== "undefined" ? window.location.protocol : "http:";
 const apiUrl = process.env.NEXT_PUBLIC_API_URL || `${protocol}//${host}`;
 const res = await fetch(`${apiUrl}/api/oracle/decisions`);
 if (res.ok) {
 const data = await res.json();
 setDecisions(data);
 if (data.length > 0 && !selectedDecision) {
 setSelectedDecision(data[0]);
 }
 }
 } catch (e) {
 console.error("Failed to fetch oracle decisions", e);
 }
 };
 fetchDecisions();
 const intv = setInterval(fetchDecisions, 10000);
 return () => clearInterval(intv);
 }, []);

 return (
 <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative">
 <GlassPanel className="p-0 gap-2 flex flex-col h-full" noOverflowHidden>

 {/* Header */}
 <PageHeader 
 title="ORACLE EXPLAINABILITY ENGINE" 
 icon={Eye} 
 
 subtitle="Radical Transparency Protocol"
 />

 {/* Search & Suggestions */}
 <div className="p-3 border-b border-[#1e1e2e] bg-[#09090e] shrink-0 z-10 flex flex-col gap-2">
 <div className="relative max-w-3xl mx-auto w-full">
 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
 <input 
 type="text" 
 placeholder="Ask Oracle: 'Why did we take Trade #1492?'" 
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full bg-black/50 border border-[#1e1e2e] text-white pl-10 pr-4 py-2 rounded-lg outline-none focus:border-white/40 transition-colors text-xs font-bold placeholder:text-white/20"
 />
 </div>

 <div className="flex flex-wrap gap-2 max-w-3xl mx-auto justify-center scale-90">
 {decisions.filter(d => d.query.toLowerCase().includes(searchQuery.toLowerCase())).map(dec => (
 <Button
 key={dec.id}
 onClick={() => setSelectedDecision(dec)}
 variant={selectedDecision?.id === dec.id ? "primary" : "ghost"}
 
 className={`rounded-full ${selectedDecision?.id === dec.id ? "bg-white text-black hover:bg-white hover:text-black border-white" : ""}`}
 label={dec.query}
 />
 ))}
 </div>
 </div>

 {/* Explanation Canvas */}
 <div className="flex-1 overflow-hidden p-2 z-10 relative flex justify-center min-h-0">
 <AnimatePresence mode="wait">
 {selectedDecision && (
 <motion.div 
 key={selectedDecision.id}
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 transition={{ duration: 0.3 }}
 className="w-full max-w-4xl flex flex-col gap-2 min-h-0"
 >
 
 <div className="text-center shrink-0">
 <h2 className="text-sm font-semibold text-white">{selectedDecision.query}</h2>
 <p className="text-[#94a3b8] text-[9px] tracking-widest mt-1">TIMESTAMP: {selectedDecision.timestamp}</p>
 </div>

 {/* Vertical Timeline / Tree */}
 <div className="relative pl-6 pb-2 flex-1 flex flex-col gap-2 justify-center">
 {/* Timeline Line */}
 <div className="absolute left-9 top-2 bottom-2 w-px bg-linear-to-b from-white/20 via-white/5 to-transparent"></div>

 {/* 1. Neural Data Core */}
 <div className="relative flex items-start gap-4 shrink-0">
 <div className="w-5 h-5 rounded-full bg-black border-2 border-[#8b5cf6] flex items-center justify-center shrink-0 z-10 mt-1">
 <Database className="w-2 h-2 text-[#a78bfa]" />
 </div>
 <GlassCard className="flex-1 p-2 border-l-4 border-l-[#8b5cf6] hover:bg-white/5 transition-colors">
 <h3 className="text-[9px] font-semibold text-[#a78bfa] tracking-widest uppercase mb-1">NEURAL DATA CORE</h3>
 <p className="text-xs font-bold text-white mb-1">{selectedDecision.dataCore.event}</p>
 <p className="text-[9px] text-[#94a3b8] leading-tight">{selectedDecision.dataCore.details}</p>
 </GlassCard>
 </div>

 {/* 2. Mahoraga Engine */}
 <div className="relative flex items-start gap-4 shrink-0">
 <div className="w-5 h-5 rounded-full bg-black border-2 border-[#8b5cf6] flex items-center justify-center shrink-0 z-10 mt-1">
 <Network className="w-2 h-2 text-[#a78bfa]" />
 </div>
 <GlassCard className="flex-1 p-2 border-l-4 border-l-[#8b5cf6] hover:bg-white/5 transition-colors">
 <h3 className="text-[9px] font-semibold text-[#a78bfa] tracking-widest uppercase mb-1">MAHORAGA ADAPTATION ENGINE</h3>
 <p className="text-xs font-bold text-white mb-1">{selectedDecision.mahoraga.reasoning}</p>
 <p className="text-[9px] text-[#94a3b8] leading-tight flex items-center gap-1">
 <ArrowRight className="w-3 h-3 text-[#a78bfa]" />
 {selectedDecision.mahoraga.adjustment}
 </p>
 </GlassCard>
 </div>

 {/* 3. Risk Guardian */}
 <div className="relative flex items-start gap-4 shrink-0">
 <div className="w-5 h-5 rounded-full bg-black border-2 border-[#f59e0b] flex items-center justify-center shrink-0 z-10 mt-1">
 <ShieldCheck className="w-2 h-2 text-[#f59e0b]" />
 </div>
 <GlassCard className="flex-1 p-2 border-l-4 border-l-[#f59e0b] hover:bg-white/5 transition-colors">
 <h3 className="text-[9px] font-semibold text-[#f59e0b] tracking-widest uppercase mb-1">RISK GUARDIAN</h3>
 <div className="flex items-center gap-2 mb-1">
 <p className="text-xs font-bold text-white">{selectedDecision.riskGuardian.check}</p>
 <div className="scale-75 origin-left">
 <StatusBadge 
 label={selectedDecision.riskGuardian.status} 
 variant={selectedDecision.riskGuardian.status === 'APPROVED' ? 'success' : 'danger'} 
 />
 </div>
 </div>
 <p className="text-[9px] text-[#94a3b8] leading-tight">{selectedDecision.riskGuardian.details}</p>
 </GlassCard>
 </div>

 {/* 4. Xiphos Execution */}
 <div className="relative flex items-start gap-4 shrink-0">
 <div className="w-5 h-5 rounded-full bg-black border-2 border-white flex items-center justify-center shrink-0 z-10 mt-1">
 <Zap className="w-2 h-2 text-white" />
 </div>
 <GlassCard className="flex-1 p-2 border-l-4 border-l-white hover:bg-white/5 transition-colors">
 <h3 className="text-[9px] font-semibold text-white/50 tracking-widest uppercase mb-1">XIPHOS EXECUTION ENGINE</h3>
 <div className="flex items-center justify-between">
 <p className="text-xs font-bold text-white">{selectedDecision.xiphos.action}</p>
 <span className="text-[8px] font-mono text-white/50 flex items-center gap-1">
 LATENCY <span className="text-white font-bold">{selectedDecision.xiphos.latency}</span>
 </span>
 </div>
 </GlassCard>
 </div>

 </div>

 </motion.div>
 )}
 </AnimatePresence>
 </div>

 </GlassPanel>
 </div>
 );
}
