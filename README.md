<div align="center">

# ⚔️ XIPHOS
### Institutional-Grade Algorithmic Trading Framework

**A fully autonomous, multi-asset trend-following system for MetaTrader 5 — built around hard risk rules, live signal intelligence, and a professional-grade dual UI.**

[![Version](https://img.shields.io/badge/version-v2.0.0-00d26a?style=flat-square&logo=github)](https://github.com/Aomine-c2c/Xiphos/releases)
[![Python](https://img.shields.io/badge/python-3.10+-3776ab?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS%20%7C%20Android-informational?style=flat-square)](#installation)

</div>

---

## What Is It?

Xiphos is a **production-ready algorithmic trading engine** that connects directly to MetaTrader 5 and autonomously executes M30 Moving Average Fan breakout strategies across multiple correlated asset pairs — simultaneously, with strict institutional-grade risk controls at every layer.

It ships with two fully-featured user interfaces:

| Interface | Description |
|---|---|
| **🌐 Web Dashboard** (Recommended) | Institutional-grade Next.js dashboard — real-time correlation heatmaps, live signal intelligence, AI assistant (Vincent AI), and portfolio analytics. |
| **⌨️ Terminal UI (TUI)** | Zero-dependency, terminal-native cockpit powered by Textual. Runs anywhere, even over SSH. |

---

## Why Should You Care?

Most retail algo bots are glorified "buy/sell scripts" that blow accounts silently. Xiphos is different:

- **🛡️ Five-Layer Risk Gate System** — Every potential trade passes through 5 sequential safety filters before a single order is placed. If any gate fails, the cycle halts cleanly.
- **📡 Multi-Asset Signal Priority Engine** — Scans all configured symbol groups simultaneously. Ranks live setups by SMA200 distance and projects per-trade risk before execution.
- **🔗 Correlation Guard** — Prevents opening multiple risk-bearing positions in the same correlated asset class (e.g., EURUSD + GBPUSD + AUDUSD cannot all be open with capital at risk simultaneously).
- **📈 Dual-Strategy Execution** — Every valid signal spawns two trades: **Trade A (Scalper)** trails via EMA50 to capture immediate momentum; **Trade B (Runner)** trails via SMA200 to ride the full macro trend.
- **🗄️ Immutable SQLite Audit Trail** — Every signal, trade, modification, and trailing stop event is logged with full timestamps and rationale. Your data, your control.
- **🤖 Vincent AI Command Assistant** — An embedded AI layer that can explain exactly why a trade was taken, skipped, or blocked in plain language.

---

## Architecture Overview

```
Xiphos
├── core/               # Config loading, logging, correlation engine
├── indicators/         # M30 Moving Average calculations (EMA13, EMA50, SMA200)
├── strategies/         # Fan Alignment signal evaluation
├── risk/               # RiskSlotManager, CorrelationGuard, SignalPriorityEngine
├── execution/          # MT5 connection, order placement, trailing stop logic
├── monitoring/         # APScheduler (M30 job + trailing job)
├── storage/            # SQLite database (trades, history, performance)
├── state_manager.py    # Performance metrics, strategy analytics
├── main.py             # Core evaluation loop (5-gate system)
├── api_server.py       # FastAPI + WebSocket server (for Web Dashboard)
├── tui.py              # Textual Terminal UI (standalone)
└── web/                # Next.js Institutional Web Dashboard
```

### The 5-Gate Execution Pipeline

Every M30 candle close triggers an evaluation cycle. Signals must survive all five gates in sequence:

```
M30 Candle Close
       │
  ┌────▼────┐
  │ GATE 1  │  Risk Slot Check    → Max concurrent risk-bearing positions not exceeded
  └────┬────┘
  ┌────▼────┐
  │ GATE 2  │  Correlation Guard  → No risk-bearing trade exists in same asset class
  └────┬────┘
  ┌────▼────┐
  │ GATE 3  │  Fan Alignment      → Close > EMA13 > EMA50 > SMA200 (BUY) or inverse
  └────┬────┘
  ┌────▼────┐
  │ GATE 4  │  Priority Filter    → Signals ranked by SMA200 distance & projected risk
  └────┬────┘
  ┌────▼────┐
  │ GATE 5  │  Hard SL Enforced   → All trades require a defined Stop Loss on placement
  └────┬────┘
       │
   EXECUTE  →  Trade A (Scalper, EMA50 trail) + Trade B (Runner, SMA200 trail)
```

---

## Installation

### Prerequisites

Before installing Xiphos, make sure you have:

- **MetaTrader 5** installed and logged into your broker account
- **Python 3.10+** — [Download](https://python.org/downloads)
- **Git** — [Download](https://git-scm.com/downloads)
- **Node.js 18+** *(Web Dashboard only)* — [Download](https://nodejs.org)

---

### Option 1: One-Command Install (Recommended)

**Windows:**
```bat
curl -O https://raw.githubusercontent.com/Aomine-c2c/Xiphos/main/install.bat
install.bat
```

**Linux / macOS / Android (Termux):**
```bash
curl -O https://raw.githubusercontent.com/Aomine-c2c/Xiphos/main/install.sh
chmod +x install.sh
./install.sh
```

The setup script will:
1. Clone the Xiphos repository
2. Create an isolated Python virtual environment
3. Install all Python dependencies
4. **Ask you which UI you prefer** — Web Dashboard or Terminal UI
5. If Web Dashboard: automatically run `npm install` and build the production bundle
6. Create a global `Xiphos` command you can run from anywhere

**After installation, simply type:**
```
Xiphos
```

---

### Option 2: Manual Installation

```bash
# 1. Clone the repository
git clone https://github.com/Aomine-c2c/Xiphos.git
cd Xiphos

# 2. Create and activate virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate

# Linux/macOS:
source venv/bin/activate

# 3. Install Python dependencies
pip install -r requirements.txt
```

#### Launch — Terminal UI
```bash
python tui.py
```

#### Launch — Web Dashboard
```bash
# Terminal 1: Start the Python backend API
python api_server.py

# Terminal 2: Start the Next.js frontend
cd web
npm install
npm run dev
```
Then open your browser at: **http://localhost:3000**

---

### Option 3: Windows Installer (.exe)

Download the latest `Xiphos_Setup.exe` from the [Releases Page](https://github.com/Aomine-c2c/Xiphos/releases). The GUI installer will handle everything automatically.

---

## Configuration

All strategy, risk, and broker settings live in `config/settings.yaml`. This file is generated automatically on first run.

```yaml
execution:
  mode: "DIRECT"          # DIRECT = Windows/MT5 native | BRIDGE = Remote proxy

trading:
  max_risk_trades: 4      # Maximum concurrent risk-bearing positions
  lot_size: 0.01          # Lot size per trade
  timeframe: "M30"

magic_numbers:
  scalper: 135001         # Trade A identifier
  runner: 135002          # Trade B identifier

correlation_groups:
  group_1_majors:  ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY"]
  group_2_metals:  ["XAUUSD", "XAGUSD"]
  group_3_exotics: ["EURJPY", "GBPJPY", "USDCAD", "USDCHF"]
  group_4_crypto:  ["BTCUSD"]
  group_5_indices: ["Volatility 75 Index"]
```

> **No code changes required.** Add or remove symbols, adjust lot sizes, and tune risk parameters entirely through this YAML file — the system will pick up changes automatically.

---

## Requirements

| Dependency | Purpose |
|---|---|
| `MetaTrader5 ≥ 5.0.45` | Direct MT5 broker connection (Windows only) |
| `textual ≥ 0.60.0` | Terminal UI framework |
| `fastapi` + `uvicorn` | REST + WebSocket API server for the Web Dashboard |
| `pandas ≥ 2.0.0` | Correlation matrix computation |
| `APScheduler ≥ 3.10.1` | M30 candle close scheduling + trailing stop jobs |
| `loguru ≥ 0.7.0` | Structured logging |
| `pydantic ≥ 2.4.2` | Config validation |
| `Node.js 18+` | Web Dashboard frontend (optional) |

> **Note:** `MetaTrader5` is a Windows-only library. On Linux/macOS, Xiphos operates in Bridge Mode, routing MT5 commands through a Windows-hosted proxy.

---

## Platform Support

| Platform | TUI | Web Dashboard | Notes |
|---|---|---|---|
| Windows 10/11 | ✅ | ✅ | Full native MT5 support |
| Ubuntu / Debian | ✅ | ✅ | Bridge Mode required for MT5 |
| macOS | ✅ | ✅ | Bridge Mode required for MT5 |
| Android (Termux) | ✅ | ⚠️ | Bridge Mode; Node.js setup may vary |

---

## Web Dashboard Panels

| Panel | Tab | Description |
|---|---|---|
| **Command Center** | Dashboard | 3-column signal intelligence hub: Decision Feed, Gate Matrix, Vincent AI |
| **Correlation Matrix** | Markets | Live 9×9 Pearson correlation heatmap across all asset groups |
| **Market Radar** | Markets | Ranked opportunity queue with confidence, direction, and risk |
| **Battlefield Graph** | Markets | SVG network graph of correlated symbol nodes |
| **Active Positions** | Positions | Full positions registry with inline SL/TP controls |
| **War Room** | Positions | Portfolio equity curves and live metrics |
| **Risk Manager** | Risk | Per-slot usage, Correlation Guard status per group |
| **Analytics** | Analytics | Cumulative equity chart, Profit Factor, Sharpe Ratio, strategy breakdown |
| **Reports** | Reports | Full trade history, export-ready performance tables |
| **Settings** | Settings | Live config editing — no restart required |

---

## Running Tests

```bash
pytest tests/
```

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) for details.

---

<div align="center">

**⚔️ Built for traders who demand precision, not guesswork.**

[Releases](https://github.com/Aomine-c2c/Xiphos/releases) · [Issues](https://github.com/Aomine-c2c/Xiphos/issues) · [Discussions](https://github.com/Aomine-c2c/Xiphos/discussions)

</div>
