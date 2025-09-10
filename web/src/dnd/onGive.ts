import { store } from '../store';
import { fetchNui } from '../utils/fetchNui';
import { SlotWithItem } from '../typings/slot';
import { InventoryType } from '../typings/inventory';

type GivePayload = SlotWithItem & {
  inventoryKey: 'leftInventory' | 'backpackInventory' | 'rightInventory';
  inventoryType: InventoryType;
};

export const onGive = (item: GivePayload) => {
  const { itemAmount } = store.getState().inventory;
  fetchNui('giveItem', { slot: item.slot, count: itemAmount });
};