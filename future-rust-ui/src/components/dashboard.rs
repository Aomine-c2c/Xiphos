use dioxus::prelude::*;
use crate::models::AppState;
use crate::components::mahoraga::DecisionCardsGrid;

#[component]
pub fn Dashboard(app_state: Signal<AppState>) -> Element {
    rsx! {
        div {
            class: "flex-1 flex flex-col p-6 overflow-hidden",
            
            // Content Layout
            div {
                class: "flex-1 flex gap-6 min-h-0", // min-h-0 is crucial for flex children scrolling
                
                // Left Column (Charts / Positions)
                div {
                    class: "flex-[2] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2",
                    
                    div {
                        class: "bg-white/5 border border-white/10 rounded-xl p-6 min-h-[400px]",
                        h3 { class: "text-lg font-bold mb-4", "PORTFOLIO OVERVIEW" }
                        div { class: "text-xiphos-muted text-sm", "Chart placeholder..." }
                    }
                    
                    div {
                        class: "bg-white/5 border border-white/10 rounded-xl p-6 min-h-[300px]",
                        h3 { class: "text-lg font-bold mb-4 text-xiphos-cyan", "ACTIVE POSITIONS" }
                        
                        div {
                            class: "flex flex-col gap-2",
                            for pos in app_state().positions.iter() {
                                {
                                    let type_color = if pos.r#type == "BUY" { "bg-xiphos-emerald" } else { "bg-xiphos-crimson" };
                                    let pl_color = if pos.profit >= 0.0 { "text-xiphos-emerald" } else { "text-xiphos-crimson" };
                                    rsx! {
                                        div {
                                            class: "flex justify-between items-center p-3 rounded-lg bg-black/40 border border-white/5",
                                            
                                            div {
                                                class: "flex items-center gap-4",
                                                div {
                                                    class: "w-2 h-2 rounded-full {type_color}",
                                                }
                                                div {
                                                    span { class: "font-bold mr-2", "{pos.symbol}" }
                                                    span { class: "text-xs text-xiphos-muted", "{pos.volume} Lots" }
                                                }
                                            }
                                            
                                            div {
                                                class: "font-mono {pl_color}",
                                                "${pos.profit:.2}"
                                            }
                                        }
                                    }
                                }
                            }
                            if app_state().positions.is_empty() {
                                div { class: "text-center text-xiphos-muted py-8 text-sm", "NO ACTIVE POSITIONS" }
                            }
                        }
                    }
                }
                
                // Right Column (Mahoraga Engine)
                div {
                    class: "flex-1 flex flex-col gap-6 overflow-hidden pr-2", // Strictly no scrolling here
                    
                    div {
                        class: "flex-1 min-h-0",
                        DecisionCardsGrid { 
                            signals: app_state().ranked_signals.clone(),
                            mahoraga_state: app_state().mahoraga_state.clone()
                        }
                    }
                }
            }
        }
    }
}
