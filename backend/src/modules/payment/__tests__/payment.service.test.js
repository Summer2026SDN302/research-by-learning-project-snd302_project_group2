import { beforeEach, describe, expect, it, vi } from "vitest";

import { ORDER_PAYMENT_STATUS, ORDER_STATUS } from "../../order/order.constants.js";
import orderRepository from "../../order/order.repository.js";
import * as dailyMenuRepository from "../../menu/daily-menu/daily-menu.repository.js";
import { USER_ROLES } from "../../user/user.constants.js";
import { withTransaction } from "../../../shared/helpers/transaction.helper.js";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../payment.constants.js";
import paymentRepository from "../payment.repository.js";
import paymentService from "../payment.service.js";

const { mockSession, mockWithTransaction } = vi.hoisted(() => ({
  mockSession: {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    abortTransaction: vi.fn(),
    endSession: vi.fn(),
  },
  mockWithTransaction: vi.fn(async (callback) => {
    mockSession.startTransaction();
    try {
      const result = await callback(mockSession);
      await mockSession.commitTransaction();
      return result;
    } catch (error) {
      await mockSession.abortTransaction();
      throw error;
    } finally {
      mockSession.endSession();
    }
  }),
}));

vi.mock("../../order/order.repository.js", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findIdsByOrderNumberKeyword: vi.fn(),
  },
}));

vi.mock("../../menu/daily-menu/daily-menu.repository.js", () => ({
  findMenuByDate: vi.fn(),
  decrementSoldQuantity: vi.fn(),
}));

vi.mock("../payment.repository.js", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    findLatestByOrderId: vi.fn(),
    findPendingByOrderId: vi.fn(),
    isTransactionCodeTaken: vi.fn(),
    updateById: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock("../../../shared/helpers/transaction.helper.js", () => ({
  withTransaction: mockWithTransaction,
}));

const buildOrder = (overrides = {}) => ({
  _id: "order-1",
  orderNumber: "ORD-0001",
  staffId: "staff-1",
  orderStatus: ORDER_STATUS.PENDING,
  subTotal: 100000,
  discountAmount: 5000,
  taxRate: 0.08,
  taxAmount: 7600,
  totalAmount: 102600,
  items: [],
  notes: null,
  ...overrides,
});

const buildDailyMenu = () => ({
  _id: "menu-1",
  isConfigured: true,
  items: [
    {
      foodItemId: {
        _id: "food-1",
        name: "Pho",
      },
      currentPrice: 32000,
      originalPrice: 35000,
      remainingQuantity: 10,
      status: "Available",
    },
    {
      foodItemId: {
        _id: "food-2",
        name: "Com ga",
      },
      currentPrice: 40000,
      originalPrice: 40000,
      remainingQuantity: 8,
      status: "Available",
    },
  ],
});

const buildPayment = (overrides = {}) => ({
  _id: "payment-1",
  paymentNumber: "PAY-20260626-1234",
  orderId: "order-1",
  finalAmount: 102600,
  paymentMethod: PAYMENT_METHOD.CASH,
  paymentStatus: PAYMENT_STATUS.PENDING,
  amountReceived: 102600,
  changeReturned: 0,
  transactionCode: null,
  printCount: 0,
  lastPrintedAt: null,
  lastPrintedBy: null,
  paidAt: null,
  failureReason: null,
  createdAt: "2026-06-26T01:00:00.000Z",
  updatedAt: "2026-06-26T01:00:00.000Z",
  auditTrail: [],
  ...overrides,
});

describe("paymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks initiating a payment when another pending payment already exists", async () => {
    orderRepository.findById.mockResolvedValue(buildOrder());
    paymentRepository.findLatestByOrderId.mockResolvedValue(
      buildPayment({ _id: "payment-older" }),
    );

    await expect(
      paymentService.initiatePayment(
        {
          orderId: "order-1",
          paymentMethod: PAYMENT_METHOD.CASH,
          amountReceived: 105000,
        },
        "staff-1",
        USER_ROLES.STAFF,
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "PAYMENT_IN_PROGRESS",
    });

    expect(paymentRepository.create).not.toHaveBeenCalled();
  });

  it("creates a completed paid order and payment during checkout", async () => {
    const createdOrder = buildOrder({
      _id: "order-checkout-1",
      orderNumber: "ORD-20260628-001",
      orderStatus: ORDER_STATUS.COMPLETED,
      subTotal: 72000,
      discountAmount: 3000,
      taxAmount: 5760,
      totalAmount: 77760,
      items: [
        {
          foodItemId: "food-1",
          name: "Pho",
          unitPrice: 32000,
          quantity: 1,
          lineTotal: 32000,
          note: null,
        },
        {
          foodItemId: "food-2",
          name: "Com ga",
          unitPrice: 40000,
          quantity: 1,
          lineTotal: 40000,
          note: null,
        },
      ],
      notes: "Mang di",
    });
    const createdPayment = buildPayment({
      _id: "payment-checkout-1",
      orderId: createdOrder._id,
      paymentStatus: PAYMENT_STATUS.PAID,
      amountReceived: 80000,
      changeReturned: 2240,
      paidAt: "2026-06-28T09:00:00.000Z",
    });
    const hydratedPayment = {
      ...createdPayment,
      orderId: {
        _id: createdOrder._id,
        orderNumber: createdOrder.orderNumber,
        staffId: "staff-1",
      },
    };

    dailyMenuRepository.findMenuByDate.mockResolvedValue(buildDailyMenu());
    dailyMenuRepository.decrementSoldQuantity.mockResolvedValue(true);
    orderRepository.create.mockResolvedValue(createdOrder);
    paymentRepository.isTransactionCodeTaken.mockResolvedValue(false);
    paymentRepository.create.mockResolvedValue(createdPayment);
    paymentRepository.findById.mockResolvedValue(hydratedPayment);

    const result = await paymentService.checkout(
      {
        items: [
          { foodItemId: "food-1", quantity: 1 },
          { foodItemId: "food-2", quantity: 1 },
        ],
        notes: "Mang di",
        paymentMethod: PAYMENT_METHOD.CASH,
        amountReceived: 80000,
      },
      "staff-1",
    );

    expect(dailyMenuRepository.decrementSoldQuantity).toHaveBeenNthCalledWith(
      1,
      "menu-1",
      "food-1",
      1,
      mockSession,
    );
    expect(dailyMenuRepository.decrementSoldQuantity).toHaveBeenNthCalledWith(
      2,
      "menu-1",
      "food-2",
      1,
      mockSession,
    );
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderStatus: ORDER_STATUS.COMPLETED,
        notes: "Mang di",
        totalAmount: 77760,
      }),
      mockSession,
    );
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: createdOrder._id,
        finalAmount: 77760,
        paymentStatus: PAYMENT_STATUS.PAID,
      }),
      mockSession,
    );
    expect(result).toMatchObject({
      _id: "payment-checkout-1",
      orderId: {
        _id: "order-checkout-1",
        orderNumber: "ORD-20260628-001",
      },
      paymentStatus: PAYMENT_STATUS.PAID,
    });
  });

  it("does not reserve transaction codes during payment initiation", async () => {
    const createdPayment = buildPayment({
      paymentMethod: PAYMENT_METHOD.QR,
      transactionCode: null,
    });

    orderRepository.findById.mockResolvedValue(buildOrder());
    paymentRepository.findLatestByOrderId.mockResolvedValue(null);
    paymentRepository.create.mockResolvedValue(createdPayment);
    paymentRepository.findById.mockResolvedValue(createdPayment);

    const result = await paymentService.initiatePayment(
      {
        orderId: "order-1",
        paymentMethod: PAYMENT_METHOD.QR,
        amountReceived: 0,
        transactionCode: "BANK-TXN-001",
      },
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(paymentRepository.isTransactionCodeTaken).not.toHaveBeenCalled();
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        paymentMethod: PAYMENT_METHOD.QR,
        transactionCode: null,
      }),
      mockSession,
    );
    expect(result.transactionCode).toBeNull();
  });

  it("rejects duplicate transaction codes during confirmation", async () => {
    paymentRepository.findById.mockResolvedValue(buildPayment());
    orderRepository.findById.mockResolvedValue(
      buildOrder({ paymentStatus: ORDER_PAYMENT_STATUS.PENDING }),
    );
    paymentRepository.isTransactionCodeTaken.mockResolvedValue(true);

    await expect(
      paymentService.confirmPayment(
        "payment-1",
        {
          amountReceived: 105000,
          transactionCode: "TXN-001",
        },
        "staff-1",
        USER_ROLES.STAFF,
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "PAYMENT_TRANSACTION_CODE_EXISTS",
    });

    expect(withTransaction).not.toHaveBeenCalled();
  });

  it("rejects insufficient cash during confirmation", async () => {
    paymentRepository.findById.mockResolvedValue(buildPayment());
    orderRepository.findById.mockResolvedValue(
      buildOrder({ paymentStatus: ORDER_PAYMENT_STATUS.PENDING }),
    );
    paymentRepository.isTransactionCodeTaken.mockResolvedValue(false);

    await expect(
      paymentService.confirmPayment(
        "payment-1",
        {
          amountReceived: 100000,
        },
        "staff-1",
        USER_ROLES.STAFF,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "INSUFFICIENT_CASH_RECEIVED",
    });

    expect(withTransaction).not.toHaveBeenCalled();
  });

  it("calculates cash change and marks the payment as paid when confirmation succeeds", async () => {
    const pendingPayment = buildPayment();
    const payableOrder = buildOrder({ paymentStatus: ORDER_PAYMENT_STATUS.PENDING });
    const finalPayment = buildPayment({
      paymentStatus: PAYMENT_STATUS.PAID,
      amountReceived: 110000,
      changeReturned: 7400,
      paidAt: "2026-06-26T02:00:00.000Z",
      orderId: {
        _id: "order-1",
        orderNumber: "ORD-0001",
        staffId: "staff-1",
      },
    });

    paymentRepository.findById
      .mockResolvedValueOnce(pendingPayment)
      .mockResolvedValueOnce(finalPayment);
    orderRepository.findById.mockResolvedValue(payableOrder);
    paymentRepository.isTransactionCodeTaken.mockResolvedValue(false);
    paymentRepository.updateById.mockResolvedValue(finalPayment);

    const result = await paymentService.confirmPayment(
      "payment-1",
      {
        amountReceived: 110000,
      },
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(paymentRepository.updateById).toHaveBeenCalledWith(
      "payment-1",
      expect.objectContaining({
        amountReceived: 110000,
        changeReturned: 7400,
        paymentStatus: PAYMENT_STATUS.PAID,
      }),
      mockSession,
    );
    expect(withTransaction).toHaveBeenCalledTimes(1);
    expect(result.changeReturned).toBe(7400);
    expect(result.printCount).toBe(0);
  });

  it("builds receipt payloads directly from payment and order data", async () => {
    paymentRepository.findById.mockResolvedValue(
      buildPayment({
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentNumber: "PAY-20260626-8888",
        paidAt: "2026-06-26T06:00:00.000Z",
      }),
    );
    orderRepository.findById.mockResolvedValue(
      buildOrder({
        orderNumber: "ORD-0008",
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
      }),
    );

    const result = await paymentService.getPaymentReceipt(
      "payment-1",
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(result).toMatchObject({
      paymentId: "payment-1",
      paymentNumber: "PAY-20260626-8888",
      orderNumber: "ORD-0008",
      notes: "Mang di",
      paymentStatus: PAYMENT_STATUS.PAID,
      lineItems: [
        expect.objectContaining({
          name: "Pho",
          lineTotal: 90000,
        }),
      ],
    });
  });

  it("updates print audit on payment receipts", async () => {
    const paidPayment = buildPayment({
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentNumber: "PAY-20260626-9999",
    });
    const order = buildOrder({
      orderNumber: "ORD-0009",
      items: [],
    });
    const printedPayment = buildPayment({
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentNumber: "PAY-20260626-9999",
      printCount: 1,
      lastPrintedAt: "2026-06-26T07:00:00.000Z",
      lastPrintedBy: {
        _id: "staff-1",
        username: "staff.one",
        fullName: "Staff One",
        role: "Staff",
      },
    });

    paymentRepository.findById.mockResolvedValue(paidPayment);
    orderRepository.findById.mockResolvedValue(order);

    const result = await paymentService.printPaymentReceipt(
      "payment-1",
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(withTransaction).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      paymentId: "payment-1",
      printCount: 0,
      lastPrintedAt: null,
    });
  });

  it("builds payment list queries with trimmed search and mapped list items", async () => {
    orderRepository.findIdsByOrderNumberKeyword.mockResolvedValue(["order-9"]);
    paymentRepository.findAll.mockResolvedValue({
      items: [
        {
          _id: "payment-9",
          paymentNumber: "PAY-20260626-9999",
          orderId: {
            _id: "order-9",
            orderNumber: "ORD-0009",
            staffId: "staff-9",
          },
          paymentMethod: PAYMENT_METHOD.QR,
          paymentStatus: PAYMENT_STATUS.PAID,
          finalAmount: 88000,
          transactionCode: "TXN-999",
          printCount: 3,
          lastPrintedAt: "2026-06-26T05:00:00.000Z",
          paidAt: "2026-06-26T04:30:00.000Z",
          createdAt: "2026-06-26T04:00:00.000Z",
        },
      ],
      total: 1,
    });

    const result = await paymentService.getPayments({
      search: "  ORD-0009  ",
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentMethod: PAYMENT_METHOD.QR,
      page: "2",
      limit: "5",
    });

    expect(orderRepository.findIdsByOrderNumberKeyword).toHaveBeenCalledWith(
      "ORD-0009",
    );
    expect(paymentRepository.findAll).toHaveBeenCalledWith({
      searchKeyword: "ORD-0009",
      matchingOrderIds: ["order-9"],
      paymentStatus: PAYMENT_STATUS.PAID,
      paymentMethod: PAYMENT_METHOD.QR,
      page: 2,
      limit: 5,
    });
    expect(result).toEqual({
      items: [
        expect.objectContaining({
          paymentNumber: "PAY-20260626-9999",
          printCount: 3,
          lastPrintedAt: "2026-06-26T05:00:00.000Z",
        }),
      ],
      pagination: {
        page: 2,
        limit: 5,
        total: 1,
        totalPages: 1,
      },
    });
  });
});
