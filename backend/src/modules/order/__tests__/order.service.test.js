import { beforeEach, describe, expect, it, vi } from "vitest";

import * as dailyMenuRepository from "../../menu/daily-menu/daily-menu.repository.js";
import { withTransaction } from "../../../shared/helpers/transaction.helper.js";
import { USER_ROLES } from "../../user/user.constants.js";
import {
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
} from "../order.constants.js";
import paymentRepository from "../../payment/payment.repository.js";
import orderRepository from "../order.repository.js";
import orderService from "../order.service.js";

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

vi.mock("../order.repository.js", () => ({
  default: {
    findById: vi.fn(),
    updateById: vi.fn(),
    create: vi.fn(),
    findAll: vi.fn(),
    updateStatusById: vi.fn(),
  },
}));

vi.mock("../../menu/daily-menu/daily-menu.repository.js", () => ({
  findMenuByDate: vi.fn(),
  adjustSoldQuantity: vi.fn(),
  decrementSoldQuantity: vi.fn(),
}));

vi.mock("../../../shared/helpers/transaction.helper.js", () => ({
  withTransaction: mockWithTransaction,
}));

vi.mock("../../payment/payment.repository.js", () => ({
  default: {
    findLatestByOrderId: vi.fn(),
    findLatestByOrderIds: vi.fn(),
  },
}));

const buildOrder = (overrides = {}) => ({
  _id: "order-1",
  orderNumber: "ORD-0001",
  staffId: "staff-1",
  items: [
    {
      foodItemId: "food-1",
      name: "Pho",
      unitPrice: 30000,
      quantity: 2,
      lineTotal: 60000,
      note: null,
    },
    {
      foodItemId: "food-2",
      name: "Cha gio",
      unitPrice: 20000,
      quantity: 1,
      lineTotal: 20000,
      note: null,
    },
  ],
  notes: "Ban 1",
  subTotal: 80000,
  discountAmount: 0,
  taxRate: 0.08,
  taxAmount: 6400,
  totalAmount: 86400,
  orderStatus: ORDER_STATUS.PENDING,
  paymentStatus: ORDER_PAYMENT_STATUS.UNPAID,
  orderDate: "2026-06-26T00:00:00.000Z",
  createdAt: "2026-06-26T01:00:00.000Z",
  updatedAt: "2026-06-26T01:00:00.000Z",
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
        name: "Cha gio",
      },
      currentPrice: 20000,
      originalPrice: 20000,
      remainingQuantity: 5,
      status: "Unavailable",
    },
    {
      foodItemId: {
        _id: "food-3",
        name: "Tra dao",
      },
      currentPrice: 15000,
      originalPrice: 18000,
      remainingQuantity: 4,
      status: "Available",
    },
  ],
});

describe("orderService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates an order and reserves menu quantities", async () => {
    const createdOrder = buildOrder({
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
          foodItemId: "food-3",
          name: "Tra dao",
          unitPrice: 15000,
          quantity: 2,
          lineTotal: 30000,
          note: "It da",
        },
      ],
      notes: "Mang di",
      subTotal: 62000,
      discountAmount: 9000,
      taxAmount: 4960,
      totalAmount: 66960,
    });

    dailyMenuRepository.findMenuByDate.mockResolvedValue(buildDailyMenu());
    dailyMenuRepository.decrementSoldQuantity.mockResolvedValue(true);
    orderRepository.create.mockResolvedValue(createdOrder);

    const result = await orderService.createOrder(
      {
        items: [
          { foodItemId: "food-1", quantity: 1 },
          { foodItemId: "food-3", quantity: 2, note: "It da" },
        ],
        notes: "Mang di",
      },
      "staff-1",
    );

    expect(withTransaction).toHaveBeenCalledTimes(1);
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
      "food-3",
      2,
      mockSession,
    );
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: "staff-1",
        notes: "Mang di",
        subTotal: 62000,
        discountAmount: 9000,
        taxAmount: 4960,
        totalAmount: 66960,
      }),
      mockSession,
    );
    expect(result).toMatchObject({
      orderNumber: "ORD-0001",
      paymentStatus: ORDER_PAYMENT_STATUS.UNPAID,
      totalAmount: 66960,
    });
  });

  it("reserves menu quantities sequentially during order creation", async () => {
    const createdOrder = buildOrder({
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
          foodItemId: "food-3",
          name: "Tra dao",
          unitPrice: 15000,
          quantity: 1,
          lineTotal: 15000,
          note: null,
        },
      ],
      subTotal: 47000,
      discountAmount: 6000,
      taxAmount: 3760,
      totalAmount: 50760,
    });

    let inFlight = false;

    dailyMenuRepository.findMenuByDate.mockResolvedValue(buildDailyMenu());
    dailyMenuRepository.decrementSoldQuantity.mockImplementation(async () => {
      if (inFlight) {
        throw new Error("parallel-session-operations");
      }

      inFlight = true;
      await Promise.resolve();
      inFlight = false;

      return true;
    });
    orderRepository.create.mockResolvedValue(createdOrder);

    await expect(
      orderService.createOrder(
        {
          items: [
            { foodItemId: "food-1", quantity: 1 },
            { foodItemId: "food-3", quantity: 1 },
          ],
        },
        "staff-1",
      ),
    ).resolves.toMatchObject({
      totalAmount: 50760,
    });

    expect(dailyMenuRepository.decrementSoldQuantity).toHaveBeenCalledTimes(2);
  });

  it("updates an unpaid pending order and adjusts stock deltas", async () => {
    const existingOrder = buildOrder();
    const updatedOrder = buildOrder({
      notes: "Ban 9",
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
          name: "Cha gio",
          unitPrice: 20000,
          quantity: 1,
          lineTotal: 20000,
          note: null,
        },
        {
          foodItemId: "food-3",
          name: "Tra dao",
          unitPrice: 15000,
          quantity: 2,
          lineTotal: 30000,
          note: null,
        },
      ],
      subTotal: 82000,
      discountAmount: 9000,
      taxAmount: 6560,
      totalAmount: 88560,
    });

    orderRepository.findById.mockResolvedValue(existingOrder);
    paymentRepository.findLatestByOrderId.mockResolvedValue(null);
    dailyMenuRepository.findMenuByDate.mockResolvedValue(buildDailyMenu());
    dailyMenuRepository.adjustSoldQuantity.mockResolvedValue(true);
    orderRepository.updateById.mockResolvedValue(updatedOrder);

    const result = await orderService.updateOrderItems(
      "order-1",
      {
        items: [
          { foodItemId: "food-1", quantity: 1 },
          { foodItemId: "food-2", quantity: 1 },
          { foodItemId: "food-3", quantity: 2 },
        ],
        notes: "Ban 9",
      },
      "staff-1",
      USER_ROLES.STAFF,
    );

    expect(dailyMenuRepository.findMenuByDate).toHaveBeenCalledWith("2026-06-26");
    expect(dailyMenuRepository.adjustSoldQuantity).toHaveBeenNthCalledWith(
      1,
      "menu-1",
      "food-1",
      -1,
      mockSession,
    );
    expect(dailyMenuRepository.adjustSoldQuantity).toHaveBeenNthCalledWith(
      2,
      "menu-1",
      "food-3",
      2,
      mockSession,
    );
    expect(orderRepository.updateById).toHaveBeenCalledWith(
      "order-1",
      expect.objectContaining({
        notes: "Ban 9",
        subTotal: 82000,
        discountAmount: 9000,
        taxAmount: 6560,
        totalAmount: 88560,
      }),
      mockSession,
    );
    expect(withTransaction).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      _id: "order-1",
      orderNumber: "ORD-0001",
      paymentStatus: ORDER_PAYMENT_STATUS.UNPAID,
      orderStatus: ORDER_STATUS.PENDING,
      totalAmount: 88560,
    });
  });

  it("rejects editing once payment has already started", async () => {
    orderRepository.findById.mockResolvedValue(buildOrder());
    paymentRepository.findLatestByOrderId.mockResolvedValue({
      _id: "payment-1",
      paymentStatus: ORDER_PAYMENT_STATUS.PENDING,
    });

    await expect(
      orderService.updateOrderItems(
        "order-1",
        {
          items: [{ foodItemId: "food-1", quantity: 1 }],
          notes: null,
        },
        "staff-1",
        USER_ROLES.STAFF,
      ),
    ).rejects.toMatchObject({
      statusCode: 409,
      code: "ORDER_NOT_EDITABLE",
    });

    expect(dailyMenuRepository.findMenuByDate).not.toHaveBeenCalled();
    expect(withTransaction).not.toHaveBeenCalled();
  });
});
