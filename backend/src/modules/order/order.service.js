import AppError from "../../shared/exceptions/AppError.js";
import {
  formatVNDateString,
  getTodayVNDateString,
} from "../../shared/helpers/date.helper.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";
import { parsePagination } from "../../shared/helpers/query.helper.js";
import { generateReferenceNumber } from "../../shared/helpers/reference-number.helper.js";
import { withTransaction } from "../../shared/helpers/transaction.helper.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import paymentRepository from "../payment/payment.repository.js";
import { deriveOrderPaymentStatus } from "../payment/payment.derived.js";
import { USER_ROLES } from "../user/user.constants.js";
import {
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  TAX_PERCENT,
  VALID_STATUS_TRANSITIONS,
} from "./order.constants.js";
import { toOrderResponse } from "./order.dto.js";
import orderRepository from "./order.repository.js";

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const normalizeEntityId = (entity) => {
  if (!entity) {
    return null;
  }

  if (typeof entity === "string") {
    return entity;
  }

  if (entity._id) {
    return entity._id.toString();
  }

  return entity.toString();
};

const parseVNDateToUTCDate = (dateString) =>
  new Date(`${dateString}T00:00:00.000Z`);

const buildOrderResponse = (order, payment = null) =>
  toOrderResponse(order, { payment });

const enrichOrdersWithPaymentState = async (orders) => {
  const paymentMap = await paymentRepository.findLatestByOrderIds(
    orders.map((order) => order._id),
  );

  return orders.map((order) =>
    buildOrderResponse(order, paymentMap.get(order._id.toString()) ?? null),
  );
};

const assertOrderAccess = (order, requestingUserId, requestingRole) => {
  if (
    requestingRole === USER_ROLES.STAFF &&
    normalizeEntityId(order.staffId) !== requestingUserId
  ) {
    throw new AppError(
      "You do not have permission to access this order",
      403,
      "FORBIDDEN",
    );
  }
};

const getOrderOrThrow = async (id) => {
  const order = await orderRepository.findById(id);

  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  return order;
};

const assertNoDuplicateItems = (items) => {
  const seen = new Set();

  for (const item of items) {
    if (seen.has(item.foodItemId)) {
      throw new AppError(
        "Duplicate food item in order",
        400,
        "DUPLICATE_ITEM",
      );
    }

    seen.add(item.foodItemId);
  }
};

const buildMenuItemMap = (dailyMenu) => {
  const menuItemMap = new Map();

  for (const item of dailyMenu.items ?? []) {
    menuItemMap.set(item.foodItemId._id.toString(), item);
  }

  return menuItemMap;
};

const buildOrderItemMap = (items = []) => {
  const orderItemMap = new Map();

  for (const item of items) {
    orderItemMap.set(normalizeEntityId(item.foodItemId), item);
  }

  return orderItemMap;
};

const calculateOrderPricing = (lineItems) => {
  let subTotal = 0;
  let discountAmount = 0;

  const orderItems = lineItems.map(({ menuItem, requestedQty, note }) => {
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
      lineTotal: roundCurrency(lineTotal),
      note: note ?? null,
    };
  });

  const taxAmount = roundCurrency(subTotal * TAX_PERCENT);
  const totalAmount = roundCurrency(subTotal + taxAmount);

  return {
    orderItems,
    subTotal: roundCurrency(subTotal),
    discountAmount: roundCurrency(discountAmount),
    taxAmount,
    totalAmount,
  };
};

const buildCreateLineItems = (requestedItems, menuItemMap) =>
  requestedItems.map((requested) => {
    const menuItem = menuItemMap.get(requested.foodItemId);

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

    return {
      menuItem,
      requestedQty: requested.quantity,
      note: requested.note ?? null,
    };
  });

const buildEditableLineItems = (
  requestedItems,
  existingOrderItemMap,
  menuItemMap,
) =>
  requestedItems.map((requested) => {
    const menuItem = menuItemMap.get(requested.foodItemId);
    const existingItem = existingOrderItemMap.get(requested.foodItemId);
    const existingQuantity = existingItem?.quantity ?? 0;
    const additionalQuantity = requested.quantity - existingQuantity;

    if (!menuItem) {
      throw new AppError(
        `Food item ${requested.foodItemId} is not in the menu for this order date`,
        400,
        "ITEM_NOT_IN_MENU",
      );
    }

    if (additionalQuantity > 0 && menuItem.status !== "Available") {
      throw new AppError(
        `Food item "${menuItem.foodItemId.name}" is unavailable`,
        400,
        "ITEM_UNAVAILABLE",
      );
    }

    if (additionalQuantity > 0 && menuItem.remainingQuantity < additionalQuantity) {
      throw new AppError(
        `Insufficient quantity for item "${menuItem.foodItemId.name}"`,
        400,
        "INSUFFICIENT_QUANTITY",
      );
    }

    return {
      menuItem,
      requestedQty: requested.quantity,
      note: requested.note ?? null,
    };
  });

const buildQuantityDeltaMap = (existingItems = [], requestedItems = []) => {
  const quantityDeltaMap = new Map();

  for (const item of existingItems) {
    const foodItemId = normalizeEntityId(item.foodItemId);
    quantityDeltaMap.set(foodItemId, -Number(item.quantity || 0));
  }

  for (const item of requestedItems) {
    quantityDeltaMap.set(
      item.foodItemId,
      (quantityDeltaMap.get(item.foodItemId) || 0) + Number(item.quantity || 0),
    );
  }

  return quantityDeltaMap;
};

const assertOrderEditable = (order, latestPayment = null) => {
  if (
    order.orderStatus !== ORDER_STATUS.PENDING ||
    deriveOrderPaymentStatus(latestPayment) !== ORDER_PAYMENT_STATUS.UNPAID
  ) {
    throw new AppError(
      "Only pending unpaid orders can be edited",
      409,
      "ORDER_NOT_EDITABLE",
    );
  }
};

const orderService = {
  async createOrder(body, staffId) {
    const todayStr = getTodayVNDateString();
    assertNoDuplicateItems(body.items);

    const dailyMenu = await dailyMenuRepository.findMenuByDate(todayStr);

    if (!dailyMenu || !dailyMenu.isConfigured) {
      throw new AppError(
        "Daily menu not found or not configured for today",
        404,
        "DAILY_MENU_NOT_FOUND",
      );
    }

    const menuItemMap = buildMenuItemMap(dailyMenu);
    const lineItems = buildCreateLineItems(body.items, menuItemMap);
    const { orderItems, subTotal, discountAmount, taxAmount, totalAmount } =
      calculateOrderPricing(lineItems);

    const order = await withTransaction(async (session) => {
      // Mongo transactions do not support parallel operations on the same session.
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
          orderNumber: generateReferenceNumber("ORD"),
          staffId,
          items: orderItems,
          notes: body.notes ?? null,
          subTotal,
          discountAmount,
          taxRate: TAX_PERCENT,
          taxAmount,
          totalAmount,
          orderStatus: ORDER_STATUS.PENDING,
          orderDate: parseVNDateToUTCDate(todayStr),
        },
        session,
      );

      return order;
    });

    return buildOrderResponse(order);
  },

  async updateOrderItems(id, body, requestingUserId, requestingRole) {
    const order = await getOrderOrThrow(id);
    const latestPayment = await paymentRepository.findLatestByOrderId(order._id);
    assertOrderAccess(order, requestingUserId, requestingRole);
    assertOrderEditable(order, latestPayment);
    assertNoDuplicateItems(body.items);

    const orderDateStr = formatVNDateString(order.orderDate);
    const dailyMenu = await dailyMenuRepository.findMenuByDate(orderDateStr);

    if (!dailyMenu || !dailyMenu.isConfigured) {
      throw new AppError(
        "Daily menu not found or not configured for this order date",
        404,
        "DAILY_MENU_NOT_FOUND",
      );
    }

    const menuItemMap = buildMenuItemMap(dailyMenu);
    const existingOrderItemMap = buildOrderItemMap(order.items);
    const lineItems = buildEditableLineItems(
      body.items,
      existingOrderItemMap,
      menuItemMap,
    );
    const quantityDeltaMap = buildQuantityDeltaMap(order.items, body.items);
    const { orderItems, subTotal, discountAmount, taxAmount, totalAmount } =
      calculateOrderPricing(lineItems);

    const updatedOrder = await withTransaction(async (session) => {
      for (const [foodItemId, quantityDelta] of quantityDeltaMap.entries()) {
        if (!quantityDelta) {
          continue;
        }

        const adjusted = await dailyMenuRepository.adjustSoldQuantity(
          dailyMenu._id,
          foodItemId,
          quantityDelta,
          session,
        );

        if (!adjusted) {
          const menuItem = menuItemMap.get(foodItemId);
          const itemName =
            menuItem?.foodItemId?.name ||
            existingOrderItemMap.get(foodItemId)?.name ||
            foodItemId;

          throw new AppError(
            `Unable to update reserved quantity for item "${itemName}"`,
            409,
            quantityDelta > 0
              ? "INSUFFICIENT_QUANTITY"
              : "ORDER_STOCK_UPDATE_FAILED",
          );
        }
      }

      return orderRepository.updateById(
        id,
        {
          items: orderItems,
          notes: body.notes ?? null,
          subTotal,
          discountAmount,
          taxRate: TAX_PERCENT,
          taxAmount,
          totalAmount,
        },
        session,
      );
    });

    return buildOrderResponse(updatedOrder, latestPayment);
  },

  async getOrders(query) {
    const { page, limit } = parsePagination(query);
    const { orderStatus, paymentStatus, date, staffId, fromDate, toDate } =
      query;

    const orders = await orderRepository.findMatching({
      staffId,
      orderStatus,
      date,
      fromDate,
      toDate,
    });
    const enrichedOrders = await enrichOrdersWithPaymentState(orders);
    const filteredOrders = paymentStatus
      ? enrichedOrders.filter((item) => item.paymentStatus === paymentStatus)
      : enrichedOrders;
    const total = filteredOrders.length;
    const startIndex = (page - 1) * limit;
    const paginatedItems = filteredOrders.slice(startIndex, startIndex + limit);

    return {
      items: paginatedItems,
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  },

  async getOrderById(id, requestingUserId, requestingRole) {
    const order = await getOrderOrThrow(id);
    const latestPayment = await paymentRepository.findLatestByOrderId(order._id);
    assertOrderAccess(order, requestingUserId, requestingRole);
    return buildOrderResponse(order, latestPayment);
  },

  async updateOrderStatus(id, newStatus) {
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
    const latestPayment = await paymentRepository.findLatestByOrderId(updated._id);
    return buildOrderResponse(updated, latestPayment);
  },
};

export default orderService;
