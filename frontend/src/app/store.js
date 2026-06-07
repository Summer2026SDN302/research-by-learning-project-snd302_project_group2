import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../modules/menu/redux/categorySlice";

export const store = configureStore({
  reducer: {
    category: categoryReducer,
  },
});
