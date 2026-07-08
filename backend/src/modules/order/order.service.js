import mongoose from "mongoose";
import AppError from "../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";
import { parsePagination } from "../../shared/helpers/query.helper.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import { getTodayVNDateString } from "../../shared/helpers/date.helper.js";
import { withTransaction } from "../../shared/helpers/transaction.helper.js";
import orderRepository from "./order.repository.js";
import { toOrderResponse } from "./order.dto.js";
import { ORDER_STATUS, VALID_STATUS_TRANSITIONS } from "./order.constants.js";
import { USER_ROLES } from "../user/user.constants.js";

// Helpers

const generateOrderNumber = () => {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
};

const getOrderOrThrow = async (id) => {
  const order = await orderRepository.findById(id);
  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }
  return order;
};

/**
 * Calculates pricing subtotal, discounts and final total.
 *
 * @param {Array<{menuItem: Object, requestedQty: number}>} lineItems
 * @returns {{
 *   orderItems: Array,
 *   subTotal: number,
 *   discountAmount: number,
 *   totalAmount: number
 * }}
 */
const calculateOrderPricing = (lineItems) => {
  let subTotal = 0;
  let discountAmount = 0;

  const orderItems = lineItems.map(({ menuItem, requestedQty }) => {
    const unitPrice = menuItem.currentPrice;
    const lineTotal = unitPrice * requestedQty;
    const discount =
      (menuItem.originalPrice - menuItem.currentPrice) * requestedQty;

    subTotal += lineTotal;
    discountAmount += discount;

    return {
      foodItemId: menuItem.foodItemId._id,
      name: menuItem.foodItemId.name,
      unitPrice,
      quantity: requestedQty,
      lineTotal,
    };
  });

  const totalAmount = Math.round(subTotal * 100) / 100;

  return {
    orderItems,
    subTotal: Math.round(subTotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalAmount,
  };
};

const orderService = {
  async createOrder(body, staffId) {
    const todayStr = getTodayVNDateString();
    const seen = new Set();
    for (const item of body.items) {
      if (seen.has(item.foodItemId)) {
        throw new AppError(
          "Duplicate food item in order",
          400,
          "DUPLICATE_ITEM",
        );
      }
      seen.add(item.foodItemId);
    }

    const dailyMenu = await dailyMenuRepository.findMenuByDate(todayStr);

    if (!dailyMenu || !dailyMenu.isConfigured) {
      throw new AppError(
        "Daily menu not found or not configured for today",
        404,
        "DAILY_MENU_NOT_FOUND",
      );
    }

    const menuItemMap = {};
    for (const item of dailyMenu.items) {
      menuItemMap[item.foodItemId._id.toString()] = item;
    }

    const lineItems = [];

    for (const requested of body.items) {
      const menuItem = menuItemMap[requested.foodItemId];

      if (!menuItem) {
        throw new AppError(
          `Food item ${requested.foodItemId} is not in today's menu`,
          400,
          "ITEM_NOT_IN_MENU",
        );
      }

      if (menuItem.status !== "Available") {
        throw new AppError(
          `Food item "${menuItem.foodItemId.name}" is unavailable`,
          400,
          "ITEM_UNAVAILABLE",
        );
      }

      if (menuItem.remainingQuantity < requested.quantity) {
        throw new AppError(
          `Insufficient quantity for item "${menuItem.foodItemId.name}"`,
          400,
          "INSUFFICIENT_QUANTITY",
        );
      }

      lineItems.push({ menuItem, requestedQty: requested.quantity });
    }

    const { orderItems, subTotal, discountAmount, totalAmount } =
      calculateOrderPricing(lineItems);

    return withTransaction(async (session) => {
      await Promise.all(
        body.items.map(({ foodItemId, quantity }) =>
          dailyMenuRepository.decrementSoldQuantity(
            dailyMenu._id,
            foodItemId,
            quantity,
            session,
          ),
        ),
      );

      const order = await orderRepository.create(
        {
          orderNumber: generateOrderNumber(),
          staffId,
          items: orderItems,
          subTotal,
          discountAmount,
          totalAmount,
          orderStatus: ORDER_STATUS.PENDING,
          orderDate: new Date(todayStr),
        },
        session,
      );

      return toOrderResponse(order);
    });
  },

  async getOrders(query) {
    const { page, limit } = parsePagination(query);
    const { orderStatus, date, staffId, fromDate, toDate } = query;

    const { items, total } = await orderRepository.findAll({
      staffId,
      orderStatus,
      date,
      fromDate,
      toDate,
      page,
      limit,
    });

    return {
      items: items.map(toOrderResponse),
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  },

  async getOrderById(id, requestingUserId, requestingRole) {
    const order = await getOrderOrThrow(id);

    // Staff chi duoc xem order cua chinh minh
    if (
      requestingRole === USER_ROLES.STAFF &&
      order.staffId.toString() !== requestingUserId
    ) {
      throw new AppError(
        "You do not have permission to view this order",
        403,
        "FORBIDDEN",
      );
    }

    return toOrderResponse(order);
  },

  async updateOrderStatus(id, newStatus, requestingUserId, requestingRole) {
    const order = await getOrderOrThrow(id);
    const currentStatus = order.orderStatus;

    if (
      requestingRole === USER_ROLES.STAFF &&
      order.staffId.toString() !== requestingUserId
    ) {
      throw new AppError(
        "You do not have permission to modify this order",
        403,
        "FORBIDDEN",
      );
    }

    const allowedNext = VALID_STATUS_TRANSITIONS[currentStatus] ?? [];

    if (!allowedNext.includes(newStatus)) {
      throw new AppError(
        `Cannot transition order from "${currentStatus}" to "${newStatus}"`,
        400,
        "INVALID_STATUS_TRANSITION",
      );
    }

    const updated = await orderRepository.updateStatusById(id, newStatus);
    return toOrderResponse(updated);
  },
};

export default orderService;
