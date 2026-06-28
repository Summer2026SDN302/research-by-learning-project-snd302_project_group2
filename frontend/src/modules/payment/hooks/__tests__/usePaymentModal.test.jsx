import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import paymentReducer from "../../redux/paymentSlice";
import { getQuickCashOptions, usePaymentModal } from "../usePaymentModal";
import * as paymentApi from "../../api/paymentApi";

vi.mock("../../api/paymentApi", () => ({
  getPayments: vi.fn(),
  initiatePayment: vi.fn(),
  checkoutPayment: vi.fn(),
  confirmPayment: vi.fn(),
  failPayment: vi.fn(),
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

const createTestStore = () =>
  configureStore({
    reducer: {
      payment: paymentReducer,
    },
  });

const createWrapper = (store) =>
  function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };

describe("usePaymentModal", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("only shows the success toast after checkout finishes", async () => {
    let resolveCheckout;

    paymentApi.checkoutPayment.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveCheckout = resolve;
        }),
    );

    const store = createTestStore();
    const onSuccess = vi.fn();
    const { result } = renderHook(() => usePaymentModal(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.openModal(
        {
          items: [{ foodItemId: "food-1", quantity: 1, note: null }],
          notes: "Ban 7",
          finalAmount: 50000,
        },
        "Cash",
      );
      result.current.setCashReceivedAmount(50000);
    });

    let submitPromise;
    await act(async () => {
      submitPromise = result.current.submitCheckout(onSuccess);
      await Promise.resolve();
    });

    expect(paymentApi.checkoutPayment).toHaveBeenCalledWith({
      items: [{ foodItemId: "food-1", quantity: 1, note: null }],
      notes: "Ban 7",
      paymentMethod: "Cash",
      amountReceived: 50000,
      transactionCode: null,
    });
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();

    resolveCheckout({
      _id: "payment-1",
      orderId: {
        _id: "order-1",
        orderNumber: "ORD-001",
      },
    });

    await act(async () => {
      await submitPromise;
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Thanh toan thanh cong",
      "Don hang #ORD-001 da thanh toan xong va duoc luu bien lai.",
    );
    expect(onSuccess).toHaveBeenCalledWith({
      _id: "payment-1",
      orderId: {
        _id: "order-1",
        orderNumber: "ORD-001",
      },
    });
  });

  it("sends transactionCode only for non-cash checkout", async () => {
    paymentApi.checkoutPayment.mockResolvedValue({
      _id: "payment-2",
      orderId: {
        _id: "order-2",
        orderNumber: "ORD-002",
      },
    });

    const store = createTestStore();
    const { result } = renderHook(() => usePaymentModal(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.openModal(
        {
          items: [{ foodItemId: "food-2", quantity: 2, note: null }],
          notes: null,
          finalAmount: 85000,
        },
        "QR",
      );
      result.current.setTransactionCode("BANK-TXN-002");
    });

    await act(async () => {
      await result.current.submitCheckout();
    });

    expect(paymentApi.checkoutPayment).toHaveBeenCalledWith({
      items: [{ foodItemId: "food-2", quantity: 2, note: null }],
      notes: null,
      paymentMethod: "QR",
      amountReceived: 85000,
      transactionCode: "BANK-TXN-002",
    });
  });

  it("waits for the success callback before resetting the modal state", async () => {
    let resolveSuccess;

    paymentApi.checkoutPayment.mockResolvedValue({
      _id: "payment-3",
      orderId: {
        _id: "order-3",
        orderNumber: "ORD-003",
      },
    });

    const store = createTestStore();
    const onSuccess = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveSuccess = resolve;
        }),
    );
    const { result } = renderHook(() => usePaymentModal(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.openModal(
        {
          items: [{ foodItemId: "food-3", quantity: 1, note: null }],
          notes: "Ban 9",
          finalAmount: 65000,
        },
        "Cash",
      );
      result.current.setCashReceivedAmount(65000);
    });

    let submitPromise;
    await act(async () => {
      submitPromise = result.current.submitCheckout(onSuccess);
      await Promise.resolve();
    });

    expect(onSuccess).toHaveBeenCalledWith({
      _id: "payment-3",
      orderId: {
        _id: "order-3",
        orderNumber: "ORD-003",
      },
    });
    expect(result.current.isOpen).toBe(true);
    expect(result.current.order).toMatchObject({
      notes: "Ban 9",
      finalAmount: 65000,
    });

    resolveSuccess();

    await act(async () => {
      await submitPromise;
    });

    expect(result.current.isOpen).toBe(false);
    expect(result.current.order).toBeNull();
  });

  it("builds quick cash suggestions from the current order total", () => {
    expect(getQuickCashOptions(57000)).toEqual([100000, 200000]);
    expect(getQuickCashOptions(160000)).toEqual([200000, 300000]);
    expect(getQuickCashOptions(32000)).toEqual([50000, 100000]);
  });

  it("exposes dynamic quick cash options for the active order", () => {
    const store = createTestStore();
    const { result } = renderHook(() => usePaymentModal(), {
      wrapper: createWrapper(store),
    });

    act(() => {
      result.current.openModal(
        {
          items: [{ foodItemId: "food-1", quantity: 1, note: null }],
          finalAmount: 160000,
        },
        "Cash",
      );
    });

    expect(result.current.quickCashOptions).toEqual([200000, 300000]);
  });
});
