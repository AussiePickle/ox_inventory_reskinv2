import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { itemDurability } from '../helpers';
import { inventorySlice } from '../store/inventory';
import { Items } from '../store/items';
import { InventoryType, Slot, State } from '../typings';

export type ItemsPayload = { item: Slot; inventory?: InventoryType; targetInventoryKey?: 'leftInventory' | 'rightInventory' | 'backpackInventory' };

interface Payload {
  items?: ItemsPayload | ItemsPayload[];
  itemCount?: Record<string, number>;
  weightData?: { inventoryId: string; maxWeight: number };
  slotsData?: { inventoryId: string; slots: number };
}

export const refreshSlotsReducer: CaseReducer<State, PayloadAction<Payload>> = (state, action) => {
  if (action.payload.items) {
    if (!Array.isArray(action.payload.items)) action.payload.items = [action.payload.items];
    const curTime = Math.floor(Date.now() / 1000);

    action.payload.items.forEach((data) => {
      if (!data) return;

      const targetInventory =
        data.targetInventoryKey
          ? state[data.targetInventoryKey]
          : data.inventory === InventoryType.PLAYER
          ? state.leftInventory
          : data.inventory === InventoryType.BACKPACK
          ? state.backpackInventory!
          : state.rightInventory;

      data.item.durability = itemDurability(data.item.metadata, curTime);
      targetInventory.items[data.item.slot - 1] = data.item;

      if (targetInventory.type === InventoryType.CRAFTING) {
        if (data.inventory !== InventoryType.BACKPACK) {
          state.rightInventory = { ...state.rightInventory };
        }
      }
    });
  }

  if (action.payload.itemCount) {
    Object.entries(action.payload.itemCount).forEach(([item, count]) => {
      if (Items[item]!) {
        Items[item]!.count += count;
      }
    });
  }

  if (action.payload.weightData) {
    const { inventoryId, maxWeight } = action.payload.weightData;

    const inv =
      inventoryId === state.leftInventory.id
        ? 'leftInventory'
        : inventoryId === state.rightInventory.id
        ? 'rightInventory'
        : inventoryId === state.backpackInventory?.id
        ? 'backpackInventory'
        : null;

    if (!inv) return;

    state[inv].maxWeight = maxWeight;
  }

  if (action.payload.slotsData) {
    const { inventoryId, slots } = action.payload.slotsData;

    const inv =
      inventoryId === state.leftInventory.id
        ? 'leftInventory'
        : inventoryId === state.rightInventory.id
        ? 'rightInventory'
        : inventoryId === state.backpackInventory?.id
        ? 'backpackInventory'
        : null;

    if (!inv) return;

    state[inv].slots = slots;

    inventorySlice.caseReducers.setupInventory(state, {
      type: 'setupInventory',
      payload: {
        leftInventory: inv === 'leftInventory' ? state[inv] : undefined,
        rightInventory: inv === 'rightInventory' ? state[inv] : undefined,
        backpackInventory: inv === 'backpackInventory' ? state[inv] : undefined,
      },
    });
  }
};
