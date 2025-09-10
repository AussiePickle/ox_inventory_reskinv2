import { Inventory } from './inventory';
import { Slot, SlotWithItem } from './slot';
import { InventoryType } from './inventory'; // make sure to import the enum

export type DragSource = {
  item: Pick<SlotWithItem, 'slot' | 'name'>;
  inventory: Inventory['type'];
  inventoryKey: 'leftInventory' | 'backpackInventory' | 'rightInventory';
  inventoryId: string; // ADD THIS - missing from your current version
  count?: number;
  targetInventoryKey?: 'leftInventory' | 'backpackInventory' | 'rightInventory';
  image?: string;
};

export type DropTarget = {
  item: Pick<Slot, 'slot'>;
  inventory: InventoryType;
  targetInventoryKey: 'leftInventory' | 'backpackInventory' | 'rightInventory'; // CHANGE: remove optional and use specific type instead of string
};