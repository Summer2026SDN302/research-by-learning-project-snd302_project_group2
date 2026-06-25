import { configureStore } from "@reduxjs/toolkit";
import { afterEach, describe, expect, it, vi } from "vitest";

import reducer, { fetchPaymentKpisThunk } from "../paymentSlice";
import * as paymentApi from "../../api/paymentApi";

vi.mock("../../api/paymentApi", () => ({
  getPayments: vi.fn(),
  initiatePayment: vi.fn(),
  confirmPayment: vi.fn(),
  failPayment: vi.fn(),
}));

const makeStore = (preloadedState) =>
  configureStore({
    reducer: {
      payment: reducer,
    },
    preloadedState,
  });

describe("paymentSlice", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("builds daily payment KPIs from the actual completion date", async () => {
    paymentApi.getPayments
      .mockResolvedValueOnce({
        items: [
          {
            _id: "payment-1",
            paymentStatus: "Paid",
            finalAmount: 100000,
            createdAt: "2026-06-24T19:00:00",
            paidAt: "2026-06-25T08:15:00",
          },
          {
            _id: "payment-2",
            paymentStatus: "Pending",
            finalAmount: 50000,
            createdAt: "2026-06-25T09:30:00",
          },
        ],
        pagination: {
          page: 1,
          limit: 200,
          total: 3,
          totalPages: 2,
        },
      })
      .mockResolvedValueOnce({
        items: [
          {
            _id: "payment-3",
            paymentStatus: "Paid",
            finalAmount: 70000,
            createdAt: "2026-06-25T10:00:00",
            paidAt: "2026-06-24T22:45:00",
          },
        ],
        pagination: {
          page: 2,
          limit: 200,
          total: 3,
          totalPages: 2,
        },
      });

    const store = makeStore();
    const result = await store.dispatch(fetchPaymentKpisThunk("2026-06-25"));

    expect(result.type).toBe("payment/fetchPaymentKpis/fulfilled");
    expect(paymentApi.getPayments).toHaveBeenNthCalledWith(1, {
      page: 1,
      limit: 200,
    });
    expect(paymentApi.getPayments).toHaveBeenNthCalledWith(2, {
      page: 2,
      limit: 200,
    });
    expect(store.getState().payment.paymentKpis).toEqual({
      totalRevenue: 100000,
      successCount: 1,
      pendingCount: 1,
    });
  });
});
