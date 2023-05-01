#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod serial;
use std::{
    error::Error,
    sync::{Arc, Mutex},
    time::{self, Duration},
};
use std::{io, num::ParseIntError, thread};
use tauri::{
    api::process::{Command, CommandEvent},
    Config, State, Runtime,
};

// Need to implement serde::deserialize trait on this to use in command
#[derive(serde::Deserialize, serde::Serialize, Debug)]
struct Card {
    name: String,
    password: String,
    rfid: String,
}

// You can have multiple states in tauri app, check https://github.com/tauri-apps/tauri/blob/dev/examples/state/main.rs
struct ReaderThreadState {
    // Mutex allows our struct to implement DerefMut
    reader_thread: Mutex<Option<thread::JoinHandle<()>>>,
}

#[derive(Default)]
struct MyState {
    s: std::sync::Mutex<String>,
    t: std::sync::Mutex<std::collections::HashMap<String, String>>,
}
// remember to call `.manage(MyState::default())`
#[tauri::command]
async fn command_name(state: tauri::State<'_, MyState>) -> Result<(), String> {
    *state.s.lock().unwrap() = "new string".into();
    state.t.lock().unwrap().insert("key".into(), "value".into());
    Ok(())
}

#[tauri::command]
async fn test<R: Runtime>(
    app: tauri::AppHandle<R>,
    window: tauri::Window<R>,
) -> Result<String, String> {
    // `new_sidecar()` expects just the filename, NOT the whole path like in JavaScript
    // 'bin/dist/parttool', [`-e`, `${espBin}`, `--port`, `COM4`, `--baud`, `115200`, `read_partition`, `--partition-name=nvs`,`--output`, binFileName
    let mut esp_bin = std::env::current_exe().unwrap().parent().unwrap().to_owned();
    esp_bin.push("esptool");
    let esp_bin = esp_bin.as_os_str().to_str().unwrap();
    let mut command_builder = Command::new_sidecar("parttool").unwrap().args([
        "-e",
        &esp_bin,
        "--port",
        "COM4",
        "--baud",
        "115200",
        "read_partition",
        "--partition-name=nvs",
        "--output",
        "./Hey_man.bin"
    ]);
    println!("Running command{:?}", command_builder);

    let (mut rx, mut child) = command_builder
        .spawn()
        .expect("Failed to spawn sidecar");

// THis is effectively the same thing as just doing it through js, theres no api yet for reading bytes from stdin
    tauri::async_runtime::spawn(async move {
        println!("Reading events from command");
        // read events such as stdout
        while let Some(event) = rx.recv().await {
            if let CommandEvent::Stdout(line) = event {
                // window
                //     .emit("message", Some(format!("'{}'", line)))
                //     .expect("failed to emit event");
                println!("{line}");

                // write to stdin
                // child.write("message from Rust\n".as_bytes()).unwrap();
            }
            else if let CommandEvent::Stderr(line) = event {
                println!("{line}");
            }
        }
    });
    // let printThing = format!("test: {:#?}", app.config());
    // println!("{printThing}");
    // Ok(printThing)
    Ok((String::new()))
}

fn save_cards_to_csv(cards: Vec<Card>, config: Arc<Config>) -> Result<String, Box<dyn Error>> {
    // TODO: Use anyhow to propogate errors in this in a way that doesnt need to make a new function or use a closure
    let mut path =
        tauri::api::path::app_data_dir(&config).unwrap_or(std::path::PathBuf::from("./temp"));
    std::fs::create_dir_all(&path)?;

    path.push("data.csv");
    println!("Saving csv at: {:?}", path);
    let mut wtr = csv::Writer::from_path(&path)?;
    wtr.write_record(&["key", "type", "encoding", "value"])?;
    wtr.write_record(&["kb", "namespace", "", ""])?;

    let mut uid_buffer = String::new();
    let mut uid_count = cards.len();

    for (i, card) in cards.iter().enumerate() {
        println!("card lol: {:?}", card);

        // let mut my_vector: Vec<&str> = Vec::new();

        // my_vector.push(&card.name);

        let key = format!("name{}", i.to_string());
        let card_name = &card.name;
        let record = [&key, "data", "string", card_name];
        wtr.write_record(record)?;

        let key = format!("pass{}", i.to_string());
        let card_pass = &card.password;
        let record = [&key, "data", "string", card_pass];
        wtr.write_record(record)?;

        // let hex_string_trimmed: String = hex_string
        //     .replace('\0', "")
        //     .trim()
        //     .chars()
        //     .filter(|c| !c.is_whitespace())
        //     .collect();

        // let maybe_hex = hex::decode(hex_string_trimmed);
        uid_buffer.push_str(&card.rfid);
    }
    wtr.write_record(&["uids", "data", "hex2bin", &uid_buffer])?;
    wtr.write_record(&["num_cards", "data", "u32", &uid_count.to_string()])?;

    match path.to_str() {
        Some(str) => Ok(str.into()),
        None => Err(
            "HEy man, path for path buf could not be computed, prolly not a valid utf-8 string"
                .into(),
        ),
    }
}

// We cant use this because dyn Error doesnt implement Serialize but string does :)
// async fn save_card(value: String) -> Result<(), Box<dyn Error>> {
#[tauri::command]
async fn save_cards_to_csv_command(
    app: AppHandle,
    cards: Vec<Card>,
    port: String,
) -> Result<String, String> {
    // let confRef = &app.config();

    // Because we are now using the value of path_to_csv, the config reference that has to be passed into save_cards becomes invalid because the return type may use it later
    let path_to_csv = save_cards_to_csv(cards, app.config());

    // Ok(("Hey".into()))
    match path_to_csv {
        Ok(path_to_csv) => Ok(path_to_csv.to_string()),
        Err(err) => {
            let errString = format!("Could not csv: {}", err.to_string());
            println!("{errString}");
            return Err(errString);
        }
    }
}

#[tauri::command]
async fn get_current_working_dir() -> Result<String, String> {
    match std::env::current_exe() {
        Ok(exe_path) => match exe_path.parent() {
            Some(parent_dir) => match parent_dir.to_str() {
                Some(parent_dir_str) => Ok(parent_dir_str.to_owned()),
                None => Err("Could not convert parent directory path to string".to_owned()),
            },
            None => Err("Could not get parent directory of current executable".to_owned()),
        },
        Err(e) => Err(format!("Could not get path of current executable: {}", e)),
    }
}

#[tauri::command]
async fn start_listen_server(
    window: tauri::Window,
    // Anonymous lifetime specified here because the state object needs to exist for the duration of the function and has reference to AppState
    state: State<'_, ReaderThreadState>,
    port: String,
) -> Result<(), String> {
    let mut maybe_old_thread = state.reader_thread.lock().unwrap();

    let mut sum_error: String = String::new();
    // kill the old thread
    // Take grabs the value from Option, leaving a none in its place, we need the value in order to actually run join
    if let Some(old_thread) = maybe_old_thread.take() {
        println!("Killing old thread");
        let join_res = old_thread.join();
        if let (Err(error)) = join_res {
            // sum_error.push_str("" );
            println!("Could not kill old server");
        }
    }

    let app = window.app_handle().clone();

    let thread_handle = thread::spawn(move || {
        serial::read_rfid(app, port);
    });

    *maybe_old_thread = Some(thread_handle);

    Ok(())
}

#[tauri::command]
fn get_ports() -> Vec<String> {
    let ports = serialport::available_ports().expect("No ports found!");
    ports.iter().map(|p| p.port_name.clone()).collect()
    // for p in ports {
    //     println!("{}", p.port_name);
    // }
}

use tauri::{App, AppHandle, Manager};
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            save_cards_to_csv_command,
            get_ports,
            start_listen_server,
            test,
            get_current_working_dir
        ])
        // .setup(|app| setup(app))
        .manage(ReaderThreadState {
            reader_thread: Mutex::new(None),
        })
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
        // app.emit_all("rfid", payload);
        counter += 1;
    }
}
