use std::collections::HashMap;
use serde::{Deserialize, Serialize};

#[derive(Clone, Default, Deserialize, Serialize, PartialEq, Debug)]
pub struct AccountInfo {
    pub balance: f64,
    pub equity: f64,
    pub margin_free: f64,
    pub margin_level: f64,
    pub profit: f64,
}

#[derive(Clone, Deserialize, Serialize, PartialEq, Debug)]
pub struct Position {
    pub ticket: u64,
    pub symbol: String,
    pub r#type: String, // BUY or SELL
    pub volume: f64,
    pub price_open: f64,
    pub price_current: f64,
    pub sl: f64,
    pub tp: f64,
    pub profit: f64,
    pub role: String,
    pub risk_status: String,
}

#[derive(Clone, Deserialize, Serialize, PartialEq, Debug)]
pub struct Order {
    pub ticket: u64,
    pub symbol: String,
    pub r#type: String,
    pub volume: f64,
    pub price_open: f64,
    pub sl: f64,
    pub tp: f64,
    pub comment: String,
}

#[derive(Clone, Deserialize, Serialize, PartialEq, Debug)]
pub struct MarketWatchItem {
    pub symbol: String,
    pub price: f64,
    pub e13_dist: f64,
    pub e50_dist: f64,
    pub s200_dist: f64,
    pub signal: String,
}

#[derive(Clone, Deserialize, Serialize, PartialEq, Debug)]
pub struct MahoragaState {
    pub fast_ema: i32,
    pub medium_ema: i32,
    pub slow_sma: i32,
    pub lot_multiplier: f64,
    pub sl_multiplier: f64,
    pub filter_strictness: String,
    pub trend_state: String,
    pub momentum_state: String,
    pub confidence_score: f64,
    pub phenomenon: String,
    pub is_adapted: bool,
    pub adaptation_spins: i32,
    pub adapter_source: String,
    pub trading_halted: bool,
    pub active_strategy: String,
    pub tp_multiplier: f64,
}

#[derive(Clone, Deserialize, Serialize, PartialEq, Debug)]
pub struct RankedSignal {
    pub symbol: String,
    pub action: String, // BUY or SELL
    pub combined_score: f64,
    pub components: HashMap<String, f64>,
}

#[derive(Clone, Deserialize, Serialize, PartialEq, Debug)]
pub struct AppState {
    pub account: Option<AccountInfo>,
    pub positions: Vec<Position>,
    pub orders: Vec<Order>,
    pub market_watch: Vec<MarketWatchItem>,
    pub ranked_signals: Vec<RankedSignal>,
    pub mahoraga_state: HashMap<String, MahoragaState>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            account: None,
            positions: Vec::new(),
            orders: Vec::new(),
            market_watch: Vec::new(),
            ranked_signals: Vec::new(),
            mahoraga_state: HashMap::new(),
        }
    }
}
