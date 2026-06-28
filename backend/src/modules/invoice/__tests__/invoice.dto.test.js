import { describe, expect, it } from "vitest";

import {
  toInvoiceReceiptResponse,
  toInvoiceResponse,
} from "../invoice.dto.js";

describe("invoice.dto", () => {
  it("maps invoice detail responses with print audit fields", () => {
    const result = toInvoiceResponse({
      _id: "invoice-1",
      invoiceNumber: "INV-20260626-1234",
      orderId: "order-1",
      paymentId: "payment-1",
      staffId: {
        _id: "staff-1",
        username: "staff.one",
        fullName: "Staff One",
        role: "Staff",
      },
      lineItems: [
        {
          foodItemId: "food-1",
          name: "Com ga",
          unitPrice: 45000,
          quantity: 2,
          lineTotal: 90000,
          note: "It da",
        },
      ],
      notes: "Khach lay ve",
      subtotalAmount: 90000,
      discountAmount: 5000,
      taxRate: 0.08,
      taxAmount: 6800,
      finalAmount: 91800,
      paymentMethod: "QR",
      transactionCode: "TXN-1234",
      invoiceStatus: "Issued",
      issuedAt: "2026-06-26T03:00:00.000Z",
      printCount: 2,
      lastPrintedAt: "2026-06-26T03:15:00.000Z",
      lastPrintedBy: {
        _id: "manager-1",
        username: "manager.one",
        fullName: "Manager One",
        role: "Manager",
      },
      createdAt: "2026-06-26T03:00:00.000Z",
      updatedAt: "2026-06-26T03:15:00.000Z",
    });

    expect(result).toMatchObject({
      _id: "invoice-1",
      invoiceNumber: "INV-20260626-1234",
      printCount: 2,
      lastPrintedAt: "2026-06-26T03:15:00.000Z",
      lastPrintedBy: {
        _id: "manager-1",
        username: "manager.one",
        fullName: "Manager One",
        role: "Manager",
      },
    });
  });

  it("maps receipt payloads for FE receipt pages", () => {
    const result = toInvoiceReceiptResponse({
      _id: "invoice-2",
      invoiceNumber: "INV-20260626-5678",
      issuedAt: "2026-06-26T04:00:00.000Z",
      invoiceStatus: "Issued",
      staffId: {
        _id: "staff-2",
        username: "staff.two",
        fullName: "Staff Two",
        role: "Staff",
      },
      lineItems: [
        {
          foodItemId: "food-2",
          name: "Tra dao",
          unitPrice: 30000,
          quantity: 1,
          lineTotal: 30000,
          note: null,
        },
      ],
      notes: null,
      subtotalAmount: 30000,
      discountAmount: 0,
      taxRate: 0.08,
      taxAmount: 2400,
      finalAmount: 32400,
      paymentMethod: "Cash",
      transactionCode: null,
      printCount: 1,
      lastPrintedAt: "2026-06-26T04:05:00.000Z",
      lastPrintedBy: {
        _id: "staff-2",
        username: "staff.two",
        fullName: "Staff Two",
        role: "Staff",
      },
    });

    expect(result).toEqual({
      invoiceId: "invoice-2",
      invoiceNumber: "INV-20260626-5678",
      issuedAt: "2026-06-26T04:00:00.000Z",
      invoiceStatus: "Issued",
      staff: {
        _id: "staff-2",
        username: "staff.two",
        fullName: "Staff Two",
        role: "Staff",
      },
      lineItems: [
        {
          foodItemId: "food-2",
          name: "Tra dao",
          unitPrice: 30000,
          quantity: 1,
          lineTotal: 30000,
          note: null,
        },
      ],
      notes: null,
      subtotalAmount: 30000,
      discountAmount: 0,
      taxRate: 0.08,
      taxAmount: 2400,
      finalAmount: 32400,
      paymentMethod: "Cash",
      transactionCode: null,
      printCount: 1,
      lastPrintedAt: "2026-06-26T04:05:00.000Z",
      lastPrintedBy: {
        _id: "staff-2",
        username: "staff.two",
        fullName: "Staff Two",
        role: "Staff",
      },
    });
  });
});
