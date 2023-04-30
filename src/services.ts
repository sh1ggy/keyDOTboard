
// TODO: organize imports to interfaces (likely make a Card component (Model View Controller pattern))
import { path, tauri, os } from "@tauri-apps/api";
import { Card } from "./App";
import { invoke } from '@tauri-apps/api/tauri'
import { OsType } from "@tauri-apps/api/os";

export const reflashPartition = async (): Promise<Boolean> => {
  // TODO: await command send
  try {
    const thing = await invoke('run_thing');
  } catch (error) {
    // Will catch result errors

  }
  // Delete nvc partition command
  // Create new nvc partition
  // Flash nvc partition image
  // Error Checking
  return true;
}

export const backupCardsToDisk = async (cards: Card[]) => {
  // Save to localstorage

}
export const getPorts = async () => {
  return await invoke<string[]>('get_ports');
}

export const getTargetPlatformExtension = async () => {
  let arch = await os.arch();
  let type = await os.type();
  switch (type) {
    case "Darwin":
      return `-${arch}-apple-darwin`
    case "Linux":
      return `-${arch}-unknown-linux-gnu`
    case "Windows_NT":
      return `-${arch}-pc-windows-msvc`
    default:
      throw new Error("Unsupported platform");
  }
}