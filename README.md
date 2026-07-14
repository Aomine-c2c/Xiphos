# Xiphos

Xiphos is an institutional-grade, fully autonomous algorithmic trading framework with a unified desktop and web environment. It is designed to act as an advanced command center for algorithmic trading, offering high-frequency execution via MetaTrader 5, adaptive AI-driven strategy modification, and real-time visualization of order flow and market regimes.

## Architecture Structure

The project relies on a decoupled, highly performant architecture composed of two major systems: a Next.js/Tauri frontend and a FastAPI/Redis Python backend.

### 1. The Frontend (Web & Desktop Shell)
- **Next.js & React**: The core of the user interface is built on Next.js 16 with React 18, leveraging Server-Side Generation (SSG) for high-performance dashboards.
- **Tauri Shell**: Xiphos can run as a standalone Windows `.exe` desktop application using Tauri. The Next.js static export is bundled inside a minimal Rust WebView, ensuring minimal RAM overhead and native OS integration.
- **State Management**: `zustand` is used for global state management, tracking WebSocket event streams, order status, account equity, and the Mahoraga AI state.
- **Visuals**: Features a dark, cyberpunk "Glassmorphism" aesthetic built with Tailwind CSS, Framer Motion for micro-animations, and Recharts for live parameter tracking.

**Key UI Components:**
- **Mahoraga Adaptation Engine View**: Tracks dynamic trading constraints (Lot size multipliers, Stop-Loss multipliers, Fast EMAs, and overall Confidence Scores) adapted by the AI.
- **Trade Journal & AI Mistake Analysis**: A journal module where you can review historical trades. Leveraging the Google Gemini API, it provides a "Vincent AI Deep Dive" for trade post-mortems, order-flow explanations, and mistake analysis.

### 2. The Backend Engine
The backend is completely decoupled from the UI, operating strictly as a data provider and high-frequency execution layer.
- **`api_server.py`**: The FastAPI-based REST and WebSocket endpoint. It securely serves state payload updates to the Next.js UI using Redis Pub/Sub, keeping the interface snappy and preventing direct DB locks.
- **`worker_engine.py`**: The critical background task queue. This process binds directly to the MetaTrader 5 terminal using the native `MetaTrader5` Python library. It handles live market data fetching, execution queuing, and pushes compiled states to Redis.
- **`core/llm.py`**: The integration layer for Google Gemini API, utilized for the Vincent chat interface and post-trade AI analysis.
- **Data Layer**: 
  - **Redis**: The in-memory message broker that links `worker_engine.py` (producer) to `api_server.py` (consumer).
  - **SQLite**: Local persistence for trade logs, AI analysis, journal notes, and strategy history.

## Development & Build Process

Xiphos provides unified scripts to handle the multi-process environment.

**Development:**
- `.\dev.ps1`: Starts the complete development environment, firing up both the Python backend and the Next.js Turbo dev server on `localhost:3000`.

**Production Build:**
- `.\build_app.ps1`: The master build script. It performs a static export of the Next.js frontend (`npm run build`) and uses the Tauri CLI (`npx @tauri-apps/cli build`) to compile the optimized production executable (`Xiphos.exe`). The executable does not include hot-reloading and is tuned for maximum performance.

## Execution Flow (How it Works)

1. The `worker_engine.py` connects to MetaTrader 5.
2. Market data, active positions, and account state are compiled by the `state_compiler.py` into a unified JSON state payload.
3. This payload is fired into Redis via Pub/Sub.
4. `api_server.py` ingests the Redis streams and broadcasts them to the Next.js/Tauri frontend via Server-Sent Events (SSE) or WebSockets.
5. The Next.js `useTradingStore.ts` ingests these ticks, updating the Recharts and UI components in real-time.
6. The Mahoraga Engine monitors market phenomenon (momentum vs. mean-reversion) and dynamically adjusts risk limits (via `AdaptiveParameters`), executing trades completely autonomously while providing full transparency in the desktop app.
