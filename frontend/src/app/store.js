import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import toastReducer from "./toastSlice";
import categoryReducer from "../modules/menu/redux/categorySlice";
import foodItemReducer from "../modules/menu/redux/foodItemSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    toast: toastReducer,
    category: categoryReducer,
    foodItem: foodItemReducer,
  },
});
