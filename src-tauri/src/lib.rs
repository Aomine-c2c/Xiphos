use std::sync::{Arc, Mutex};
use tauri::{
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Emitter, Manager, Runtime,
};

mod process_manager;
mod notifications;

pub use process_manager::ProcessRegistry;

/// Tauri commands exposed to the frontend via `invoke()`
#[tauri::command]
fn send_notification(title: String, body: String, app: AppHandle) {
    notifications::send(&app, &title, &body);
}

#[tauri::command]
fn get_app_version(app: AppHandle) -> String {
    app.package_info().version.to_string()
}

#[tauri::command]
async fn send_command(cmd_type: String, data: serde_json::Value) -> Result<(), String> {
    let client = reqwest::Client::new();
    let payload = serde_json::json!({
        "type": cmd_type,
        "data": data
    });
    client.post("http://127.0.0.1:8001/api/command")
        .json(&payload)
        .send()
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn restart_services(registry: tauri::State<Arc<Mutex<ProcessRegistry>>>, app: AppHandle) {
    let mut reg = registry.lock().unwrap();
    reg.stop_all();
    std::thread::sleep(std::time::Duration::from_millis(1500));
    if let Err(e) = reg.launch_all(&app) {
        eprintln!("Failed to restart services: {e}");
    }
    notifications::send(&app, "Xiphos", "All services restarted.");
}

/// Main library entrypoint called from main.rs
pub fn run() {
    let registry = Arc::new(Mutex::new(ProcessRegistry::new()));
    let registry_clone = registry.clone();

    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .manage(registry)
        .setup(move |app| {
            let app_handle = app.handle().clone();

            // ── System Tray ──────────────────────────────────────────────
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .tooltip("Xiphos Trading System")
                .on_tray_icon_event(|tray, event| {
                    let app = tray.app_handle();
                    match event {
                        TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } => {
                            toggle_window(app);
                        }
                        TrayIconEvent::DoubleClick { .. } => {
                            show_window(app);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            setup_tray_menu(app, &tray)?;

            // ── Launch backend processes ─────────────────────────────────
            let mut reg = registry_clone.lock().unwrap();
            if let Err(e) = reg.launch_all(&app_handle) {
                eprintln!("[Xiphos] Failed to launch services: {e}");
            }
            drop(reg);

            // ── Check for updates in background ──────────────────────────
            let update_handle = app_handle.clone();
            std::thread::spawn(move || {
                std::thread::sleep(std::time::Duration::from_secs(5));
                let _ = update_handle.emit("check-for-updates", ());
            });

            // ── Background SSE Streamer ───────────────────────────────
            let sse_app_handle = app_handle.clone();
            tauri::async_runtime::spawn(async move {
                use reqwest_eventsource::{Event, EventSource};
                use futures_util::StreamExt;
                let mut client = EventSource::get("http://127.0.0.1:8001/api/stream");
                
                while let Some(event) = client.next().await {
                    match event {
                        Ok(Event::Open) => println!("[Xiphos] SSE Connection Open"),
                        Ok(Event::Message(message)) => {
                            if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&message.data) {
                                if let Some(event_type) = parsed.get("type").and_then(|t| t.as_str()) {
                                    if let Some(event_data) = parsed.get("data") {
                                        let _ = sse_app_handle.emit(event_type, event_data.clone());
                                    }
                                }
                            }
                        }
                        Err(err) => {
                            eprintln!("[Xiphos] SSE Error: {}", err);
                            client.close();
                            tokio::time::sleep(std::time::Duration::from_secs(2)).await;
                            client = EventSource::get("http://127.0.0.1:8001/api/stream");
                        }
                    }
                }
            });

            Ok(())
        })
        .on_window_event(|window, event| {
            // Close button → hide to tray instead of quitting
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            send_notification,
            get_app_version,
            restart_services,
            send_command,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Xiphos");
}

// ── Tray menu ────────────────────────────────────────────────────────────────

fn setup_tray_menu(app: &tauri::App, tray: &tauri::tray::TrayIcon) -> tauri::Result<()> {
    use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};

    let show = MenuItem::with_id(app, "show", "Show Dashboard", true, None::<&str>)?;
    let hide = MenuItem::with_id(app, "hide", "Hide to Tray", true, None::<&str>)?;
    let restart = MenuItem::with_id(app, "restart", "Restart Services", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit Xiphos", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show, &hide, &restart, &sep, &quit])?;
    tray.set_menu(Some(menu))?;

    let app_handle = app.handle().clone();
    tray.on_menu_event(move |_tray, event| {
        let app = &app_handle;
        match event.id.as_ref() {
            "show" => show_window(app),
            "hide" => hide_window(app),
            "restart" => {
                let reg = app.state::<Arc<Mutex<ProcessRegistry>>>();
                let mut r = reg.lock().unwrap();
                r.stop_all();
                std::thread::sleep(std::time::Duration::from_millis(1500));
                let _ = r.launch_all(app);
                notifications::send(app, "Xiphos", "All services restarted.");
            }
            "quit" => {
                let reg = app.state::<Arc<Mutex<ProcessRegistry>>>();
                let mut r = reg.lock().unwrap();
                r.stop_all();
                drop(r);
                app.exit(0);
            }
            _ => {}
        }
    });

    Ok(())
}

fn show_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.show();
        let _ = window.set_focus();
        let _ = window.unminimize();
    }
}

fn hide_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.hide();
    }
}

fn toggle_window(app: &AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        if window.is_visible().unwrap_or(false) {
            let _ = window.hide();
        } else {
            let _ = window.show();
            let _ = window.set_focus();
        }
    }
}
