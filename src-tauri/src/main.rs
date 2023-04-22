#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;

use std::{io, num::ParseIntError, thread};

use tauri::{App, Manager};
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
        serial::read_rfid(app_handle);
    });
    Ok(())
}
