import { createSlice, current, isFulfilled, isPending, isRejected, PayloadAction } from '@reduxjs/toolkit';
import {
  moveSlotsReducer,
  refreshSlotsReducer,
  setupInventoryReducer,
  stackSlotsReducer,
  swapSlotsReducer,
} from '../reducers';
import { State, Inventory } from '../typings';
import { validateMove } from '../thunks/validateItems';

const initialInventory: Inventory = {
  id: '',
  type: '',
  slots: 0,
  maxWeight: 0,
  items: [],
};

const initialState: State = {
  leftInventory: { ...initialInventory, type: 'player', id: 'player1' },
  rightInventory: { ...initialInventory, type: 'shop', id: 'shop1' },
  backpackInventory: { ...initialInventory, type: 'backpack', id: 'backpack1', items: [], groups: {} },
  inventories: {}, // Add missing multi-inventory properties
  activeInventories: [], // Add missing multi-inventory properties
  additionalMetadata: [],
  itemAmount: 0,
  shiftPressed: false,
  isBusy: false,
};

export const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    stackSlots: stackSlotsReducer,
    swapSlots: swapSlotsReducer,
    setupInventory: setupInventoryReducer,
    moveSlots: moveSlotsReducer,
    refreshSlots: refreshSlotsReducer,
    
    // Add multi-inventory actions
    addInventory: (state, action: PayloadAction<{ inventoryId: string; inventory: Inventory }>) => {
      const { inventoryId, inventory } = action.payload;
      state.inventories[inventoryId] = {
        ...inventory,
        visible: true,
      };

      if (!state.activeInventories.includes(inventoryId)) {
        state.activeInventories.push(inventoryId);
      }
    },
    
    removeInventory: (state, action: PayloadAction<{ inventoryId: string }>) => {
      const { inventoryId } = action.payload;
      delete state.inventories[inventoryId];
      state.activeInventories = state.activeInventories.filter(id => id !== inventoryId);
    },
    
    setInventoryVisible: (state, action: PayloadAction<{ inventoryId: string; visible: boolean }>) => {
      const { inventoryId, visible } = action.payload;
      if (state.inventories[inventoryId]) {
        state.inventories[inventoryId].visible = visible;
        
        if (visible && !state.activeInventories.includes(inventoryId)) {
          state.activeInventories.push(inventoryId);
        } else if (!visible) {
          state.activeInventories = state.activeInventories.filter(id => id !== inventoryId);
        }
      }
    },
    
    setInventoryPosition: (state, action: PayloadAction<{ 
      inventoryId: string; 
      position: { x: number; y: number; width?: number; height?: number } 
    }>) => {
      const { inventoryId, position } = action.payload;
      if (state.inventories[inventoryId]) {
        state.inventories[inventoryId].position = position;
      }
    },
    
    setAdditionalMetadata: (state, action: PayloadAction<Array<{ metadata: string; value: string }>>) => {
      const metadata = [];
      for (let i = 0; i < action.payload.length; i++) {
        const entry = action.payload[i];
        if (!state.additionalMetadata.find((el) => el.value === entry.value)) metadata.push(entry);
      }
      state.additionalMetadata = [...state.additionalMetadata, ...metadata];
    },
    setItemAmount: (state, action: PayloadAction<number>) => {
      state.itemAmount = action.payload;
    },
    setShiftPressed: (state, action: PayloadAction<boolean>) => {
      state.shiftPressed = action.payload;
    },
    setContainerWeight: (state, action: PayloadAction<number>) => {
      const container = state.leftInventory.items.find((item) => item.metadata?.container === state.rightInventory.id);
      if (!container) return;
      container.weight = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Handle validateMove thunk
    builder.addCase(validateMove.pending, (state) => {
      state.isBusy = true;
      state.history = {
        leftInventory: current(state.leftInventory),
        rightInventory: current(state.rightInventory),
        backpackInventory: current(state.backpackInventory),
        inventories: Object.fromEntries(
          Object.entries(state.inventories).map(([id, inv]) => [id, current(inv)])
        ),
      };
    });
    
    builder.addCase(validateMove.fulfilled, (state) => {
      state.isBusy = false;
    });
    
    builder.addCase(validateMove.rejected, (state) => {
      state.isBusy = false;
      if (state.history) {
        if (state.history.leftInventory) state.leftInventory = state.history.leftInventory;
        if (state.history.rightInventory) state.rightInventory = state.history.rightInventory;
        if (state.history.backpackInventory) state.backpackInventory = state.history.backpackInventory;
        if (state.history.inventories) state.inventories = state.history.inventories;
      }
    });

    // Handle other async actions
    builder.addMatcher(isPending, (state) => {
      state.isBusy = true;
      state.history = {
        leftInventory: current(state.leftInventory),
        rightInventory: current(state.rightInventory),
        backpackInventory: current(state.backpackInventory),
        inventories: Object.fromEntries(
          Object.entries(state.inventories).map(([id, inv]) => [id, current(inv)])
        ),
      };
    });
    builder.addMatcher(isFulfilled, (state) => {
      state.isBusy = false;
    });
    builder.addMatcher(isRejected, (state) => {
      if (state.history) {
        if (state.history.leftInventory) state.leftInventory = state.history.leftInventory;
        if (state.history.rightInventory) state.rightInventory = state.history.rightInventory;
        if (state.history.backpackInventory) state.backpackInventory = state.history.backpackInventory;
        if (state.history.inventories) state.inventories = state.history.inventories;
      }
      state.isBusy = false;
    });
  },
});

export const {
  setAdditionalMetadata,
  setItemAmount,
  setShiftPressed,
  setupInventory,
  addInventory,
  removeInventory,
  setInventoryVisible,
  setInventoryPosition,
  swapSlots,
  moveSlots,
  stackSlots,
  refreshSlots,
  setContainerWeight,
} = inventorySlice.actions;

// Define RootState type
export type RootState = {
  inventory: State;
  tooltip: any;
  contextMenu: any;
};

// Selectors
export const selectLeftInventory = (state: RootState) => state.inventory.leftInventory;
export const selectRightInventory = (state: RootState) => state.inventory.rightInventory;
export const selectBackpackInventory = (state: RootState) => state.inventory.backpackInventory;
export const selectInventories = (state: RootState) => state.inventory.inventories;
export const selectActiveInventories = (state: RootState) => state.inventory.activeInventories;
export const selectItemAmount = (state: RootState) => state.inventory.itemAmount;
export const selectIsBusy = (state: RootState) => state.inventory.isBusy;

export default inventorySlice.reducer;