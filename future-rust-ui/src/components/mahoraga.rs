use dioxus::prelude::*;
use crate::models::{MahoragaState, RankedSignal};

#[component]
pub fn DecisionCardsGrid(signals: Vec<RankedSignal>, mahoraga_state: std::collections::HashMap<String, MahoragaState>) -> Element {
    // Only take the top 6 signals for the grid to prevent scrolling
    let display_signals = signals.iter().take(6).collect::<Vec<_>>();

    rsx! {
        div {
            class: "grid grid-cols-2 lg:grid-cols-3 gap-4 h-full",
            
            for signal in display_signals {
                {
                    let state = mahoraga_state.get(&signal.symbol);
                    let confidence = state.map(|s| s.confidence_score).unwrap_or(0.0);
                    let phenomenon = state.map(|s| s.phenomenon.clone()).unwrap_or_else(|| "UNKNOWN".to_string());
                    
                    // Determine glowing border based on confidence
                    let glow_class = if confidence >= 80.0 {
                        "border-xiphos-emerald shadow-[0_0_15px_rgba(74,222,128,0.2)]"
                    } else if confidence >= 50.0 {
                        "border-xiphos-gold shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                    } else {
                        "border-white/10"
                    };

                    let action_class = if signal.action == "BUY" {
                        "bg-xiphos-emerald/20 text-xiphos-emerald"
                    } else {
                        "bg-xiphos-crimson/20 text-xiphos-crimson"
                    };

                    rsx! {
                        div {
                            class: "bg-black/60 rounded-xl p-4 flex flex-col justify-between border {glow_class} transition-all hover:bg-black/80 cursor-pointer",
                            
                            // Header
                            div {
                                class: "flex justify-between items-start mb-4",
                                div {
                                    class: "text-xl font-bold tracking-wider",
                                    "{signal.symbol}"
                                }
                                div {
                                    class: "px-2 py-1 rounded text-xs font-bold {action_class}",
                                    "{signal.action}"
                                }
                            }
                            
                            // Details
                            div {
                                class: "flex flex-col gap-2 mb-4",
                                div {
                                    class: "flex justify-between text-sm",
                                    span { class: "text-xiphos-muted", "Confidence:" }
                                    span { class: "font-mono font-bold", "{confidence:.1}%" }
                                }
                                div {
                                    class: "flex justify-between text-sm",
                                    span { class: "text-xiphos-muted", "Score:" }
                                    span { class: "font-mono", "{signal.combined_score:.2}" }
                                }
                                div {
                                    class: "flex justify-between text-sm",
                                    span { class: "text-xiphos-muted", "State:" }
                                    span { class: "text-xiphos-cyan", "{phenomenon}" }
                                }
                            }
                            
                            // Footer / Action
                            button {
                                class: "w-full py-2 rounded bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors text-xiphos-muted hover:text-white border border-white/5",
                                "VIEW ANALYSIS"
                            }
                        }
                    }
                }
            }
            
            if signals.is_empty() {
                div {
                    class: "col-span-full h-full flex flex-col items-center justify-center text-xiphos-muted bg-white/5 rounded-xl border border-white/10",
                    div { class: "material-symbols-outlined text-4xl mb-2", "psychology" }
                    div { class: "font-medium", "MAHORAGA ENGINE IDLE" }
                    div { class: "text-sm mt-1 opacity-60", "Waiting for trading signals..." }
                }
            }
        }
    }
}
