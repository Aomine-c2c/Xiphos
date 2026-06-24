use crate::models::{WsCommand, WsMessage};
use futures_util::{SinkExt, StreamExt};
use std::time::Duration;
use tokio::sync::mpsc;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::protocol::Message;

pub enum NetworkEvent {
    Message(WsMessage),
    Connected,
    Disconnected,
}

pub struct Network;

impl Network {
    pub async fn start_ws(
        tx: mpsc::Sender<NetworkEvent>,
        mut cmd_rx: mpsc::Receiver<WsCommand>,
    ) {
        'outer: loop {
            match connect_async("ws://127.0.0.1:8001/ws").await {
                Ok((ws_stream, _)) => {
                    let _ = tx.send(NetworkEvent::Connected).await;
                    let (mut write, mut read) = ws_stream.split();

                    loop {
                        tokio::select! {
                            // Incoming messages from the Python backend
                            msg = read.next() => {
                                match msg {
                                    Some(Ok(Message::Text(text))) => {
                                        if let Ok(parsed) = serde_json::from_str::<WsMessage>(&text) {
                                            let _ = tx.send(NetworkEvent::Message(parsed)).await;
                                        }
                                    }
                                    Some(Ok(Message::Close(_))) | None => break,
                                    _ => {}
                                }
                            }
                            // Outgoing commands from the UI
                            cmd = cmd_rx.recv() => {
                                match cmd {
                                    Some(command) => {
                                        let json = command.to_json();
                                        let _ = write.send(Message::Text(json.into())).await;
                                    }
                                    None => break 'outer, // cmd channel closed → exit
                                }
                            }
                        }
                    }
                    let _ = tx.send(NetworkEvent::Disconnected).await;
                }
                Err(_) => {
                    let _ = tx.send(NetworkEvent::Disconnected).await;
                }
            }
            tokio::time::sleep(Duration::from_secs(2)).await;
        }
    }
}
