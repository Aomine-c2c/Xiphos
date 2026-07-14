use dioxus::prelude::*;
use crate::Tab;

#[component]
pub fn Sidebar(active_tab: Signal<Tab>) -> Element {
    rsx! {
        div {
            class: "w-64 bg-xiphos-panel flex flex-col border-r border-white/5 p-5 shrink-0",
            
            div {
                class: "text-2xl font-bold mb-10 text-xiphos-purple flex items-center gap-2 tracking-widest",
                "XIPHOS"
            }

            NavItem {
                label: "PORTFOLIO",
                icon: "pie-chart",
                is_active: active_tab() == Tab::Portfolio,
                onclick: move |_| active_tab.set(Tab::Portfolio)
            }
            NavItem {
                label: "MAHORAGA",
                icon: "psychology",
                is_active: active_tab() == Tab::Mahoraga,
                onclick: move |_| active_tab.set(Tab::Mahoraga)
            }
            NavItem {
                label: "POSITIONS",
                icon: "activity",
                is_active: active_tab() == Tab::Positions,
                onclick: move |_| active_tab.set(Tab::Positions)
            }
            NavItem {
                label: "SETTINGS",
                icon: "settings",
                is_active: active_tab() == Tab::Settings,
                onclick: move |_| active_tab.set(Tab::Settings)
            }
            
            div { class: "flex-grow" }
            
            div {
                class: "text-xs text-xiphos-muted text-center",
                "Xiphos Engine v2.0"
            }
        }
    }
}

#[component]
fn NavItem(label: String, icon: String, is_active: bool, onclick: EventHandler<MouseEvent>) -> Element {
    let bg_class = if is_active { "bg-white/10" } else { "bg-transparent hover:bg-white/5" };
    let text_class = if is_active { "text-xiphos-purple font-medium" } else { "text-xiphos-muted hover:text-white" };

    rsx! {
        button {
            class: "w-full text-left px-4 py-3 mb-2 rounded-lg flex items-center gap-3 transition-colors text-sm {bg_class} {text_class}",
            onclick: move |e| onclick.call(e),
            // We would ideally have an icon here
            span { class: "material-symbols-outlined text-[20px]", "{icon}" }
            "{label}"
        }
    }
}
