#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
use std::time::Duration;
use tokio::runtime::Runtime;
use std::{io, num::ParseIntError};
struct Card {
    name: String,
    password: String,
    rfid: String,
}

#[tauri::command]
async fn save_card(value: Card) -> String {
    tokio::time::sleep(Duration::from_secs(1)).await;

    return "gay".to_string();
}

fn main() {
    serial::read_rfid();

    tauri::Builder::default()
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

pub fn decode_hex(s: &str) -> Result<Vec<u8>, ParseIntError> {
    (0..s.len())
        .step_by(2)
        .map(|i| u8::from_str_radix(&s[i..i + 2], 16))
        .collect()
}
