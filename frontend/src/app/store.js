import { configureStore } from "@reduxjs/toolkit";
import toastReducer from "./toastSlice";
import authReducer from "../modules/auth/redux/authSlice";
import userReducer from "../modules/user/redux/userSlice";
import scheduledMenuReducer from "../modules/menu/redux/scheduledMenuSlice";

export const store = configureStore({
  reducer: {
    toast: toastReducer,
    auth: authReducer,
    user: userReducer,
    scheduledMenu: scheduledMenuReducer,
  },
});
