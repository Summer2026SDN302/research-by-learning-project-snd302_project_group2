import mongoose from "mongoose";
import AppError from "../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";
import { parsePagination } from "../../shared/helpers/query.helper.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import { getTodayVNDateString } from "../../shared/helpers/date.helper.js";
import { withTransaction } from "../../shared/helpers/transaction.helper.js";
import orderRepository from "./order.repository.js";
import { toOrderResponse } from "./order.dto.js";
import {
  ORDER_STATUS,
  VALID_STATUS_TRANSITIONS,
  TAX_PERCENT,
} from "./order.constants.js";
import { USER_ROLES } from "../user/user.constants.js";
import { DAILY_MENU_ITEM_STATUS } from "../menu/daily-menu/daily-menu.constants.js";

// Helpers

const generateOrderNumber = () => {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
};

/**
 * Kiểm tra lỗi duplicate key MongoDB (code 11000 / 11001).
 * Dùng để phát hiện trùng orderNumber và retry.
 */
const isDuplicateKeyError = (err) => err?.code === 11000 || err?.code === 11001;

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
 *   orderItems: Array,   — mảng item để lưu vào DB
 *   subTotal: number,    — Σ lineTotal (trước thuế)
 *   discountAmount: number, — Σ (originalPrice − currentPrice) × qty
 *   totalAmount: number  — subTotal
 * }}
 */
const calculateOrderPricing = (lineItems) => {
  let totalAmount = 0;
  let discountAmount = 0;

  const orderItems = lineItems.map(({ menuItem, requestedQty, note }) => {
    const unitPrice = menuItem.currentPrice;
    const lineTotal = unitPrice * requestedQty;
    const discount =
      (menuItem.originalPrice - menuItem.currentPrice) * requestedQty;

    totalAmount += lineTotal;
    discountAmount += discount;

    return {
      foodItemId: menuItem.foodItemId._id,
      name: menuItem.foodItemId.name,
      unitPrice,
      quantity: requestedQty,
      lineTotal,
      note: note || "",
    };
  });

  const taxAmount =
    Math.round((totalAmount - totalAmount / (1 + TAX_PERCENT)) * 100) / 100;
  const subTotal = totalAmount - taxAmount;

  return {
    orderItems,
    subTotal,
    discountAmount,
    taxAmount,
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

    // Fix #1: findByDate giờ populate items.foodItemId với field "name"
    const dailyMenu = await dailyMenuRepository.findMenuByDate(todayStr, {
      isConfigured: true,
    });

    if (!dailyMenu) {
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

      if (menuItem.status !== DAILY_MENU_ITEM_STATUS.AVAILABLE) {
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
      lineItems.push({
        menuItem,
        requestedQty: requested.quantity,
        note: requested.note || "",
      });
    }

    const { orderItems, subTotal, discountAmount, taxAmount, totalAmount } =
      calculateOrderPricing(lineItems);

    /**
     * Chạy transaction trong 1 attempt.
     * Mỗi attempt nhận orderNumber riêng để tránh trùng.
     * Trả về order document đã được lưu.
     */
    const runTransaction = async (orderNumber) => {
      // Mỗi lần retry PHẢI tạo session mới. Khi transaction throw lỗi bất kỳ,
      // MongoDB đánh dấu session đó là "aborted" — không thể tiếp tục dùng lại.
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // Fix #2: deductSoldQuantity giờ có atomic guard ($gte) và nhận session
        for (const { foodItemId, quantity } of body.items) {
          await dailyMenuRepository.decrementSoldQuantity(
            dailyMenu._id,
            foodItemId,
            quantity,
            session,
          );
        }

        const order = await orderRepository.create(
          {
            orderNumber,
            staffId,
            items: orderItems,
            subTotal,
            discountAmount,
            taxAmount,
            totalAmount,
            orderStatus: ORDER_STATUS.PENDING,
            orderDate: new Date(),
            notes: body.notes || "",
          },
          session,
        );

        await session.commitTransaction();
        return order;
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    };

    // Retry vòng ngoài: mỗi lần tạo session mới + orderNumber mới.
    // Lý do: MongoDB invalidate toàn bộ session khi transaction gặp lỗi,
    // nên không thể retry bên trong cùng một transaction/session.
    const MAX_RETRIES = 3;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const order = await runTransaction(generateOrderNumber());
        return toOrderResponse(order);
      } catch (err) {
        if (isDuplicateKeyError(err) && attempt < MAX_RETRIES) {
          // orderNumber trùng — thử lại với session + số mới
          continue;
        }
        if (isDuplicateKeyError(err)) {
          throw new AppError(
            "Không thể tạo mã đơn hàng duy nhất sau nhiều lần thử. Vui lòng thử lại.",
            500,
            "ORDER_NUMBER_CONFLICT",
          );
        }
        throw err;
      }
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

  /**
   * Hủy đơn hàng.
   * Luồng:
   *  1. Validate quyền + trạng thái hiện tại cho phép chuyển sang Cancelled.
   *  2. Trong transaction: hoàn trả tồn kho về daily menu, sau đó cập nhật status.
   *
   * Lý do cần transaction: nếu hoàn tồn kho thành công nhưng updateStatus thất bại
   * (hoặc ngược lại), dữ liệu sẽ bị lệch. Transaction đảm bảo cả hai cùng thành công hoặc rollback.
   */
  async cancelOrder(id, requestingUserId, requestingRole) {
    const order = await getOrderOrThrow(id);

    // Kiểm tra quyền (giữ nguyên logic như updateOrderStatus)
    if (
      requestingRole === USER_ROLES.STAFF &&
      order.staffId.toString() !== requestingUserId
    ) {
      throw new AppError(
        "You do not have permission to cancel this order",
        403,
        "FORBIDDEN",
      );
    }

    // Kiểm tra transition hợp lệ theo VALID_STATUS_TRANSITIONS
    const allowedNext = VALID_STATUS_TRANSITIONS[order.orderStatus] ?? [];
    if (!allowedNext.includes(ORDER_STATUS.CANCELLED)) {
      throw new AppError(
        `Cannot cancel order with status "${order.orderStatus}"`,
        400,
        "INVALID_STATUS_TRANSITION",
      );
    }

    // Chỉ hoàn tồn kho nếu đơn đang Pending (chưa được xử lý).
    // Nếu đơn Confirmed thì quản lý quyết định hoàn hàng thủ công ngoài hệ thống.
    const shouldRestoreInventory = order.orderStatus === ORDER_STATUS.PENDING;

    if (!shouldRestoreInventory) {
      // Không cần hoàn tồn kho, cập nhật status trực tiếp
      const updated = await orderRepository.updateStatusById(
        id,
        ORDER_STATUS.CANCELLED,
      );
      return toOrderResponse(updated);
    }

    // Tìm daily menu của ngày đặt đơn để hoàn tồn kho
    const todayStr = getTodayVNDateString();
    const dailyMenu = await dailyMenuRepository.findMenuByDate(todayStr, {
      isConfigured: true,
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      // Hoàn trả soldQuantity và remainingQuantity cho từng món trong đơn
      if (dailyMenu) {
        for (const item of order.items) {
          await dailyMenuRepository.incrementSoldQuantity(
            dailyMenu._id,
            item.foodItemId._id ?? item.foodItemId,
            item.quantity,
            session,
          );
        }
      }

      const updated = await orderRepository.updateStatusById(
        id,
        ORDER_STATUS.CANCELLED,
        session,
      );
      await session.commitTransaction();
      return toOrderResponse(updated);
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  },

  /**
   * Cập nhật danh sách món trong đơn hàng đang Pending.
   * Luồng xử lý:
   *  1. Validate đơn tồn tại, đang Pending, và người yêu cầu có quyền.
   *  2. Hoàn tác soldQuantity cũ về menu (increment).
   *  3. Validate các món mới với menu hôm nay.
   *  4. Tính lại giá, deduct soldQuantity mới.
   *  5. Lưu items + totals mới vào DB.
   * Mỗi attempt dùng session riêng (giống createOrder) để tránh lỗi transaction aborted.
   */
  async updateOrderItems(id, newItems, requestingUserId, requestingRole) {
    const order = await getOrderOrThrow(id);

    if (order.orderStatus !== ORDER_STATUS.PENDING) {
      throw new AppError(
        `Only Pending orders can be updated. Current status: "${order.orderStatus}"`,
        400,
        "ORDER_NOT_PENDING",
      );
    }

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

    // Kiểm tra trùng foodItemId trong danh sách mới
    const seen = new Set();
    for (const item of newItems) {
      if (seen.has(item.foodItemId)) {
        throw new AppError(
          "Duplicate food item in order",
          400,
          "DUPLICATE_ITEM",
        );
      }
      seen.add(item.foodItemId);
    }

    const todayStr = getTodayVNDateString();
    const dailyMenu = await dailyMenuRepository.findMenuByDate(todayStr, {
      isConfigured: true,
    });

    if (!dailyMenu) {
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
    for (const requested of newItems) {
      const menuItem = menuItemMap[requested.foodItemId];
      if (!menuItem) {
        throw new AppError(
          `Food item ${requested.foodItemId} is not in today's menu`,
          400,
          "ITEM_NOT_IN_MENU",
        );
      }
      if (menuItem.status !== DAILY_MENU_ITEM_STATUS.AVAILABLE) {
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
      lineItems.push({
        menuItem,
        requestedQty: requested.quantity,
        note: requested.note || "",
      });
    }

    const { orderItems, subTotal, discountAmount, taxAmount, totalAmount } =
      calculateOrderPricing(lineItems);

    const runUpdateTransaction = async () => {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        // 1. Hoàn tác soldQuantity của các món cũ
        for (const oldItem of order.items) {
          await dailyMenuRepository.incrementSoldQuantity(
            dailyMenu._id,
            oldItem.foodItemId._id ?? oldItem.foodItemId,
            oldItem.quantity,
            session,
          );
        }

        // 2. Deduct soldQuantity cho các món mới
        for (const { foodItemId, quantity } of newItems) {
          await dailyMenuRepository.decrementSoldQuantity(
            dailyMenu._id,
            foodItemId,
            quantity,
            session,
          );
        }

        // 3. Cập nhật items và totals
        const updated = await orderRepository.updateItemsById(
          id,
          {
            items: orderItems,
            subTotal,
            discountAmount,
            taxAmount,
            totalAmount,
          },
          session,
        );

        await session.commitTransaction();
        return updated;
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    };

    const updated = await runUpdateTransaction();
    return toOrderResponse(updated);
  },
};

export default orderService;
