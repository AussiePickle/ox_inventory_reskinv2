import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { getTargetInventory, itemDurability } from '../helpers';
import { Inventory, Slot, SlotWithItem, State } from '../typings';
import { InventoryType, SlotWithItem, Inventory, State } from '../typings';


export const moveSlotsReducer: CaseReducer<
  State,
  PayloadAction<{
    fromSlot: SlotWithItem;
    fromType: Inventory['type'];
    toSlot: Slot;
    toType: Inventory['type'];
    inventoryKey: 'leftInventory' | 'rightInventory' | 'backpackInventory'; // <--- add this
    targetInventoryKey?: 'leftInventory' | 'rightInventory' | 'backpackInventory';
    count: number;
  }>
> = (state, action) => {
  const { fromSlot, fromType, toSlot, toType, targetInventoryKey, count } = action.payload;

  const { sourceInventory, targetInventory } = getTargetInventory(
    state,
    action.payload.inventoryKey,       // source key
    action.payload.targetInventoryKey  // optional target key
  );
  

  const pieceWeight = fromSlot.weight / fromSlot.count;
  const curTime = Math.floor(Date.now() / 1000);
  const fromItem = sourceInventory.items[fromSlot.slot - 1];

  targetInventory.items[toSlot.slot - 1] = {
    ...fromItem,
    count: count,
    weight: pieceWeight * count,
    slot: toSlot.slot,
    durability: itemDurability(fromItem.metadata, curTime),
  };

  if (fromType === InventoryType.SHOP || fromType === InventoryType.CRAFTING) return;

  sourceInventory.items[fromSlot.slot - 1] =
    fromSlot.count - count > 0
      ? {
          ...sourceInventory.items[fromSlot.slot - 1],
          count: fromSlot.count - count,
          weight: pieceWeight * (fromSlot.count - count),
        }
      : { slot: fromSlot.slot };
};
