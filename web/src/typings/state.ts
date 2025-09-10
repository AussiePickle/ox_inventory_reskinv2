import { Inventory } from './inventory';

export type State = {
  leftInventory: Inventory;
  rightInventory: Inventory;
  backpackInventory: Inventory;
  inventories: Record<string, Inventory>;
  activeInventories: string[];
  itemAmount: number;
  shiftPressed: boolean;
  isBusy: boolean;
  additionalMetadata: Array<{ metadata: string; value: string }>;
  history?: {
    leftInventory: Inventory;
    rightInventory: Inventory;
    backpackInventory: Inventory;
    inventories?: Record<string, Inventory>;
  };
};