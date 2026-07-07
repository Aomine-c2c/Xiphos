// Tauri entry point — keeps the binary surface minimal.
// All logic lives in lib.rs.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    xiphos_lib::run();
}
