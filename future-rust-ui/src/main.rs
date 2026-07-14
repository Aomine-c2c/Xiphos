#![allow(non_snake_case)]

mod components;
mod models;
mod commands; // We will create this next

use dioxus::prelude::*;
use dioxus_logger::tracing::Level;
use futures_util::StreamExt;
use std::collections::HashMap;
use tokio_tungstenite::connect_async;

use crate::components::sidebar::Sidebar;
use crate::components::header::Header;
use crate::components::dashboard::Dashboard;
use crate::components::mahoraga_tab::MahoragaTab; // We will create this
use crate::models::*;

#[derive(Clone, PartialEq, Debug)]
pub enum Tab {
    Portfolio,
    Mahoraga,
    Positions,
    Settings,
}

fn main() {
    dioxus_logger::init(Level::INFO).expect("failed to init logger");
    dioxus::launch(App);
}

#[component]
fn App() -> Element {
    let active_tab = use_signal(|| Tab::Portfolio);
    let mut app_state = use_signal(|| AppState::default());
    let mut is_connected = use_signal(|| false);

    // Background coroutine to stream WebSockets
    use_coroutine(move |_: UnboundedReceiver<()>| {
        async move {
            let ws_url = "ws://127.0.0.1:8001/ws";
            if let Ok((ws_stream, _)) = connect_async(ws_url).await {
                is_connected.set(true);
                let (_, mut read) = ws_stream.split();

                while let Some(message) = read.next().await {
                    if let Ok(msg) = message {
                        if let Ok(text) = msg.into_text() {
                            if let Ok(json_state) = serde_json::from_str::<serde_json::Value>(&text) {
                                // Extract state parts
                                let mut new_state = app_state().clone();
                                
                                if let Some(account_val) = json_state.get("account") {
                                    if let Ok(account) = serde_json::from_value::<AccountInfo>(account_val.clone()) {
                                        new_state.account = Some(account);
                                    }
                                }
                                
                                if let Some(positions_val) = json_state.get("positions") {
                                    if let Ok(positions) = serde_json::from_value::<Vec<Position>>(positions_val.clone()) {
                                        new_state.positions = positions;
                                    }
                                }
                                
                                if let Some(market_val) = json_state.get("market_watch") {
                                    if let Ok(market) = serde_json::from_value::<Vec<MarketWatchItem>>(market_val.clone()) {
                                        new_state.market_watch = market;
                                    }
                                }
                                
                                if let Some(ranked_val) = json_state.get("ranked_signals") {
                                    if let Ok(signals) = serde_json::from_value::<Vec<RankedSignal>>(ranked_val.clone()) {
                                        new_state.ranked_signals = signals;
                                    }
                                }
                                
                                if let Some(mahoraga_val) = json_state.get("mahoraga_state") {
                                    if let Ok(mahoraga) = serde_json::from_value::<HashMap<String, MahoragaState>>(mahoraga_val.clone()) {
                                        new_state.mahoraga_state = mahoraga;
                                    }
                                }
                                
                                app_state.set(new_state);
                            }
                        }
                    }
                }
                is_connected.set(false);
            }
        }
    });

    rsx! {
        link { rel: "stylesheet", href: "tailwind.css" }
        
        div {
            class: "flex h-screen w-screen bg-xiphos-bg text-white font-sans overflow-hidden",
            
            Sidebar { active_tab: active_tab }
            
            div {
                class: "flex-1 flex flex-col min-w-0", // min-w-0 prevents flex blowout
                
                Header { app_state: app_state, is_connected: is_connected }
                
                // Content Area
                match active_tab() {
                    Tab::Portfolio => rsx! { Dashboard { app_state: app_state } },
                    Tab::Mahoraga => rsx! { MahoragaTab { app_state: app_state } },
                    Tab::Positions => rsx! { div { class: "p-6", "Positions View (WIP)" } },
                    Tab::Settings => rsx! { div { class: "p-6", "Settings View (WIP)" } },
                }
            }
        }
    }
}
