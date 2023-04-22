#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
use std::time::{Duration, self};
use tokio::runtime::Runtime;
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


use tauri::{App, Manager, AppHandle};
fn main() {
    tauri::Builder::default()
        .setup(|app| {
          setup(app)
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
fn setup(app: &App) -> Result<(), Box<(dyn std::error::Error )>>{
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
    thread::sleep(millis_100);
}