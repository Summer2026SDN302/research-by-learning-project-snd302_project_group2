import { createSlice } from "@reduxjs/toolkit";

const DEFAULT_USER = {
  name: "Admin User",
  initials: "A",
  email: "",
};

const getUserFromAccessToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return DEFAULT_USER;

    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role ?? "User";

    return {
      name: role,
      initials: String(role).charAt(0).toUpperCase(),
      email: "",
    };
  } catch {
    return DEFAULT_USER;
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: getUserFromAccessToken(),
    isAuthenticated: Boolean(localStorage.getItem("accessToken")),
  },
  reducers: {},
});

export default authSlice.reducer;
