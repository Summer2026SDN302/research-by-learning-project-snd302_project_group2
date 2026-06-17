import { configureStore } from "@reduxjs/toolkit";
import toastReducer from "./toastSlice";
import authReducer from "../modules/auth/redux/authSlice";
import userReducer from "../modules/user/redux/userSlice";
import foodItemReducer from "../modules/menu/redux/foodItemSlice";
import dailyMenuReducer from "../modules/menu/redux/dailyMenuSlice";
import categoryReducer from "../modules/menu/redux/categorySlice";
export const store = configureStore({
  reducer: {
    toast: toastReducer,
    auth: authReducer,
    user: userReducer,
    foodItems: foodItemReducer,
    dailyMenu: dailyMenuReducer,
    categories: categoryReducer,
  },
});
