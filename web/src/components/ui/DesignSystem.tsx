"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Send, CheckCircle2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { TypewriterText } from "./TypewriterText";

// ==========================================
// 1. DESIGN SYSTEM SYSTEM TOKENS
// ==========================================
export const TOKENS = {
  borderRadius: {
    xs: "rounded-[4px]",
    sm: "rounded-[8px]",
    md: "rounded-[12px]",
    lg: "rounded-[16px]",
    xl: "rounded-[24px]",
    full: "rounded-full",
  },
  borders: {
    dark: "border border-[#151522]",
    purple: "border border-[#8b5cf6]/20",
    gold: "border border-[#f59e0b]/20",
    activePurple: "border border-[#8b5cf6]/50",
    activeGold: "border border-[#f59e0b]/50",
  },
  bg: {
    panel: "bg-[#09090f]",
    casing: "bg-[#07070c]",
    dark: "bg-[#050508]",
    glass: "bg-[#0f0f1a]/65 backdrop-blur-md",
  },
  typography: {
    mono: "font-mono select-none",
    title: "text-[9px] font-bold tracking-[0.2em] uppercase text-[#a78bfa]",
    sub: "text-[7px] text-[#52525b] uppercase font-bold tracking-widest block mt-0.5",
    body: "text-[8.5px] leading-tight text-[#e8e8f0]",
    details: "text-[7px] text-[#71717a] leading-normal",
    value: "text-[10px] font-black tracking-wide",
  },
  shadows: {
    low: "shadow-[0_0_10px_rgba(139,92,246,0.01)]",
    medium: "shadow-[0_0_20px_rgba(139,92,246,0.03)]",
    purpleGlow: "shadow-[0_0_15px_rgba(139,92,246,0.12)]",
    goldGlow: "shadow-[0_0_15px_rgba(245,158,11,0.15)]",
  },
  transitions: {
    springCard: { type: "spring", stiffness: 300, damping: 22 } as const,
    springNode: { type: "spring", stiffness: 200, damping: 18 } as const,
    springLog: { type: "spring", stiffness: 120, damping: 16 } as const,
    easeProgress: { duration: 1.5, ease: [0.16, 1, 0.3, 1] } as const,
  }
};

// ==========================================
// 2. GLASS PANEL / CARD
// ==========================================
export function GlassCard({ 
  children, 
  className = "", 
  animateFloat = false, 
  delay = 0 
}: { 
  children: React.ReactNode; 
  className?: string; 
  animateFloat?: boolean; 
  delay?: number;
}) {
  const transitionConfig = animateFloat
    ? { repeat: Infinity, duration: 7, ease: "easeInOut" as const, delay }
    : TOKENS.transitions.springCard;

  return (
    <motion.div
      whileHover={{ y: -4, border: "1px solid rgba(139,92,246,0.25)", boxShadow: TOKENS.shadows.purpleGlow }}
      transition={transitionConfig}
      animate={animateFloat ? { y: [0, -3, 0] } : {}}
      style={{ transformStyle: "preserve-3d" }}
      className={`${TOKENS.bg.glass} ${TOKENS.borders.dark} ${TOKENS.borderRadius.md} p-4 relative ${TOKENS.shadows.low} transition-colors duration-300 ${className}`}
    >
      {children}
    </motion.div>
  );
}

// ==========================================
// 3. HUD BUTTONS
// ==========================================
export function HUDButton({
  children,
  onClick,
  variant = "purple",
  cmdKey,
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "purple" | "gold" | "glass";
  cmdKey?: string;
  className?: string;
}) {
  const variantStyles = {
    purple: "bg-[#8b5cf6]/20 border-[#8b5cf6]/40 hover:bg-[#8b5cf6] text-[#a78bfa] hover:text-white shadow-[0_0_15px_rgba(139,92,246,0.05)]",
    gold: "bg-[#f59e0b]/20 border-[#f59e0b]/40 hover:bg-[#f59e0b] text-[#f59e0b] hover:text-black shadow-[0_0_15px_rgba(245,158,11,0.05)]",
    glass: "bg-[#0f0f1a] hover:bg-[#8b5cf6]/15 border-[#151522] hover:border-[#8b5cf6]/40 text-[#a78bfa]"
  };

  return (
    <motion.button
      whileHover={{ y: -2.5, scale: 1.015, boxShadow: variant === "gold" ? TOKENS.shadows.goldGlow : TOKENS.shadows.purpleGlow }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2 border ${TOKENS.borderRadius.sm} text-[9px] font-bold tracking-widest uppercase cursor-pointer transition-all duration-200 ${variantStyles[variant]} ${TOKENS.typography.mono} ${className}`}
    >
      {children}
      {cmdKey && (
        <span className="text-[7px] bg-black/35 px-1 py-0.5 rounded opacity-75">{cmdKey}</span>
      )}
    </motion.button>
  );
}

// ==========================================
// 4. STATUS BADGE
// ==========================================
export function StatusBadge({ 
  status, 
  text 
}: { 
  status: "active" | "standby" | "alert"; 
  text: string 
}) {
  const colors = {
    active: { bg: "bg-[#4ade80]/10", border: "border-[#4ade80]/20", text: "text-[#4ade80]" },
    standby: { bg: "bg-[#f59e0b]/10", border: "border-[#f59e0b]/20", text: "text-[#f59e0b]" },
    alert: { bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", text: "text-[#f87171]" }
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${colors[status].bg} border ${colors[status].border} ${TOKENS.typography.mono}`}>
      <span className="relative flex h-1.5 w-1.5">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === "active" ? "bg-[#4ade80]" : status === "standby" ? "bg-[#f59e0b]" : "bg-[#f87171]"}`} />
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${status === "active" ? "bg-[#4ade80]" : status === "standby" ? "bg-[#f59e0b]" : "bg-[#f87171]"}`} />
      </span>
      <span className={`text-[7.5px] font-bold uppercase tracking-wider ${colors[status].text}`}>{text}</span>
    </div>
  );
}

// ==========================================
// 5. PROGRESS RING (SVG Circular Progress)
// ==========================================
export function ProgressRing({ 
  value, 
  max = 100, 
  size = 50, 
  strokeWidth = 4, 
  color = "#8b5cf6" 
}: {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const r = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#151522" strokeWidth={strokeWidth} />
        <motion.circle 
          cx={size / 2} cy={size / 2} r={r} fill="none" 
          stroke={color} strokeWidth={strokeWidth} 
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={TOKENS.transitions.easeProgress}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[7px] text-[#e8e8f0] font-black font-mono">
        <AnimatedNumber value={value} decimals={0} suffix="%" />
      </div>
    </div>
  );
}

// ==========================================
// 6. CIRCULAR GAUGE (Circular dial with custom segments)
// ==========================================
export function CircularGauge({
  label,
  value,
  percentage,
  color = "#8b5cf6"
}: {
  label: string;
  value: number;
  percentage: number; // 0 to 1
  color?: string;
}) {
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - percentage * circumference;

  return (
    <div className={`bg-[#09090f] border border-[#151522] rounded-xl p-3 flex items-center gap-4 ${TOKENS.typography.mono}`}>
      <div className="relative flex items-center justify-center w-[75px] h-[75px] shrink-0">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="37.5" cy="37.5" r={radius} fill="none" stroke="#151522" strokeWidth={strokeWidth} />
          <motion.circle 
            cx="37.5" cy="37.5" r={radius} fill="none" 
            stroke={color} strokeWidth={strokeWidth} 
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={TOKENS.transitions.easeProgress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[6px] text-[#52525b] uppercase font-bold tracking-widest">{label}</span>
          <span className="text-[8px] font-black text-[#e8e8f0] mt-0.5">
            <AnimatedNumber value={value} decimals={0} prefix="$" />
          </span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. HUD CONSOLE (Terminal view)
// ==========================================
export function HUDConsole({
  title,
  logs,
  onClear
}: {
  title: string;
  logs: { time: string; tag: string; text: string; color: string }[];
  onClear?: () => void;
}) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className={`flex flex-col gap-2 h-full ${TOKENS.typography.mono}`}>
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[9px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#a78bfa]" />
          {title}
        </h2>
        {onClear && (
          <button onClick={onClear} className="text-[8px] text-[#52525b] hover:text-[#e8e8f0] cursor-pointer tracking-wider font-bold">
            CLEAR
          </button>
        )}
      </div>

      <div className="flex-1 bg-[#09090f] border border-[#151522] rounded-xl p-3 flex flex-col justify-between shadow-[0_0_10px_rgba(139,92,246,0.01)] min-h-[160px]">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-2 mb-3 max-h-[100px]">
          {logs.map((log, idx) => (
            <div key={idx} className="text-[8px] leading-normal flex items-start gap-2 hover:bg-white/[0.01] px-1 py-0.5 rounded transition-colors">
              <span className="text-[#52525b] shrink-0 font-bold">[{log.time}]</span>
              <span className={`font-bold shrink-0 w-16 uppercase ${log.color}`}>
                [{log.tag}]
              </span>
              <span className={`${log.color} break-all`}>
                <TypewriterText text={log.text} speed={8} />
              </span>
            </div>
          ))}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 8. MEMORY NODE / TIMELINE ITEM
// ==========================================
export function MemoryNode({
  time,
  type,
  text,
  idx
}: {
  time: string;
  type: string;
  text: string;
  idx: number;
}) {
  const typeColors: Record<string, string> = {
    ADAPTATION: "text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/5",
    SIGNAL: "text-[#38bdf8] border-[#38bdf8]/30 bg-[#38bdf8]/5",
    RISK: "text-[#f87171] border-[#f87171]/30 bg-[#f87171]/5",
    EXECUTION: "text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/5",
  };

  const borderClass = typeColors[type] || "text-[#e8e8f0] border-[#151522] bg-[#0f0f1a]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: idx * 0.08 }}
      className={`border ${borderClass} rounded-xl p-3 flex flex-col gap-1 w-[200px] shrink-0 cursor-pointer ${TOKENS.typography.mono}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[7.5px] font-bold tracking-wider">{type}</span>
        <span className="text-[7px] text-[#52525b] font-bold">{time}</span>
      </div>
      <p className="text-[8px] text-[#a1a1aa] leading-snug truncate mt-0.5">
        {text}
      </p>
    </motion.div>
  );
}

// ==========================================
// 9. HUD TIMELINE
// ==========================================
export function HUDTimeline({
  title,
  sub,
  items
}: {
  title: string;
  sub: string;
  items: { time: string; type: string; text: string }[];
}) {
  return (
    <div className={`flex flex-col gap-2 h-full ${TOKENS.typography.mono}`}>
      <div className="flex flex-col gap-0.5 shrink-0 px-1">
        <h2 className="text-[9px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase">
          {title}
        </h2>
        <span className="text-[7px] text-[#52525b] uppercase font-bold tracking-widest mt-0.5">
          {sub}
        </span>
      </div>

      <div className="flex-1 bg-[#09090f] border border-[#151522] rounded-xl p-3 flex items-center gap-3 overflow-x-auto custom-scrollbar-horizontal shadow-[0_0_10px_rgba(139,92,246,0.01)] min-h-[90px]">
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            <MemoryNode {...item} idx={idx} />
            {idx < items.length - 1 && (
              <svg className="w-6 h-1 flex-shrink-0" viewBox="0 0 24 4">
                <line x1="0" y1="2" x2="24" y2="2" stroke="#151522" strokeWidth="2" strokeDasharray="3, 3" />
              </svg>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 10. AI REASONING CARD
// ==========================================
export function AIReasoningCard({
  title,
  steps
}: {
  title: string;
  steps: { label: string; sub: string; status: "complete" | "running" | "failed" }[];
}) {
  return (
    <div className={`flex flex-col gap-2 h-full ${TOKENS.typography.mono}`}>
      <div className="flex flex-col gap-0.5 shrink-0">
        <h2 className="text-[9px] font-bold text-[#a78bfa] tracking-[0.2em] uppercase">
          {title}
        </h2>
        <span className="text-[7px] text-[#52525b] uppercase font-bold tracking-widest mt-0.5">
          Step Analysis
        </span>
      </div>
      
      <div className="flex-1 bg-[#09090f] border border-[#151522] rounded-xl p-3 flex flex-col gap-2 overflow-y-auto custom-scrollbar shadow-[0_0_10px_rgba(139,92,246,0.01)]">
        {steps.map((st, idx) => (
          <div key={idx} className="flex items-start justify-between text-[8.5px] border-b border-[#151522]/30 pb-1.5 last:border-b-0 last:pb-0">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 shrink-0">
                {st.status === "complete" && <CheckCircle2 className="w-3 h-3 text-[#4ade80]" />}
                {st.status === "running" && <RefreshCw className="w-3 h-3 text-[#f59e0b] animate-spin" />}
                {st.status === "failed" && <AlertCircle className="w-3 h-3 text-[#f87171]" />}
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`font-bold tracking-wide ${st.status === "running" ? "text-[#f59e0b]" : st.status === "failed" ? "text-[#f87171]" : "text-[#e8e8f0]"}`}>
                  {st.label}
                </span>
                <span className="text-[#52525b] text-[8px] leading-tight truncate">{st.sub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 11. NEURAL CONNECTIONS & MINI CHART
// ==========================================
export function MiniChart({
  points,
  color = "#a78bfa",
  className = ""
}: {
  points: string;
  color?: string;
  className?: string;
}) {
  return (
    <div className={`h-2 w-16 opacity-70 ${className}`}>
      <svg className="w-full h-full" viewBox="0 0 100 20" preserveAspectRatio="none">
        <motion.path 
          d={points} 
          fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}

// ==========================================
// 12. FLOATING NOTIFICATIONS (Toast Alert)
// ==========================================
export function FloatingNotification({
  message,
  type = "info",
  onClose
}: {
  message: string;
  type?: "info" | "warning" | "error";
  onClose: () => void;
}) {
  const typeIcons = {
    info: Sparkles,
    warning: AlertCircle,
    error: AlertCircle
  };
  const Icon = typeIcons[type];

  const typeColors = {
    info: "border-[#8b5cf6]/35 bg-[#0f0f1a] text-[#a78bfa]",
    warning: "border-[#f59e0b]/35 bg-[#0f0f1a] text-[#f59e0b]",
    error: "border-[#f87171]/35 bg-[#0f0f1a] text-[#f87171]"
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 px-4 py-3 border ${TOKENS.borderRadius.md} shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-sm ${typeColors[type]} ${TOKENS.typography.mono}`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-[9px] font-bold tracking-wider leading-tight">{message}</span>
      <button onClick={onClose} className="text-[#52525b] hover:text-white cursor-pointer font-bold text-[9px] ml-2 font-mono">×</button>
    </motion.div>
  );
}
