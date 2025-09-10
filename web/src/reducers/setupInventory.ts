import { CaseReducer, PayloadAction } from '@reduxjs/toolkit';
import { getItemData, itemDurability } from '../helpers';
import { Items } from '../store/items';
import { Inventory, State } from '../typings';

export const setupInventoryReducer: CaseReducer<
  State,
  PayloadAction<{
    leftInventory?: Inventory;
    rightInventory?: Inventory;
    backpackInventory?: Inventory; // new
  }>
> = (state, action) => {
  const { leftInventory, rightInventory, backpackInventory } = action.payload;
  const curTime = Math.floor(Date.now() / 1000);

  const setupItems = (inventory: Inventory) =>
    Array.from(Array(inventory.slots), (_, index) => {
      const item =
        Object.values(inventory.items).find((i) => i?.slot === index + 1) || {
          slot: index + 1,
        };

      if (!item.name) return item;

      if (typeof Items[item.name] === 'undefined') {
        getItemData(item.name);
      }

      item.durability = itemDurability(item.metadata, curTime);
      return item;
    });

  if (leftInventory)
    state.leftInventory = { ...leftInventory, items: setupItems(leftInventory) };

  if (rightInventory)
    state.rightInventory = { ...rightInventory, items: setupItems(rightInventory) };

  if (backpackInventory)
    state.backpackInventory = { ...backpackInventory, items: setupItems(backpackInventory) }; // new

  state.shiftPressed = false;
  state.isBusy = false;
};
