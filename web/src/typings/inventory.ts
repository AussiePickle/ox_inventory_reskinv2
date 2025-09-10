import { Slot, SlotWithItem } from './slot';

export enum InventoryType {
  PLAYER = 'player',
  SHOP = 'shop',
  CONTAINER = 'container',
  CRAFTING = 'crafting',
}

export interface Inventory {
  id: string;
  type: string;
  slots: number;
  items: Slot[];
  maxWeight?: number;
  label?: string;
  groups?: Record<string, number>;
  position?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  visible?: boolean;
  zIndex?: number;
}

export interface DragSource {
  item: SlotWithItem;
  inventory: InventoryType;
  inventoryKey: 'leftInventory' | 'rightInventory' | 'backpackInventory';
  image?: string;
}

export interface DropTarget {
  item: Slot;
  inventory: InventoryType;
  targetInventoryKey?: 'leftInventory' | 'rightInventory' | 'backpackInventory';
}