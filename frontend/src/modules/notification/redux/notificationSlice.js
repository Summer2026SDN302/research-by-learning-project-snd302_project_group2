import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
  isMarkingAll: false,
  error: null,
  cachedItems: [],
  cachedUnreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications(state, action) {
      state.items = action.payload.items || [];
      state.unreadCount = action.payload.unreadCount || 0;
      state.error = null;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setMarkingAll(state, action) {
      state.isMarkingAll = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
    },
    markSingleReadOptimistic(state, action) {
      const id = action.payload;
      // Deep clone items to prevent reference mutation issues on rollback
      state.cachedItems = state.items.map((item) => ({ ...item }));
      state.cachedUnreadCount = state.unreadCount;

      const item = state.items.find((n) => n.id === id);
      if (item && !item.isRead) {
        item.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllReadOptimistic(state) {
      state.cachedItems = state.items.map((item) => ({ ...item }));
      state.cachedUnreadCount = state.unreadCount;

      state.items.forEach((item) => {
        item.isRead = true;
      });
      state.unreadCount = 0;
    },
    rollbackOptimistic(state) {
      state.items = state.cachedItems;
      state.unreadCount = state.cachedUnreadCount;
    },
    clearNotifications(state) {
      state.items = [];
      state.unreadCount = 0;
      state.isLoading = false;
      state.isMarkingAll = false;
      state.error = null;
    },
  },
});

export const {
  setNotifications,
  setLoading,
  setMarkingAll,
  setError,
  markSingleReadOptimistic,
  markAllReadOptimistic,
  rollbackOptimistic,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;
