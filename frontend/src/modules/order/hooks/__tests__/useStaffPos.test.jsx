import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import categoryReducer from "@/modules/menu/redux/categorySlice";
import dailyMenuReducer from "@/modules/menu/redux/dailyMenuSlice";
import orderReducer from "../../redux/orderSlice";
import { useStaffPos } from "../useStaffPos";
import * as orderApi from "../../api/orderApi";

vi.mock("@/modules/menu/api/dailyMenuApi", () => ({
  getTodayMenu: vi.fn(),
}));

vi.mock("@/modules/menu/api/categoryApi", () => ({
  getCategories: vi.fn(),
}));

const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
};

vi.mock("@/hooks/useAppToast", () => ({
  default: () => ({
    toast: mockToast,
  }),
}));

import * as dailyMenuApi from "@/modules/menu/api/dailyMenuApi";
import * as categoryApi from "@/modules/menu/api/categoryApi";

const createTestStore = (preloadedOrderState) =>
  configureStore({
    reducer: {
      order: orderReducer,
      dailyMenu: dailyMenuReducer,
      category: categoryReducer,
    },
    preloadedState: {
      order: {
        cart: { items: [] },
        currentOrder: null,
        status: "idle",
        error: null,
        ...preloadedOrderState,
      },
    },
  });

const createWrapper = (store) =>
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };

describe("useStaffPos", () => {
  beforeEach(() => {
    vi.spyOn(orderApi, "cancelOrder").mockResolvedValue({
      _id: "order-1",
      orderStatus: "Cancelled",
      paymentStatus: "Unpaid",
      isActive: false,
    });
    dailyMenuApi.getTodayMenu.mockResolvedValue({ items: [] });
    categoryApi.getCategories.mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("keeps the current draft order in the store after the POS hook unmounts", async () => {
    const store = createTestStore({
      currentOrder: {
        _id: "order-1",
        orderNumber: "ORD-001",
        notes: "Ban 7",
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
      },
    });

    const { result, unmount } = renderHook(() => useStaffPos(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loadingMenu).toBe(false);
    });

    expect(result.current.orderNotes).toBe("Ban 7");

    unmount();

    expect(store.getState().order.currentOrder).toMatchObject({
      _id: "order-1",
      notes: "Ban 7",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
    });
  });

  it("cancels the active draft order before clearing the cart", async () => {
    const store = createTestStore({
      cart: {
        items: [
          {
            foodItemId: "food-1",
            name: "Pho",
            unitPrice: 35000,
            quantity: 1,
            note: null,
          },
        ],
      },
      currentOrder: {
        _id: "order-1",
        orderNumber: "ORD-001",
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
      },
    });

    const { result } = renderHook(() => useStaffPos(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loadingMenu).toBe(false);
    });

    let clearResult;
    await act(async () => {
      clearResult = await result.current.handleClearCart();
    });

    expect(clearResult).toBe(true);
    expect(orderApi.cancelOrder).toHaveBeenCalledWith("order-1");
    expect(store.getState().order.cart.items).toEqual([]);
    expect(store.getState().order.currentOrder).toBeNull();
  });

  it("does not show a success toast when creating an order for checkout", async () => {
    vi.spyOn(orderApi, "createOrder").mockResolvedValue({
      _id: "order-2",
      orderNumber: "ORD-002",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
      notes: "Ban 5",
    });

    const store = createTestStore({
      cart: {
        items: [
          {
            foodItemId: "food-1",
            name: "Pho",
            unitPrice: 35000,
            quantity: 1,
            note: "It hanh",
          },
        ],
      },
    });

    const { result } = renderHook(() => useStaffPos(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loadingMenu).toBe(false);
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleSubmitOrder("Ban 5");
    });

    expect(submitResult).toMatchObject({
      _id: "order-2",
      orderNumber: "ORD-002",
    });
    expect(orderApi.createOrder).toHaveBeenCalledWith({
      items: [
        {
          foodItemId: "food-1",
          quantity: 1,
          note: "It hanh",
        },
      ],
      notes: "Ban 5",
      taxRate: 0.08,
    });
    expect(mockToast.success).not.toHaveBeenCalled();
  });
});
