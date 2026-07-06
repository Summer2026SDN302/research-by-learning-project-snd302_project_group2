import mongoose from "mongoose";
import AppError from "../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";
import { parsePagination } from "../../shared/helpers/query.helper.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import { getTodayVNDateString } from "../../shared/helpers/date.helper.js";
import orderRepository from "./order.repository.js";
import { toOrderResponse } from "./order.dto.js";
import { VALID_STATUS_TRANSITIONS, TAX_PERCENT } from "./order.constants.js";
import { USER_ROLES } from "../user/user.constants.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
 * Pure function — tính toán giá trị đơn hàng từ danh sách món đã validate.
 *
 * @param {Array<{ menuItem, requestedQty }>} lineItems
 *   menuItem: document từ dailyMenu (có originalPrice, currentPrice, foodItemId đã populate)
 *   requestedQty: số lượng khách yêu cầu
 *
 * @returns {{
 *   orderItems: Array,   — mảng item để lưu vào DB
 *   subTotal: number,    — Σ lineTotal (trước thuế)
 *   discountAmount: number, — Σ (originalPrice − currentPrice) × qty
 *   taxAmount: number,   — subTotal × TAX_PERCENT
 *   totalAmount: number  — subTotal + taxAmount
 * }}
 */
const calculateOrderPricing = (lineItems) => {
  let subTotal = 0;
  let discountAmount = 0;

  const orderItems = lineItems.map(({ menuItem, requestedQty }) => {
    const unitPrice = menuItem.currentPrice;
    const lineTotal = unitPrice * requestedQty;
    const discount = (menuItem.originalPrice - menuItem.currentPrice) * requestedQty;

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

  const taxAmount = Math.round(subTotal * TAX_PERCENT * 100) / 100;
  const totalAmount = Math.round((subTotal + taxAmount) * 100) / 100;

  return {
    orderItems,
    subTotal: Math.round(subTotal * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    taxAmount,
    totalAmount,
  };
};

// ─── Service ──────────────────────────────────────────────────────────────────

const orderService = {
  async createOrder(body, staffId) {
    const todayStr = getTodayVNDateString(); // "YYYY-MM-DD" theo múi giờ VN
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

    // Fix #1: findByDate giờ populate items.foodItemId với field "name"
    const dailyMenu = await dailyMenuRepository.findMenuByDate(todayStr);

    if (!dailyMenu || !dailyMenu.isConfigured) {
      throw new AppError(
        "Daily menu not found or not configured for today",
        404,
        "DAILY_MENU_NOT_FOUND",
      );
    }

    // Build lookup map — sau khi populate, foodItemId là FoodItem object
    const menuItemMap = {};
    for (const item of dailyMenu.items) {
      menuItemMap[item.foodItemId._id.toString()] = item;
    }

    // Validate từng item và collect lineItems để tính giá
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

      // Thu thập dữ liệu để truyền vào calculateOrderPricing
      lineItems.push({ menuItem, requestedQty: requested.quantity });
    }

    // Tính toán giá trị đơn hàng
    const { orderItems, subTotal, discountAmount, taxAmount, totalAmount } =
      calculateOrderPricing(lineItems);

    // Fix #3: dùng Mongoose session + transaction để đảm bảo rollback nếu có lỗi.
    // Nếu orderRepository.create thất bại, các deduct đã làm sẽ bị rollback.
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Fix #2: deductSoldQuantity giờ có atomic guard ($gte) và nhận session
      await Promise.all(
        body.items.map(({ foodItemId, quantity }) =>
          dailyMenuRepository.decrementSoldQuantity(dailyMenu._id, foodItemId, quantity, session),
        ),
      );

      const order = await orderRepository.create(
        {
          orderNumber: generateOrderNumber(),
          staffId,
          items: orderItems,
          subTotal,
          discountAmount,
          taxAmount,
          totalAmount,
          orderStatus: "Pending",
          orderDate: new Date(todayStr),
        },
        session,
      );

      await session.commitTransaction();
      return toOrderResponse(order);
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
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

    // Staff chỉ được xem order của chính mình
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
