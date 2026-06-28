import { describe, expect, it } from "vitest";

import { ORDER_PAYMENT_STATUS } from "../../order/order.constants.js";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "../payment.constants.js";
import {
  buildInvoiceBackfillUpdate,
  buildOrderBackfillUpdate,
  buildPaymentBackfillUpdate,
  deriveOrderPaymentStatus,
  normalizeLegacyPaymentMethod,
} from "../payment.backfill.js";

describe("payment.backfill", () => {
  it("normalizes legacy qr providers to the shared QR method", () => {
    expect(normalizeLegacyPaymentMethod("Momo", null)).toEqual({
      paymentMethod: PAYMENT_METHOD.QR,
      providerName: "Momo",
    });

    expect(normalizeLegacyPaymentMethod("VNPay", "  VietQR Gateway  ")).toEqual({
      paymentMethod: PAYMENT_METHOD.QR,
      providerName: "VietQR Gateway",
    });
  });

  it("builds payment backfill updates for paid legacy documents", () => {
    const result = buildPaymentBackfillUpdate(
      {
        paymentMethod: "Momo",
        providerName: "",
        paymentStatus: PAYMENT_STATUS.PAID,
        paidAt: null,
        updatedAt: "2026-06-26T02:00:00.000Z",
        createdAt: "2026-06-26T01:00:00.000Z",
        invoiceId: null,
        auditTrail: null,
      },
      { _id: "invoice-1" },
    );

    expect(result).toEqual({
      paymentMethod: PAYMENT_METHOD.QR,
      providerName: "Momo",
      invoiceId: "invoice-1",
      paidAt: "2026-06-26T02:00:00.000Z",
      auditTrail: [],
    });
  });

  it("builds invoice backfill defaults for print audit fields", () => {
    expect(
      buildInvoiceBackfillUpdate({
        invoiceNumber: "INV-001",
      }),
    ).toEqual({
      notes: null,
      printCount: 0,
      lastPrintedAt: null,
      lastPrintedBy: null,
    });
  });

  it("derives order payment status from linked payment", () => {
    expect(deriveOrderPaymentStatus(null)).toBe(ORDER_PAYMENT_STATUS.UNPAID);
    expect(
      deriveOrderPaymentStatus({ paymentStatus: PAYMENT_STATUS.PENDING }),
    ).toBe(ORDER_PAYMENT_STATUS.PENDING);
    expect(
      deriveOrderPaymentStatus({ paymentStatus: PAYMENT_STATUS.PAID }),
    ).toBe(ORDER_PAYMENT_STATUS.PAID);
    expect(
      deriveOrderPaymentStatus({ paymentStatus: PAYMENT_STATUS.REFUNDED }),
    ).toBe(ORDER_PAYMENT_STATUS.REFUNDED);
    expect(
      deriveOrderPaymentStatus({ paymentStatus: PAYMENT_STATUS.FAILED }),
    ).toBe(ORDER_PAYMENT_STATUS.UNPAID);
  });

  it("builds order backfill updates for missing notes and stale references", () => {
    const result = buildOrderBackfillUpdate(
      {
        items: [
          {
            foodItemId: "food-1",
            name: "Bun bo",
            unitPrice: 45000,
            quantity: 1,
            lineTotal: 45000,
          },
        ],
        paymentId: "broken-payment-id",
        invoiceId: "broken-invoice-id",
        paymentStatus: ORDER_PAYMENT_STATUS.PENDING,
      },
      null,
      null,
    );

    expect(result).toEqual({
      notes: null,
      items: [
        {
          foodItemId: "food-1",
          name: "Bun bo",
          unitPrice: 45000,
          quantity: 1,
          lineTotal: 45000,
          note: null,
        },
      ],
      paymentId: null,
      invoiceId: null,
      paymentStatus: ORDER_PAYMENT_STATUS.UNPAID,
    });
  });
});
