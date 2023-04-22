#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
use std::time::{self, Duration};

use std::{io, num::ParseIntError, thread};
struct Card {
    name: String,
    password: String,
    rfid: String,
}

#[tauri::command]
async fn save_card(value: Card) -> String {
    // tokio::time::sleep(Duration::from_secs(1)).await;

    return "gay".to_string();
}

use tauri::{App, AppHandle, Manager};
fn main() {
    tauri::Builder::default()
        .setup(|app| setup(app))
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
// Return type says the error can basically fill any type
fn setup(app: &App) -> Result<(), Box<(dyn std::error::Error)>> {
    // Not entirely sure, but perhaps you could omit that error type
    let app_handle = app.handle();

    thread::spawn(move || {
        // serial::read_rfid(app_handle);
        test_loop(app_handle);
    });
    Ok(())
}

fn test_loop(app: AppHandle) {
    let millis_100 = time::Duration::from_millis(100);
    let mut counter = 0;
    loop {
        thread::sleep(millis_100);
        let payload = format!("Hey man {}", counter);
        app.emit_all("rfid", payload);
        counter += 1;
    }
}
