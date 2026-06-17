import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  isLoading: false,
  error: null,
};

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    setCategories(state, action) {
      state.categories = action.payload ?? [];
      state.error = null;
    },
    setCategoriesLoading(state, action) {
      state.isLoading = action.payload;
    },
    setCategoriesError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearCategories(state) {
      state.categories = [];
      state.error = null;
    },
  },
});

export const {
  setCategories,
  setCategoriesLoading,
  setCategoriesError,
  clearCategories,
} = categorySlice.actions;

export const selectCategories = (s) => s.categories.categories;
export const selectCategoriesLoading = (s) => s.categories.isLoading;
export const selectCategoriesError = (s) => s.categories.error;

export default categorySlice.reducer;
