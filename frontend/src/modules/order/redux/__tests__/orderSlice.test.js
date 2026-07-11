import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";

import reducer, {
  addToCart,
  clearCart,
  fetchOwnOrderKpisThunk,
  setCurrentOrder,
  startEditingOrder,
  submitOrder,
  updateCartItemNote,
  updateOrderItemsThunk,
} from "../orderSlice";
import * as orderApi from "../../api/orderApi";

vi.mock("../../api/orderApi", () => ({
  createOrder: vi.fn(),
  getMyOrders: vi.fn(),
  updateOrderItems: vi.fn(),
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

  it("hydrates the cart when starting to edit an existing unpaid order", () => {
    const state = reducer(
      undefined,
      startEditingOrder({
        _id: "order-1",
        orderNumber: "ORD-001",
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
        items: [
          {
            foodItemId: "food-1",
            name: "Pho",
            unitPrice: 35000,
            quantity: 2,
            note: null,
          },
        ],
      }),
    );

    expect(state.currentOrder).toMatchObject({
      _id: "order-1",
      orderNumber: "ORD-001",
    });
    expect(state.cart.items).toEqual([
      {
        foodItemId: "food-1",
        name: "Pho",
        unitPrice: 35000,
        quantity: 2,
        note: null,
      },
    ]);
  });

  it("stores per-item notes in the cart", () => {
    let state = reducer(
      undefined,
      addToCart({
        foodItemId: "food-1",
        name: "Pho",
        unitPrice: 35000,
        quantity: 1,
      }),
    );

    state = reducer(
      state,
      updateCartItemNote({
        foodItemId: "food-1",
        note: "Khong hanh",
      }),
    );

    expect(state.cart.items).toEqual([
      {
        foodItemId: "food-1",
        name: "Pho",
        unitPrice: 35000,
        quantity: 1,
        note: "Khong hanh",
      },
    ]);
  });

  it("creates a new order and stores the backend response", async () => {
    const createdOrder = {
      _id: "order-1",
      orderNumber: "ORD-001",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
    };
    const payload = {
      items: [{ foodItemId: "food-1", quantity: 2 }],
      notes: "Mang di",
    };

    orderApi.createOrder.mockResolvedValue(createdOrder);

    const store = makeStore();
    const result = await store.dispatch(submitOrder(payload));

    expect(result.type).toBe("order/submitOrder/fulfilled");
    expect(orderApi.createOrder).toHaveBeenCalledWith(payload);
    expect(store.getState().order.currentOrder).toEqual(createdOrder);
  });

  it("updates the existing order instead of creating a fresh one", async () => {
    const updatedOrder = {
      _id: "order-2",
      orderNumber: "ORD-002",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
      items: [{ foodItemId: "food-1", quantity: 3 }],
      notes: "Ban 5",
    };

    orderApi.updateOrderItems.mockResolvedValue(updatedOrder);

    const store = makeStore({
      order: {
        cart: { items: [] },
        currentOrder: {
          _id: "order-2",
          paymentStatus: "Unpaid",
          orderStatus: "Pending",
        },
        status: "idle",
        error: null,
      },
    });

    const result = await store.dispatch(
      updateOrderItemsThunk({
        id: "order-2",
        body: {
          items: [{ foodItemId: "food-1", quantity: 3 }],
          notes: "Ban 5",
        },
      }),
    );

    expect(result.type).toBe("order/updateOrderItems/fulfilled");
    expect(orderApi.updateOrderItems).toHaveBeenCalledWith("order-2", {
      items: [{ foodItemId: "food-1", quantity: 3 }],
      notes: "Ban 5",
    });
    expect(store.getState().order.currentOrder).toEqual(updatedOrder);
  });

  it("counts only paid orders in own-history revenue KPIs", async () => {
    orderApi.getMyOrders.mockResolvedValue({
      items: [
        {
          _id: "order-1",
          orderDate: "2026-06-26T08:00:00.000Z",
          paymentStatus: "Paid",
          finalAmount: 120000,
          orderStatus: "Completed",
        },
        {
          _id: "order-2",
          orderDate: "2026-06-26T09:00:00.000Z",
          paymentStatus: "Paid",
          totalAmount: 80000,
          orderStatus: "Completed",
        },
        {
          _id: "order-3",
          orderDate: "2026-06-26T10:00:00.000Z",
          paymentStatus: "Pending",
          finalAmount: 50000,
          orderStatus: "Pending",
        },
      ],
      pagination: {
        totalPages: 1,
      },
    });

    const store = makeStore();
    const result = await store.dispatch(fetchOwnOrderKpisThunk("2026-06-26"));

    expect(result.type).toBe("order/fetchOwnOrderKpis/fulfilled");
    expect(orderApi.getMyOrders).toHaveBeenCalledWith({
      page: 1,
      limit: 50,
    });
    expect(store.getState().order.ownHistoryKpis).toEqual({
      todayOrdersCount: 3,
      personalRevenue: 200000,
      completedOrdersCount: 2,
      pendingOrdersCount: 1,
    });
  });
});
