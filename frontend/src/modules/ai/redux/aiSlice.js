import { createSlice } from "@reduxjs/toolkit";
import dayjs from "dayjs";

const initialState = {
  insight: null, // AI Insight object containing forecasts and pricing recommendations
  isLoading: false,
  isMutating: false, // true during updates (apply/reject forecasts or pricing)
  error: null,
  selectedDate: dayjs().format("YYYY-MM-DD"),
  activeTab: "overview", // "overview" | "forecast" | "pricing"
  versions: [],
};

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {
    setInsight(state, action) {
      state.insight = action.payload;
      state.error = null;
    },
    clearInsight(state) {
      state.insight = null;
      state.error = null;
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
    },
    setActiveTab(state, action) {
      state.activeTab = action.payload;
    },
    setVersions(state, action) {
      state.versions = action.payload;
    },
    resetAiState(state) {
      state.insight = null;
      state.isLoading = false;
      state.isMutating = false;
      state.error = null;
      state.selectedDate = dayjs().format("YYYY-MM-DD");
      state.activeTab = "overview";
      state.versions = [];
    },
  },
});

export const {
  setInsight,
  clearInsight,
  setLoading,
  setMutating,
  setError,
  setSelectedDate,
  setActiveTab,
  setVersions,
  resetAiState,
} = aiSlice.actions;

// Selectors
export const selectAiInsight = (state) => state.ai.insight;
export const selectAiLoading = (state) => state.ai.isLoading;
export const selectAiMutating = (state) => state.ai.isMutating;
export const selectAiError = (state) => state.ai.error;
export const selectAiSelectedDate = (state) => state.ai.selectedDate;
export const selectActiveTab = (state) => state.ai.activeTab;
export const selectAiVersions = (state) => state.ai.versions;

export default aiSlice.reducer;
