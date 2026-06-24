mod app;
mod models;
mod network;
mod theme;
mod ui;

use app::{ActiveTab, App, ChatMessage, ModalState};
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyModifiers},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use models::WsCommand;
use network::{Network, NetworkEvent};
use ratatui::{backend::CrosstermBackend, Terminal};
use std::{error::Error, io, time::Duration};
use tokio::sync::mpsc;

#[tokio::main]
async fn main() -> Result<(), Box<dyn Error>> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let mut app = App::new();
    let (net_tx, mut net_rx) = mpsc::channel::<NetworkEvent>(200);
    let (cmd_tx, cmd_rx) = mpsc::channel::<WsCommand>(100);

    tokio::spawn(async move {
        Network::start_ws(net_tx, cmd_rx).await;
    });

    loop {
        terminal.draw(|f| ui::draw(f, &mut app))?;

        // ── Input handling ────────────────────────────────────────────────
        if event::poll(Duration::from_millis(50))? {
            if let Event::Key(key) = event::read()? {
                // Ctrl+C always exits
                if key.code == KeyCode::Char('c') && key.modifiers.contains(KeyModifiers::CONTROL) {
                    break;
                }

                // Clone modal to avoid borrow conflicts
                let modal = app.modal.clone();

                match modal {
                    // ── No modal open ──────────────────────────────────────
                    ModalState::None => {
                        if app.active_tab == ActiveTab::Chat {
                            // Chat input mode: all printable chars go to input
                            match key.code {
                                KeyCode::Enter => {
                                    let text = app.chat_input.trim().to_string();
                                    if !text.is_empty() {
                                        app.chat_history.push(ChatMessage { is_user: true, text: text.clone() });
                                        let _ = cmd_tx.try_send(WsCommand::ChatMessage { text });
                                        app.chat_input.clear();
                                    }
                                }
                                KeyCode::Esc => app.chat_input.clear(),
                                KeyCode::Backspace => { app.chat_input.pop(); }
                                KeyCode::Tab => app.next_tab(),
                                KeyCode::BackTab => app.previous_tab(),
                                KeyCode::Char('q') if app.chat_input.is_empty() => break,
                                KeyCode::Char(c) => app.chat_input.push(c),
                                _ => {}
                            }
                        } else {
                            // Normal navigation mode
                            match key.code {
                                KeyCode::Char('q') => break,
                                KeyCode::Char('1') => app.active_tab = ActiveTab::Dashboard,
                                KeyCode::Char('2') => app.active_tab = ActiveTab::Markets,
                                KeyCode::Char('3') => app.active_tab = ActiveTab::Positions,
                                KeyCode::Char('4') => app.active_tab = ActiveTab::Orders,
                                KeyCode::Char('5') => app.active_tab = ActiveTab::Gates,
                                KeyCode::Char('6') => app.active_tab = ActiveTab::Logs,
                                KeyCode::Char('7') => app.active_tab = ActiveTab::Chat,
                                KeyCode::Right | KeyCode::Tab => app.next_tab(),
                                KeyCode::Left  | KeyCode::BackTab => app.previous_tab(),
                                KeyCode::Up    => app.nav_up(),
                                KeyCode::Down  => app.nav_down(),
                                // Global commands
                                KeyCode::Char('s') => { let _ = cmd_tx.try_send(WsCommand::StartBot); }
                                KeyCode::Char('x') => { let _ = cmd_tx.try_send(WsCommand::StopBot); }
                                KeyCode::Char('f') => { let _ = cmd_tx.try_send(WsCommand::ForceCycle); }
                                // Panic close: open confirmation modal
                                KeyCode::Char('p') => {
                                    app.modal = ModalState::PanicConfirm { input: String::new() };
                                }
                                // Enter: open action modal on selected position
                                KeyCode::Enter => {
                                    if app.active_tab == ActiveTab::Positions {
                                        if let Some((ticket, symbol)) = app.selected_position() {
                                            app.modal = ModalState::PositionAction { ticket, symbol };
                                        }
                                    }
                                }
                                _ => {}
                            }
                        }
                    }

                    // ── Position action modal ──────────────────────────────
                    ModalState::PositionAction { ticket, symbol } => {
                        match key.code {
                            KeyCode::Esc => { app.modal = ModalState::None; }
                            KeyCode::Char('c') => {
                                let _ = cmd_tx.try_send(WsCommand::ClosePosition { ticket, symbol });
                                app.modal = ModalState::None;
                            }
                            KeyCode::Char('b') => {
                                let _ = cmd_tx.try_send(WsCommand::Breakeven { ticket, symbol });
                                app.modal = ModalState::None;
                            }
                            KeyCode::Char('p') => {
                                let _ = cmd_tx.try_send(WsCommand::PartialClose { ticket, symbol });
                                app.modal = ModalState::None;
                            }
                            KeyCode::Char('m') => {
                                app.modal = ModalState::ModifySL { ticket, symbol, input: String::new() };
                            }
                            _ => {}
                        }
                    }

                    // ── Modify SL input ────────────────────────────────────
                    ModalState::ModifySL { ticket, symbol, input } => {
                        match key.code {
                            KeyCode::Esc => {
                                app.modal = ModalState::PositionAction { ticket, symbol };
                            }
                            KeyCode::Enter => {
                                if let Ok(new_sl) = input.parse::<f64>() {
                                    let _ = cmd_tx.try_send(WsCommand::ModifySL { ticket, symbol, new_sl });
                                    app.modal = ModalState::None;
                                }
                            }
                            KeyCode::Backspace => {
                                let mut new_input = input.clone();
                                new_input.pop();
                                app.modal = ModalState::ModifySL { ticket, symbol, input: new_input };
                            }
                            KeyCode::Char(c) if c.is_ascii_digit() || c == '.' => {
                                let mut new_input = input.clone();
                                new_input.push(c);
                                app.modal = ModalState::ModifySL { ticket, symbol, input: new_input };
                            }
                            _ => {}
                        }
                    }

                    // ── Panic confirm input ────────────────────────────────
                    ModalState::PanicConfirm { input } => {
                        match key.code {
                            KeyCode::Esc => { app.modal = ModalState::None; }
                            KeyCode::Enter => {
                                if input == "CONFIRM" {
                                    let _ = cmd_tx.try_send(WsCommand::PanicClose);
                                    app.modal = ModalState::None;
                                }
                            }
                            KeyCode::Backspace => {
                                let mut new_input = input.clone();
                                new_input.pop();
                                app.modal = ModalState::PanicConfirm { input: new_input };
                            }
                            KeyCode::Char(c) if input.len() < 7 => {
                                let mut new_input = input.clone();
                                new_input.push(c);
                                app.modal = ModalState::PanicConfirm { input: new_input };
                            }
                            _ => {}
                        }
                    }
                }
            }
        }

        // ── Network event processing ──────────────────────────────────────
        while let Ok(net_event) = net_rx.try_recv() {
            match net_event {
                NetworkEvent::Connected    => app.connected = true,
                NetworkEvent::Disconnected => app.connected = false,
                NetworkEvent::Message(msg) => match msg {
                    models::WsMessage::StateUpdate(state) => {
                        app.state = state;
                        app.clamp_selection();
                        app.update_pl_history();
                    }
                    models::WsMessage::LogEvent(log) => {
                        app.logs.push(log);
                        if app.logs.len() > 200 { app.logs.remove(0); }
                    }
                    models::WsMessage::LogHistory(history) => {
                        app.logs = history;
                    }
                    models::WsMessage::ChatResponse(val) => {
                        // Try common response fields: "response", "bot_response", "message"
                        let text = val.get("response")
                            .or_else(|| val.get("bot_response"))
                            .or_else(|| val.get("message"))
                            .and_then(|v| v.as_str())
                            .unwrap_or("(no text in response)")
                            .to_string();
                        app.chat_history.push(ChatMessage { is_user: false, text });
                    }
                    _ => {}
                },
            }
        }

        app.on_tick();
    }

    // ── Restore terminal ──────────────────────────────────────────────────
    disable_raw_mode()?;
    execute!(terminal.backend_mut(), LeaveAlternateScreen, DisableMouseCapture)?;
    terminal.show_cursor()?;
    Ok(())
}
