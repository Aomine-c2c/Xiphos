"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Network, Search, BrainCircuit, ChevronRight, CheckCircle2, 
  XOctagon, AlertTriangle, Activity, Database, Sparkles, Plus, Minus, Layers, Target
} from "lucide-react";

// --- Types ---
type Opportunity = {
  id: string;
  asset: string;
  direction: "LONG" | "SHORT";
  probability: number;
  confidence: number;
  riskPct: number;
  expectedRewardPct: number;
  timestamp: string;
  reasoning: {
    evidence: string;
    indicators: string[];
    counterArguments: string[];
    decisionLog: string[];
  };
};

// --- Mock Data ---
const OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    asset: "EUR/USD",
    direction: "LONG",
    probability: 88.4,
    confidence: 94,
    riskPct: 0.5,
    expectedRewardPct: 2.1,
    timestamp: "2 mins ago",
    reasoning: {
      evidence: "Macro liquidity conditions indicate heavy dollar offloading from central European banks over the last 4 hours. Order book imbalance detected on tier-1 ECNs with a 3.4:1 bid/ask ratio.",
      indicators: [
        "RSI (14) printed bullish divergence on M30 timeframe.",
        "VWAP (Daily) crossed above weekly mean threshold.",
        "Dark pool volume index spiked +400% in the last 15 minutes."
      ],
      counterArguments: [
        "Impending ECB rate decision in 48 hours could invalidate current directional bias.",
        "Retail sentiment is heavily skewed long (78%), contrarian risk is elevated."
      ],
      decisionLog: [
        "Initiating macro environment scan...",
        "Validating order book delta across aggregated exchanges.",
        "Computing risk-adjusted probability matrix.",
        "Checking correlation against Treasury yields... Passed.",
        "Finalizing entry parameters. Confidence threshold met."
      ]
    }
  }
];

// Typewriter Effect Component
const Typewriter = ({ text, delay = 10 }: { text: string, delay?: number }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText(""); 
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, delay);
    return () => clearInterval(interval);
  }, [text, delay]);

  return <span>{displayedText}</span>;
};

// Expandable Card
const ExpandableCard = ({ title, icon: Icon, color, children, defaultOpen = false }: any) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[#09090e] border border-[#1e1e2e] rounded-xl overflow-hidden mb-4">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#1e1e2e]/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-sm font-bold text-white uppercase tracking-wider">{title}</span>
        </div>
        {isOpen ? <Minus className="w-4 h-4 text-[#52525b]" /> : <Plus className="w-4 h-4 text-[#52525b]" />}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#1e1e2e]"
          >
            <div className="p-4 text-sm text-[#94a3b8] leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { useTradingStore } from "../store/useTradingStore";

export default function IntelligenceCenterView() {
  const [activeView, setActiveView] = useState<"OPPORTUNITIES" | "STRATEGIES">("STRATEGIES");
  
  // Read from Zustand store
  const storeOpportunities = useTradingStore(state => state.opportunities);
  const MOCK_OPPORTUNITIES = [
    {
      id: "opp-001",
      asset: "EUR/USD",
      direction: "LONG" as const,
      probability: 88.4,
      confidence: 94,
      riskPct: 0.5,
      expectedRewardPct: 2.1,
      timestamp: "2 mins ago",
      reasoning: {
        evidence: "Macro liquidity conditions indicate heavy dollar offloading from central European banks over the last 4 hours. Order book imbalance detected on tier-1 ECNs with a 3.4:1 bid/ask ratio.",
        indicators: [
          "RSI (14) printed bullish divergence on M30 timeframe.",
          "VWAP (Daily) crossed above weekly mean threshold.",
          "Dark pool volume index spiked +400% in the last 15 minutes."
        ],
        counterArguments: [
          "Impending ECB rate decision in 48 hours could invalidate current directional bias.",
          "Retail sentiment is heavily skewed long (78%), contrarian risk is elevated."
        ],
        decisionLog: [
          "Initiating macro environment scan...",
          "Validating order book delta across aggregated exchanges.",
          "Computing risk-adjusted probability matrix.",
          "Checking correlation against Treasury yields... Passed.",
          "Finalizing entry parameters. Confidence threshold met."
        ]
      }
    }
  ];

  const ACTIVE_OPPORTUNITIES = storeOpportunities.length > 0 ? storeOpportunities : MOCK_OPPORTUNITIES;

  const [selectedOppId, setSelectedOppId] = useState<string>(ACTIVE_OPPORTUNITIES[0].id);
  const selectedOpp = ACTIVE_OPPORTUNITIES.find(o => o.id === selectedOppId);

  return (
    <div className="flex flex-col w-full h-full bg-transparent text-sm overflow-hidden select-none animate-in fade-in rounded-xl border-none">
      
      {/* Header Tabs */}
      <div className="h-14 border-b border-[#1e1e2e] flex items-center justify-between px-6 shrink-0 bg-[#0a0a10]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-[#a78bfa]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-bold text-[#e8e8f0] uppercase tracking-widest">Intelligence Center</span>
            <span className="text-[9px] font-mono text-[#94a3b8] uppercase tracking-wider">Reasoning & Strategies</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#05050a] p-1 rounded-lg border border-[#1e1e2e]">
          <button
            onClick={() => setActiveView("STRATEGIES")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${
              activeView === "STRATEGIES" 
                ? "bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30" 
                : "text-[#52525b] hover:text-[#94a3b8]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>AI Strategies</span>
          </button>
          <button
            onClick={() => setActiveView("OPPORTUNITIES")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all ${
              activeView === "OPPORTUNITIES" 
                ? "bg-[#8b5cf6]/20 text-[#a78bfa] border border-[#8b5cf6]/30" 
                : "text-[#52525b] hover:text-[#94a3b8]"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Opportunities</span>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 relative">
        <AnimatePresence mode="wait">
          
          {/* STRATEGIES NEURAL VIEWER */}
          {activeView === "STRATEGIES" && (
            <motion.div key="strategies" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex">
              <div className="w-80 bg-[#09090e] border-r border-[#1e1e2e] flex flex-col shrink-0 relative z-10 p-4">
                <h2 className="text-xs font-bold tracking-widest text-[#94a3b8] uppercase mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#8b5cf6]" />
                  Active Models
                </h2>
                <div className="p-3 rounded-xl border bg-[#1e1e2e] border-[#8b5cf6]/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-base">Mean Reversion v4.2</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#4ade80] bg-[#4ade80]/10">ACTIVE</span>
                  </div>
                  <div className="text-xs text-[#94a3b8]">Pairs: EURUSD, GBPUSD</div>
                </div>
                <div className="p-3 rounded-xl border bg-[#05050a] border-[#1e1e2e] mt-2 opacity-50 cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-base">Momentum Breakout</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-[#f59e0b] bg-[#f59e0b]/10">STANDBY</span>
                  </div>
                  <div className="text-xs text-[#94a3b8]">Pairs: XAUUSD, BTCUSD</div>
                </div>
              </div>
              
              <div className="flex-1 relative bg-[#05050a] overflow-hidden">
                {/* Neural Map Grid Background */}
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                
                {/* Neural Nodes Visualization */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <motion.path d="M 200 300 Q 400 300, 500 400" fill="none" stroke="#4ade80" strokeWidth="2" opacity="0.5" strokeDasharray="5,5" className="animate-pulse" />
                    <motion.path d="M 200 500 Q 400 500, 500 400" fill="none" stroke="#8b5cf6" strokeWidth="2" opacity="0.5" />
                    <motion.path d="M 500 400 L 800 400" fill="none" stroke="#a78bfa" strokeWidth="4" opacity="0.8" />
                  </svg>

                  {/* Input Layer */}
                  <div className="absolute left-[150px] top-1/2 -translate-y-1/2 flex flex-col gap-12">
                    <div className="w-32 p-3 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(74,222,128,0.1)] relative z-10">
                      <span className="text-[10px] font-bold text-[#4ade80] mb-1">RSI (14)</span>
                      <span className="text-xs text-white">Weight: 0.85</span>
                    </div>
                    <div className="w-32 p-3 bg-[#0f0f1a] border border-[#1e1e2e] rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(139,92,246,0.1)] relative z-10">
                      <span className="text-[10px] font-bold text-[#8b5cf6] mb-1">VWAP Delta</span>
                      <span className="text-xs text-white">Weight: 1.12</span>
                    </div>
                  </div>

                  {/* Hidden Layer / Core Logic */}
                  <div className="absolute left-[450px] top-1/2 -translate-y-1/2 w-40 p-4 bg-[#1e1e2e]/80 backdrop-blur-md border border-[#8b5cf6] rounded-xl flex flex-col items-center shadow-[0_0_30px_rgba(139,92,246,0.3)] relative z-10">
                    <BrainCircuit className="w-8 h-8 text-[#a78bfa] mb-2 animate-pulse" />
                    <span className="text-xs font-bold text-white mb-1">Ensemble Oracle</span>
                    <span className="text-[9px] text-[#a78bfa] text-center">Sigmoid Activation<br/>Confidence Threshold: 85%</span>
                  </div>

                  {/* Output Layer */}
                  <div className="absolute left-[800px] top-1/2 -translate-y-1/2 w-32 p-3 bg-[#09090e] border border-[#4ade80]/50 rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(74,222,128,0.2)] relative z-10">
                    <Target className="w-6 h-6 text-[#4ade80] mb-2" />
                    <span className="text-[10px] font-bold text-[#4ade80] uppercase">Execution</span>
                    <span className="text-xs text-white">Trigger Ready</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* OPPORTUNITIES TRACE VIEWER */}
          {activeView === "OPPORTUNITIES" && (
            <motion.div key="opportunities" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex">
              <div className="w-80 bg-[#09090e] border-r border-[#1e1e2e] flex flex-col shrink-0 relative z-10 p-4">
                <h2 className="text-xs font-bold tracking-widest text-[#94a3b8] uppercase mb-4 flex items-center gap-2">
                  <Search className="w-4 h-4 text-[#8b5cf6]" />
                  Opportunity Feed
                </h2>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                  {OPPORTUNITIES.map(opp => {
                    const isSelected = selectedOppId === opp.id;
                    const isLong = opp.direction === "LONG";
                    return (
                      <div 
                        key={opp.id}
                        onClick={() => setSelectedOppId(opp.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                          isSelected ? "bg-[#1e1e2e] border-[#8b5cf6]/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]" : "bg-[#05050a] border-[#1e1e2e] hover:border-[#52525b]"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{opp.asset}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLong ? "text-[#4ade80] bg-[#4ade80]/10" : "text-[#f87171] bg-[#f87171]/10"}`}>
                              {opp.direction}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-[#94a3b8]">Prob: <span className="text-white font-mono">{opp.probability}%</span></span>
                          <span className="text-[#94a3b8]">RR: <span className="text-white font-mono">1:{(opp.expectedRewardPct / opp.riskPct).toFixed(1)}</span></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Trace Output */}
              <div className="flex-1 overflow-y-auto custom-scrollbar relative p-6">
                <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(#8b5cf6 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>
                
                {selectedOpp && (
                  <div className="max-w-4xl mx-auto relative z-10 flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#a78bfa]" />
                      </div>
                      <div className="flex flex-col">
                        <h1 className="text-2xl font-bold text-white">{selectedOpp.asset}</h1>
                        <p className="text-sm text-[#a78bfa] font-mono tracking-widest">OPPORTUNITY REASONING TRACE</p>
                      </div>
                    </div>

                    <ExpandableCard title="Synthesized Evidence" icon={Database} color="#3b82f6" defaultOpen={true}>
                      <Typewriter text={selectedOpp.reasoning.evidence} delay={15} />
                    </ExpandableCard>

                    <ExpandableCard title="Technical Indicators" icon={Activity} color="#4ade80" defaultOpen={true}>
                      <ul className="space-y-3">
                        {selectedOpp.reasoning.indicators.map((ind, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-4 h-4 text-[#4ade80] mt-0.5 shrink-0" />
                            <span>{ind}</span>
                          </li>
                        ))}
                      </ul>
                    </ExpandableCard>

                    <ExpandableCard title="Counter Arguments & Risks" icon={AlertTriangle} color="#f59e0b" defaultOpen={false}>
                      <ul className="space-y-3">
                        {selectedOpp.reasoning.counterArguments.map((arg, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <XOctagon className="w-4 h-4 text-[#f59e0b] mt-0.5 shrink-0" />
                            <span>{arg}</span>
                          </li>
                        ))}
                      </ul>
                    </ExpandableCard>

                    <ExpandableCard title="Execution Decision Log" icon={Network} color="#8b5cf6" defaultOpen={true}>
                      <div className="flex flex-col gap-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#8b5cf6]/30 before:to-transparent">
                        {selectedOpp.reasoning.decisionLog.map((log, i) => (
                          <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-5 h-5 rounded-full border border-[#8b5cf6] bg-[#09090e] text-[#a78bfa] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[0_0_10px_rgba(139,92,246,0.2)]">
                              <div className="w-1.5 h-1.5 bg-[#a78bfa] rounded-full animate-ping"></div>
                            </div>
                            <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] p-3 rounded border border-[#1e1e2e] bg-[#0f0f1a]">
                              <span className="font-mono text-xs text-[#d4d4d8]">{log}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ExpandableCard>

                  </div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
