import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  pagination: null,
  isLoading: false,
  error: null,
};

const foodItemSlice = createSlice({
  name: 'foodItems',
  initialState,
  reducers: {
    setFoodItems(state, action) {
      state.items = action.payload.items ?? [];
      state.pagination = action.payload.pagination ?? null;
      state.error = null;
    },
    setFoodItemsLoading(state, action) {
      state.isLoading = action.payload;
    },
    setFoodItemsError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearFoodItems(state) {
      state.items = [];
      state.pagination = null;
      state.error = null;
    },
  },
});

export const { setFoodItems, setFoodItemsLoading, setFoodItemsError, clearFoodItems } =
  foodItemSlice.actions;

export const selectFoodItems          = (s) => s.foodItems.items;
export const selectFoodItemsPagination = (s) => s.foodItems.pagination;
export const selectFoodItemsLoading   = (s) => s.foodItems.isLoading;
export const selectFoodItemsError     = (s) => s.foodItems.error;

export default foodItemSlice.reducer;
