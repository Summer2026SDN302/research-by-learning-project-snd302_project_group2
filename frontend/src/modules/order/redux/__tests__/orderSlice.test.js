import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";

import reducer, {
  addToCart,
  clearCart,
  setCurrentOrder,
  submitOrder,
} from "../orderSlice";
import * as orderApi from "../../api/orderApi";

vi.mock("../../api/orderApi", () => ({
  createOrder: vi.fn(),
  updateOrderItems: vi.fn(),
  cancelOrder: vi.fn(),
}));

const makeStore = (preloadedState) =>
  configureStore({
    reducer: {
      order: reducer,
    },
    preloadedState,
  });

describe("orderSlice", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("clearCart also resets the current active order", () => {
    let state = reducer(undefined, {
      type: "@@INIT",
    });

    state = reducer(
      state,
      addToCart({
        foodItemId: "food-1",
        name: "Pho",
        unitPrice: 35000,
        quantity: 1,
      }),
    );
    state = reducer(
      state,
      setCurrentOrder({
        _id: "order-1",
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
      }),
    );

    state = reducer(state, clearCart());

    expect(state.cart.items).toEqual([]);
    expect(state.currentOrder).toBeNull();
    expect(state.status).toBe("idle");
    expect(state.error).toBeNull();
  });

  it("creates a new order when there is no reusable active order", async () => {
    const createdOrder = {
      _id: "order-1",
      orderNumber: "ORD-001",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
    };
    const payload = {
      items: [{ foodItemId: "food-1", quantity: 2, note: null }],
      notes: "Mang di",
      taxRate: 0.08,
    };

    orderApi.createOrder.mockResolvedValue(createdOrder);

    const store = makeStore();
    const result = await store.dispatch(submitOrder(payload));

    expect(result.type).toBe("order/submitOrder/fulfilled");
    expect(orderApi.createOrder).toHaveBeenCalledWith(payload);
    expect(orderApi.updateOrderItems).not.toHaveBeenCalled();
    expect(store.getState().order.currentOrder).toEqual(createdOrder);
  });

  it("updates the existing unpaid order instead of creating another one", async () => {
    const payload = {
      items: [{ foodItemId: "food-1", quantity: 3, note: "It da" }],
      notes: "Ban 5",
      taxRate: 0.08,
    };
    const updatedOrder = {
      _id: "order-1",
      orderNumber: "ORD-001",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
      items: payload.items,
      notes: payload.notes,
    };

    orderApi.updateOrderItems.mockResolvedValue(updatedOrder);

    const store = makeStore({
      order: {
        cart: { items: [] },
        currentOrder: {
          _id: "order-1",
          paymentStatus: "Unpaid",
          orderStatus: "Pending",
        },
        status: "idle",
        error: null,
      },
    });

    const result = await store.dispatch(submitOrder(payload));

    expect(result.type).toBe("order/submitOrder/fulfilled");
    expect(orderApi.updateOrderItems).toHaveBeenCalledWith("order-1", payload);
    expect(orderApi.createOrder).not.toHaveBeenCalled();
    expect(store.getState().order.currentOrder).toEqual(updatedOrder);
  });
});
