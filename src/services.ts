// TODO: organize imports to interfaces (likely make a Card component (Model View Controller pattern))
import { Card } from "./App";

export const reflashPartition = async (): Promise<Boolean> => {
  // TODO: await command send
  // Delete nvc partition command
  // Create new nvc partition
  // Flash nvc partition image
  // Error Checking
  return true;
}

export const backupCardsToDisk = async (cards: Card[]) => {
  // Save to localstorage

}