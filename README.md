![kongi](./public/wlogo.svg)


![kongi](https://img.shields.io/badge/kongi-purple?style=plastic) ![Year](https://img.shields.io/badge/Year-2023-red?style=plastic) ![Language](https://img.shields.io/badge/TypeScript-grey?style=plastic&logo=typescript)  ![Framework](https://img.shields.io/badge/NextJS-grey?style=plastic&logo=next.js) ![Framework](https://img.shields.io/badge/Tauri-grey?style=plastic&logo=tauri)

--- 

This is the entire codebase of a hardware-focused project made as a part of the [2023 Arduino Hackathon](https://www.facebook.com/events/165398366306829/) hosted by UQ Mars, RoboGals & QUT Robotics Club. The theme of the hackathon was **automation**, with our project following that by attempting to automate logins with RFID technology.

The main purpose of this application is to act as a password and RFID card manager, with a front-end application where you're able to manage your RFID cards and a back-end that talks with an ESP32 via Rust to load binaries based on what you are doing on the front-end. The project was not presented at the event but we did end up completing it afterwards.

This project was limited by scarce parts and limited ESP32 documentation, findings will be listed below. 

## Stack
- [NextJS](https://nextjs.org/), our chosen ReactJS front-end framework. 
- [Tauri](https://tauri.app), a framework that allowed us to create a web-based application with our chosen front-end. Tauri combines the front-end and back-end to communicate with the ESP32 hardware back-end.
- ESP32 / Arduino hardware stack
- RFID scanner component (currently limited to MiFare)

## User Guide
1. Install and open keyDOTboard
2. Choose the COM port that corresponds with the port that the ESP32 is connected to. 
3. Create cards
	1. Scan an RFID card before creating a card with this dashboard
	2. Fill out the name for reference
	3. Fill out the password that you want to be using to login
4. Press sync when you are done
5. Press activate to allow the program to be able to login with RFID scans 
6. Scan your corresponding RFID card to log in with the password that you assigned it

### Process for Building ESP32 Binaries 
- Run `git pull --recurse-submodules` to pull the esp-idf repo 
- (Optional) Run `pyi-makespec .esp-idf/components/partition_table/parttool.py` and replace the name of the python file
    - Create a merged file that merges all the commands into collect like seen in `merged.spec`, see `https://www.zacoding.com/en/post/pyinstaller-create-multiple-executables/` or https://pyinstaller.org/en/stable/spec-files.html#multipackage-bundles
- Run `pyinstaller --distpath ./dist merged.spec`
- Drag in the esptool binary from `https://github.com/espressif/esptool` for your platform into the dist folder
- rename folder to match os tag
- The execs need to be in the same folder other wise you end up with error: `[55752] Archive not found: D:\keyDOTboard\src-tauri\bin\merged_dist\parttool-x86_64-pc-windows-msv`

## References
- [**Inspiration**](https://github.com/Jaycar-Electronics/RFID-Computer-Login)
- Icons from [**SVG REPO**](https://www.svgrepo.com/)