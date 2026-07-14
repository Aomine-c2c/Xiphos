"use client";

import React, { useState } from "react";
import { 
  FileText, Download, Sparkles, Calendar, TrendingUp, 
  BrainCircuit, AlertTriangle, ShieldAlert, Activity, 
  DollarSign, Printer, ChevronRight
} from "lucide-react";
import { useTradingStore } from "../store/useTradingStore";
import { motion, AnimatePresence } from "framer-motion";
import { GlassPanel } from "./ui/GlassPanel";
import { GlassCard } from "./ui/GlassCard";
import { PageHeader } from "./ui/PageHeader";
import { Button } from "./ui/Button";

type ReportFrequency = "DAILY" | "WEEKLY" | "MONTHLY";

export default function ReportsView() {
  const { performanceMetrics } = useTradingStore();
  const [frequency, setFrequency] = useState<ReportFrequency>("DAILY");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportFrequency | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedReport(null);
    // Simulate AI generation time
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedReport(frequency);
    }, 2500);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="flex flex-col w-full h-full font-sans select-none overflow-hidden gap-4 transition-all duration-300 animate-in fade-in relative">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
          }
          /* Hide non-printable elements inside the report */
          .no-print {
            display: none !important;
          }
          /* Force colors for printing if supported */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}} />

      <GlassPanel className="p-0 flex flex-col h-full no-print" noOverflowHidden>
        <PageHeader 
          title="EXECUTIVE INTELLIGENCE" 
          icon={FileText} 
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 z-10 flex flex-col xl:flex-row gap-6 max-w-7xl mx-auto w-full">
          
          {/* LEFT PANEL: Report Generator Settings */}
          <div className="w-full xl:w-1/3 flex flex-col gap-6 shrink-0">
            <GlassCard className="p-6 flex flex-col gap-6">
              <div>
                <h2 className="text-xs font-bold text-white tracking-widest uppercase flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[#a78bfa]" />
                  AI Report Generator
                </h2>
                <p className="text-[10px] text-[#94a3b8] leading-relaxed">
                  Compile neural observations, risk telemetry, and performance metrics into a cohesive executive summary.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase">FREQUENCY</span>
                <div className="grid grid-cols-3 gap-2">
                  {["DAILY", "WEEKLY", "MONTHLY"].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setFrequency(freq as ReportFrequency)}
                      className={`py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-colors border ${
                        frequency === freq 
                          ? "bg-[#a78bfa]/20 border-[#a78bfa] text-[#a78bfa]" 
                          : "bg-[#0f0f1a] border-[#1e1e2e] text-[#94a3b8] hover:border-[#a78bfa]/50 hover:text-white"
                      }`}
                    >
                      {freq}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <Button 
                  onClick={handleGenerate} 
                  disabled={isGenerating}
                  className="w-full py-4 text-xs font-bold tracking-widest uppercase flex justify-center items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] text-black border-none hover:opacity-90"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <Sparkles className="w-4 h-4" /> SYNTHESIZING DATA...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4" /> GENERATE REPORT
                    </span>
                  )}
                </Button>
              </div>
            </GlassCard>

            {/* Generated Reports Archive */}
            <GlassCard className="p-4 flex flex-col gap-4 flex-1">
              <span className="text-[10px] font-semibold text-[#94a3b8] tracking-widest uppercase flex items-center gap-2 border-b border-[#1e1e2e] pb-2">
                <Calendar className="w-3.5 h-3.5" /> RECENT ARCHIVES
              </span>
              <div className="flex flex-col gap-2">
                {[
                  { id: "R-9402", type: "DAILY", date: "Yesterday" },
                  { id: "R-9395", type: "WEEKLY", date: "Last Week" },
                  { id: "R-9380", type: "MONTHLY", date: "Last Month" },
                ].map((doc) => (
                  <div key={doc.id} className="flex justify-between items-center p-3 bg-[#0f0f1a] border border-[#1e1e2e] rounded hover:border-white/20 transition-colors cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white group-hover:text-[#a78bfa] transition-colors flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-[#94a3b8]" /> {doc.id}
                      </span>
                      <span className="text-[9px] text-[#94a3b8] tracking-widest mt-0.5">{doc.type} • {doc.date}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#1e1e2e] group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>

          {/* RIGHT PANEL: Report View */}
          <div className="w-full xl:w-2/3 flex flex-col">
            <AnimatePresence mode="wait">
              {!generatedReport && !isGenerating && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12 border border-dashed border-[#1e1e2e] rounded-xl bg-[#09090e]/50"
                >
                  <Sparkles className="w-12 h-12 text-[#1e1e2e] mb-4" />
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-2">NO REPORT SELECTED</h3>
                  <p className="text-xs text-[#94a3b8] max-w-sm">
                    Select a frequency and generate an AI report to view executive insights and telemetry summaries.
                  </p>
                </motion.div>
              )}

              {isGenerating && (
                <motion.div 
                  key="generating"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center p-12 border border-[#1e1e2e] rounded-xl bg-[#09090e]"
                >
                  <div className="relative w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full border-t-2 border-[#8b5cf6] animate-spin"></div>
                    <div className="absolute inset-2 rounded-full border-r-2 border-[#a78bfa] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BrainCircuit className="w-8 h-8 text-[#a78bfa] animate-pulse" />
                    </div>
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-widest uppercase mb-2 animate-pulse">SYNTHESIZING INTELLIGENCE</h3>
                  <div className="flex gap-1 text-[10px] text-[#8b5cf6] font-mono mt-4">
                    <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }}>Parsing Logs...</motion.span>
                    <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.3 }}>Analyzing Risk...</motion.span>
                    <motion.span animate={{ opacity: [0,1,0] }} transition={{ repeat: Infinity, duration: 1, delay: 0.6 }}>Drafting Summary...</motion.span>
                  </div>
                </motion.div>
              )}

              {generatedReport && !isGenerating && (
                <motion.div 
                  key="report"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex-1 bg-white text-black p-8 xl:p-12 rounded-xl shadow-2xl relative overflow-y-auto custom-scrollbar print-container"
                  id="printable-report"
                >
                  {/* Export Button (Hidden on Print) */}
                  <div className="absolute top-6 right-6 flex gap-2 no-print">
                    <Button 
                      onClick={handleExportPDF} 
                      className="bg-black text-white hover:bg-gray-800 border-none px-4 py-2 text-xs font-bold tracking-widest flex items-center gap-2"
                    >
                      <Printer className="w-3.5 h-3.5" /> EXPORT PDF
                    </Button>
                  </div>

                  {/* Report Header */}
                  <div className="border-b-2 border-black pb-6 mb-8 mt-4">
                    <div className="flex justify-between items-end mb-4">
                      <h1 className="text-3xl font-black tracking-tighter uppercase">XIPHOS<br/>INTELLIGENCE</h1>
                      <div className="text-right">
                        <div className="text-xs font-bold tracking-widest uppercase text-gray-500">EXECUTIVE SUMMARY</div>
                        <div className="text-sm font-mono font-bold mt-1">{currentDate}</div>
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs font-bold tracking-widest uppercase text-gray-400">
                      <span>REPORT ID: <span className="text-black">XPH-{Date.now().toString().slice(-6)}</span></span>
                      <span>FREQUENCY: <span className="text-black">{generatedReport}</span></span>
                    </div>
                  </div>

                  {/* Report Content Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 leading-relaxed">
                    
                    {/* Performance */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 border-b border-gray-200 pb-2">
                        <TrendingUp className="w-4 h-4" /> PERFORMANCE
                      </h3>
                      <p className="text-sm text-gray-700">
                        The system achieved a profit factor of <strong>{performanceMetrics?.profit_factor.toFixed(2) || "2.14"}</strong> over the {generatedReport.toLowerCase()} period. Win rate stabilized at <strong>{performanceMetrics?.win_rate.toFixed(1) || "68.5"}%</strong> across 142 discrete execution events. Volatility modeling correctly anticipated major market shifts, locking in gains prior to standard deviation spikes.
                      </p>
                    </div>

                    {/* Capital */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 border-b border-gray-200 pb-2">
                        <DollarSign className="w-4 h-4" /> CAPITAL
                      </h3>
                      <p className="text-sm text-gray-700">
                        Total return sits at <strong>+${performanceMetrics?.total_profit.toLocaleString() || "14,250"}</strong>. Equity curve variance remained tightly bounded. Capital allocation efficiency improved by 4.2%, with sidelined reserve capital properly utilized during the high-probability setups identified on Tuesday.
                      </p>
                    </div>

                    {/* Risk */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 border-b border-gray-200 pb-2">
                        <ShieldAlert className="w-4 h-4" /> RISK & EXPOSURE
                      </h3>
                      <p className="text-sm text-gray-700">
                        Maximum drawdown experienced was limited to <strong>${performanceMetrics?.max_drawdown.toLocaleString() || "1,420"}</strong> (1.4%). Correlation limits were breached twice during the Asian session crossover; the system automatically delta-hedged the exposure. Margin utilization never exceeded 15%.
                      </p>
                    </div>

                    {/* Adaptation */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 border-b border-gray-200 pb-2">
                        <Activity className="w-4 h-4" /> ADAPTATION
                      </h3>
                      <p className="text-sm text-gray-700">
                        The Mahoraga Engine shifted regime parameters 3 times. Primary adaptation involved shortening the fast EMA lookback from 13 to 9 periods to account for increased short-term momentum decay. Structural trend filters were widened.
                      </p>
                    </div>

                    {/* Learning */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 border-b border-gray-200 pb-2">
                        <BrainCircuit className="w-4 h-4" /> LEARNING
                      </h3>
                      <p className="text-sm text-gray-700">
                        Neural networks identified a new micro-pattern in liquidity sweeps during the European open. Confidence thresholds for this specific pattern have been elevated from 65% to 82% based on back-tested validation logic generated on the fly.
                      </p>
                    </div>

                    {/* Mistakes */}
                    <div className="flex flex-col gap-3">
                      <h3 className="text-sm font-black tracking-widest uppercase flex items-center gap-2 border-b border-gray-200 pb-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" /> MISTAKES & ANOMALIES
                      </h3>
                      <p className="text-sm text-gray-700">
                        A suboptimal execution occurred on EURUSD resulting in 1.2 pips of negative slippage due to a latency spike (45ms). The logic misfired slightly on a false breakout event; the adaptation weights for false breakout detection have been penalized accordingly.
                      </p>
                    </div>

                  </div>

                  {/* Footer */}
                  <div className="mt-12 pt-6 border-t border-gray-200 flex justify-between items-center opacity-50">
                    <span className="text-[10px] font-bold tracking-widest uppercase">GENERATED BY XIPHOS AI</span>
                    <span className="text-[10px] font-mono uppercase">CONFIDENTIAL & PROPRIETARY</span>
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
