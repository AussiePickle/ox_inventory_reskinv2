import { store } from '../store';
import { DragSource, DropTarget } from '../typings/inventory';
import { isSlotWithItem } from '../helpers';
import { Items } from '../store/items';
import { craftItem } from '../thunks/craftItem';
import { Inventory } from '../typings';

export const onCraft = (source: DragSource, target: DropTarget) => {
  const { inventory: state } = store.getState();

  const sourceInventory = state.rightInventory;
  
  // Fix: Be specific about which inventory properties can be accessed
  let targetInventory: Inventory;
  
  if (target?.targetInventoryKey) {
    switch (target.targetInventoryKey) {
      case 'leftInventory':
        targetInventory = state.leftInventory;
        break;
      case 'rightInventory':
        targetInventory = state.rightInventory;
        break;
      case 'backpackInventory':
        // Handle backpack inventory if it exists in your state
        targetInventory = (state as any).backpackInventory || state.leftInventory;
        break;
      default:
        targetInventory = state.leftInventory;
    }
  } else {
    targetInventory = state.leftInventory;
  }

  const sourceSlot = sourceInventory.items[source.item.slot - 1];

  if (!isSlotWithItem(sourceSlot)) throw new Error(`Item ${sourceSlot.slot} name === undefined`);
  if (sourceSlot.count === 0) return;

  const sourceData = Items[sourceSlot.name];
  if (!sourceData) return console.error(`Item ${sourceSlot.name} data undefined!`);

  const targetSlot = targetInventory.items[target.item.slot - 1];
  if (!targetSlot) return console.error(`Target slot undefined`);

  const count = state.itemAmount === 0 ? 1 : state.itemAmount;

  const data = {
    fromSlot: sourceSlot,
    toSlot: targetSlot,
    fromType: sourceInventory.type,
    toType: targetInventory.type,
    count,
  };

  store.dispatch(
    craftItem({
      ...data,
      fromSlot: sourceSlot.slot,
      toSlot: targetSlot.slot,
    })
  );
};