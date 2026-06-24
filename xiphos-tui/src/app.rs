use crate::models::{LogEvent, SystemState};
use ratatui::widgets::TableState;
use std::collections::VecDeque;

#[derive(PartialEq, Clone)]
pub enum ActiveTab {
    Dashboard,
    Markets,
    Positions,
    Orders,
    Gates,
    Logs,
    Chat,
}

#[derive(Clone)]
pub enum ModalState {
    None,
    PositionAction { ticket: u64, symbol: String },
    ModifySL { ticket: u64, symbol: String, input: String },
    PanicConfirm { input: String },
}

#[derive(Clone)]
pub struct ChatMessage {
    pub is_user: bool,
    pub text: String,
}

pub struct App {
    pub state: SystemState,
    pub logs: Vec<LogEvent>,
    pub active_tab: ActiveTab,
    pub connected: bool,
    pub tick: u64,
    pub positions_table_state: TableState,
    pub orders_table_state: TableState,
    pub modal: ModalState,
    pub chat_history: Vec<ChatMessage>,
    pub chat_input: String,
    pub pl_history: VecDeque<f64>,
}

impl App {
    pub fn new() -> Self {
        let mut positions_table_state = TableState::default();
        positions_table_state.select(Some(0));
        let mut orders_table_state = TableState::default();
        orders_table_state.select(Some(0));

        Self {
            state: SystemState::default(),
            logs: Vec::new(),
            active_tab: ActiveTab::Dashboard,
            connected: false,
            tick: 0,
            positions_table_state,
            orders_table_state,
            modal: ModalState::None,
            chat_history: Vec::new(),
            chat_input: String::new(),
            pl_history: VecDeque::with_capacity(60),
        }
    }

    pub fn on_tick(&mut self) {
        self.tick = self.tick.wrapping_add(1);
    }

    pub fn update_pl_history(&mut self) {
        if self.pl_history.len() >= 60 {
            self.pl_history.pop_front();
        }
        self.pl_history.push_back(self.state.account.profit);
    }

    pub fn clamp_selection(&mut self) {
        let pos_len = self.state.positions.len();
        if pos_len == 0 {
            self.positions_table_state.select(None);
        } else {
            let sel = self.positions_table_state.selected().unwrap_or(0).min(pos_len - 1);
            self.positions_table_state.select(Some(sel));
        }
        let ord_len = self.state.orders.len();
        if ord_len == 0 {
            self.orders_table_state.select(None);
        } else {
            let sel = self.orders_table_state.selected().unwrap_or(0).min(ord_len - 1);
            self.orders_table_state.select(Some(sel));
        }
    }

    pub fn nav_down(&mut self) {
        match self.active_tab {
            ActiveTab::Positions => {
                let max = self.state.positions.len().saturating_sub(1);
                let i = self.positions_table_state.selected().unwrap_or(0);
                self.positions_table_state.select(Some((i + 1).min(max)));
            }
            ActiveTab::Orders => {
                let max = self.state.orders.len().saturating_sub(1);
                let i = self.orders_table_state.selected().unwrap_or(0);
                self.orders_table_state.select(Some((i + 1).min(max)));
            }
            _ => {}
        }
    }

    pub fn nav_up(&mut self) {
        match self.active_tab {
            ActiveTab::Positions => {
                let i = self.positions_table_state.selected().unwrap_or(0);
                self.positions_table_state.select(Some(i.saturating_sub(1)));
            }
            ActiveTab::Orders => {
                let i = self.orders_table_state.selected().unwrap_or(0);
                self.orders_table_state.select(Some(i.saturating_sub(1)));
            }
            _ => {}
        }
    }

    pub fn selected_position(&self) -> Option<(u64, String)> {
        let idx = self.positions_table_state.selected()?;
        let pos = self.state.positions.get(idx)?;
        Some((pos.ticket, pos.symbol.clone()))
    }

    pub fn next_tab(&mut self) {
        self.active_tab = match self.active_tab {
            ActiveTab::Dashboard  => ActiveTab::Markets,
            ActiveTab::Markets    => ActiveTab::Positions,
            ActiveTab::Positions  => ActiveTab::Orders,
            ActiveTab::Orders     => ActiveTab::Gates,
            ActiveTab::Gates      => ActiveTab::Logs,
            ActiveTab::Logs       => ActiveTab::Chat,
            ActiveTab::Chat       => ActiveTab::Dashboard,
        };
    }

    pub fn previous_tab(&mut self) {
        self.active_tab = match self.active_tab {
            ActiveTab::Dashboard  => ActiveTab::Chat,
            ActiveTab::Markets    => ActiveTab::Dashboard,
            ActiveTab::Positions  => ActiveTab::Markets,
            ActiveTab::Orders     => ActiveTab::Positions,
            ActiveTab::Gates      => ActiveTab::Orders,
            ActiveTab::Logs       => ActiveTab::Gates,
            ActiveTab::Chat       => ActiveTab::Logs,
        };
    }
}
