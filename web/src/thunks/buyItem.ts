import { createAsyncThunk } from '@reduxjs/toolkit';
import { fetchNui } from '../utils/fetchNui';

export const buyItem = createAsyncThunk(
  'inventory/buyItem',
  async (
    data: {
      fromSlot: number;
      fromInventoryKey: string;
      toSlot: number;
      toInventoryKey: string;
      count: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetchNui<boolean>('buyItem', data);

      if (response === false) {
        return rejectWithValue(response);
      }
    } catch (error) {
      return rejectWithValue(false);
    }
  }
);