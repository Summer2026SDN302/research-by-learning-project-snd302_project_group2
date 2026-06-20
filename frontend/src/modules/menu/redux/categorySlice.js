import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as categoryApi from "../api/categoryApi";
import { DEFAULT_PAGE_SIZE } from "../constants/categoryConstants";

export const fetchCategories = createAsyncThunk(
  "category/fetchCategories",
  async (params, { rejectWithValue }) => {
    try {
      return await categoryApi.getCategories(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchCategoryById = createAsyncThunk(
  "category/fetchCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      return await categoryApi.getCategoryById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (body, { rejectWithValue }) => {
    try {
      return await categoryApi.createCategory(body);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async ({ id, body }, { rejectWithValue }) => {
    try {
      return await categoryApi.updateCategory(id, body);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const toggleCategoryStatus = createAsyncThunk(
  "category/toggleCategoryStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      return await categoryApi.patchCategoryStatus(id, isActive);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (id, { rejectWithValue }) => {
    try {
      return await categoryApi.deleteCategory(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  items: [],
  pagination: { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0, totalPages: 0 },
  filters: { search: "", isActive: null },
  selectedCategory: null,
  listStatus: "idle",
  mutationStatus: "idle",
  error: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedCategory(state) {
      state.selectedCategory = null;
    },
    clearError(state) {
      state.error = null;
    },
    resetMutationStatus(state) {
      state.mutationStatus = "idle";
    },
    clearCategories(state) {
      state.items = [];
      state.listStatus = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.listStatus = "loading";
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload.items ?? [];
        state.pagination = action.payload.pagination ?? initialState.pagination;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.listStatus = "failed";
        state.error = action.payload;
      })

      .addCase(fetchCategoryById.pending, (state) => {
        state.mutationStatus = "loading";
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.mutationStatus = "idle";
        state.selectedCategory = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.mutationStatus = "idle";
        state.error = action.payload;
      })

      .addCase(createCategory.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload;
      })

      .addCase(updateCategory.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.mutationStatus = "succeeded";
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload;
      })

      .addCase(toggleCategoryStatus.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";
        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(toggleCategoryStatus.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload;
      })

      .addCase(deleteCategory.pending, (state) => {
        state.mutationStatus = "loading";
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.mutationStatus = "succeeded";

        const index = state.items.findIndex(
          (item) => item._id === action.payload._id,
        );

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.mutationStatus = "failed";
        state.error = action.payload;
      });
  },
});

export const {
  setFilters,
  clearSelectedCategory,
  clearError,
  resetMutationStatus,
  clearCategories,
} = categorySlice.actions;

export default categorySlice.reducer;
