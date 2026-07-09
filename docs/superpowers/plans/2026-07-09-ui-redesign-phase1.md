# Xiphos UI Redesign Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the glowing cockpit visual language with a clean Graphite Purple fintech SaaS design system, restructure the Dashboard to a KPI-strip + chart-focus layout, and wire all components to real backend data.

**Architecture:** All changes isolated to `web/` (Next.js frontend). The Zustand store already receives real data via Tauri SSE — no backend changes needed. Work replaces CSS tokens, removes glassmorphism/glow, updates fonts, and restructures the Dashboard page layout.

**Tech Stack:** Next.js 14 (App Router), Tailwind CSS v4, Framer Motion, Zustand, Tauri v2, IBM Plex Sans + IBM Plex Mono (Google Fonts), lucide-react

## Global Constraints

- Target window minimum: 1440×900px
- Tailwind CSS v4: all tokens in `@theme` block in `globals.css`
- All color values defined as CSS custom properties; never hardcode hex in components
- Numeric data (prices, %, counts, timestamps): `font-mono` class
- Navigation / labels: `font-sans` class
- No glow utilities, glassmorphism, backdrop-blur, or HUD animations after Task 1
- Keep existing Framer Motion `layoutId` on sidebar active indicator
- Do NOT modify `useTradingStore.ts`, `mockData.ts`, or any backend file

---

## Token Substitution Reference

| Old class | New class |
|---|---|
| `glass-panel` | `bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg` |
| `glass-card` | `bg-[#09090e] border border-[#1e1e2e] rounded` |
| `text-white` | `text-[#e8e8f0]` |
| `text-xiphos-muted` | `text-[#52525b]` |
| `text-xiphos-purple` | `text-[#8b5cf6]` |
| `text-xiphos-emerald` | `text-[#4ade80]` |
| `text-xiphos-crimson` | `text-[#f87171]` |
| `text-xiphos-gold` | `text-[#f59e0b]` |
| `text-xiphos-cyan` | `text-[#a1a1aa]` |
| `bg-xiphos-purple` | `bg-[#8b5cf6]` |
| `bg-xiphos-purple/20` | `bg-[rgba(139,92,246,0.12)]` |
| `border-xiphos-purple` | `border-[#8b5cf6]` |
| `border-xiphos-emerald` | `border-[rgba(74,222,128,0.25)]` |
| `border-xiphos-crimson` | `border-[rgba(248,113,113,0.25)]` |
| `glow-*` | *(remove entirely)* |
| `font-black` | `font-semibold` |
| `backdrop-blur-*` | *(remove entirely)* |
| `bg-[rgba(11,15,23,*)]` | `bg-[#0f0f1a]` |
| `border-[rgba(255,255,255,0.05)]` | `border-[#1e1e2e]` |
| `text-slate-300` | `text-[#a1a1aa]` |

**Signal chip pattern:**
- BUY: `bg-[rgba(74,222,128,0.09)] text-[#4ade80] border border-[rgba(74,222,128,0.2)] font-mono text-[10px] px-1.5 py-0.5 rounded`
- SELL: `bg-[rgba(248,113,113,0.09)] text-[#f87171] border border-[rgba(248,113,113,0.2)] font-mono text-[10px] px-1.5 py-0.5 rounded`
- HOLD: `bg-[rgba(82,82,91,0.1)] text-[#52525b] border border-[rgba(82,82,91,0.2)] font-mono text-[10px] px-1.5 py-0.5 rounded`

---

## Task 1: Design System — globals.css

**Files:** Modify `web/src/app/globals.css`

- [ ] **Step 1: Add Google Fonts import at top (replace line 1)**

  ```css
  @import "tailwindcss";
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap');
  ```

- [ ] **Step 2: Replace entire `@theme` block (lines 3–16)**

  ```css
  @theme {
    --color-bg-base:         #0a0a0f;
    --color-bg-surface:      #0f0f1a;
    --color-bg-elevated:     #14142a;
    --color-bg-input:        #09090e;
    --color-border:          #1e1e2e;
    --color-border-focus:    rgba(139, 92, 246, 0.25);
    --color-border-strong:   #8b5cf6;
    --color-accent:          #8b5cf6;
    --color-accent-dim:      rgba(139, 92, 246, 0.12);
    --color-accent-hover:    #a78bfa;
    --color-accent-muted:    #6d28d9;
    --color-up:              #4ade80;
    --color-up-dim:          rgba(74, 222, 128, 0.09);
    --color-down:            #f87171;
    --color-down-dim:        rgba(248, 113, 113, 0.09);
    --color-warn:            #f59e0b;
    --color-warn-dim:        rgba(245, 158, 11, 0.09);
    --color-neutral:         #52525b;
    --color-text-primary:    #e8e8f0;
    --color-text-secondary:  #a1a1aa;
    --color-text-muted:      #52525b;
    --color-text-accent:     #c4b5fd;
    --font-sans: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
    --font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
  }
  ```

- [ ] **Step 3: Replace `:root` and `body` blocks**

  ```css
  :root {
    --background: var(--color-bg-base);
    --foreground: var(--color-text-primary);
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
    overflow: hidden;
    font-family: var(--font-sans);
  }
  ```

- [ ] **Step 4: Delete these entire blocks**

  Find and delete: `.glass-panel`, `.glass-panel:hover`, `.glass-card`, `.glass-card:hover`, `.glow-purple`, `.glow-gold`, `.glow-cyan`, `.glow-emerald`, `.glow-crimson`, `@keyframes radarSweep`, `.animate-radar-sweep`, `@keyframes pipelinePulse`, `.animate-pipeline-pulse`, `@keyframes neonFlicker`, `.animate-neon-flicker`, `@keyframes pulseGlow`, `.hud-glow-panel`, `@keyframes spin-slow`, `.animate-spin-slow`, `@keyframes float`, `.animate-float`

- [ ] **Step 5: Replace `aiPulse` animation with subtle version**

  ```css
  @keyframes aiPulse {
    0%, 100% { opacity: 0.5; }
    50%       { opacity: 1; }
  }
  .animate-ai-pulse {
    animation: aiPulse 1.8s ease-in-out infinite;
  }
  ```

- [ ] **Step 6: Update scrollbar utilities**

  ```css
  ::-webkit-scrollbar       { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--color-neutral); }

  .custom-scrollbar::-webkit-scrollbar       { width: 3px; height: 3px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 99px; }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: var(--color-neutral); }
  ```

- [ ] **Step 7: Start dev server and verify app loads (not blank)**

  ```
  cd web && npm run dev
  ```

  Expected: http://localhost:3000 loads. CSS class errors in components are acceptable at this stage.

- [ ] **Step 8: Commit**

  ```
  git add web/src/app/globals.css
  git commit -m "feat: replace design tokens with Graphite Purple system, IBM Plex fonts"
  ```

---

## Task 2: LeftNav Restyle

**Files:** Modify `web/src/components/LeftNav.tsx`

Props interface unchanged: `{ activeTab: TabType; setActiveTab: (tab: TabType) => void }`

- [ ] **Step 1: Remove spin from logo SVG**

  Find the SVG element (around line 59) with `animate-[spin_10s_linear_infinite]` in className. Remove that class. Keep all other SVG markup unchanged.

- [ ] **Step 2: Replace `getTabClass` function (lines ~30–36)**

  ```tsx
  const getTabClass = (tab: TabType) => {
    const base =
      "flex items-center justify-center w-11 h-11 mx-auto rounded-xl transition-all duration-200 cursor-pointer relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#8b5cf6] group";
    if (activeTab === tab) {
      return `${base} bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.35)]`;
    }
    return `${base} border border-transparent hover:bg-white/[0.04] hover:border-[rgba(255,255,255,0.06)]`;
  };
  ```

- [ ] **Step 3: Replace Icon className (line ~89)**

  ```tsx
  <Icon
    className={`w-5 h-5 transition-colors z-10 ${
      isActive ? "text-[#8b5cf6]" : "text-[#52525b] group-hover:text-[#a1a1aa]"
    }`}
  />
  ```

- [ ] **Step 4: Replace active tab indicator (lines ~84–87)**

  ```tsx
  <motion.div
    layoutId="activeTabIndicator"
    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#8b5cf6] rounded-r-full"
  />
  ```

- [ ] **Step 5: Replace outer sidebar container className (line ~55)**

  ```tsx
  className="w-[52px] h-full flex flex-col items-center bg-[#0f0f1a] border-r border-[#1e1e2e] z-20 shrink-0"
  ```

- [ ] **Step 6: Replace nav items container className (line ~72)**

  ```tsx
  className="flex-1 px-1.5 py-2 w-full flex flex-col gap-1"
  ```

- [ ] **Step 7: Replace bottom status dots (lines ~95–99)**

  ```tsx
  <div className="py-5 border-t border-[#1e1e2e] w-full flex flex-col items-center gap-3 shrink-0">
    <div className="w-2 h-2 rounded-full bg-[#f59e0b]" title="Kronos Link: ACTIVE" />
    <div className="w-2 h-2 rounded-full bg-[#4ade80]" title="Data Stream: SYNCED" />
    <div className="w-2 h-2 rounded-full bg-[#8b5cf6]" title="API: CONNECTED" />
  </div>
  ```

- [ ] **Step 8: Commit**

  ```
  git add web/src/components/LeftNav.tsx
  git commit -m "feat: restyle LeftNav, remove spin animation, update to new tokens"
  ```

---

## Task 3: Header Restyle + Vincent Toggle

**Files:** Modify `web/src/components/Header.tsx`

New prop: `onVincentToggle: () => void`

- [ ] **Step 1: Replace entire `Header.tsx`**

  ```tsx
  "use client";

  import React, { useEffect, useState } from "react";
  import { useTradingStore } from "../store/useTradingStore";
  import { MessageSquare, Radio, ShieldCheck } from "lucide-react";

  export default function Header({ onVincentToggle }: { onVincentToggle: () => void }) {
    const { apiLatency, mt5Connected } = useTradingStore();
    const [time, setTime] = useState("");

    useEffect(() => {
      const tick = () => {
        setTime(
          new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "UTC",
          })
        );
      };
      tick();
      const id = setInterval(tick, 1000);
      return () => clearInterval(id);
    }, []);

    return (
      <header className="h-10 bg-[#0f0f1a] border-b border-[#1e1e2e] flex items-center justify-between px-4 select-none shrink-0 z-10">
        <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-[#52525b]">
          Xiphos Trading System
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${mt5Connected ? "bg-[#4ade80]" : "bg-[#f87171]"}`} />
            <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">MT5</span>
          </div>
          <div className="w-px h-3.5 bg-[#1e1e2e]" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#4ade80]" />
            <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">Risk On</span>
          </div>
          <div className="w-px h-3.5 bg-[#1e1e2e]" />
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#52525b]" />
            <span className="text-[10px] font-mono text-[#52525b]">{apiLatency}ms</span>
          </div>
          <div className="w-px h-3.5 bg-[#1e1e2e]" />
          <span className="text-[10px] font-mono text-[#52525b]">{time} UTC</span>
          <div className="w-px h-3.5 bg-[#1e1e2e]" />
          <button
            id="vincent-toggle-btn"
            onClick={onVincentToggle}
            title="Open Vincent AI"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#1e1e2e] hover:border-[rgba(139,92,246,0.4)] hover:bg-[rgba(139,92,246,0.08)] transition-all duration-150 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#8b5cf6]" />
            <span className="text-[10px] font-sans font-medium text-[#8b5cf6] uppercase tracking-widest">Vincent</span>
          </button>
        </div>
      </header>
    );
  }
  ```

- [ ] **Step 2: Commit**

  ```
  git add web/src/components/Header.tsx
  git commit -m "feat: restyle Header, add Vincent toggle, fix UTC clock"
  ```

---

## Task 4: VincentPanel (new slide-over)

**Files:** Create `web/src/components/VincentPanel.tsx`

Props: `{ isOpen: boolean; onClose: () => void }`

- [ ] **Step 1: Create `web/src/components/VincentPanel.tsx`**

  ```tsx
  "use client";

  import React, { useRef, useEffect, useState, useCallback } from "react";
  import { X, BrainCircuit, Send, CheckCircle } from "lucide-react";
  import { motion, AnimatePresence } from "framer-motion";
  import { useTradingStore } from "../store/useTradingStore";

  interface VincentPanelProps { isOpen: boolean; onClose: () => void; }

  const DIRECTIVES = [
    { id: "DIR-001", symbol: "EURUSD", type: "BUY LIMIT" as const, price: 1.089, tp: 1.092, sl: 1.0823, confidence: 92 },
    { id: "DIR-002", symbol: "XAUUSD", type: "BUY STOP" as const, price: 2408.2, tp: 2450, sl: 2390, confidence: 88 },
  ];

  export default function VincentPanel({ isOpen, onClose }: VincentPanelProps) {
    const { chatMessages, isTyping, sendChatMessage, placeOrder } = useTradingStore();
    const [input, setInput] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatMessages, isTyping]);

    useEffect(() => {
      if (!isOpen) return;
      const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }, [isOpen, onClose]);

    const handleSend = useCallback(() => {
      const text = input.trim();
      if (!text) return;
      sendChatMessage(text);
      setInput("");
    }, [input, sendChatMessage]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="vincent-panel"
            initial={{ x: 360 }} animate={{ x: 0 }} exit={{ x: 360 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-[360px] bg-[#0f0f1a] border-l border-[#1e1e2e] z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-10 flex items-center justify-between px-4 border-b border-[#1e1e2e] shrink-0">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-[#8b5cf6] animate-ai-pulse" />
                <span className="text-xs font-sans font-semibold text-[#e8e8f0]">Vincent AI</span>
                <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-widest ml-1">LLaMA-3-70B</span>
              </div>
              <button id="vincent-close-btn" onClick={onClose} aria-label="Close Vincent panel"
                className="w-6 h-6 flex items-center justify-center rounded text-[#52525b] hover:text-[#e8e8f0] hover:bg-white/5 transition-colors cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs font-sans leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-[rgba(139,92,246,0.15)] text-[#e8e8f0] border border-[rgba(139,92,246,0.25)]"
                      : "bg-[#14142a] text-[#c4b5fd] border border-[#1e1e2e]"
                  }`}>{msg.text}</div>
                  <span className="text-[9px] font-mono text-[#52525b]">{msg.timestamp}</span>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-1.5 px-3 py-2">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#8b5cf6] animate-ai-pulse"
                      style={{ animationDelay: `${delay}s` }} />
                  ))}
                </div>
              )}
            </div>

            {/* Directives */}
            <div className="border-t border-[#1e1e2e] px-4 py-3 space-y-2 shrink-0">
              <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">AI Directives</span>
              {DIRECTIVES.map((rec) => (
                <div key={rec.id} className="bg-[#09090e] border border-[#1e1e2e] rounded-lg px-3 py-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-mono font-semibold text-[#e8e8f0]">{rec.symbol}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                      rec.type.includes("BUY")
                        ? "bg-[rgba(74,222,128,0.09)] text-[#4ade80] border-[rgba(74,222,128,0.2)]"
                        : "bg-[rgba(248,113,113,0.09)] text-[#f87171] border-[rgba(248,113,113,0.2)]"
                    }`}>{rec.type}</span>
                    <span className="text-[9px] font-mono text-[#52525b]">{rec.confidence}%</span>
                  </div>
                  <button onClick={() => placeOrder(rec.symbol, rec.type, 0.01, rec.price, rec.sl, rec.tp)}
                    className="flex items-center gap-1 px-2 py-1 text-[9px] font-sans font-medium uppercase tracking-widest rounded border border-[rgba(74,222,128,0.25)] text-[#4ade80] hover:bg-[rgba(74,222,128,0.09)] transition-colors cursor-pointer">
                    <CheckCircle className="w-3 h-3" /> Approve
                  </button>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t border-[#1e1e2e] p-3 shrink-0">
              <div className="flex items-center gap-2 bg-[#09090e] border border-[#1e1e2e] rounded-lg px-3 py-2 focus-within:border-[rgba(139,92,246,0.4)] transition-colors">
                <input id="vincent-input" type="text" value={input}
                  onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Ask Vincent..."
                  className="flex-1 bg-transparent text-xs font-sans text-[#e8e8f0] placeholder-[#52525b] outline-none" />
                <button id="vincent-send-btn" onClick={handleSend} disabled={!input.trim()}
                  aria-label="Send message"
                  className="text-[#8b5cf6] disabled:opacity-30 hover:text-[#a78bfa] transition-colors cursor-pointer disabled:cursor-default">
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    );
  }
  ```

- [ ] **Step 2: TypeScript check**

  ```
  cd web && npx tsc --noEmit
  ```

  Expected: 0 errors in VincentPanel.tsx.

- [ ] **Step 3: Commit**

  ```
  git add web/src/components/VincentPanel.tsx
  git commit -m "feat: add VincentPanel slide-over component"
  ```

---

## Task 5: DecisionFeed Restyle

**Files:** Modify `web/src/components/DecisionFeed.tsx`

- [ ] **Step 1: Replace entire file**

  ```tsx
  "use client";

  import React, { useRef, useEffect } from "react";
  import { useTradingStore } from "../store/useTradingStore";
  import { motion, AnimatePresence } from "framer-motion";

  export default function DecisionFeed() {
    const { logs } = useTradingStore();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (containerRef.current) containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }, [logs]);

    const getRowColor = (message: string): string => {
      const lower = message.toLowerCase();
      if (lower.includes("blocked") || lower.includes("violate")) return "text-[#f87171]";
      if (lower.includes("warn") || lower.includes("released")) return "text-[#f59e0b]";
      return "text-[#a1a1aa]";
    };

    return (
      <div className="w-full h-full flex flex-col overflow-hidden bg-[#0f0f1a] border border-[#1e1e2e] rounded-lg">
        <div className="shrink-0 px-4 py-3 border-b border-[#1e1e2e] flex items-center justify-between">
          <span className="text-[10px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Decision Feed</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
            <span className="text-[9px] font-mono text-[#4ade80] uppercase tracking-widest">Live</span>
          </span>
        </div>
        <div ref={containerRef} className="flex-1 overflow-y-auto custom-scrollbar py-1">
          <AnimatePresence initial={false}>
            {logs.length === 0 ? (
              <div className="flex h-full items-center justify-center text-[#52525b] text-xs font-sans p-4">
                Awaiting data stream...
              </div>
            ) : (
              logs.slice(-30).map((log, i) => (
                <motion.div key={`${log.timestamp}-${i}`}
                  initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}
                  className="flex items-baseline gap-2.5 px-4 py-1.5 hover:bg-white/[0.02] border-b border-[#1e1e2e] last:border-0">
                  <span className="text-[9px] font-mono text-[#52525b] shrink-0 tabular-nums">{log.timestamp}</span>
                  <span className={`text-[11px] font-mono leading-relaxed break-all ${getRowColor(log.message)}`}>
                    {log.message}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 2: Commit**

  ```
  git add web/src/components/DecisionFeed.tsx
  git commit -m "feat: restyle DecisionFeed, remove glow/glassmorphism"
  ```

---

## Task 6: Dashboard Page Restructure

**Files:** Modify `web/src/app/page.tsx`

- [ ] **Step 1: Replace imports block**

  ```tsx
  "use client";

  import React, { useEffect, useState, useCallback } from "react";
  import Header from "../components/Header";
  import LeftNav, { TabType } from "../components/LeftNav";
  import CenterPanel from "../components/CenterPanel";
  import DecisionFeed from "../components/DecisionFeed";
  import DecisionCards from "../components/DecisionCards";
  import VincentPanel from "../components/VincentPanel";
  import RiskManagerView from "../components/RiskManagerView";
  import TradeManagerView from "../components/TradeManagerView";
  import SettingsView from "../components/SettingsView";
  import AnalyticsView from "../components/AnalyticsView";
  import MarketsView from "../components/MarketsView";
  import PositionsView from "../components/PositionsView";
  import OrdersView from "../components/OrdersView";
  import ReportsView from "../components/ReportsView";
  import PortfolioView from "../components/PortfolioView";
  import JournalView from "../components/JournalView";
  import AdaptationEngineView from "../components/AdaptationEngineView";
  import MonitoringView from "../components/MonitoringView";
  import OracleView from "../components/OracleView";
  import { useTradingStore } from "../store/useTradingStore";
  import { motion, AnimatePresence } from "framer-motion";
  ```

- [ ] **Step 2: Replace the entire `Home` component**

  ```tsx
  export default function Home() {
    const { connectWebSocket, account, performanceMetrics, positions } = useTradingStore();
    const [activeTab, setActiveTab] = useState<TabType>("DASHBOARD");
    const [portfolioSubTab, setPortfolioSubTab] = useState<"STATS" | "POSITIONS" | "ORDERS">("STATS");
    const [reportsSubTab, setReportsSubTab] = useState<"CURVE" | "JOURNAL">("CURVE");
    const [monitoringSubTab, setMonitoringSubTab] = useState<"HEALTH" | "ORACLE">("HEALTH");
    const [vincentOpen, setVincentOpen] = useState(false);

    useEffect(() => { connectWebSocket(); }, [connectWebSocket]);

    const toggleVincent = useCallback(() => setVincentOpen((v) => !v), []);
    const closeVincent = useCallback(() => setVincentOpen(false), []);

    const totalFloatPnl = positions.reduce((sum, p) => sum + (p.profit ?? 0), 0);
    const formattedEquity = account.equity
      ? "$" + account.equity.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
      : "$0";
    const formattedPnl =
      (totalFloatPnl >= 0 ? "+" : "-") + "$" +
      Math.abs(totalFloatPnl).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    const winRatePct = performanceMetrics.win_rate
      ? (performanceMetrics.win_rate * 100).toFixed(1) : "0.0";
    const drawdownPct = performanceMetrics.max_drawdown
      ? Math.abs(performanceMetrics.max_drawdown * 100).toFixed(1) : "0.0";

    const SubTabBtn = ({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) => (
      <button onClick={onClick}
        className={`px-4 py-1.5 text-[10px] font-sans font-medium uppercase tracking-widest rounded border cursor-pointer transition-all ${
          active
            ? "bg-[rgba(139,92,246,0.12)] text-[#e8e8f0] border-[rgba(139,92,246,0.35)]"
            : "bg-transparent text-[#52525b] border-transparent hover:text-[#a1a1aa]"
        }`}>{label}</button>
    );

    return (
      <div className="h-screen max-h-screen flex bg-[#0a0a0f] text-[#e8e8f0] font-sans select-none overflow-hidden">
        <LeftNav activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onVincentToggle={toggleVincent} />

          {/* KPI Strip — Dashboard only */}
          {activeTab === "DASHBOARD" && (
            <div className="h-14 flex items-center px-6 border-b border-[#1e1e2e] bg-[#0f0f1a] shrink-0">
              <div className="flex flex-col gap-0.5 pr-6">
                <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Equity</span>
                <span className="text-sm font-mono font-bold text-[#e8e8f0] tabular-nums">{formattedEquity}</span>
              </div>
              <div className="w-px h-7 bg-[#1e1e2e]" />
              <div className="flex flex-col gap-0.5 px-6">
                <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Float P&L</span>
                <span className={`text-sm font-mono font-bold tabular-nums ${totalFloatPnl >= 0 ? "text-[#4ade80]" : "text-[#f87171]"}`}>{formattedPnl}</span>
              </div>
              <div className="w-px h-7 bg-[#1e1e2e]" />
              <div className="flex flex-col gap-0.5 px-6">
                <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Win Rate</span>
                <span className="text-sm font-mono font-bold text-[#e8e8f0] tabular-nums">{winRatePct}%</span>
              </div>
              <div className="w-px h-7 bg-[#1e1e2e]" />
              <div className="flex flex-col gap-0.5 px-6">
                <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Open</span>
                <span className="text-sm font-mono font-bold text-[#e8e8f0] tabular-nums">{positions.length}</span>
              </div>
              <div className="w-px h-7 bg-[#1e1e2e]" />
              <div className="flex flex-col gap-0.5 pl-6">
                <span className="text-[9px] font-sans font-medium uppercase tracking-widest text-[#52525b]">Max DD</span>
                <span className={`text-sm font-mono font-bold tabular-nums ${parseFloat(drawdownPct) > 5 ? "text-[#f87171]" : "text-[#f59e0b]"}`}>-{drawdownPct}%</span>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === "DASHBOARD" ? (
              <motion.main key="dashboard"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-h-0 p-4 grid grid-cols-[1fr_300px] gap-4 overflow-hidden">
                <div className="min-h-0 overflow-hidden"><CenterPanel /></div>
                <div className="flex flex-col gap-4 overflow-hidden">
                  <div className="flex-[0.45] min-h-0 overflow-hidden"><DecisionCards /></div>
                  <div className="flex-[0.55] min-h-0 overflow-hidden"><DecisionFeed /></div>
                </div>
              </motion.main>
            ) : (
              <motion.main key={activeTab}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar w-full flex flex-col">
                {activeTab === "RISK_MANAGER" && <RiskManagerView />}
                {activeTab === "TRADE_MANAGER" && <TradeManagerView />}
                {activeTab === "SETTINGS" && <SettingsView />}
                {activeTab === "ANALYTICS" && <AnalyticsView />}
                {activeTab === "MARKETS" && <MarketsView />}
                {activeTab === "ADAPTATION" && <AdaptationEngineView />}

                {activeTab === "PORTFOLIO" && (
                  <div className="flex flex-col h-full w-full gap-4">
                    <div className="flex gap-2 border-b border-[#1e1e2e] pb-2 shrink-0">
                      <SubTabBtn active={portfolioSubTab === "STATS"} onClick={() => setPortfolioSubTab("STATS")} label="Portfolio Stats" />
                      <SubTabBtn active={portfolioSubTab === "POSITIONS"} onClick={() => setPortfolioSubTab("POSITIONS")} label="Active Positions" />
                      <SubTabBtn active={portfolioSubTab === "ORDERS"} onClick={() => setPortfolioSubTab("ORDERS")} label="Pending Orders" />
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                      {portfolioSubTab === "STATS" && <PortfolioView />}
                      {portfolioSubTab === "POSITIONS" && <PositionsView />}
                      {portfolioSubTab === "ORDERS" && <OrdersView />}
                    </div>
                  </div>
                )}

                {activeTab === "REPORTS" && (
                  <div className="flex flex-col h-full w-full gap-4">
                    <div className="flex gap-2 border-b border-[#1e1e2e] pb-2 shrink-0">
                      <SubTabBtn active={reportsSubTab === "CURVE"} onClick={() => setReportsSubTab("CURVE")} label="Equity Curve" />
                      <SubTabBtn active={reportsSubTab === "JOURNAL"} onClick={() => setReportsSubTab("JOURNAL")} label="Trading Journal" />
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                      {reportsSubTab === "CURVE" && <ReportsView />}
                      {reportsSubTab === "JOURNAL" && <JournalView />}
                    </div>
                  </div>
                )}

                {activeTab === "MONITORING" && (
                  <div className="flex flex-col h-full w-full gap-4">
                    <div className="flex gap-2 border-b border-[#1e1e2e] pb-2 shrink-0">
                      <SubTabBtn active={monitoringSubTab === "HEALTH"} onClick={() => setMonitoringSubTab("HEALTH")} label="System Monitor" />
                      <SubTabBtn active={monitoringSubTab === "ORACLE"} onClick={() => setMonitoringSubTab("ORACLE")} label="Oracle Engine" />
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                      {monitoringSubTab === "HEALTH" && <MonitoringView />}
                      {monitoringSubTab === "ORACLE" && <OracleView />}
                    </div>
                  </div>
                )}
              </motion.main>
            )}
          </AnimatePresence>
        </div>

        <VincentPanel isOpen={vincentOpen} onClose={closeVincent} />
      </div>
    );
  }
  ```

- [ ] **Step 3: Verify Dashboard at http://localhost:3000**

  - KPI strip shows 5 metric columns
  - Dashboard is 2-column grid (chart + right panel)
  - Vincent slide-over opens/closes correctly
  - All other tabs still load

- [ ] **Step 4: Commit**

  ```
  git add web/src/app/page.tsx
  git commit -m "feat: restructure Dashboard to KPI strip + chart/signals grid, VincentPanel"
  ```

---

## Task 7: DecisionCards Restyle

**Files:** Modify `web/src/components/DecisionCards.tsx`

- [ ] **Step 1: Apply all token substitutions from the reference table at the top of this plan**

  Open the file. Find every old class name and apply the replacement from the table.

- [ ] **Step 2: Apply signal chip pattern to direction/status badges**

  For BUY/SELL/HOLD badges — use the signal chip pattern from the reference table.

- [ ] **Step 3: Verify no old class names remain**

  ```
  npx grep-cli "xiphos-|glass-|glow-|font-black|backdrop-blur" web/src/components/DecisionCards.tsx
  ```

  Expected: 0 matches.

- [ ] **Step 4: Commit**

  ```
  git add web/src/components/DecisionCards.tsx
  git commit -m "feat: restyle DecisionCards with new tokens and signal chips"
  ```

---

## Task 8: CenterPanel Restyle

**Files:** Modify `web/src/components/CenterPanel.tsx`

- [ ] **Step 1: Apply token substitutions from reference table**

  Apply all substitutions. Additionally: `backdrop-blur-*` → remove; `bg-[rgba(11,15,23,*)]` → `bg-[#0f0f1a]`; `border-[rgba(255,255,255,0.05)]` → `border-[#1e1e2e]`; `text-slate-*` → `text-[#a1a1aa]`.

- [ ] **Step 2: Add symbol and timeframe selectors if not already present**

  Add this state at the top of the component:

  ```tsx
  const SYMBOLS = ["EURUSD", "XAUUSD", "GBPJPY", "USDJPY"];
  const TIMEFRAMES = ["M5", "M15", "M30", "H1", "H4"];
  const [activeSymbol, setActiveSymbol] = useState("EURUSD");
  const [activeTf, setActiveTf] = useState("M30");
  ```

  Add selector bar as first child of the panel, before the chart:

  ```tsx
  <div className="shrink-0 flex items-center justify-between px-4 py-2 border-b border-[#1e1e2e]">
    <div className="flex gap-1">
      {SYMBOLS.map((s) => (
        <button key={s} onClick={() => setActiveSymbol(s)}
          className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all cursor-pointer ${
            activeSymbol === s
              ? "bg-[rgba(139,92,246,0.12)] text-[#8b5cf6] border border-[rgba(139,92,246,0.35)]"
              : "text-[#52525b] hover:text-[#a1a1aa] border border-transparent"
          }`}>{s}</button>
      ))}
    </div>
    <div className="flex gap-1">
      {TIMEFRAMES.map((tf) => (
        <button key={tf} onClick={() => setActiveTf(tf)}
          className={`px-2 py-0.5 text-[9px] font-mono rounded transition-all cursor-pointer ${
            activeTf === tf
              ? "text-[#e8e8f0] bg-[#14142a] border border-[#1e1e2e]"
              : "text-[#52525b] hover:text-[#a1a1aa] border border-transparent"
          }`}>{tf}</button>
      ))}
    </div>
  </div>
  ```

  Pass `activeSymbol` to the chart's symbol prop/fetch call.

- [ ] **Step 3: Verify 0 old class references**

  ```
  npx grep-cli "xiphos-|glass-|glow-|backdrop-blur|font-black" web/src/components/CenterPanel.tsx
  ```

  Expected: 0 matches.

- [ ] **Step 4: Commit**

  ```
  git add web/src/components/CenterPanel.tsx
  git commit -m "feat: restyle CenterPanel, add symbol/timeframe selector tabs"
  ```

---

## Task 9: Final Verification

- [ ] **Step 1: Global grep for removed class names across web/src/**

  ```
  npx grep-cli "glass-panel|glass-card|glow-purple|glow-gold|glow-cyan|glow-emerald|glow-crimson|glow-white|hud-glow|xiphos-bg|xiphos-panel|xiphos-gold|xiphos-cyan" web/src/
  ```

  Expected: 0 matches. Fix any remaining occurrences by applying the substitution table.

- [ ] **Step 2: Full TypeScript check**

  ```
  cd web && npx tsc --noEmit
  ```

  Expected: 0 errors.

- [ ] **Step 3: Manual verification at 1440×900**

  - [ ] Background is `#0a0a0f` dark purple-black
  - [ ] Sidebar 52px, no spin, correct active state
  - [ ] Header 40px, real UTC clock, Vincent button visible
  - [ ] KPI strip with 5 live metric columns
  - [ ] Dashboard: 2-column grid (chart left, signals/feed right)
  - [ ] Vincent slide-over opens on button, closes on Escape and X
  - [ ] No glow, no glassmorphism, no backdrop-blur
  - [ ] Numbers in IBM Plex Mono
  - [ ] No console errors
  - [ ] No layout overflow at 1440×900

- [ ] **Step 4: Final commit**

  ```
  git add -A
  git commit -m "feat: Xiphos UI Redesign Phase 1 complete"
  ```

---

## File Summary

| File | Action |
|---|---|
| `web/src/app/globals.css` | Replace tokens, fonts; remove glow/glassmorphism |
| `web/src/components/LeftNav.tsx` | Remove spin; update icon/dot styles |
| `web/src/components/Header.tsx` | Restyle; add Vincent toggle; fix clock |
| `web/src/components/VincentPanel.tsx` | **NEW** — slide-over chat + directives |
| `web/src/app/page.tsx` | KPI strip; 2-col Dashboard; VincentPanel |
| `web/src/components/DecisionFeed.tsx` | Restyle; remove glow/glassmorphism |
| `web/src/components/DecisionCards.tsx` | Token substitutions; signal chip pattern |
| `web/src/components/CenterPanel.tsx` | Restyle; symbol + timeframe tabs |
