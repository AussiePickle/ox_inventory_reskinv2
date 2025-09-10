import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNui } from '../utils/fetchNui';

export const craftItem = createAsyncThunk(
  'inventory/craftItem',
  async (
    data: { 
      fromSlot: number; 
      fromInventoryKey: string; 
      toSlot: number; 
      toInventoryKey: string; 
      count: number 
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchNui<boolean>('craftItem', data);

      if (response === false) {
        return rejectWithValue(response);
      }
    } catch (error) {
      return rejectWithValue(false);
    }
  }
);