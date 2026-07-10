import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import categoryReducer from "@/modules/menu/redux/categorySlice";
import dailyMenuReducer from "@/modules/menu/redux/dailyMenuSlice";
import orderReducer from "../../redux/orderSlice";
import { useStaffPos } from "../useStaffPos";
import * as orderApi from "../../api/orderApi";

vi.mock("../../api/orderApi", () => ({
  createOrder: vi.fn(),
  updateOrderItems: vi.fn(),
}));

vi.mock("@/modules/menu/api/dailyMenuApi", () => ({
  getTodayMenu: vi.fn(),
}));

vi.mock("@/modules/menu/api/categoryApi", () => ({
  getCategories: vi.fn(),
}));

const mockToast = {
  error: vi.fn(),
  success: vi.fn(),
  warning: vi.fn(),
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
    dailyMenuApi.getTodayMenu.mockResolvedValue({
      items: [
        {
          foodItemId: {
            _id: "food-1",
            name: "Pho",
          },
          currentPrice: 35000,
          originalPrice: 35000,
          preparedQuantity: 5,
          soldQuantity: 3,
          remainingQuantity: 2,
          status: "Available",
        },
      ],
    });
    categoryApi.getCategories.mockResolvedValue({ items: [] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("hydrates shared order notes from currentOrder and leaves the store untouched on unmount", async () => {
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

  it("clears both cart items and local order notes", async () => {
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
    });

    const { result } = renderHook(() => useStaffPos(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loadingMenu).toBe(false);
    });

    let clearResult;
    await act(async () => {
      result.current.handleOrderNotesChange("Ban 7");
      clearResult = await result.current.handleClearCart();
    });

    expect(clearResult).toBe(true);
    expect(store.getState().order.cart.items).toEqual([]);
    expect(store.getState().order.currentOrder).toBeNull();
    expect(result.current.orderNotes).toBe("");
  });
  it("submits a new unpaid order with shared notes and retains the POS state for payment", async () => {
    orderApi.createOrder.mockResolvedValue({
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

    await act(async () => {
      result.current.handleOrderNotesChange("Ban 5");
    });

    await waitFor(() => {
      expect(result.current.orderNotes).toBe("Ban 5");
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleSubmitOrder();
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
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Tạo đơn hàng thành công",
      "Đơn hàng #ORD-002 đã được tạo.",
    );
    expect(store.getState().order.cart.items).toEqual([
      {
        foodItemId: "food-1",
        name: "Pho",
        unitPrice: 35000,
        quantity: 1,
        note: "It hanh",
      },
    ]);
    expect(result.current.orderNotes).toBe("Ban 5");
  });

  it("shows stock meta and blocks selecting more than the remaining quantity", async () => {
    const store = createTestStore();

    const { result } = renderHook(() => useStaffPos(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loadingMenu).toBe(false);
    });

    const menuItem = result.current.filteredMenuItems[0];

    await act(async () => {
      result.current.handleAddItem(menuItem);
      result.current.handleAddItem(menuItem);
      result.current.handleAddItem(menuItem);
    });

    expect(store.getState().order.cart.items).toEqual([
      expect.objectContaining({
        foodItemId: "food-1",
        quantity: 2,
      }),
    ]);
    expect(result.current.menuItemSelectionMap["food-1"]).toMatchObject({
      actualRemainingQuantity: 2,
      soldQuantity: 3,
      preparedQuantity: 5,
      maxSelectableQuantity: 2,
    });
    expect(mockToast.warning).toHaveBeenCalledWith(
      "Vuot qua so luong con lai",
      "Mon Pho chi co the chon toi da 2 phan.",
    );
  });

  it("updates the current unpaid order instead of creating a new one", async () => {
    orderApi.updateOrderItems.mockResolvedValue({
      _id: "order-3",
      orderNumber: "ORD-003",
      paymentStatus: "Unpaid",
      orderStatus: "Pending",
      notes: "Ban 8",
    });

    const store = createTestStore({
      cart: {
        items: [
          {
            foodItemId: "food-1",
            name: "Pho",
            unitPrice: 35000,
            quantity: 2,
          },
        ],
      },
      currentOrder: {
        _id: "order-3",
        orderNumber: "ORD-003",
        paymentStatus: "Unpaid",
        orderStatus: "Pending",
        notes: "Ban 6",
      },
    });

    const { result } = renderHook(() => useStaffPos(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loadingMenu).toBe(false);
    });

    await act(async () => {
      result.current.handleOrderNotesChange("Ban 8");
    });

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleSubmitOrder();
    });

    expect(submitResult).toMatchObject({
      _id: "order-3",
      orderNumber: "ORD-003",
    });
    expect(orderApi.updateOrderItems).toHaveBeenCalledWith("order-3", {
      items: [
        {
          foodItemId: "food-1",
          quantity: 2,
          note: "",
        },
      ],
      notes: "Ban 8",
    });
    expect(orderApi.createOrder).not.toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith(
      "Cập nhật đơn hàng thành công",
      "Đơn hàng #ORD-003 đã được cập nhật.",
    );
  });

  it("caps quantity updates at the allowed maximum", async () => {
    const store = createTestStore({
      cart: {
        items: [
          {
            foodItemId: "food-1",
            name: "Pho",
            unitPrice: 35000,
            quantity: 1,
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

    let updateResult;
    await act(async () => {
      updateResult = result.current.handleUpdateQuantity("food-1", 5);
    });

    expect(updateResult).toBe(false);
    expect(store.getState().order.cart.items).toEqual([
      expect.objectContaining({
        foodItemId: "food-1",
        quantity: 2,
      }),
    ]);
    expect(mockToast.warning).toHaveBeenCalledWith(
      "Vuot qua so luong con lai",
      "Mon Pho chi co the chon toi da 2 phan.",
    );
  });

  it("updates the note of a specific cart item", async () => {
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
    });

    const { result } = renderHook(() => useStaffPos(), {
      wrapper: createWrapper(store),
    });

    await waitFor(() => {
      expect(result.current.loadingMenu).toBe(false);
    });

    let updateResult;
    await act(async () => {
      updateResult = result.current.handleUpdateItemNote("food-1", "Khong hanh");
    });

    expect(updateResult).toBe(true);
    expect(store.getState().order.cart.items).toEqual([
      expect.objectContaining({
        foodItemId: "food-1",
        note: "Khong hanh",
      }),
    ]);
  });

  it("rounds subtotal, tax and total for the later payment handoff", async () => {
    const store = createTestStore({
      cart: {
        items: [
          {
            foodItemId: "food-1",
            name: "Pho dac biet",
            unitPrice: 33333,
            quantity: 1,
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

    expect(result.current.cartTotals).toEqual({
      subtotal: 33333,
      taxRate: 0.08,
      taxAmount: 2666.64,
      totalAmount: 35999.64,
    });
  });
});
