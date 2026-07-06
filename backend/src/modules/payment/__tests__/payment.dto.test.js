import { describe, expect, it } from "vitest";

import {
  toPaymentListItem,
  toPaymentReceiptResponse,
  toPaymentResponse,
} from "../payment.dto.js";

describe("payment.dto", () => {
  it("maps list items with top-level print audit data", () => {
    const result = toPaymentListItem({
      _id: "pay-1",
      paymentNumber: "PAY-20260626-1234",
      orderId: {
        _id: "order-1",
        orderNumber: "ORD-0001",
        staffId: "staff-1",
      },
      paymentMethod: "QR",
      paymentStatus: "Paid",
      finalAmount: 125000,
      transactionCode: "TXN-123",
      printCount: 2,
      lastPrintedAt: "2026-06-26T02:00:00.000Z",
      paidAt: "2026-06-26T01:30:00.000Z",
      createdAt: "2026-06-26T01:00:00.000Z",
    });

    expect(result).toEqual({
      _id: "pay-1",
      paymentNumber: "PAY-20260626-1234",
      orderId: {
        _id: "order-1",
        orderNumber: "ORD-0001",
        staffId: "staff-1",
      },
      paymentMethod: "QR",
      paymentStatus: "Paid",
      finalAmount: 125000,
      transactionCode: "TXN-123",
      printCount: 2,
      lastPrintedAt: "2026-06-26T02:00:00.000Z",
      paidAt: "2026-06-26T01:30:00.000Z",
      createdAt: "2026-06-26T01:00:00.000Z",
    });
  });

  it("maps payment detail responses without legacy audit payloads", () => {
    const payment = {
      _id: "pay-2",
      paymentNumber: "PAY-20260626-5678",
      orderId: {
        _id: "order-2",
        orderNumber: "ORD-0002",
        staffId: {
          _id: "staff-2",
          username: "staff.two",
          fullName: "Staff Two",
          role: "Staff",
        },
        paymentStatus: "Paid",
      },
      subtotalAmount: 100000,
      discountAmount: 5000,
      taxRate: 0.08,
      taxAmount: 7600,
      finalAmount: 102600,
      paymentMethod: "Cash",
      amountReceived: 110000,
      changeReturned: 7400,
      transactionCode: null,
      paymentStatus: "Paid",
      initiatedBy: {
        _id: "manager-1",
        username: "manager.one",
        fullName: "Manager One",
        role: "Manager",
      },
      confirmedBy: {
        _id: "cashier-1",
        username: "cashier.one",
        fullName: "Cashier One",
        role: "Staff",
      },
      printCount: 1,
      lastPrintedAt: "2026-06-26T03:15:00.000Z",
      lastPrintedBy: {
        _id: "cashier-1",
        username: "cashier.one",
        fullName: "Cashier One",
        role: "Staff",
      },
      paidAt: "2026-06-26T03:00:00.000Z",
      failureReason: null,
      createdAt: "2026-06-26T02:45:00.000Z",
      updatedAt: "2026-06-26T03:15:00.000Z",
    };

    expect(toPaymentResponse(payment)).toMatchObject({
      _id: "pay-2",
      printCount: 1,
      lastPrintedAt: "2026-06-26T03:15:00.000Z",
      lastPrintedBy: {
        _id: "cashier-1",
        username: "cashier.one",
        fullName: "Cashier One",
        role: "Staff",
      },
    });
  });

  it("builds receipt payloads from payment and order data", () => {
    const result = toPaymentReceiptResponse(
      {
        _id: "pay-3",
        paymentNumber: "PAY-20260626-7777",
        paymentMethod: "Cash",
        amountReceived: 120000,
        changeReturned: 17400,
        transactionCode: null,
        paymentStatus: "Paid",
        subtotalAmount: 95000,
        discountAmount: 5000,
        taxRate: 0.08,
        taxAmount: 7600,
        finalAmount: 102600,
        printCount: 1,
        lastPrintedAt: "2026-06-26T06:00:00.000Z",
        lastPrintedBy: {
          _id: "staff-3",
          username: "staff.three",
          fullName: "Staff Three",
          role: "Staff",
        },
        paidAt: "2026-06-26T05:30:00.000Z",
      },
      {
        _id: "order-3",
        orderNumber: "ORD-0003",
        staffId: {
          _id: "staff-9",
          username: "staff.nine",
          fullName: "Staff Nine",
          role: "Staff",
        },
        items: [
          {
            foodItemId: "food-1",
            name: "Pho",
            unitPrice: 45000,
            quantity: 2,
            lineTotal: 90000,
            note: "Khong hanh",
          },
        ],
        notes: "Mang di",
        subTotal: 95000,
        discountAmount: 5000,
        taxRate: 0.08,
        taxAmount: 7600,
      },
    );

    expect(result).toEqual({
      paymentId: "pay-3",
      paymentNumber: "PAY-20260626-7777",
      orderId: "order-3",
      orderNumber: "ORD-0003",
      issuedAt: "2026-06-26T05:30:00.000Z",
      paymentStatus: "Paid",
      staff: {
        _id: "staff-9",
        username: "staff.nine",
        fullName: "Staff Nine",
        role: "Staff",
      },
      lineItems: [
        {
          foodItemId: "food-1",
          name: "Pho",
          unitPrice: 45000,
          quantity: 2,
          lineTotal: 90000,
          note: "Khong hanh",
        },
      ],
      notes: "Mang di",
      subtotalAmount: 95000,
      discountAmount: 5000,
      taxRate: 0.08,
      taxAmount: 7600,
      finalAmount: 102600,
      paymentMethod: "Cash",
      amountReceived: 120000,
      changeReturned: 17400,
      transactionCode: null,
      printCount: 1,
      lastPrintedAt: "2026-06-26T06:00:00.000Z",
      lastPrintedBy: {
        _id: "staff-3",
        username: "staff.three",
        fullName: "Staff Three",
        role: "Staff",
      },
    });
  });
});
