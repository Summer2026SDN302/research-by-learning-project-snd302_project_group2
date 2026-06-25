import { createSlice } from "@reduxjs/toolkit";
import { PAYMENT_METHOD } from "../constants/orderConstants";

const initialState = {
  /** @type {Array<{ foodItemId: string, name: string, unitPrice: number, quantity: number }>} */
  cart: [],
  isSubmitting: false,
  categoryFilter: "", // "" = Tất cả
  searchTerm: "",
  paymentMethod: PAYMENT_METHOD.CASH,
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addItem(state, action) {
      const { foodItemId, name, unitPrice } = action.payload;
      const existing = state.cart.find((i) => i.foodItemId === foodItemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.cart.push({ foodItemId, name, unitPrice, quantity: 1 });
      }
    },
    removeItem(state, action) {
      state.cart = state.cart.filter(
        (i) => i.foodItemId !== action.payload,
      );
    },
    increaseQty(state, action) {
      const item = state.cart.find((i) => i.foodItemId === action.payload);
      if (item) item.quantity += 1;
    },
    decreaseQty(state, action) {
      const item = state.cart.find((i) => i.foodItemId === action.payload);
      if (!item) return;
      if (item.quantity <= 1) {
        state.cart = state.cart.filter(
          (i) => i.foodItemId !== action.payload,
        );
      } else {
        item.quantity -= 1;
      }
    },
    clearCart(state) {
      state.cart = [];
    },
    setSubmitting(state, action) {
      state.isSubmitting = action.payload;
    },
    setCategoryFilter(state, action) {
      state.categoryFilter = action.payload;
    },
    setSearchTerm(state, action) {
      state.searchTerm = action.payload;
    },
    setPaymentMethod(state, action) {
      state.paymentMethod = action.payload;
    },
    resetOrder(state) {
      state.cart = [];
      state.isSubmitting = false;
      state.paymentMethod = PAYMENT_METHOD.CASH;
    },
  },
});

export const {
  addItem,
  removeItem,
  increaseQty,
  decreaseQty,
  clearCart,
  setSubmitting,
  setCategoryFilter,
  setSearchTerm,
  setPaymentMethod,
  resetOrder,
} = orderSlice.actions;

// ── Selectors ────────────────────────────────────────────────────────────────
export const selectCart = (s) => s.order.cart;
export const selectIsSubmitting = (s) => s.order.isSubmitting;
export const selectCategoryFilter = (s) => s.order.categoryFilter;
export const selectSearchTerm = (s) => s.order.searchTerm;
export const selectPaymentMethod = (s) => s.order.paymentMethod;
export const selectCartItemCount = (s) =>
  s.order.cart.reduce((sum, i) => sum + i.quantity, 0);

export default orderSlice.reducer;
