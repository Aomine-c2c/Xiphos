/**
 * tauri-bridge.ts
 *
 * Thin wrapper around Tauri's `invoke` API so the frontend can communicate
 * with the Rust backend. All calls are guarded so the UI works normally
 * in browser dev mode (without Tauri loaded).
 */

const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI__" in window;

/**
 * Send a native Windows toast notification via the Tauri shell.
 */
export async function sendNotification(title: string, body: string): Promise<void> {
  if (!isTauri()) {
    console.info(`[Notification] ${title}: ${body}`);
    return;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("send_notification", { title, body });
}

/**
 * Get the current application version string.
 */
export async function getAppVersion(): Promise<string> {
  if (!isTauri()) return "dev";
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<string>("get_app_version");
}

/**
 * Restart all backend services (Redis, Bridge, API, Worker).
 */
export async function restartServices(): Promise<void> {
  if (!isTauri()) {
    console.warn("[Bridge] restartServices() — not in Tauri context");
    return;
  }
  const { invoke } = await import("@tauri-apps/api/core");
  await invoke("restart_services");
}

/**
 * Listen for backend events emitted by Tauri (e.g., update available).
 */
export async function onEvent(
  event: string,
  handler: (payload: unknown) => void
): Promise<() => void> {
  if (!isTauri()) return () => {};
  const { listen } = await import("@tauri-apps/api/event");
  const unlisten = await listen(event, (e) => handler(e.payload));
  return unlisten;
}
