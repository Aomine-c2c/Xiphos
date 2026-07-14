use dioxus::prelude::*;
use crate::models::AppState;

#[component]
pub fn Header(app_state: Signal<AppState>, is_connected: Signal<bool>) -> Element {
    let account = app_state().account;
    
    // Fallbacks if data is not yet available
    let balance = account.as_ref().map(|a| a.balance).unwrap_or(0.0);
    let equity = account.as_ref().map(|a| a.equity).unwrap_or(0.0);
    let margin_free = account.as_ref().map(|a| a.margin_free).unwrap_or(0.0);
    let float_pl = account.as_ref().map(|a| a.profit).unwrap_or(0.0);
    
    let pl_color = if float_pl >= 0.0 { "text-xiphos-emerald" } else { "text-xiphos-crimson" };
    let status_indicator = if is_connected() { "w-2 h-2 rounded-full bg-xiphos-emerald shadow-[0_0_8px_rgba(74,222,128,0.5)]" } else { "w-2 h-2 rounded-full bg-xiphos-crimson shadow-[0_0_8px_rgba(248,113,113,0.5)]" };
    let status_text = if is_connected() { "text-xiphos-emerald" } else { "text-xiphos-crimson" };
    let status_label = if is_connected() { "LIVE" } else { "OFFLINE" };

    rsx! {
        div {
            class: "h-20 border-b border-white/5 bg-xiphos-panel flex items-center justify-between px-6 shrink-0",
            
            // Connection Status
            div {
                class: "flex items-center gap-3",
                div {
                    class: "{status_indicator}"
                }
                span {
                    class: "text-sm font-medium tracking-wide {status_text}",
                    "{status_label}"
                }
            }
            
            // KPI Strip
            div {
                class: "flex gap-8",
                
                KpiItem { label: "BALANCE", value: format!("${:.2}", balance), value_class: "text-white" }
                KpiItem { label: "EQUITY", value: format!("${:.2}", equity), value_class: "text-white" }
                KpiItem { label: "FREE MARGIN", value: format!("${:.2}", margin_free), value_class: "text-xiphos-muted" }
                KpiItem { label: "FLOAT P&L", value: format!("${:.2}", float_pl), value_class: pl_color.to_string() }
            }
        }
    }
}

#[component]
fn KpiItem(label: String, value: String, value_class: String) -> Element {
    rsx! {
        div {
            class: "flex flex-col",
            span { class: "text-[10px] text-xiphos-muted tracking-wider mb-1", "{label}" }
            span { class: "text-lg font-bold {value_class}", "{value}" }
        }
    }
}
