"use client";

import React, { useRef, useEffect } from "react";
import { useTradingStore } from "../store/useTradingStore";

export default function DecisionFeed() {
  const { logs } = useTradingStore();
  const logContainerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Determine line style based on content keywords to match mockup screenshots
  const getLineStyle = (message: string) => {
    if (message.toLowerCase().includes("blocked") || message.toLowerCase().includes("violate")) {
      return "text-[#FF4D4D]"; // Critical/Blocked Red
    }
    if (message.toLowerCase().includes("warn") || message.toLowerCase().includes("released")) {
      return "text-[#ccd6e0]";
    }
    return "text-[#ccd6e0]"; // Standard light grey
  };

  return (
    <div className="w-full h-full bg-[#0E1525] border border-slate-900/80 flex flex-col font-mono select-none overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b border-slate-950 flex items-center bg-[#0a101b]/45">
        <span className="text-[10px] font-black text-xiphos-blue uppercase tracking-widest">
          AI DECISION FEED
        </span>
      </div>

      {/* Log list (scrollable) */}
      <div
        ref={logContainerRef}
        className="flex-1 p-3.5 overflow-hidden space-y-1.5 bg-[#070B14]/40 text-[9px] leading-relaxed"
      >
        {logs.length === 0 ? (
          <div className="text-center py-10 text-slate-700 font-bold">
            [WAITING FOR DECISION STREAM ACTIVITY...]
          </div>
        ) : (
          logs.slice(-5).map((log, i) => (
            <div key={i} className="flex gap-4 items-start font-mono">
              <span className="text-[#425062] font-bold shrink-0">{log.timestamp}</span>
              <span className={`break-all ${getLineStyle(log.message)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      {/* View Full Log Button Box */}
      <div className="flex-shrink-0 p-2 border-t border-slate-950/60 bg-[#0a101b]/20 flex justify-center">
        <button
          onClick={() => alert("Loading historical session logs...")}
          className="px-6 py-1.5 border border-[#1e293b] hover:border-xiphos-blue/30 text-[#6f7e90] hover:text-white text-[8px] font-black tracking-widest uppercase rounded-sm transition-all cursor-pointer bg-slate-950/30"
        >
          VIEW FULL LOG
        </button>
      </div>
    </div>
  );
}
