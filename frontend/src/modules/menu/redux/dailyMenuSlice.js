import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
  menu: null, // DailyMenu document
  isLoading: false,
  isMutating: false, // true during PATCH / POST / DELETE
  error: null,
  selectedDate: dayjs().format("YYYY-MM-DD"),
  searchTerm: "", // client-side filter by food item name
  statusFilter: "", // '' | 'Available' | 'Unavailable'
  currentPage: 1,
};

const dailyMenuSlice = createSlice({
  name: "dailyMenu",
  initialState,
  reducers: {
    setMenu(state, action) {
      state.menu = action.payload;
      state.error = null;
    },
    clearMenu(state) {
      state.menu = null;
      state.error = null;
      state.currentPage = 1;
    },
    setLoading(state, action) {
      state.isLoading = action.payload;
    },
    setMutating(state, action) {
      state.isMutating = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.isLoading = false;
      state.isMutating = false;
    },
    setSelectedDate(state, action) {
      state.selectedDate = action.payload;
      state.currentPage = 1;
      state.searchTerm = "";
      state.statusFilter = "";
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter(state, action) {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage(state, action) {
      state.currentPage = action.payload;
    },
    resetFilters(state) {
      state.searchTerm = "";
      state.statusFilter = "";
      state.currentPage = 1;
    },
  },
});

export const {
  setMenu,
  clearMenu,
  setLoading,
  setMutating,
  setError,
  setSelectedDate,
  setSearchTerm,
  setStatusFilter,
  setCurrentPage,
  resetFilters,
} = dailyMenuSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectDailyMenu = (s) => s.dailyMenu.menu;
export const selectDailyMenuLoading = (s) => s.dailyMenu.isLoading;
export const selectDailyMenuMutating = (s) => s.dailyMenu.isMutating;
export const selectDailyMenuError = (s) => s.dailyMenu.error;
export const selectSelectedDate = (s) => s.dailyMenu.selectedDate;
export const selectSearchTerm = (s) => s.dailyMenu.searchTerm;
export const selectStatusFilter = (s) => s.dailyMenu.statusFilter;
export const selectCurrentPage = (s) => s.dailyMenu.currentPage;
export const selectIsConfigured = (s) =>
  s.dailyMenu.menu?.isConfigured ?? false;

export default dailyMenuSlice.reducer;
