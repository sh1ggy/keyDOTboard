use core::time::Duration;
use std::io;

use tauri::{AppHandle, Manager};
// For now string is fine, otherwise use, Result<(), Box<dyn std::error::Error>> or anyhow OR use this:
// #[derive(Debug)]
// enum ThreadError {
//     FileError(io::Error),
//     PortError(io::Error),
// }
// fn thread_function() -> Result<(), ThreadError> {

pub fn read_rfid(app: AppHandle, port_path: String) -> Result<(), String> {
    // pub fn read_rfid() {
    // let app = process::app_handle().expect("failed to get app handle");
    // const PORT_PATH: &str = "COM4";
    const BAUD_RATE: u32 = 115_200;
    let port = serialport::new(&port_path, BAUD_RATE)
        .timeout(Duration::from_millis(10))
        .open();
    // On drop of port, it automatically cleans up for you
    // .unwrap();

    match port {
        Ok(mut port) => {
            println!("Receiving data on {} at {} baud:", &port_path, &BAUD_RATE);

            let mut serial_buf: Vec<u8> = vec![0; 1000];
            loop {
                if port.bytes_to_read().unwrap() > 0 {
                    match port.read(serial_buf.as_mut_slice()) {
                        Ok(t) => {
                            // let converted = String::from_utf8(serial_buf.clone())
                            //     .unwrap_or("Could not convert the bytes to utf8".to_string());
                            // println!("{}", converted);
                        }
                        Err(ref e) if e.kind() == io::ErrorKind::TimedOut => {
                            (eprintln!("No more content error, dont know how i got here"))
                        }
                        Err(e) => eprintln!("Read Error: {:?}", e),
                    }
                }

                // This method reads single byte by byte from serial, not ideal or necessary and hard to integrate with kill signal
                // let mut serial_buf: Vec<u8> = vec![0; 100];
                // loop {
                //     // This is an array of size 1
                //     let mut byte = [0; 1];
                //     if port.bytes_to_read().unwrap() > 0 {
                //         let port_val = port.read(&mut byte);
                //         match port_val {
                //             Ok(_) => {
                //                 if byte[0] == b'\n' {
                //                     break;
                //                 }
                //                 if byte[0] != 0 {
                //                     serial_buf.push(byte[0]);
                //                 }
                //             }
                //             Err(err) => {
                //                 println!("Failed to read from port{}", err);
                //                 return Err(err.to_string());
                //             },
                //         }
                //     }
                // }

                let maybe_hex_string = String::from_utf8(serial_buf.clone());
                if let Ok(hex_string) = maybe_hex_string {
                    let hex_string_trimmed: String = hex_string
                        .replace('\0', "")
                        .trim()
                        .chars()
                        .filter(|c| !c.is_whitespace())
                        .collect();
                    let maybe_hex = hex::decode(&hex_string_trimmed);
                    match maybe_hex {
                        Ok(hex_value) => {
                            let back_toString = hex::encode(&hex_value);
                            app.emit_all("rfid", &back_toString);
                            println!("WORKING!!!: {}", &back_toString)
                        }
                        Err(err) => println!("Unreadable Hex {}: {}", &hex_string_trimmed, err),
                    }
                }
                else {
                    eprintln!("Could not convert the bytes to utf8");
                }
            }
        }
        Err(e) => {
            // Emit error to client
            eprintln!("Failed to open \"{}\". Error: {}", port_path, e);
            // Doing this is the same as using the ? error chaining operator on the port value, were just handling the matches ourselves
            Err(e.to_string())
            // ::std::process::exit(1);
        }
    }
}
