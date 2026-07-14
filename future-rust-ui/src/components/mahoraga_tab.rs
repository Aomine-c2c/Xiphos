use dioxus::prelude::*;
use crate::models::AppState;
use crate::components::mahoraga::DecisionCardsGrid;

#[component]
pub fn MahoragaTab(app_state: Signal<AppState>) -> Element {
    rsx! {
        div {
            class: "flex-1 p-6 overflow-hidden flex flex-col",
            
            div {
                class: "flex justify-between items-end mb-6",
                div {
                    h2 { class: "text-2xl font-bold text-xiphos-purple", "Mahoraga Engine" }
                    p { class: "text-xiphos-muted text-sm mt-1", "AI Signal Processing & Decision Feed" }
                }
                
                div {
                    class: "px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm font-mono text-xiphos-cyan",
                    "Active Signals: {app_state().ranked_signals.len()}"
                }
            }
            
            div {
                class: "flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-2",
                // For the dedicated tab, we allow scrolling and show all signals
                DecisionCardsGrid { 
                    signals: app_state().ranked_signals.clone(),
                    mahoraga_state: app_state().mahoraga_state.clone()
                }
            }
        }
    }
}
