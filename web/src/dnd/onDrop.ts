import { canStack, findAvailableSlot, getTargetInventory, isSlotWithItem } from '../helpers';
import { store } from '../store';
import { DragSource, InventoryType, Slot, SlotWithItem } from '../typings';
import { moveSlots, stackSlots, swapSlots } from '../store/inventory';
import { Items } from '../store/items';
import { validateMove } from '../thunks/validateItems';

interface DropData {
  inventory: InventoryType; // target inventory type
  item: { slot: number };
  targetInventoryKey?: 'leftInventory' | 'rightInventory' | 'backpackInventory';
}

export const onDrop = (
  source: DragSource,
  target?: DropData,
  count?: number
) => {
  const state = store.getState().inventory;

  if (!source.inventoryKey) return console.error('Source inventory key missing!');

  const { sourceInventory, targetInventory } = getTargetInventory(
    state, 
    source.inventoryKey,
    target?.targetInventoryKey
  );

  const sourceSlot = sourceInventory.items[source.item.slot - 1] as SlotWithItem;
  if (!sourceSlot) return console.error(`Source slot ${source.item.slot} undefined!`);

  const sourceData = Items[sourceSlot.name];
  if (!sourceData) return console.error(`${sourceSlot.name} item data undefined!`);

  // Target slot: either existing item or empty
  let targetSlot = target
    ? targetInventory.items[target.item.slot - 1]
    : findAvailableSlot(sourceSlot, sourceData, targetInventory.items);

  if (!targetSlot) return console.error('Target slot undefined!');

  const moveCount = count || sourceSlot.count;

  // Convert targetSlot to SlotWithItem for Redux actions
  let targetSlotWithItem: SlotWithItem;

  if (isSlotWithItem(targetSlot)) {
    // Target slot has an item
    targetSlotWithItem = targetSlot;
  } else {
    // Target slot is empty - create a proper SlotWithItem for the payload
    targetSlotWithItem = {
      slot: targetSlot.slot,
      name: '', // Empty slot
      count: 0,
      weight: 0,
      metadata: {},
    } as SlotWithItem;
  }

  // STEP 3: Add server validation before local updates
  const validationData = {
    fromSlot: sourceSlot.slot,
    fromInventoryKey: source.inventoryKey,
    toSlot: targetSlot.slot,
    toInventoryKey: target?.targetInventoryKey || source.inventoryKey,
    count: moveCount,
  };

  // Dispatch validation to server
  store.dispatch(validateMove(validationData)).then((result) => {
    // Only proceed with local updates if server validation succeeds
    if (validateMove.fulfilled.match(result)) {
      const payload = {
        fromSlot: sourceSlot,
        toSlot: targetSlotWithItem,
        fromType: sourceInventory.type,
        toType: targetInventory.type,
        count: moveCount,
        inventoryKey: source.inventoryKey,
        targetInventoryKey: target?.targetInventoryKey,
      };

      // Handle different drop scenarios
      if (isSlotWithItem(targetSlot) && sourceData.stack && canStack(sourceSlot, targetSlot)) {
        // Stack items together
        store.dispatch(stackSlots(payload));
      } else if (isSlotWithItem(targetSlot)) {
        // Swap items
        store.dispatch(swapSlots(payload));
      } else {
        // Move to empty slot
        store.dispatch(moveSlots(payload));
      }
    }
    // If validation fails, the extraReducers will handle the rollback automatically
  });
};