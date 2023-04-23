
// TODO: organize imports to interfaces (likely make a Card component (Model View Controller pattern))
import { Card } from "./App";
import { invoke } from '@tauri-apps/api/tauri'

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
export const getPorts = () => {
  return invoke<string[]>('get_ports');
}