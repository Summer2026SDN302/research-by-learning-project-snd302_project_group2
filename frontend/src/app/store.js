import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../modules/menu/redux/categorySlice";
import foodItemReducer from "../modules/menu/redux/foodItemSlice";
import toastReducer from "./toastSlice";
import authReducer from "../modules/auth/redux/authSlice";
import userReducer from "../modules/user/redux/userSlice";
import dailyMenuReducer from "../modules/menu/redux/dailyMenuSlice";
import scheduledMenuReducer from "../modules/menu/redux/scheduledMenuSlice";

export const store = configureStore({
  reducer: {
    toast: toastReducer,
    auth: authReducer,
    user: userReducer,
    dailyMenu: dailyMenuReducer,
    scheduledMenu: scheduledMenuReducer,
    category: categoryReducer,
    foodItem: foodItemReducer,
  },
});
