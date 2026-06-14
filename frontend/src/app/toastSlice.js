import { createSlice } from "@reduxjs/toolkit";

/**
 * toastSlice
 *
 * Redux slice for managing global toast notifications.
 * Handles adding and removing toasts from the store.
 *
 * State shape:
 *   items  {Array<Toast>}  – list of active toast objects
 *
 * Toast shape:
 *   {
 *     id       {string}
 *     type     {string}   – 'success' | 'error' | 'warning' | 'info'
 *     title    {string}
 *     message  {string}
 *     duration {number}   – ms before auto-dismiss, 0 = no auto-dismiss
 *   }
 */
const toastSlice = createSlice({
  name: "toast",
  initialState: {
    items: [],
  },
  reducers: {
    /**
     * addToast – adds a new toast to the list.
     * Auto-generates a unique id if not provided.
     */
    addToast: (state, action) => {
      const toast = {
        id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        duration: 3000,
        ...action.payload,
      };
      state.items.push(toast);
    },

    /** removeToast – removes a toast by id */
    removeToast: (state, action) => {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export default toastSlice.reducer;
