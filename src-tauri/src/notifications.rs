use tauri::AppHandle;
use tauri_plugin_notification::NotificationExt;

/// Send a native Windows toast notification.
pub fn send(app: &AppHandle, title: &str, body: &str) {
    let _ = app
        .notification()
        .builder()
        .title(title)
        .body(body)
        .show();
}
