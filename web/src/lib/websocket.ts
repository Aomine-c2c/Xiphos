import { useTradingStore } from '../store/useTradingStore';

const isTauri = typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8001/ws";

let activeSocket: WebSocket | null = null;

export function connectTradingSystem() {
  const state = useTradingStore.getState();
  if (state.connected) return;

  state.setConnectionState(true);

  if (isTauri) {
    console.info("XIPHOS: Tauri mode — subscribing to Rust SSE events");
    import("@tauri-apps/api/event").then(({ listen }) => {
      listen("state_update", (event: { payload: any }) => {
        try {
          const data = event.payload;
          useTradingStore.setState({
            botRunning: data.bot_running,
            mt5Connected: data.mt5_connected,
            apiLatency: data.api_latency,
            account: data.account,
            positions: data.positions,
            orders: data.orders,
            marketWatch: data.market_watch,
            gates: data.gates,
            rankedSignals: data.ranked_signals,
            lastCycleTime: data.last_cycle_time,
            systemStats: data.system_stats,
            correlationMatrix: data.correlation_matrix,
            performanceMetrics: data.performance_metrics,
            mahoragaState: data.mahoraga_state || null,
            news: data.news || null,
          });
        } catch (e) { console.error("Tauri event parse error", e); }
      });
      listen("log_history", (event: { payload: any }) => {
        useTradingStore.setState({ logs: event.payload });
      });
      listen("log_event", (event: { payload: any }) => {
        const { logs } = useTradingStore.getState();
        useTradingStore.setState({ logs: [...logs, event.payload].slice(-1000) });
      });
      listen("chat_response", (event: { payload: any }) => {
        const p = event.payload;
        const { chatMessages } = useTradingStore.getState();
        useTradingStore.setState({
          chatMessages: [...chatMessages, { sender: "vincent", text: p.bot_response, timestamp: p.timestamp }],
          isTyping: false,
        });
      });
    });
  } else {
    console.info(`XIPHOS: Web mode — connecting to ${WS_URL}`);

    const connect = () => {
      const socket = new WebSocket(WS_URL);
      activeSocket = socket;

      socket.onopen = () => {
        console.info("XIPHOS WS: connected");
        useTradingStore.getState().resetWsRetries();
      };

      socket.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "state_update") {
            const data = msg.data;
            useTradingStore.setState({
              botRunning: data.bot_running,
              mt5Connected: data.mt5_connected,
              apiLatency: data.api_latency,
              account: data.account,
              positions: data.positions,
              orders: data.orders,
              marketWatch: data.market_watch,
              gates: data.gates,
              rankedSignals: data.ranked_signals,
              lastCycleTime: data.last_cycle_time,
              systemStats: data.system_stats,
              correlationMatrix: data.correlation_matrix,
              performanceMetrics: data.performance_metrics,
              mahoragaState: data.mahoraga_state || null,
              news: data.news || null,
            });
          } else if (msg.type === "log_history") {
            useTradingStore.setState({ logs: msg.data });
          } else if (msg.type === "log_event") {
            const { logs } = useTradingStore.getState();
            useTradingStore.setState({ logs: [...logs, msg.data].slice(-1000) });
          } else if (msg.type === "chat_response") {
            const p = msg.data;
            const { chatMessages } = useTradingStore.getState();
            useTradingStore.setState({
              chatMessages: [...chatMessages, { sender: "vincent", text: p.bot_response, timestamp: p.timestamp }],
              isTyping: false,
            });
          }
        } catch (e) { console.error("WS parse error", e); }
      };

      socket.onclose = () => {
        console.warn("XIPHOS WS: disconnected — retrying in 3s...");
        useTradingStore.getState().setConnectionState(false);
        useTradingStore.getState().incrementWsRetries();
        setTimeout(() => {
          useTradingStore.getState().setConnectionState(true);
          connect();
        }, 3000);
      };

      socket.onerror = (err) => {
        console.error("XIPHOS WS error", err);
        socket.close();
      };
    };

    connect();
  }
}
