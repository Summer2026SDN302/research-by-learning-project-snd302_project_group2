import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profile: null,
  profileLoading: false,
  profileSaving: false,
  profileError: null,

  users: [],
  usersLoading: false,
  usersSaving: false,
  usersError: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  },
  stats: {
    total: 0,
    active: 0,
    inactive: 0,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfileLoading: (state, action) => {
      state.profileLoading = Boolean(action.payload);
      state.profileError = null;
    },

    setProfileSaving: (state, action) => {
      state.profileSaving = Boolean(action.payload);
      state.profileError = null;
    },

    setProfile: (state, action) => {
      state.profile = action.payload || null;
      state.profileLoading = false;
      state.profileSaving = false;
      state.profileError = null;
    },

    setProfileError: (state, action) => {
      state.profileLoading = false;
      state.profileSaving = false;
      state.profileError = action.payload || "Không thể tải hồ sơ.";
    },

    setUsersLoading: (state, action) => {
      state.usersLoading = Boolean(action.payload);
      state.usersError = null;
    },

    setUsersSaving: (state, action) => {
      state.usersSaving = Boolean(action.payload);
      state.usersError = null;
    },

    setUsersData: (state, action) => {
      state.users = action.payload?.items || [];
      state.pagination = {
        ...state.pagination,
        ...(action.payload?.pagination || {}),
      };
      state.usersLoading = false;
      state.usersError = null;
    },

    setUsersStats: (state, action) => {
      state.stats = {
        ...state.stats,
        ...(action.payload || {}),
      };
    },

    setUsersError: (state, action) => {
      state.usersLoading = false;
      state.usersSaving = false;
      state.usersError = action.payload || "Không thể tải danh sách người dùng.";
    },
  },
});

export const {
  setProfileLoading,
  setProfileSaving,
  setProfile,
  setProfileError,
  setUsersLoading,
  setUsersSaving,
  setUsersData,
  setUsersStats,
  setUsersError,
} = userSlice.actions;

export default userSlice.reducer;
