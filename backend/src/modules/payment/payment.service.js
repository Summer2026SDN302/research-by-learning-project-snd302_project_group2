import AppError from "../../shared/exceptions/AppError.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";
import {
  parsePagination,
  parseSearchQuery,
} from "../../shared/helpers/query.helper.js";
import { generateReferenceNumber } from "../../shared/helpers/reference-number.helper.js";
import { withTransaction } from "../../shared/helpers/transaction.helper.js";
import { getTodayVNDateString } from "../../shared/helpers/date.helper.js";
import {
  ORDER_STATUS,
  TAX_PERCENT,
} from "../order/order.constants.js";
import Order from "../order/order.model.js";
import orderRepository from "../order/order.repository.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import { USER_ROLES } from "../user/user.constants.js";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "./payment.constants.js";
import {
  toPaymentListItem,
  toPaymentResponse,
  toPaymentReceiptResponse,
} from "./payment.dto.js";
import paymentRepository from "./payment.repository.js";

const roundCurrency = (value) =>
  Math.round((Number(value) + Number.EPSILON) * 100) / 100;

const generateOrderNumber = () => {
  const now = new Date();
  const dateStr = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const random = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${dateStr}-${random}`;
};

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

const normalizeOptionalText = (value) => {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
};

const assertNoDuplicateItems = (items = []) => {
  const seen = new Set();

  for (const item of items) {
    if (seen.has(item.foodItemId)) {
      throw new AppError(
        "Duplicate food item in checkout",
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

const buildCheckoutLineItems = (requestedItems, menuItemMap) =>
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
    };
  });

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

const findOrderIdsByOrderNumberKeyword = async (keyword) => {
  const regex = new RegExp(keyword, "i");
  const orders = await Order.find({ orderNumber: regex }).select("_id");
  return orders.map((item) => item._id);
};

const getPaymentOrThrow = async (id, options = {}) => {
  const payment = await paymentRepository.findById(id, options);

  if (!payment) {
    throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
  }

  return payment;
};

const getOrderByIdOrThrow = async (orderId) => {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  return order;
};

const assertOrderAccess = (order, requestingUserId, requestingRole) => {
  if (
    requestingRole === USER_ROLES.STAFF &&
    normalizeEntityId(order.staffId) !== requestingUserId
  ) {
    throw new AppError(
      "You do not have permission to access this payment",
      403,
      "INSUFFICIENT_PERMISSIONS",
    );
  }
};

const assertReceiptAvailable = (payment) => {
  if (
    ![PAYMENT_STATUS.PAID, PAYMENT_STATUS.REFUNDED].includes(
      payment.paymentStatus,
    )
  ) {
    throw new AppError(
      "Receipt is only available for completed payments",
      400,
      "PAYMENT_RECEIPT_NOT_AVAILABLE",
    );
  }
};

const ensureUniqueTransactionCode = async (transactionCode, excludePaymentId) => {
  const normalizedCode = normalizeOptionalText(transactionCode);

  if (!normalizedCode) {
    return null;
  }

  const exists = await paymentRepository.isTransactionCodeTaken(
    normalizedCode,
    { excludePaymentId },
  );

  if (exists) {
    throw new AppError(
      "Transaction code already exists",
      409,
      "PAYMENT_TRANSACTION_CODE_EXISTS",
    );
  }

  return normalizedCode;
};

const paymentService = {
  async checkout(body, requestingUserId) {
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
    const lineItems = buildCheckoutLineItems(body.items, menuItemMap);
    const { orderItems, subTotal, discountAmount, taxAmount, totalAmount } =
      calculateOrderPricing(lineItems);

    const transactionCode = await ensureUniqueTransactionCode(
      body.transactionCode,
      null,
    );
    const amountReceived =
      body.paymentMethod === PAYMENT_METHOD.CASH
        ? roundCurrency(body.amountReceived)
        : roundCurrency(totalAmount);

    if (
      body.paymentMethod === PAYMENT_METHOD.CASH &&
      amountReceived < totalAmount
    ) {
      throw new AppError(
        "Cash received is insufficient",
        400,
        "INSUFFICIENT_CASH_RECEIVED",
      );
    }

    const changeReturned =
      body.paymentMethod === PAYMENT_METHOD.CASH
        ? roundCurrency(amountReceived - totalAmount)
        : 0;

    const paymentId = await withTransaction(async (session) => {
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
          orderNumber: generateOrderNumber(),
          staffId: requestingUserId,
          items: orderItems,
          subTotal,
          discountAmount,
          taxAmount,
          totalAmount,
          orderStatus: ORDER_STATUS.PENDING,
          orderDate: new Date(todayStr),
        },
        session,
      );

      const payment = await paymentRepository.create(
        {
          paymentNumber: generateReferenceNumber("PAY"),
          orderId: order._id,
          finalAmount: totalAmount,
          paymentMethod: body.paymentMethod,
          amountReceived,
          changeReturned,
          transactionCode,
          paymentStatus: PAYMENT_STATUS.PAID,
          refundedAt: null,
          refundedBy: null,
          refundReason: null,
        },
        session,
      );

      return payment._id;
    });

    const completedPayment = await paymentRepository.findById(paymentId);
    return toPaymentResponse(completedPayment);
  },

  async getPaymentReceipt(id, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    const order = await getOrderByIdOrThrow(payment.orderId?._id ?? payment.orderId);

    assertOrderAccess(order, requestingUserId, requestingRole);
    assertReceiptAvailable(payment);

    return toPaymentReceiptResponse(payment, order);
  },

  async printPaymentReceipt(id, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    const order = await getOrderByIdOrThrow(payment.orderId?._id ?? payment.orderId);

    assertOrderAccess(order, requestingUserId, requestingRole);
    assertReceiptAvailable(payment);

    return toPaymentReceiptResponse(payment, order);
  },

  async getPayments(query) {
    const { page, limit } = parsePagination(query);
    const searchKeyword = parseSearchQuery(query.search);
    const matchingOrderIds = searchKeyword
      ? await findOrderIdsByOrderNumberKeyword(searchKeyword)
      : [];

    const { items, total } = await paymentRepository.findAll({
      searchKeyword,
      matchingOrderIds,
      paymentStatus: query.paymentStatus,
      paymentMethod: query.paymentMethod,
      page,
      limit,
    });

    return {
      items: items.map(toPaymentListItem),
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  },
};

export default paymentService;
