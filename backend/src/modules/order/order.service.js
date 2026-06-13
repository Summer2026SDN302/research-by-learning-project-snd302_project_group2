import AppError from "../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";
import { parsePagination } from "../../shared/helpers/query.helper.js";
import dailyMenuRepository from "../menu/daily_menu/daily_menu.repository.js";
import orderRepository from "./order.repository.js";
import { toOrderResponse } from "./order.dto.js";
import { USER_ROLES } from "../user/user.constants.js";
import { VALID_STATUS_TRANSITIONS } from "./order.constants.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getTodayDateString = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const generateOrderNumber = () => {
  const dateStr = getTodayDateString().replace(/-/g, "");
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

// ─── Service ──────────────────────────────────────────────────────────────────

const orderService = {
  async createOrder(body, staffId) {
    const today = getTodayDateString();
    const dailyMenu = await dailyMenuRepository.findByDate(today);

    if (!dailyMenu || !dailyMenu.isConfigured) {
      throw new AppError(
        "Daily menu not found or not configured for today",
        404,
        "DAILY_MENU_NOT_FOUND",
      );
    }

    // Build a lookup map for daily menu items
    const menuItemMap = {};
    for (const item of dailyMenu.items) {
      menuItemMap[item.foodItemId.toString()] = item;
    }

    // Validate each requested item and build order items
    const orderItems = [];
    let totalAmount = 0;

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
          `Food item "${menuItem.foodItemId}" is unavailable`,
          400,
          "ITEM_UNAVAILABLE",
        );
      }

      if (menuItem.remainingQuantity < requested.quantity) {
        throw new AppError(
          `Insufficient quantity for item "${menuItem.foodItemId}"`,
          400,
          "INSUFFICIENT_QUANTITY",
        );
      }

      orderItems.push({
        foodItemId: menuItem.foodItemId,
        name: menuItem.foodItemId.toString(), // will be enriched from FoodItem ref
        unitPrice: menuItem.currentPrice,
        quantity: requested.quantity,
      });

      totalAmount += menuItem.currentPrice * requested.quantity;
    }

    // Deduct sold quantities atomically
    await Promise.all(
      body.items.map(({ foodItemId, quantity }) =>
        dailyMenuRepository.deductSoldQuantity(today, foodItemId, quantity),
      ),
    );

    // Create order
    const order = await orderRepository.create({
      orderNumber: generateOrderNumber(),
      staffId,
      items: orderItems,
      discountAmount: 0,
      taxAmount: 0,
      totalAmount,
      orderStatus: "Pending",
      orderDate: today,
    });

    return toOrderResponse(order);
  },

  async getOrders(query, userId, role) {
    const { page, limit } = parsePagination(query);
    const { orderStatus, date } = query;

    // Staff only sees their own orders
    const staffId =
      role === USER_ROLES.STAFF ? userId : query.staffId ?? undefined;

    const { items, total } = await orderRepository.findAll({
      staffId,
      orderStatus,
      date,
      page,
      limit,
    });

    return {
      items: items.map(toOrderResponse),
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  },

  async getOrderById(id) {
    const order = await getOrderOrThrow(id);
    return toOrderResponse(order);
  },

  async updateOrderStatus(id, newStatus, role) {
    const order = await getOrderOrThrow(id);
    const currentStatus = order.orderStatus;

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
