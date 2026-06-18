import { createSlice } from "@reduxjs/toolkit";

import { buildSavedSnapshot } from "../utils/scheduleSnapshot";

const initialState = {
  schedule: [],
  savedSnapshot: {},
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
      state.savedSnapshot = buildSavedSnapshot(state.schedule);
      state.isLoading = false;
      state.error = null;
    },

    updateDayItems: (state, action) => {
      const { dayOfWeek, menuItems } = action.payload;
      const day = state.schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
      if (day) {
        day.menuItems = menuItems;
      }
    },

    markDaysSaved: (state, action) => {
      const dayOfWeeks = action.payload || [];

      for (const dayOfWeek of dayOfWeeks) {
        const day = state.schedule.find((entry) => entry.dayOfWeek === dayOfWeek);
        if (day) {
          state.savedSnapshot[dayOfWeek] = day.menuItems.map((item) =>
            String(item.foodItemId?._id || item.foodItemId),
          );
        }
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
  markDaysSaved,
  setLoading,
  setSaving,
  setError,
  resetError,
} = scheduledMenuSlice.actions;

export default scheduledMenuSlice.reducer;
