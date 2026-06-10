import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../modules/menu/redux/categorySlice";
import foodItemReducer from "../modules/menu/redux/foodItemSlice";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
    foodItem: foodItemReducer,
  },
});
