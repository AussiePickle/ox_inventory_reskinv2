// onUse.ts
import { fetchNui } from '../utils/fetchNui';
import { SlotWithItem } from '../typings/slot';
import { InventoryType } from '../typings/inventory';

type UsePayload = SlotWithItem & {
  inventoryKey: 'leftInventory' | 'backpackInventory' | 'rightInventory';
  inventoryType: InventoryType;
};

export const onUse = (item: UsePayload) => {
  fetchNui('useItem', { slot: item.slot });
};
