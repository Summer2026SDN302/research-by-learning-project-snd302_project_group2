import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import * as foodItemApi from '../api/foodItemApi';
import { DEFAULT_FOOD_ITEM_PAGE_SIZE } from '../constants/foodItemConstants';

export const fetchFoodItems = createAsyncThunk(
  'foodItem/fetchFoodItems',
  async (params, { rejectWithValue }) => {
    try {
      return await foodItemApi.getFoodItems(params);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const fetchFoodItemById = createAsyncThunk(
  'foodItem/fetchFoodItemById',
  async (id, { rejectWithValue }) => {
    try {
      return await foodItemApi.getFoodItemById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const createFoodItem = createAsyncThunk(
  'foodItem/createFoodItem',
  async (body, { rejectWithValue }) => {
    try {
      return await foodItemApi.createFoodItem(body);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const updateFoodItem = createAsyncThunk(
  'foodItem/updateFoodItem',
  async ({ id, body }, { rejectWithValue }) => {
    try {
      return await foodItemApi.updateFoodItem(id, body);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const toggleFoodItemArchive = createAsyncThunk(
  'foodItem/toggleFoodItemArchive',
  async ({ id, isArchived }, { rejectWithValue }) => {
    try {
      return await foodItemApi.updateFoodItemArchive(id, isArchived);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

export const deleteFoodItem = createAsyncThunk(
  'foodItem/deleteFoodItem',
  async (id, { rejectWithValue }) => {
    try {
      return await foodItemApi.deleteFoodItem(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  },
);

const initialState = {
  items: [],
  pagination: { page: 1, limit: DEFAULT_FOOD_ITEM_PAGE_SIZE, total: 0, totalPages: 0 },
  filters: { search: '', categoryId: '', isArchived: '' },
  selectedItem: null,
  listStatus: 'idle',
  listError: null,
  mutationStatus: 'idle',
  mutationError: null,
};

const foodItemSlice = createSlice({
  name: 'foodItem',
  initialState,
  reducers: {
    setSearch(state, action) {
      state.filters.search = action.payload ?? '';
      state.pagination.page = 1;
    },
    setCategoryFilter(state, action) {
      state.filters.categoryId = action.payload ?? '';
      state.pagination.page = 1;
    },
    setArchivedFilter(state, action) {
      state.filters.isArchived = action.payload ?? '';
      state.pagination.page = 1;
    },
    setPage(state, action) {
      state.pagination.page = action.payload;
    },
    setSelectedItem(state, action) {
      state.selectedItem = action.payload;
    },
    clearSelectedItem(state) {
      state.selectedItem = null;
    },
    clearListError(state) {
      state.listError = null;
    },
    clearMutationError(state) {
      state.mutationError = null;
    },
    resetMutationState(state) {
      state.mutationStatus = 'idle';
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFoodItems.pending, (state) => {
        state.listStatus = 'loading';
        state.listError = null;
      })
      .addCase(fetchFoodItems.fulfilled, (state, action) => {
        state.listStatus = 'succeeded';
        state.items = action.payload.items ?? [];
        state.pagination = action.payload.pagination ?? initialState.pagination;
      })
      .addCase(fetchFoodItems.rejected, (state, action) => {
        state.listStatus = 'failed';
        state.listError = action.payload;
      })
      .addCase(fetchFoodItemById.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(fetchFoodItemById.fulfilled, (state, action) => {
        state.mutationStatus = 'idle';
        state.selectedItem = action.payload;
      })
      .addCase(fetchFoodItemById.rejected, (state, action) => {
        state.mutationStatus = 'idle';
        state.mutationError = action.payload;
      })
      .addCase(createFoodItem.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(createFoodItem.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(createFoodItem.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(updateFoodItem.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(updateFoodItem.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(updateFoodItem.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(toggleFoodItemArchive.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(toggleFoodItemArchive.fulfilled, (state) => {
        state.mutationStatus = 'succeeded';
      })
      .addCase(toggleFoodItemArchive.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      })
      .addCase(deleteFoodItem.pending, (state) => {
        state.mutationStatus = 'loading';
        state.mutationError = null;
      })
      .addCase(deleteFoodItem.fulfilled, (state, action) => {
  state.mutationStatus = 'succeeded';

  const index = state.items.findIndex(
    (item) => item._id === action.payload?._id,
  );

  if (index !== -1) {
    state.items[index] = action.payload;
  }
})
      .addCase(deleteFoodItem.rejected, (state, action) => {
        state.mutationStatus = 'failed';
        state.mutationError = action.payload;
      });
  },
});

export const {
  setSearch,
  setCategoryFilter,
  setArchivedFilter,
  setPage,
  setSelectedItem,
  clearSelectedItem,
  clearListError,
  clearMutationError,
  resetMutationState,
} = foodItemSlice.actions;

export default foodItemSlice.reducer;