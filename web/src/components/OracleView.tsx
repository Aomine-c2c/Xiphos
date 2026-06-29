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

const mockDecisions: DecisionExplanation[] = [
  {
    id: "DEC-1042",
    query: "Why did we take Trade #1042 (LONG EURUSD)?",
    type: "TRADE",
    timestamp: "14:22:05 UTC",
    dataCore: {
      event: "Liquidity Sweep Detected",
      details: "Price swept the previous daily low at 1.0845 on high volume (14K ticks/min)."
    },
    mahoraga: {
      reasoning: "Matched 'Mean Reversion' pattern #44 with 89% confidence.",
      adjustment: "Reduced target by 5% due to incoming ECB speech volatility."
    },
    riskGuardian: {
      check: "Portfolio VaR & Drawdown Limit",
      status: "APPROVED",
      details: "Current VaR 0.4% (Limit 1.0%). Added exposure 0.15%."
    },
    xiphos: {
      action: "Executed Buy Limit at 1.0847",
      latency: "12ms"
    }
  },
  {
    id: "DEC-1043",
    query: "Why was lot size reduced by 50%?",
    type: "ADAPTATION",
    timestamp: "09:15:30 UTC",
    dataCore: {
      event: "Volatility Regime Shift",
      details: "VIX proxy spiked 22%. Average True Range (ATR) doubled over last 4 hours."
    },
    mahoraga: {
      reasoning: "High-volatility regime identified (Regime C).",
      adjustment: "Base lot size modifier reduced from 1.0x to 0.5x to preserve capital."
    },
    riskGuardian: {
      check: "Dynamic Position Sizing (Kelly)",
      status: "APPROVED",
      details: "Kelly fraction constraint met. Max concurrent trades capped at 3."
    },
    xiphos: {
      action: "Updated live risk parameters",
      latency: "4ms"
    }
  },
  {
    id: "DEC-1044",
    query: "Why did Risk Guardian block the GBPUSD short?",
    type: "RISK_REJECTION",
    timestamp: "11:05:10 UTC",
    dataCore: {
      event: "News Event Imminent",
      details: "BoE Interest Rate Decision scheduled in 4 minutes."
    },
    mahoraga: {
      reasoning: "Breakout strategy signaled SHORT with 78% conviction.",
      adjustment: "Standard entry proposed."
    },
    riskGuardian: {
      check: "Pre-News Block",
      status: "REJECTED",
      details: "Hard rule: No new entries within 5 minutes of Tier 1 macroeconomic data."
    },
    xiphos: {
      action: "Order Cancelled",
      latency: "2ms"
    }
  }
];

export default function OracleView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDecision, setSelectedDecision] = useState<DecisionExplanation | null>(mockDecisions[0]);

  return (
    <div className="flex flex-col w-full h-full font-mono select-none overflow-hidden gap-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 relative">
      <GlassPanel glowColor="white">

        {/* Header */}
        <PageHeader 
          title="ORACLE EXPLAINABILITY ENGINE" 
          icon={Eye} 
          glowColor="white"
          subtitle="Radical Transparency Protocol"
        />

        {/* Search & Suggestions */}
        <div className="p-6 border-b border-white/5 bg-black/20 shrink-0 z-10">
          <div className="relative max-w-3xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
            <input 
              type="text" 
              placeholder="Ask Oracle: 'Why did we take Trade #1492?'" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/50 border border-white/10 text-white pl-12 pr-4 py-4 rounded-xl outline-none focus:border-white/40 transition-colors text-sm font-bold placeholder:text-white/20"
            />
          </div>

          <div className="flex flex-wrap gap-3 max-w-3xl mx-auto justify-center">
            {mockDecisions.map(dec => (
              <Button
                key={dec.id}
                onClick={() => setSelectedDecision(dec)}
                variant={selectedDecision?.id === dec.id ? "primary" : "ghost"}
                glowColor="white"
                className={`rounded-full ${selectedDecision?.id === dec.id ? "bg-white text-black hover:bg-white hover:text-black border-white" : ""}`}
                label={dec.query}
              />
            ))}
          </div>
        </div>

        {/* Explanation Canvas */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar z-10 relative flex justify-center">
          <AnimatePresence mode="wait">
            {selectedDecision && (
              <motion.div 
                key={selectedDecision.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-4xl flex flex-col gap-6"
              >
                
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-black text-white">{selectedDecision.query}</h2>
                  <p className="text-xiphos-muted text-sm tracking-widest mt-2">TIMESTAMP: {selectedDecision.timestamp}</p>
                </div>

                {/* Vertical Timeline / Tree */}
                <div className="relative pl-8 pb-8">
                  {/* Timeline Line */}
                  <div className="absolute left-11 top-4 bottom-4 w-px bg-gradient-to-b from-white/20 via-white/5 to-transparent"></div>

                  {/* 1. Neural Data Core */}
                  <div className="relative flex items-start gap-6 mb-12">
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-xiphos-cyan flex items-center justify-center shrink-0 z-10 mt-1">
                      <Database className="w-3 h-3 text-xiphos-cyan" />
                    </div>
                    <GlassCard className="flex-1 p-5 border-l-4 border-l-xiphos-cyan hover:bg-white/5 transition-colors">
                      <h3 className="text-xs font-black text-xiphos-cyan tracking-widest uppercase mb-1">NEURAL DATA CORE</h3>
                      <p className="text-lg font-bold text-white mb-2">{selectedDecision.dataCore.event}</p>
                      <p className="text-sm text-xiphos-muted leading-relaxed">{selectedDecision.dataCore.details}</p>
                    </GlassCard>
                  </div>

                  {/* 2. Mahoraga Engine */}
                  <div className="relative flex items-start gap-6 mb-12">
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-xiphos-purple flex items-center justify-center shrink-0 z-10 mt-1">
                      <Network className="w-3 h-3 text-xiphos-purple" />
                    </div>
                    <GlassCard className="flex-1 p-5 border-l-4 border-l-xiphos-purple hover:bg-white/5 transition-colors">
                      <h3 className="text-xs font-black text-xiphos-purple tracking-widest uppercase mb-1">MAHORAGA ADAPTATION ENGINE</h3>
                      <p className="text-lg font-bold text-white mb-2">{selectedDecision.mahoraga.reasoning}</p>
                      <p className="text-sm text-xiphos-muted leading-relaxed flex items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-xiphos-purple" />
                        {selectedDecision.mahoraga.adjustment}
                      </p>
                    </GlassCard>
                  </div>

                  {/* 3. Risk Guardian */}
                  <div className="relative flex items-start gap-6 mb-12">
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-xiphos-gold flex items-center justify-center shrink-0 z-10 mt-1">
                      <ShieldCheck className="w-3 h-3 text-xiphos-gold" />
                    </div>
                    <GlassCard className="flex-1 p-5 border-l-4 border-l-xiphos-gold hover:bg-white/5 transition-colors">
                      <h3 className="text-xs font-black text-xiphos-gold tracking-widest uppercase mb-1">RISK GUARDIAN</h3>
                      <div className="flex items-center gap-3 mb-2">
                        <p className="text-lg font-bold text-white">{selectedDecision.riskGuardian.check}</p>
                        <StatusBadge 
                          label={selectedDecision.riskGuardian.status} 
                          variant={selectedDecision.riskGuardian.status === 'APPROVED' ? 'success' : 'danger'} 
                        />
                      </div>
                      <p className="text-sm text-xiphos-muted leading-relaxed">{selectedDecision.riskGuardian.details}</p>
                    </GlassCard>
                  </div>

                  {/* 4. Xiphos Execution */}
                  <div className="relative flex items-start gap-6">
                    <div className="w-6 h-6 rounded-full bg-black border-2 border-white flex items-center justify-center shrink-0 z-10 mt-1">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <GlassCard className="flex-1 p-5 border-l-4 border-l-white hover:bg-white/5 transition-colors">
                      <h3 className="text-xs font-black text-white/50 tracking-widest uppercase mb-1">XIPHOS EXECUTION ENGINE</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold text-white">{selectedDecision.xiphos.action}</p>
                        <span className="text-xs font-mono text-white/50 flex items-center gap-1">
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
