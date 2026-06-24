use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct AccountData {
    pub balance: f64,
    pub equity: f64,
    pub margin_free: f64,
    pub margin_level: f64,
    pub profit: f64,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct PositionData {
    pub ticket: u64,
    pub symbol: String,
    pub r#type: String,
    pub volume: f64,
    pub price_open: f64,
    pub price_current: f64,
    pub sl: f64,
    pub tp: f64,
    pub profit: f64,
    pub role: String,
    pub risk_status: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct OrderData {
    pub ticket: u64,
    pub symbol: String,
    pub r#type: String,
    pub volume: f64,
    pub price_open: f64,
    pub sl: f64,
    pub tp: f64,
    pub comment: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct MarketWatchData {
    pub symbol: String,
    pub price: f64,
    pub e13_dist: f64,
    pub e50_dist: f64,
    pub s200_dist: f64,
    pub signal: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct RankedSignal {
    pub priority: i32,
    pub symbol: String,
    pub direction: String,
    pub price: f64,
    pub sma200: f64,
    pub distance: f64,
    pub projected_risk: f64,
    pub status: String,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct SystemStats {
    pub cpu: f64,
    pub memory: f64,
}

#[derive(Debug, Clone, Deserialize, Serialize, Default)]
pub struct SystemState {
    pub bot_running: bool,
    pub mt5_connected: bool,
    pub api_latency: f64,
    pub account: AccountData,
    #[serde(default)]
    pub positions: Vec<PositionData>,
    #[serde(default)]
    pub orders: Vec<OrderData>,
    #[serde(default)]
    pub market_watch: Vec<MarketWatchData>,
    #[serde(default)]
    pub gates: HashMap<String, String>,
    #[serde(default)]
    pub ranked_signals: Vec<RankedSignal>,
    pub last_cycle_time: String,
    pub system_stats: SystemStats,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct LogEvent {
    pub timestamp: String,
    pub level: String,
    pub message: String,
    pub formatted: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(tag = "type", content = "data")]
pub enum WsMessage {
    #[serde(rename = "state_update")]
    StateUpdate(SystemState),
    #[serde(rename = "log_event")]
    LogEvent(LogEvent),
    #[serde(rename = "log_history")]
    LogHistory(Vec<LogEvent>),
    #[serde(rename = "chat_response")]
    ChatResponse(serde_json::Value),
    #[serde(other)]
    Unknown,
}

// ── Outgoing WebSocket commands ───────────────────────────────────────────────
#[derive(Debug, Clone)]
pub enum WsCommand {
    StartBot,
    StopBot,
    ForceCycle,
    PanicClose,
    ClosePosition { ticket: u64, symbol: String },
    Breakeven { ticket: u64, symbol: String },
    PartialClose { ticket: u64, symbol: String },
    ModifySL { ticket: u64, symbol: String, new_sl: f64 },
    ChatMessage { text: String },
}

impl WsCommand {
    pub fn to_json(&self) -> String {
        match self {
            WsCommand::StartBot   => r#"{"type":"start_bot"}"#.into(),
            WsCommand::StopBot    => r#"{"type":"stop_bot"}"#.into(),
            WsCommand::ForceCycle => r#"{"type":"force_cycle"}"#.into(),
            WsCommand::PanicClose => r#"{"type":"panic_close"}"#.into(),
            WsCommand::ClosePosition { ticket, symbol } =>
                format!(r#"{{"type":"close_position","data":{{"ticket":{ticket},"symbol":"{symbol}"}}}}"#),
            WsCommand::Breakeven { ticket, symbol } =>
                format!(r#"{{"type":"breakeven","data":{{"ticket":{ticket},"symbol":"{symbol}"}}}}"#),
            WsCommand::PartialClose { ticket, symbol } =>
                format!(r#"{{"type":"partial_close","data":{{"ticket":{ticket},"symbol":"{symbol}"}}}}"#),
            WsCommand::ModifySL { ticket, symbol, new_sl } =>
                format!(r#"{{"type":"modify_sl","data":{{"ticket":{ticket},"symbol":"{symbol}","new_sl":{new_sl}}}}}"#),
            WsCommand::ChatMessage { text } => {
                let escaped = text.replace('\\', "\\\\").replace('"', "\\\"");
                format!(r#"{{"type":"chat_message","data":{{"text":"{escaped}"}}}}"#)
            }
        }
    }
}
