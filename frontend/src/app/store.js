import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "../modules/menu/redux/categorySlice";
import foodItemReducer from "../modules/menu/redux/foodItemSlice";
import toastReducer from "./toastSlice";
import authReducer from "../modules/auth/redux/authSlice";
import userReducer from "../modules/user/redux/userSlice";
import dailyMenuReducer from "../modules/menu/redux/dailyMenuSlice";
import scheduledMenuReducer from "../modules/menu/redux/scheduledMenuSlice";
import orderReducer from "../modules/order/redux/orderSlice";
import paymentReducer from "../modules/payment/redux/paymentSlice";
import invoiceReducer from "../modules/invoice/redux/invoiceSlice";

export const store = configureStore({
  reducer: {
    toast: toastReducer,
    auth: authReducer,
    user: userReducer,
    dailyMenu: dailyMenuReducer,
    scheduledMenu: scheduledMenuReducer,
    category: categoryReducer,
    foodItem: foodItemReducer,
    order: orderReducer,
    payment: paymentReducer,
    invoice: invoiceReducer,
  },
});
