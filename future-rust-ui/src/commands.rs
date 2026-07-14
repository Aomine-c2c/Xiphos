#![allow(dead_code)]

use log::{error, info};
use redis::AsyncCommands;
use serde_json::json;

pub async fn send_command(action: &str, payload: serde_json::Value) {
    let client = match redis::Client::open("redis://127.0.0.1/") {
        Ok(c) => c,
        Err(e) => {
            error!("Failed to connect to Redis: {}", e);
            return;
        }
    };

    let mut con = match client.get_connection_manager().await {
        Ok(c) => c,
        Err(e) => {
            error!("Failed to get async Redis connection: {}", e);
            return;
        }
    };

    let message = json!({
        "command": action,
        "payload": payload
    });

    match con.publish::<_, _, ()>("xiphos_commands", message.to_string()).await {
        Ok(_) => info!("Sent command '{}' to Redis", action),
        Err(e) => error!("Failed to publish command: {}", e),
    }
}

pub async fn close_position(ticket: u64, symbol: String) {
    send_command(
        "close_position",
        json!({
            "ticket": ticket,
            "symbol": symbol
        }),
    )
    .await;
}

pub async fn close_all_positions() {
    send_command("close_all_positions", json!({})).await;
}
