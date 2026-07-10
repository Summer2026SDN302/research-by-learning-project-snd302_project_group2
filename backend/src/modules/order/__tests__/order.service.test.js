import { beforeEach, describe, expect, it, vi } from "vitest";

import { USER_ROLES } from "../../user/user.constants.js";
import { ORDER_STATUS } from "../order.constants.js";
import * as dailyMenuRepository from "../../menu/daily-menu/daily-menu.repository.js";
import orderRepository from "../order.repository.js";
import orderService from "../order.service.js";

const { mockSession, mockStartSession } = vi.hoisted(() => ({
  mockSession: {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn(),
    abortTransaction: vi.fn(),
    endSession: vi.fn(),
  },
  mockStartSession: vi.fn(),
}));

vi.mock("mongoose", () => ({
  default: {
    startSession: mockStartSession,
  },
}));

vi.mock("../../../shared/helpers/transaction.helper.js", () => ({
  withTransaction: vi.fn(async (callback) => {
    const mongoose = await import("mongoose");
    const session = await mongoose.default.startSession();
    session.startTransaction();
    try {
      const result = await callback(session);
      await session.commitTransaction();
      return result;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }),
}));

vi.mock("../order.repository.js", () => ({
  default: {
    create: vi.fn(),
    findAll: vi.fn(),
    findById: vi.fn(),
    updateStatusById: vi.fn(),
  },
}));

vi.mock("../../menu/daily-menu/daily-menu.repository.js", () => ({
  findMenuByDate: vi.fn(),
  decrementSoldQuantity: vi.fn(),
}));

const buildOrder = (overrides = {}) => ({
  _id: "order-1",
  orderNumber: "ORD-20260706-1234",
  staffId: "staff-1",
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
      name: "Tra dao",
      unitPrice: 15000,
      quantity: 2,
      lineTotal: 30000,
    },
  ],
  subTotal: 62000,
  discountAmount: 9000,
  totalAmount: 62000,
  orderStatus: ORDER_STATUS.PENDING,
  orderDate: "2026-07-06T00:00:00.000Z",
  createdAt: "2026-07-06T01:00:00.000Z",
  updatedAt: "2026-07-06T01:00:00.000Z",
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
    mockStartSession.mockResolvedValue(mockSession);
  });

  it("creates an order using the zip flow and commits the transaction", async () => {
    const createdOrder = buildOrder();

    dailyMenuRepository.findMenuByDate.mockResolvedValue(buildDailyMenu());
    dailyMenuRepository.decrementSoldQuantity.mockResolvedValue(true);
    orderRepository.create.mockResolvedValue(createdOrder);

    const result = await orderService.createOrder(
      {
        items: [
          { foodItemId: "food-1", quantity: 1 },
          { foodItemId: "food-2", quantity: 2 },
        ],
      },
      "staff-1",
    );

    expect(mockStartSession).toHaveBeenCalledTimes(1);
    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(dailyMenuRepository.decrementSoldQuantity).toHaveBeenCalledTimes(2);
    expect(orderRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        staffId: "staff-1",
        subTotal: 57407.41,
        taxAmount: 4592.59,
        discountAmount: 9000,
        totalAmount: 62000,
        orderStatus: ORDER_STATUS.PENDING,
      }),
      mockSession,
    );
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.abortTransaction).not.toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
    expect(result).toMatchObject({
      orderNumber: "ORD-20260706-1234",
      totalAmount: 62000,
      orderStatus: ORDER_STATUS.PENDING,
    });
  });

  it("rolls back when order creation fails", async () => {
    dailyMenuRepository.findMenuByDate.mockResolvedValue(buildDailyMenu());
    dailyMenuRepository.decrementSoldQuantity.mockResolvedValue(true);
    orderRepository.create.mockRejectedValue(new Error("insert failed"));

    await expect(
      orderService.createOrder(
        {
          items: [{ foodItemId: "food-1", quantity: 1 }],
        },
        "staff-1",
      ),
    ).rejects.toThrow("insert failed");

    expect(mockSession.abortTransaction).toHaveBeenCalledTimes(1);
    expect(mockSession.commitTransaction).not.toHaveBeenCalled();
    expect(mockSession.endSession).toHaveBeenCalledTimes(1);
  });

  it("returns paginated orders from the repository", async () => {
    orderRepository.findAll.mockResolvedValue({
      items: [buildOrder()],
      total: 1,
    });

    const result = await orderService.getOrders({
      page: "2",
      limit: "5",
      orderStatus: ORDER_STATUS.PENDING,
      date: "2026-07-06",
    });

    expect(orderRepository.findAll).toHaveBeenCalledWith({
      staffId: undefined,
      orderStatus: ORDER_STATUS.PENDING,
      date: "2026-07-06",
      fromDate: undefined,
      toDate: undefined,
      page: 2,
      limit: 5,
    });
    expect(result.pagination).toMatchObject({
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
    });
  });

  it("blocks staff from reading another staff member's order", async () => {
    orderRepository.findById.mockResolvedValue(
      buildOrder({ staffId: { toString: () => "staff-2" } }),
    );

    await expect(
      orderService.getOrderById("order-1", "staff-1", USER_ROLES.STAFF),
    ).rejects.toMatchObject({
      statusCode: 403,
      code: "FORBIDDEN",
    });
  });

  it("updates status when the transition is valid", async () => {
    orderRepository.findById.mockResolvedValue(
      buildOrder({ orderStatus: ORDER_STATUS.PENDING }),
    );
    orderRepository.updateStatusById.mockResolvedValue(
      buildOrder({ orderStatus: ORDER_STATUS.CONFIRMED }),
    );

    const result = await orderService.updateOrderStatus(
      "order-1",
      ORDER_STATUS.CONFIRMED,
    );

    expect(orderRepository.updateStatusById).toHaveBeenCalledWith(
      "order-1",
      ORDER_STATUS.CONFIRMED,
    );
    expect(result.orderStatus).toBe(ORDER_STATUS.CONFIRMED);
  });
});
