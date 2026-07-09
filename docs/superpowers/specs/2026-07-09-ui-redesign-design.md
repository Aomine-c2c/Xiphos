# Xiphos UI Redesign — Design Spec

**Date:** 2026-07-09
**Scope:** Full frontend visual redesign + real backend data integration
**Phase:** 1 of 3 — Design System Foundation

---

## Overview

Xiphos is being redesigned from a glowing cockpit aesthetic to a **Modern Fintech SaaS** style — clean, minimal, data-dense, premium. The direction is Stripe/Linear quality applied to an institutional trading platform.

This spec covers the **design system foundation** (Phase 1): color tokens, typography, shared components, and the dashboard layout shell. Subsequent phases cover individual view rewrites (Phase 2) and advanced views (Phase 3).

---

## Core Design Decisions

| Axis | Decision | Rationale |
|---|---|---|
| Layout shell | **Icon sidebar (52px) + top status bar** | Preserves current structure; maximum content space |
| Color system | **Graphite Purple** | Evolves existing brand identity; sophisticated, not glowing |
| Typography | **IBM Plex Sans + IBM Plex Mono** | Designed for data-dense interfaces; matched pair excels at numbers |
| Dashboard | **KPI strip + chart focus + signals panel** | Critical metrics always visible; chart is center-stage |
| Vincent AI | **Slide-over panel** | Hidden by default; opened via button/hotkey; frees chart space |

---

## Design System

### Color Tokens

Replace all current `xiphos-*` color tokens in `globals.css`:

```css
/* BACKGROUNDS — layered depth system */
--color-bg-base:       #0a0a0f;   /* page/window background */
--color-bg-surface:    #0f0f1a;   /* panels, cards */
--color-bg-elevated:   #14142a;   /* modals, dropdowns, hover states */
--color-bg-input:      #09090e;   /* inputs, chart areas */

/* BORDERS */
--color-border:        #1e1e2e;   /* default panel border */
--color-border-focus:  #8b5cf640; /* focused / selected border */
--color-border-strong: #8b5cf6;   /* active selection, current tab */

/* ACCENT — primary purple */
--color-accent:        #8b5cf6;   /* primary interactive color */
--color-accent-dim:    #8b5cf620; /* backgrounds behind accent elements */
--color-accent-hover:  #a78bfa;   /* hover state on accent */
--color-accent-muted:  #6d28d9;   /* secondary/subdued accent */

/* SEMANTIC — trading signals */
--color-up:            #4ade80;   /* profit, buy, positive change */
--color-up-dim:        #4ade8018; /* background behind up elements */
--color-down:          #f87171;   /* loss, sell, negative change */
--color-down-dim:      #f8717118; /* background behind down elements */
--color-warn:          #f59e0b;   /* drawdown, caution, hold state */
--color-warn-dim:      #f59e0b18; /* background behind warn elements */
--color-neutral:       #52525b;   /* hold, flat, no signal */

/* TEXT */
--color-text-primary:  #e8e8f0;   /* headings, values, important labels */
--color-text-secondary:#a1a1aa;   /* secondary labels, descriptions */
--color-text-muted:    #52525b;   /* section labels, timestamps, placeholders */
--color-text-accent:   #c4b5fd;   /* AI responses, accent text */
```

**Remove:** All glow utilities (.glow-*), glassmorphism utilities (.glass-panel, .glass-card), and HUD animations (pulseGlow, neonFlicker, radarSweep, pipelinePulse).

**Keep:** Scrollbar utilities (.custom-scrollbar), basic transitions, aiPulse animation (repurposed for Vincent thinking indicator).

### Typography

```css
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;700&display=swap');

--font-sans: 'IBM Plex Sans', 'Segoe UI', system-ui, sans-serif;
--font-mono: 'IBM Plex Mono', 'Fira Code', monospace;
```

**Usage rules:**
- font-sans: all UI labels, descriptions, navigation, buttons
- font-mono: all numeric data (prices, percentages, counts), ticker symbols, timestamps, signal labels
- Never use font-mono for prose or descriptive text

**Type scale:**
- `text-[10px] tracking-widest uppercase font-medium` — section labels / column headers
- `text-xs` — table body, timestamps, muted descriptions
- `text-sm` — primary UI labels, nav items, button text
- `text-base` — card titles, panel headers
- `text-xl font-mono font-bold` — large metric values

### Spacing and Shape

- Border radius: rounded (4px) for inputs/chips, rounded-lg (8px) for cards/panels, rounded-xl (12px) for sidebar icons
- Panel padding: p-4 (16px) standard, p-3 (12px) compact tables, p-6 (24px) page padding
- Gap: gap-4 between panels, gap-2 between related elements in a panel

### Component Patterns

#### Panel / Card
```
background: bg-[#0f0f1a]
border: border border-[#1e1e2e]
border-radius: rounded-lg
padding: p-4
```
On hover (interactive panels only): border-color ? #8b5cf640
No box-shadow, no glow, no backdrop-blur.

#### Section Label
```
text-[10px] uppercase tracking-widest font-medium text-[#52525b] font-sans
```

#### Metric Value (large)
```
font-mono text-xl font-bold text-[#e8e8f0]
```

#### Signal Chip
- BUY:  bg-[#4ade8018] text-[#4ade80] border border-[#4ade8030]
- SELL: bg-[#f8717118] text-[#f87171] border border-[#f8717130]
- HOLD: bg-[#52525b10] text-[#52525b] border border-[#52525b20]
- WARN: bg-[#f59e0b18] text-[#f59e0b] border border-[#f59e0b30]

---

## Layout Shell

### Sidebar (restyled)

```
width:        w-[52px]
background:   #0f0f1a
border-right: 1px solid #1e1e2e
```

- Logo: Remove spin animation. Static logomark SVG.
- Nav icons: 52px touch target, icon centered at 24px.
  - Active: bg-[#8b5cf620] rounded-xl border border-[#8b5cf640] icon: text-[#8b5cf6]
  - Inactive: transparent rounded-xl icon: text-[#52525b] hover: text-[#e8e8f0]
- Active tab indicator: left-edge 2px bg-[#8b5cf6] bar (keep Framer layoutId, remove glow)
- Status dots bottom: plain colored dots, no glow

### Top Status Bar

```
height:         h-10
background:     #0f0f1a
border-bottom:  1px solid #1e1e2e
padding:        px-4
```

Left: current page label (text-[10px] uppercase tracking-widest text-[#52525b])
Right: LIVE chip | MT5 status | Latency | Vincent AI toggle button (chat icon)

---

## Dashboard — Layout B

### KPI Strip

```
height:         h-14
background:     #0f0f1a
border-bottom:  1px solid #1e1e2e
padding:        px-6
display:        flex items-center gap-6
```

Five KPI slots, separated by 1px vertical dividers:

| # | Label | Format | Change |
|---|---|---|---|
| 1 | Portfolio Equity | $142,380 (mono) | +2.4% (up color) |
| 2 | Today P&L | +$3,240 (up color mono) | trade count |
| 3 | Win Rate | 67.3% (mono) | ? 3.1pp (accent) |
| 4 | Open Positions | 3 (mono) | float P&L |
| 5 | Max Drawdown | -3.2% (warn mono) | MODERATE label |

Data source: /api/state + /api/performance via WebSocket push.

### Main Content Grid

```
grid-template-columns: minmax(0, 1fr) minmax(260px, 320px)
gap: gap-4
padding: p-4
```

**Left — Chart Panel:**
- Full-height candlestick chart (TradingChart.tsx)
- Symbol selector tabs above chart
- Timeframe buttons: M5 M15 M30 H1 H4
- EMA/SMA overlays from /api/chart/{symbol}

**Right — Signals Panel (280–320px, stacked):**
1. Live Signals: symbol + direction chip + lot size per symbol
2. Decision Feed: scrollable log, timestamp + event, newest first

Data: Live signals from WebSocket state; Decision Feed from /api/oracle/decisions.

### Vincent AI Slide-over

Trigger: button in top-right of Header (chat bubble icon).

```
position: fixed right-0 top-0 bottom-0
width: w-[360px]
background: #0f0f1a
border-left: 1px solid #1e1e2e
z-index: z-50
```

Animation: Framer Motion AnimatePresence, slide from x:360 to x:0.
Non-modal: backdrop-free, main view remains interactive.
Close: same button toggle or Escape key.
Data: /api/chat (POST, streaming response).

---

## Data Integration

No new API endpoints needed. All data exists in the current backend.

| View | Endpoint | Refresh strategy |
|---|---|---|
| KPI strip | /api/state + /api/performance | WebSocket push |
| Chart | /api/chart/{symbol} | Symbol change + 30s poll |
| Live signals | WebSocket state broadcast | Real-time |
| Decision Feed | /api/oracle/decisions | WebSocket push |
| Vincent chat | /api/chat | On send |

---

## Files to Change in Phase 1

### MODIFY: web/src/app/globals.css
- Replace color tokens (all --color-xiphos-* ? new system)
- Remove glow, glassmorphism, HUD animation utilities
- Update font import and --font-* variables
- Keep custom-scrollbar, aiPulse, basic transitions

### MODIFY: web/src/components/LeftNav.tsx
- Remove spinning logo (drop animate-spin)
- Update active/inactive nav styles to new tokens
- Remove glow from status dots and active indicator

### MODIFY: web/src/components/Header.tsx
- Restyle to top bar spec
- Add Vincent AI toggle button (opens slide-over)

### NEW: web/src/components/VincentPanel.tsx
- Extracts ChatPanel into standalone slide-over component
- Framer Motion slide-in from right
- Escape + button toggle to close

### MODIFY: web/src/app/page.tsx
- Add KPI strip between Header and main content, wired to store
- Switch Dashboard to 2-column grid (chart left + signals right)
- Remove ChatPanel from dashboard grid
- Add VincentPanel slide-over
- Wire KPI data from useTradingStore

### MODIFY: web/src/components/CenterPanel.tsx
- Restyle to new tokens
- Add symbol tabs + timeframe selector

### MODIFY: web/src/components/DecisionFeed.tsx
- Restyle to new tokens
- Remove glassmorphism

### MODIFY: web/src/components/DecisionCards.tsx
- Restyle to new tokens
- Apply signal chip pattern

---

## Out of Scope (Phase 2 and 3)

- Markets, Portfolio, Risk Manager, Trade Manager view redesigns
- Analytics, Reports, Adaptation Engine, Monitoring, Settings redesigns
- New backend features or API endpoints
- Backtesting, alerts, notifications

---

## Verification Plan

### Automated
- No TypeScript/ESLint errors: npm run build
- grep for removed class names: grep -r "glass-panel\|glow-purple\|hud-glow" web/src

### Manual (at 1440x900 minimum window size)
- KPI strip shows live data from real backend
- Chart loads for at least one symbol
- Vincent panel opens/closes with button and Escape
- No layout overflow or scroll outside intended scroll areas
- Active nav tab indicator animates correctly
- All signal chips display correct color semantics
