import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  schedule: [],
  isLoading: false,
  isSaving: false,
  error: null,
};

const scheduledMenuSlice = createSlice({
  name: "scheduledMenu",
  initialState,
  reducers: {
    setSchedule: (state, action) => {
      state.schedule = action.payload || [];
      state.isLoading = false;
      state.error = null;
    },

    updateDayItems: (state, action) => {
      const { dayOfWeek, menuItems } = action.payload;
      const day = state.schedule.find((d) => d.dayOfWeek === dayOfWeek);
      if (day) {
        day.menuItems = menuItems;
      }
    },

    setLoading: (state, action) => {
      state.isLoading = Boolean(action.payload);
      if (action.payload) state.error = null;
    },

    setSaving: (state, action) => {
      state.isSaving = Boolean(action.payload);
    },

    setError: (state, action) => {
      state.error = action.payload || null;
      state.isLoading = false;
      state.isSaving = false;
    },

    resetError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setSchedule,
  updateDayItems,
  setLoading,
  setSaving,
  setError,
  resetError,
} = scheduledMenuSlice.actions;

export default scheduledMenuSlice.reducer;
