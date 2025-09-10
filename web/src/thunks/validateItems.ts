import { createAsyncThunk } from '@reduxjs/toolkit';
import { setContainerWeight } from '../store/inventory';
import { fetchNui } from '../utils/fetchNui';

export const validateMove = createAsyncThunk(
  'inventory/validateMove',
  async (
    data: {
      fromSlot: number;
      fromInventoryKey: 'leftInventory' | 'rightInventory' | 'backpackInventory';
      toSlot: number;
      toInventoryKey: 'leftInventory' | 'rightInventory' | 'backpackInventory';
      count: number;
    },
    { rejectWithValue, dispatch }
  ) => {
    try {
      const response = await fetchNui<boolean | { success: boolean; containerWeight?: number }>('swapItems', data);

      if (response === false) return rejectWithValue(response);

      // Handle container weight update
      if (typeof response === 'object' && response.containerWeight !== undefined) {
        dispatch(setContainerWeight(response.containerWeight));
      }

      return response;
    } catch (error) {
      return rejectWithValue(false);
    }
  }
);