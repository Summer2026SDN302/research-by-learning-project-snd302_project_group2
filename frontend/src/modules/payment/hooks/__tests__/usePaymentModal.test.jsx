import { configureStore } from "@reduxjs/toolkit";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { afterEach, describe, expect, it, vi } from "vitest";

import paymentReducer from "../../redux/paymentSlice";
import { usePaymentModal } from "../usePaymentModal";
import * as paymentApi from "../../api/paymentApi";

vi.mock("../../api/paymentApi", () => ({
  getPayments: vi.fn(),
  initiatePayment: vi.fn(),
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

  it("only shows the success toast after the payment confirmation finishes", async () => {
    let resolveConfirm;

    paymentApi.initiatePayment.mockResolvedValue({
      _id: "payment-1",
      orderId: "order-1",
    });
    paymentApi.confirmPayment.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveConfirm = resolve;
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
          _id: "order-1",
          orderNumber: "ORD-001",
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

    expect(paymentApi.initiatePayment).toHaveBeenCalledWith({
      orderId: "order-1",
      paymentMethod: "Cash",
      amountReceived: 50000,
      providerName: null,
      transactionCode: null,
    });
    expect(paymentApi.confirmPayment).toHaveBeenCalledWith("payment-1", {
      amountReceived: 50000,
      providerName: null,
      transactionCode: null,
    });
    expect(mockToast.success).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();

    resolveConfirm({
      _id: "payment-1",
      invoiceId: "invoice-1",
    });

    await act(async () => {
      await submitPromise;
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      "Thanh toán thành công",
      "Đơn hàng #ORD-001 đã thanh toán xong và được lưu hóa đơn.",
    );
    expect(onSuccess).toHaveBeenCalledWith({
      _id: "payment-1",
      invoiceId: "invoice-1",
    });
  });
});
