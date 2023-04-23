use core::time::Duration;

use tauri::{api::process, AppHandle, Manager};
pub fn read_rfid(app: AppHandle, port_path: String) {
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
            // let mut serial_buf: Vec<u8> = vec![0; 1000];
            // println!("Receiving data on {} at {} baud:", &PORT_PATH, &BAUD_RATE);
            // loop {
            //     let bytes_to_read = port.bytes_to_read().unwrap();
            //     println!("Bytes to read: {}", bytes_to_read);
            //     match port.read(serial_buf.as_mut_slice()) {
            //         Ok(t) => {
            //             let converted = String::from_utf8(serial_buf.clone())
            //                 .unwrap_or("Could not convert the bytes to utf8".to_string());
            //             println!("{}", converted);
            //         }
            //         Err(ref e) if e.kind() == io::ErrorKind::TimedOut => {
            //             (println!("No more content"))
            //         }
            //         Err(e) => eprintln!("Read Error: {:?}", e),
            //     }
            //     println!("------ PAUSE -----");
            // }

            loop {
                let mut serial_buf: Vec<u8> = vec![0; 100];
                loop {
                    // This is an array of size 1
                    let mut byte = [0; 1];
                    if port.bytes_to_read().unwrap() > 0 {
                        let port_val = port.read(&mut byte);
                        match port_val {
                            Ok(_) => {
                                if byte[0] == b'\n' {
                                    break;
                                }
                                if byte[0] != 0 {
                                    serial_buf.push(byte[0]);
                                }
                            }
                            Err(err) => println!("Failed to read from port{}", err),
                        }
                    }
                }
                // This proves the string we get is not immediately equal to the hex equivilant
                // println!("Testing !!!: {}", hex::encode(&serial_buf));

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
                            println!("WORKING!!!: {}",&back_toString )
                        }
                        Err(err) => println!("Unreadable Hex {}: {}", &hex_string_trimmed, err),
                    }
                }
            }
        }
        Err(e) => {
            // Emit error to client
            eprintln!("Failed to open \"{}\". Error: {}", port_path, e);
            // ::std::process::exit(1);
        }
    }
}
