use ratatui::{
    style::{Color, Modifier, Style},
    widgets::{Block, Borders, BorderType},
    text::Span,
};

// ── Background colors ─────────────────────────────────────────────────────────
pub const BG: Color = Color::Rgb(12, 16, 28);
pub const BG_PANEL: Color = Color::Rgb(18, 24, 40);
pub const BG_SELECTED: Color = Color::Rgb(40, 20, 70);

// ── Accent palette ────────────────────────────────────────────────────────────
pub const VIOLET: Color = Color::Rgb(139, 92, 246);
pub const PURPLE: Color = Color::Rgb(168, 85, 247);
pub const INDIGO: Color = Color::Rgb(99, 102, 241);
pub const CYAN: Color = Color::Rgb(34, 211, 238);
pub const GOLD: Color = Color::Rgb(251, 191, 36);
pub const MAGENTA: Color = Color::Rgb(236, 72, 153);
pub const ORANGE: Color = Color::Rgb(251, 146, 60);
pub const GREEN: Color = Color::Rgb(34, 197, 94);
pub const RED: Color = Color::Rgb(239, 68, 68);
pub const YELLOW: Color = Color::Rgb(234, 179, 8);
pub const WHITE: Color = Color::Rgb(226, 232, 240);
pub const MUTED: Color = Color::Rgb(71, 85, 105);

// ── Symbol group color map ────────────────────────────────────────────────────
pub fn symbol_color(symbol: &str) -> Color {
    let sym = symbol.to_uppercase();
    if ["EURUSD", "GBPUSD", "AUDUSD", "USDJPY", "NZDUSD", "USDCAD"].iter().any(|&s| sym.starts_with(s)) {
        CYAN
    } else if ["XAUUSD", "XAGUSD"].iter().any(|&s| sym.starts_with(s)) {
        GOLD
    } else if ["EURJPY", "GBPJPY", "USDCHF", "EURGBP", "AUDJPY", "CADJPY"].iter().any(|&s| sym.starts_with(s)) {
        MAGENTA
    } else if sym.contains("BTC") || sym.contains("ETH") || sym.contains("LTC") {
        ORANGE
    } else if sym.contains("VOLATILITY") || sym.contains("VIX") || sym.contains("NAS") || sym.contains("US500") {
        GREEN
    } else {
        WHITE
    }
}

// ── Style helpers ─────────────────────────────────────────────────────────────
pub fn style_default() -> Style { Style::default().fg(WHITE) }
pub fn style_header() -> Style { Style::default().fg(VIOLET).add_modifier(Modifier::BOLD) }
pub fn style_selected() -> Style { Style::default().fg(WHITE).bg(BG_SELECTED).add_modifier(Modifier::BOLD) }
pub fn style_muted() -> Style { Style::default().fg(MUTED) }
pub fn style_green() -> Style { Style::default().fg(GREEN) }
pub fn style_red() -> Style { Style::default().fg(RED) }
pub fn style_yellow() -> Style { Style::default().fg(YELLOW) }
pub fn style_cyan() -> Style { Style::default().fg(CYAN) }
pub fn style_gold() -> Style { Style::default().fg(GOLD) }
pub fn style_violet() -> Style { Style::default().fg(VIOLET) }
pub fn style_orange() -> Style { Style::default().fg(ORANGE) }
pub fn style_purple() -> Style { Style::default().fg(PURPLE) }

pub fn pl_style(val: f64) -> Style {
    if val > 0.01 { style_green() } else if val < -0.01 { style_red() } else { style_muted() }
}

pub fn gate_style(status: &str) -> Style {
    if status == "PASS" { style_green() } else { style_red() }
}

// ── Block builders ────────────────────────────────────────────────────────────
pub fn block(title: impl Into<String>) -> Block<'static> {
    let t = format!(" {} ", title.into());
    Block::default()
        .title(Span::styled(t, style_header()))
        .borders(Borders::ALL)
        .border_style(Style::default().fg(INDIGO))
        .border_type(BorderType::Rounded)
}

pub fn block_animated(title: impl Into<String>, tick: u64) -> Block<'static> {
    let t = format!(" {} ", title.into());
    let border_col = if tick % 40 < 20 { VIOLET } else { PURPLE };
    Block::default()
        .title(Span::styled(t, Style::default().fg(PURPLE).add_modifier(Modifier::BOLD)))
        .borders(Borders::ALL)
        .border_style(Style::default().fg(border_col).add_modifier(Modifier::BOLD))
        .border_type(BorderType::Double)
}

pub fn block_danger(title: impl Into<String>) -> Block<'static> {
    let t = format!(" ⚠  {}  ⚠ ", title.into());
    Block::default()
        .title(Span::styled(t, Style::default().fg(RED).add_modifier(Modifier::BOLD)))
        .borders(Borders::ALL)
        .border_style(Style::default().fg(RED).add_modifier(Modifier::BOLD))
        .border_type(BorderType::Double)
}

pub fn block_success(title: impl Into<String>) -> Block<'static> {
    let t = format!(" {} ", title.into());
    Block::default()
        .title(Span::styled(t, style_green()))
        .borders(Borders::ALL)
        .border_style(Style::default().fg(GREEN))
        .border_type(BorderType::Rounded)
}
