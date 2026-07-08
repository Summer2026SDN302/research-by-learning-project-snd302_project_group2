import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../config/payos.js", () => ({
  default: {
    paymentRequests: {
      create: vi.fn(),
      get: vi.fn(),
    },
    webhooks: {
      verify: vi.fn(),
    },
  },
}));

import { ORDER_STATUS } from "../../order/order.constants.js";
import orderRepository from "../../order/order.repository.js";
import * as dailyMenuRepository from "../../menu/daily-menu/daily-menu.repository.js";
import { USER_ROLES } from "../../user/user.constants.js";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "../payment.constants.js";
import paymentRepository from "../payment.repository.js";
import paymentService from "../payment.service.js";

const { mockOrderFind, mockSession, mockWithTransaction } = vi.hoisted(() => ({
  mockOrderFind: vi.fn(),
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

vi.mock("../../order/order.model.js", () => ({
  default: {
    find: mockOrderFind,
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
    isTransactionCodeTaken: vi.fn(),
    findAll: vi.fn(),
  },
}));

vi.mock("../../../shared/helpers/transaction.helper.js", () => ({
  withTransaction: mockWithTransaction,
}));


const buildOrder = (overrides = {}) => {
  const orderObj = {
    _id: "order-1",
    orderNumber: "ORD-0001",
    staffId: "staff-1",
    orderStatus: ORDER_STATUS.PENDING,
    subTotal: 100000,
    discountAmount: 5000,
    totalAmount: 100000,
    items: [],
    save: vi.fn().mockResolvedValue(true),
    ...overrides,
  };
  return orderObj;
};

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
  paymentStatus: PAYMENT_STATUS.PAID,
  amountReceived: 102600,
  changeReturned: 0,
  transactionCode: null,
  printCount: 0,
  lastPrintedAt: null,
  lastPrintedBy: null,
  paidAt: "2026-06-26T01:00:00.000Z",
  failureReason: null,
  createdAt: "2026-06-26T01:00:00.000Z",
  updatedAt: "2026-06-26T01:00:00.000Z",
  ...overrides,
});

describe("paymentService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a paid payment during checkout", async () => {
    const createdOrder = buildOrder({
      _id: "order-checkout-1",
      orderNumber: "ORD-20260628-001",
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
        },
        {
          foodItemId: "food-2",
          name: "Com ga",
          unitPrice: 40000,
          quantity: 1,
          lineTotal: 40000,
        },
      ],
    });
    const createdPayment = buildPayment({
      _id: "payment-checkout-1",
      orderId: createdOrder._id,
      finalAmount: 77760,
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

    orderRepository.findById.mockResolvedValue(createdOrder);
    paymentRepository.isTransactionCodeTaken.mockResolvedValue(false);
    paymentRepository.create.mockResolvedValue(createdPayment);
    paymentRepository.findById.mockResolvedValue(hydratedPayment);

    const result = await paymentService.checkout(
      {
        orderId: createdOrder._id,
        paymentMethod: PAYMENT_METHOD.CASH,
        amountReceived: 80000,
      },
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(orderRepository.findById).toHaveBeenCalledWith(createdOrder._id);
    expect(createdOrder.save).toHaveBeenCalledWith({ session: mockSession });
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

  it("rejects duplicate transaction codes during checkout", async () => {
    const createdOrder = buildOrder({
      _id: "order-checkout-1",
      totalAmount: 100000,
    });
    orderRepository.findById.mockResolvedValue(createdOrder);
    paymentRepository.isTransactionCodeTaken.mockResolvedValue(true);

    await expect(
      paymentService.checkout(
        {
          orderId: createdOrder._id,
          paymentMethod: PAYMENT_METHOD.CARD,
          amountReceived: 0,
          transactionCode: "BANK-TXN-001",
        },
        "staff-1",
        USER_ROLES.STAFF,
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "PAYMENT_TRANSACTION_CODE_EXISTS",
    });

    expect(mockWithTransaction).not.toHaveBeenCalled();
  });

  it("builds receipt payloads directly from payment and order data", async () => {
    paymentRepository.findById.mockResolvedValue(
      buildPayment({
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

  it("blocks receipt access for unpaid transactions", async () => {
    paymentRepository.findById.mockResolvedValue(
      buildPayment({
        paymentStatus: PAYMENT_STATUS.PENDING,
        paidAt: null,
      }),
    );
    orderRepository.findById.mockResolvedValue(buildOrder());

    await expect(
      paymentService.getPaymentReceipt(
        "payment-1",
        "staff-1",
        USER_ROLES.STAFF,
      ),
    ).rejects.toMatchObject({
      statusCode: 400,
      code: "PAYMENT_RECEIPT_NOT_AVAILABLE",
    });
  });

  it("returns printable receipt data without mutating payment state", async () => {
    paymentRepository.findById.mockResolvedValue(
      buildPayment({
        paymentNumber: "PAY-20260626-9999",
      }),
    );
    orderRepository.findById.mockResolvedValue(
      buildOrder({
        orderNumber: "ORD-0009",
        items: [],
      }),
    );

    const result = await paymentService.printPaymentReceipt(
      "payment-1",
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(mockWithTransaction).not.toHaveBeenCalled();
    expect(result).toMatchObject({
      paymentId: "payment-1",
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

    expect(orderRepository.findIdsByOrderNumberKeyword).toHaveBeenCalledWith("ORD-0009");
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

  it("creates a pending payment and payos link during QR checkout", async () => {
    const createdOrder = buildOrder({
      _id: "order-checkout-qr",
      orderNumber: "ORD-20260628-002",
      totalAmount: 150000,
    });
    const createdPayment = buildPayment({
      _id: "payment-checkout-qr",
      orderId: createdOrder._id,
      finalAmount: 150000,
      paymentMethod: PAYMENT_METHOD.QR,
      paymentStatus: PAYMENT_STATUS.PENDING,
    });

    const payosMock = (await import("../../../config/payos.js")).default;
    payosMock.paymentRequests.create.mockResolvedValue({
      checkoutUrl: "https://checkout.payos.vn/payment-link-123",
    });

    orderRepository.findById.mockResolvedValue(createdOrder);
    paymentRepository.create.mockResolvedValue(createdPayment);
    paymentRepository.findById.mockResolvedValue(createdPayment);

    const result = await paymentService.checkout(
      {
        orderId: createdOrder._id,
        paymentMethod: PAYMENT_METHOD.QR,
      },
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(payosMock.paymentRequests.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderCode: 20260628002,
        amount: 150000,
      })
    );
    expect(paymentRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: createdOrder._id,
        paymentStatus: PAYMENT_STATUS.PENDING,
      }),
      mockSession,
    );
    expect(result).toMatchObject({
      _id: "payment-checkout-qr",
      checkoutUrl: "https://checkout.payos.vn/payment-link-123",
    });
  });
});
