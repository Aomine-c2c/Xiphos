use crate::app::{ActiveTab, App, ModalState};
use crate::theme;
use ratatui::{
    layout::{Alignment, Constraint, Direction, Layout, Rect},
    style::{Modifier, Style},
    text::{Line, Span},
    widgets::{Cell, Clear, Paragraph, Row, Sparkline, Table, Tabs},
    Frame,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Entry point
// ─────────────────────────────────────────────────────────────────────────────
pub fn draw(f: &mut Frame, app: &mut App) {
    let area = f.area();

    // Root layout: header / tabs / content / footer
    let root = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Length(3),
            Constraint::Length(3),
            Constraint::Min(0),
            Constraint::Length(3),
        ])
        .split(area);

    draw_header(f, app, root[0]);
    draw_tabs(f, app, root[1]);
    draw_content(f, app, root[2]);
    draw_footer(f, app, root[3]);
    draw_modals(f, app, area);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Header
// ─────────────────────────────────────────────────────────────────────────────
fn draw_header(f: &mut Frame, app: &App, area: Rect) {
    let blink = app.tick % 20 < 10;
    let dot = if blink { "●" } else { "○" };

    let (conn_dot, conn_style) = if app.connected {
        (dot, Style::default().fg(theme::GREEN))
    } else {
        ("●", Style::default().fg(theme::RED))
    };

    let mt5_style = if app.state.mt5_connected { theme::style_green() } else { theme::style_red() };
    let bot_style = if app.state.bot_running { theme::style_green() } else { theme::style_yellow() };

    let title = Paragraph::new(Line::from(vec![
        Span::styled("  ⚔  XIPHOS ENGINE  ", Style::default().fg(theme::PURPLE).add_modifier(Modifier::BOLD)),
        Span::styled(format!("{} {:<10}", conn_dot, if app.connected { "CONNECTED" } else { "OFFLINE" }), conn_style),
        Span::styled("  │  ", theme::style_muted()),
        Span::styled("MT5: ", theme::style_muted()),
        Span::styled(if app.state.mt5_connected { "OK" } else { "DOWN" }, mt5_style),
        Span::styled("  │  ", theme::style_muted()),
        Span::styled("Bot: ", theme::style_muted()),
        Span::styled(if app.state.bot_running { "RUNNING" } else { "STOPPED" }, bot_style),
        Span::styled("  │  ", theme::style_muted()),
        Span::styled(format!("Latency: {:.1}ms", app.state.api_latency), theme::style_cyan()),
        Span::styled("  │  ", theme::style_muted()),
        Span::styled(format!("Last Cycle: {}", app.state.last_cycle_time), theme::style_muted()),
    ]))
    .block(theme::block_animated("Xiphos Terminal", app.tick));

    f.render_widget(title, area);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Tab bar
// ─────────────────────────────────────────────────────────────────────────────
fn draw_tabs(f: &mut Frame, app: &App, area: Rect) {
    let titles: Vec<Line> = vec![
        " [1] Dashboard ",
        " [2] Markets ",
        " [3] Positions ",
        " [4] Orders ",
        " [5] Gates ",
        " [6] Logs ",
        " [7] Chat ",
    ]
    .into_iter()
    .map(Line::from)
    .collect();

    let selected = match app.active_tab {
        ActiveTab::Dashboard => 0,
        ActiveTab::Markets   => 1,
        ActiveTab::Positions => 2,
        ActiveTab::Orders    => 3,
        ActiveTab::Gates     => 4,
        ActiveTab::Logs      => 5,
        ActiveTab::Chat      => 6,
    };

    let tabs = Tabs::new(titles)
        .select(selected)
        .style(theme::style_muted())
        .highlight_style(Style::default().fg(theme::PURPLE).add_modifier(Modifier::BOLD))
        .divider(Span::styled("│", theme::style_muted()))
        .block(theme::block("Navigation"));

    f.render_widget(tabs, area);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Content routing
// ─────────────────────────────────────────────────────────────────────────────
fn draw_content(f: &mut Frame, app: &mut App, area: Rect) {
    match app.active_tab {
        ActiveTab::Dashboard => draw_dashboard(f, app, area),
        ActiveTab::Markets   => draw_markets(f, app, area),
        ActiveTab::Positions => draw_positions(f, app, area),
        ActiveTab::Orders    => draw_orders(f, app, area),
        ActiveTab::Gates     => draw_gates(f, app, area),
        ActiveTab::Logs      => draw_logs(f, app, area),
        ActiveTab::Chat      => draw_chat(f, app, area),
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────────────────────────────────────────
fn draw_dashboard(f: &mut Frame, app: &App, area: Rect) {
    let cols = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(60), Constraint::Percentage(40)])
        .split(area);

    // ── Left: account + sparkline ─────────────────────────────────────────
    let left_rows = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(5)])
        .split(cols[0]);

    let acc = &app.state.account;
    let total_pl: f64 = app.state.positions.iter().map(|p| p.profit).sum();
    let acc_lines = vec![
        Line::from(vec![
            Span::styled("  Balance:    ", theme::style_muted()),
            Span::styled(format!("${:.2}", acc.balance), theme::style_default()),
        ]),
        Line::from(vec![
            Span::styled("  Equity:     ", theme::style_muted()),
            Span::styled(format!("${:.2}", acc.equity), theme::style_default()),
        ]),
        Line::from(vec![
            Span::styled("  Free Margin:", theme::style_muted()),
            Span::styled(format!("${:.2}", acc.margin_free), theme::style_cyan()),
        ]),
        Line::from(vec![
            Span::styled("  Open P&L:   ", theme::style_muted()),
            Span::styled(format!("{:+.2}", total_pl), theme::pl_style(total_pl)),
        ]),
        Line::from(vec![
            Span::styled("  Positions:  ", theme::style_muted()),
            Span::styled(format!("{} open", app.state.positions.len()), theme::style_default()),
        ]),
    ];
    let acc_para = Paragraph::new(acc_lines).block(theme::block("Account Overview"));
    f.render_widget(acc_para, left_rows[0]);

    // Sparkline
    if !app.pl_history.is_empty() {
        let vals: Vec<f64> = app.pl_history.iter().cloned().collect();
        let min = vals.iter().cloned().fold(f64::INFINITY, f64::min);
        let max = vals.iter().cloned().fold(f64::NEG_INFINITY, f64::max);
        let range = (max - min).abs().max(0.01);
        let data: Vec<u64> = vals.iter().map(|&v| ((v - min) / range * 100.0).max(0.0) as u64).collect();
        let spark_color = if total_pl >= 0.0 { theme::GREEN } else { theme::RED };
        let sparkline = Sparkline::default()
            .data(&data)
            .max(100)
            .style(Style::default().fg(spark_color))
            .block(theme::block("P&L History (last 60s)"));
        f.render_widget(sparkline, left_rows[1]);
    } else {
        let ph = Paragraph::new("  Accumulating data...")
            .style(theme::style_muted())
            .block(theme::block("P&L History (last 60s)"));
        f.render_widget(ph, left_rows[1]);
    }

    // ── Right: system + risk slots ────────────────────────────────────────
    let right_rows = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Percentage(50), Constraint::Percentage(50)])
        .split(cols[1]);

    let risk_count = app.state.positions.iter().filter(|p| p.risk_status == "RISK").count();
    let free_count = app.state.positions.iter().filter(|p| p.risk_status == "FREE").count();

    let sys_lines = vec![
        Line::from(vec![
            Span::styled("  CPU:    ", theme::style_muted()),
            Span::styled(format!("{:.1}%", app.state.system_stats.cpu), theme::style_default()),
        ]),
        Line::from(vec![
            Span::styled("  Memory: ", theme::style_muted()),
            Span::styled(format!("{:.1} MB", app.state.system_stats.memory), theme::style_default()),
        ]),
    ];
    let sys_para = Paragraph::new(sys_lines).block(theme::block("System Health"));
    f.render_widget(sys_para, right_rows[0]);

    let slot_lines = vec![
        Line::from(vec![
            Span::styled("  Risk Slots: ", theme::style_muted()),
            Span::styled(format!("{} RISK", risk_count), theme::style_red()),
            Span::raw("  "),
            Span::styled(format!("{} FREE", free_count), theme::style_green()),
        ]),
        Line::from(""),
        Line::from(vec![
            Span::styled("  [s] Start  [x] Stop  [f] Force Cycle", theme::style_muted()),
        ]),
        Line::from(vec![
            Span::styled("  [p] ", theme::style_red()),
            Span::styled("PANIC CLOSE ALL", Style::default().fg(theme::RED).add_modifier(Modifier::BOLD)),
        ]),
    ];
    let slot_para = Paragraph::new(slot_lines).block(theme::block("Risk Slots"));
    f.render_widget(slot_para, right_rows[1]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Markets
// ─────────────────────────────────────────────────────────────────────────────
fn draw_markets(f: &mut Frame, app: &App, area: Rect) {
    let header = Row::new(["Symbol", "Price", "EMA13 Dist", "EMA50 Dist", "SMA200 Dist", "Signal"])
        .style(theme::style_header())
        .height(1);

    let rows: Vec<Row> = app.state.market_watch.iter().map(|item| {
        let col = theme::symbol_color(&item.symbol);
        let sig_style = match item.signal.as_str() {
            "BUY"  => theme::style_green(),
            "SELL" => theme::style_red(),
            _      => theme::style_muted(),
        };
        Row::new(vec![
            Cell::from(item.symbol.clone()).style(Style::default().fg(col)),
            Cell::from(format!("{:.5}", item.price)),
            Cell::from(format!("{:+.1}", item.e13_dist)),
            Cell::from(format!("{:+.1}", item.e50_dist)),
            Cell::from(format!("{:+.1}", item.s200_dist)),
            Cell::from(item.signal.clone()).style(sig_style),
        ])
    }).collect();

    let table = Table::new(rows, [
        Constraint::Percentage(16),
        Constraint::Percentage(16),
        Constraint::Percentage(17),
        Constraint::Percentage(17),
        Constraint::Percentage(17),
        Constraint::Percentage(17),
    ])
    .header(header)
    .block(theme::block("Market Watch"));

    f.render_widget(table, area);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Positions
// ─────────────────────────────────────────────────────────────────────────────
fn draw_positions(f: &mut Frame, app: &mut App, area: Rect) {
    if app.state.positions.is_empty() {
        let p = Paragraph::new("\n  No open positions.")
            .style(theme::style_muted())
            .block(theme::block("Active Positions"));
        f.render_widget(p, area);
        return;
    }

    let header = Row::new(["Ticket", "Symbol", "Type", "Volume", "Entry", "Current", "P&L", "Role", "Status"])
        .style(theme::style_header())
        .height(1);

    let rows: Vec<Row> = app.state.positions.iter().map(|pos| {
        let type_style = if pos.r#type == "BUY" { theme::style_green() } else { theme::style_red() };
        let risk_style = if pos.risk_status == "FREE" { theme::style_green() } else { theme::style_yellow() };
        Row::new(vec![
            Cell::from(pos.ticket.to_string()),
            Cell::from(pos.symbol.clone()).style(Style::default().fg(theme::symbol_color(&pos.symbol))),
            Cell::from(pos.r#type.clone()).style(type_style),
            Cell::from(format!("{:.2}", pos.volume)),
            Cell::from(format!("{:.5}", pos.price_open)),
            Cell::from(format!("{:.5}", pos.price_current)),
            Cell::from(format!("{:+.2}", pos.profit)).style(theme::pl_style(pos.profit)),
            Cell::from(pos.role.clone()),
            Cell::from(pos.risk_status.clone()).style(risk_style),
        ])
    }).collect();

    let table = Table::new(rows, [
        Constraint::Length(10),
        Constraint::Length(10),
        Constraint::Length(6),
        Constraint::Length(7),
        Constraint::Length(10),
        Constraint::Length(10),
        Constraint::Length(9),
        Constraint::Length(8),
        Constraint::Min(6),
    ])
    .header(header)
    .row_highlight_style(theme::style_selected())
    .highlight_symbol("▶ ")
    .block(theme::block("Active Positions  [↑↓] Navigate  [Enter] Actions"));

    f.render_stateful_widget(table, area, &mut app.positions_table_state);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Orders
// ─────────────────────────────────────────────────────────────────────────────
fn draw_orders(f: &mut Frame, app: &mut App, area: Rect) {
    if app.state.orders.is_empty() {
        let p = Paragraph::new("\n  No pending orders.")
            .style(theme::style_muted())
            .block(theme::block("Pending Orders"));
        f.render_widget(p, area);
        return;
    }

    let header = Row::new(["Ticket", "Symbol", "Type", "Volume", "Price", "SL", "TP", "Comment"])
        .style(theme::style_header())
        .height(1);

    let rows: Vec<Row> = app.state.orders.iter().map(|ord| {
        Row::new(vec![
            Cell::from(ord.ticket.to_string()),
            Cell::from(ord.symbol.clone()).style(Style::default().fg(theme::symbol_color(&ord.symbol))),
            Cell::from(ord.r#type.clone()),
            Cell::from(format!("{:.2}", ord.volume)),
            Cell::from(format!("{:.5}", ord.price_open)),
            Cell::from(format!("{:.5}", ord.sl)),
            Cell::from(format!("{:.5}", ord.tp)),
            Cell::from(ord.comment.clone()).style(theme::style_muted()),
        ])
    }).collect();

    let table = Table::new(rows, [
        Constraint::Length(10),
        Constraint::Length(10),
        Constraint::Length(12),
        Constraint::Length(7),
        Constraint::Length(10),
        Constraint::Length(10),
        Constraint::Length(10),
        Constraint::Min(10),
    ])
    .header(header)
    .row_highlight_style(theme::style_selected())
    .highlight_symbol("▶ ")
    .block(theme::block("Pending Orders  [↑↓] Navigate"));

    f.render_stateful_widget(table, area, &mut app.orders_table_state);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Gates / Signals
// ─────────────────────────────────────────────────────────────────────────────
fn draw_gates(f: &mut Frame, app: &App, area: Rect) {
    let cols = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(38), Constraint::Percentage(62)])
        .split(area);

    // Gates grid
    let gate_defs = [
        ("gate_1_risk_slot",    "Gate 1 — Risk Slots"),
        ("gate_2_correlation",  "Gate 2 — Correlation"),
        ("gate_3_fan_alignment","Gate 3 — Fan Alignment"),
        ("gate_4_multi_signal", "Gate 4 — Multi Signal"),
        ("gate_5_execution",    "Gate 5 — Execution"),
    ];

    let gate_lines: Vec<Line> = gate_defs.iter().map(|(key, label)| {
        let status = app.state.gates.get(*key).map(|s| s.as_str()).unwrap_or("—");
        let detail_key = key.replace("gate_", "").split('_').next().unwrap_or("").to_string();
        let detail_key = format!("gate_{}_details", &key[5..6]);
        let detail = app.state.gates.get(&detail_key).cloned().unwrap_or_default();
        let (badge, style) = if status == "PASS" {
            ("✓ PASS", theme::style_green())
        } else if status == "FAIL" {
            ("✗ FAIL", theme::style_red())
        } else {
            ("— ----", theme::style_muted())
        };
        Line::from(vec![
            Span::styled(format!("  {:<24} ", label), theme::style_default()),
            Span::styled(badge, style),
            if !detail.is_empty() {
                Span::styled(format!("  ({})", &detail[..detail.len().min(30)]), theme::style_muted())
            } else {
                Span::raw("")
            },
        ])
    }).collect();

    let gates_para = Paragraph::new(gate_lines).block(theme::block("Strategy Gates"));
    f.render_widget(gates_para, cols[0]);

    // Ranked signals
    if app.state.ranked_signals.is_empty() {
        let p = Paragraph::new("\n  No ranked signals this cycle.")
            .style(theme::style_muted())
            .block(theme::block("Ranked Signals"));
        f.render_widget(p, cols[1]);
        return;
    }

    let header = Row::new(["#", "Symbol", "Direction", "Price", "Dist SMA200", "Risk", "Status"])
        .style(theme::style_header())
        .height(1);

    let rows: Vec<Row> = app.state.ranked_signals.iter().map(|sig| {
        let dir_style = if sig.direction == "BUY" { theme::style_green() } else { theme::style_red() };
        Row::new(vec![
            Cell::from(sig.priority.to_string()).style(theme::style_gold()),
            Cell::from(sig.symbol.clone()).style(Style::default().fg(theme::symbol_color(&sig.symbol))),
            Cell::from(sig.direction.clone()).style(dir_style),
            Cell::from(format!("{:.5}", sig.price)),
            Cell::from(format!("{:.1}", sig.distance)),
            Cell::from(format!("{:.4}", sig.projected_risk)).style(theme::style_yellow()),
            Cell::from(sig.status.clone()),
        ])
    }).collect();

    let table = Table::new(rows, [
        Constraint::Length(4),
        Constraint::Length(10),
        Constraint::Length(10),
        Constraint::Length(10),
        Constraint::Length(12),
        Constraint::Length(9),
        Constraint::Min(8),
    ])
    .header(header)
    .block(theme::block("Ranked Signals (Priority Engine)"));

    f.render_widget(table, cols[1]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Logs
// ─────────────────────────────────────────────────────────────────────────────
fn draw_logs(f: &mut Frame, app: &App, area: Rect) {
    let inner_height = area.height.saturating_sub(2) as usize;
    let log_lines: Vec<Line> = app
        .logs
        .iter()
        .rev()
        .take(inner_height)
        .rev()
        .map(|log| {
            let style = match log.level.as_str() {
                "INFO"    => theme::style_green(),
                "WARNING" => theme::style_yellow(),
                "ERROR"   => theme::style_red(),
                "SUCCESS" => theme::style_cyan(),
                _         => theme::style_muted(),
            };
            Line::from(Span::styled(log.formatted.clone(), style))
        })
        .collect();

    let para = Paragraph::new(log_lines).block(theme::block("Live Logs"));
    f.render_widget(para, area);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Chat
// ─────────────────────────────────────────────────────────────────────────────
fn draw_chat(f: &mut Frame, app: &App, area: Rect) {
    let rows = Layout::default()
        .direction(Direction::Vertical)
        .constraints([Constraint::Min(0), Constraint::Length(3)])
        .split(area);

    // Chat history
    let inner_h = rows[0].height.saturating_sub(2) as usize;
    let chat_lines: Vec<Line> = app
        .chat_history
        .iter()
        .rev()
        .take(inner_h)
        .rev()
        .flat_map(|msg| {
            if msg.is_user {
                vec![Line::from(vec![
                    Span::styled("  You: ", theme::style_violet()),
                    Span::styled(msg.text.clone(), theme::style_default()),
                ])]
            } else {
                vec![Line::from(vec![
                    Span::styled("  Vincent: ", theme::style_cyan()),
                    Span::styled(msg.text.clone(), theme::style_default()),
                ])]
            }
        })
        .collect();

    let history_para = Paragraph::new(chat_lines).block(theme::block("Vincent AI"));
    f.render_widget(history_para, rows[0]);

    // Input box with blinking cursor
    let cursor = if app.tick % 20 < 10 { "▌" } else { " " };
    let input_text = format!("> {}{}", app.chat_input, cursor);
    let input_para = Paragraph::new(input_text)
        .style(theme::style_default())
        .block(theme::block("Message  [Enter] Send  [Esc] Clear"));
    f.render_widget(input_para, rows[1]);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Footer
// ─────────────────────────────────────────────────────────────────────────────
fn draw_footer(f: &mut Frame, app: &App, area: Rect) {
    let text = match &app.modal {
        ModalState::PositionAction { .. } => {
            "[C] Close  [B] Breakeven  [P] 50% Close  [M] Modify SL  [Esc] Cancel"
        }
        ModalState::ModifySL { .. } => {
            "Type new SL value and press [Enter] to confirm  |  [Esc] Back"
        }
        ModalState::PanicConfirm { .. } => {
            "⚠ Type CONFIRM and press [Enter] to close ALL positions  |  [Esc] Cancel"
        }
        ModalState::None => match app.active_tab {
            ActiveTab::Positions => {
                "[↑↓] Navigate  [Enter] Actions  [p] Panic  [Tab/←→] Switch Tab  [q] Quit"
            }
            ActiveTab::Orders => {
                "[↑↓] Navigate  [p] Panic  [Tab/←→] Switch Tab  [q] Quit"
            }
            ActiveTab::Chat => {
                "[Enter] Send Message  [Esc] Clear  [Tab] Switch Tab  [q] Quit (empty input)"
            }
            _ => {
                "[s] Start  [x] Stop  [f] Force Cycle  [p] Panic  [1-7] / [Tab] Tabs  [q] Quit"
            }
        },
    };

    let footer = Paragraph::new(text)
        .style(theme::style_muted())
        .alignment(Alignment::Center)
        .block(theme::block("Keys"));
    f.render_widget(footer, area);
}

// ─────────────────────────────────────────────────────────────────────────────
//  Modals (rendered as overlays last, so they appear on top)
// ─────────────────────────────────────────────────────────────────────────────
fn draw_modals(f: &mut Frame, app: &App, area: Rect) {
    match &app.modal {
        ModalState::None => {}

        ModalState::PositionAction { ticket, symbol } => {
            let popup = centered_rect(50, 50, area);
            f.render_widget(Clear, popup);
            let lines = vec![
                Line::from(""),
                Line::from(vec![
                    Span::styled("  Position: ", theme::style_muted()),
                    Span::styled(format!("#{ticket}  {symbol}"), theme::style_default()),
                ]),
                Line::from(""),
                Line::from(vec![Span::styled("  [C]  Close Position", theme::style_red())]),
                Line::from(vec![Span::styled("  [B]  Move to Breakeven", theme::style_yellow())]),
                Line::from(vec![Span::styled("  [P]  Partial Close (50%)", theme::style_orange())]),
                Line::from(vec![Span::styled("  [M]  Modify Stop Loss", theme::style_cyan())]),
                Line::from(""),
                Line::from(vec![Span::styled("  [Esc]  Cancel", theme::style_muted())]),
            ];
            let para = Paragraph::new(lines).block(theme::block("Position Actions"));
            f.render_widget(para, popup);
        }

        ModalState::ModifySL { ticket, symbol, input } => {
            let popup = centered_rect(40, 35, area);
            f.render_widget(Clear, popup);
            let cursor = if app.tick % 20 < 10 { "▌" } else { " " };
            let lines = vec![
                Line::from(""),
                Line::from(vec![
                    Span::styled("  Position: ", theme::style_muted()),
                    Span::styled(format!("#{ticket}  {symbol}"), theme::style_default()),
                ]),
                Line::from(""),
                Line::from(vec![Span::styled("  New Stop Loss:", theme::style_header())]),
                Line::from(vec![Span::styled(format!("  {}{}", input, cursor), theme::style_gold())]),
                Line::from(""),
                Line::from(vec![Span::styled("  [Enter] Confirm  [Esc] Back", theme::style_muted())]),
            ];
            let para = Paragraph::new(lines).block(theme::block("Modify Stop Loss"));
            f.render_widget(para, popup);
        }

        ModalState::PanicConfirm { input } => {
            let popup = centered_rect(55, 45, area);
            f.render_widget(Clear, popup);
            let cursor = if app.tick % 20 < 10 { "▌" } else { " " };
            let ready = input == "CONFIRM";
            let status_style = if ready { theme::style_green() } else { theme::style_red() };
            let lines = vec![
                Line::from(""),
                Line::from(Span::styled(
                    "  ALL OPEN POSITIONS WILL BE MARKET-CLOSED",
                    Style::default().fg(theme::RED).add_modifier(Modifier::BOLD),
                )),
                Line::from(Span::styled("  This action is irreversible.", theme::style_red())),
                Line::from(""),
                Line::from(vec![Span::styled("  Type CONFIRM to proceed:", theme::style_muted())]),
                Line::from(vec![Span::styled(format!("  {}{}", input, cursor), status_style)]),
                Line::from(""),
                Line::from(vec![Span::styled("  [Enter] Execute  [Esc] Cancel", theme::style_muted())]),
            ];
            let para = Paragraph::new(lines).block(theme::block_danger("PANIC CLOSE"));
            f.render_widget(para, popup);
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: centered popup rect
// ─────────────────────────────────────────────────────────────────────────────
fn centered_rect(percent_x: u16, percent_y: u16, r: Rect) -> Rect {
    let vert = Layout::default()
        .direction(Direction::Vertical)
        .constraints([
            Constraint::Percentage((100 - percent_y) / 2),
            Constraint::Percentage(percent_y),
            Constraint::Percentage((100 - percent_y) / 2),
        ])
        .split(r);

    Layout::default()
        .direction(Direction::Horizontal)
        .constraints([
            Constraint::Percentage((100 - percent_x) / 2),
            Constraint::Percentage(percent_x),
            Constraint::Percentage((100 - percent_x) / 2),
        ])
        .split(vert[1])[1]
}
