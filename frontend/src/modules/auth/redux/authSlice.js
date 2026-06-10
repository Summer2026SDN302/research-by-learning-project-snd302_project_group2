import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapped: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    authSuccess: (state, action) => {
      state.user = action.payload.user || null;
      state.accessToken = action.payload.accessToken || null;
      state.isAuthenticated = Boolean(action.payload.user);
      state.isLoading = false;
      state.isBootstrapped = true;
      state.error = null;
    },

    authFailure: (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Authentication failed";
    },

    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isBootstrapped = true;
      state.error = null;
    },

    finishBootstrap: (state) => {
      state.isBootstrapped = true;
      state.isLoading = false;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  clearAuth,
  finishBootstrap,
} = authSlice.actions;

export default authSlice.reducer;