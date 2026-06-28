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
  ORDER_PAYMENT_STATUS,
  ORDER_STATUS,
  TAX_PERCENT,
} from "../order/order.constants.js";
import orderRepository from "../order/order.repository.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import { USER_ROLES } from "../user/user.constants.js";
import {
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "./payment.constants.js";
import { deriveOrderPaymentStatus } from "./payment.derived.js";
import {
  toPaymentListItem,
  toPaymentResponse,
  toPaymentReceiptResponse,
} from "./payment.dto.js";
import paymentRepository from "./payment.repository.js";

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

const normalizeOptionalText = (value) => {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
};

const parseVNDateToUTCDate = (dateString) =>
  new Date(`${dateString}T00:00:00.000Z`);

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
      note: requested.note ?? null,
    };
  });

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
      note,
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

const getPaymentOrThrow = async (id, options = {}) => {
  const payment = await paymentRepository.findById(id, options);

  if (!payment) {
    throw new AppError("Payment not found", 404, "PAYMENT_NOT_FOUND");
  }

  return payment;
};

const getPayableOrderOrThrow = async (orderId) => {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new AppError("Order not found", 404, "ORDER_NOT_FOUND");
  }

  if (
    [ORDER_STATUS.CANCELLED, ORDER_STATUS.RETURNED].includes(order.orderStatus)
  ) {
    throw new AppError(
      "Order is not eligible for payment",
      400,
      "ORDER_NOT_PAYABLE",
    );
  }

  return order;
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

const assertValidPaymentTransition = (payment, expectedStatus) => {
  if (payment.paymentStatus !== expectedStatus) {
    throw new AppError(
      `Cannot transition payment from "${payment.paymentStatus}"`,
      400,
      "INVALID_PAYMENT_STATUS_TRANSITION",
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
          orderNumber: generateReferenceNumber("ORD"),
          staffId: requestingUserId,
          items: orderItems,
          notes: body.notes ?? null,
          subTotal,
          discountAmount,
          taxRate: TAX_PERCENT,
          taxAmount,
          totalAmount,
          orderStatus: ORDER_STATUS.COMPLETED,
          orderDate: parseVNDateToUTCDate(todayStr),
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

  async initiatePayment(body, requestingUserId, requestingRole) {
    const order = await getPayableOrderOrThrow(body.orderId);
    assertOrderAccess(order, requestingUserId, requestingRole);
    const latestPayment = await paymentRepository.findLatestByOrderId(order._id);

    if (deriveOrderPaymentStatus(latestPayment) === ORDER_PAYMENT_STATUS.PAID) {
      throw new AppError(
        "Order has already been paid",
        409,
        "ORDER_ALREADY_PAID",
      );
    }

    if (latestPayment?.paymentStatus === PAYMENT_STATUS.PENDING) {
      throw new AppError(
        "A payment is already in progress for this order",
        409,
        "PAYMENT_IN_PROGRESS",
      );
    }

    const amountReceived =
      body.paymentMethod === PAYMENT_METHOD.CASH
        ? roundCurrency(body.amountReceived)
        : roundCurrency(order.totalAmount);

    const paymentId = await withTransaction(async (session) => {
      const payment = await paymentRepository.create(
        {
          paymentNumber: generateReferenceNumber("PAY"),
          orderId: order._id,
          finalAmount: order.totalAmount,
          paymentMethod: body.paymentMethod,
          amountReceived,
          changeReturned: 0,
          transactionCode: null,
          paymentStatus: PAYMENT_STATUS.PENDING,
          refundedAt: null,
          refundedBy: null,
          refundReason: null,
        },
        session,
      );

      return payment._id;
    });

    const createdPayment = await paymentRepository.findById(paymentId);
    return toPaymentResponse(createdPayment);
  },

  async confirmPayment(id, body, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    const order = await getPayableOrderOrThrow(
      payment.orderId?._id ?? payment.orderId,
    );

    assertOrderAccess(order, requestingUserId, requestingRole);
    assertValidPaymentTransition(payment, PAYMENT_STATUS.PENDING);

    const transactionCode = await ensureUniqueTransactionCode(
      body.transactionCode ?? payment.transactionCode,
      payment._id,
    );

    const amountReceived =
      payment.paymentMethod === PAYMENT_METHOD.CASH
        ? roundCurrency(body.amountReceived ?? payment.amountReceived)
        : roundCurrency(payment.finalAmount ?? order.totalAmount);
    const finalAmount = roundCurrency(payment.finalAmount ?? order.totalAmount);

    if (
      payment.paymentMethod === PAYMENT_METHOD.CASH &&
      amountReceived < finalAmount
    ) {
      throw new AppError(
        "Cash received is insufficient",
        400,
        "INSUFFICIENT_CASH_RECEIVED",
      );
    }

    const changeReturned =
      payment.paymentMethod === PAYMENT_METHOD.CASH
        ? roundCurrency(amountReceived - finalAmount)
        : 0;

    await withTransaction(async (session) => {
      await paymentRepository.updateById(
        payment._id,
        {
          amountReceived,
          changeReturned,
          transactionCode,
          paymentStatus: PAYMENT_STATUS.PAID,
        },
        session,
      );
    });

    const confirmedPayment = await paymentRepository.findById(payment._id);
    return toPaymentResponse(confirmedPayment);
  },

  async failPayment(id, body, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    const order = await getPayableOrderOrThrow(
      payment.orderId?._id ?? payment.orderId,
    );

    assertOrderAccess(order, requestingUserId, requestingRole);
    assertValidPaymentTransition(payment, PAYMENT_STATUS.PENDING);

    await withTransaction(async (session) => {
      await paymentRepository.updateById(
        payment._id,
        {
          paymentStatus: PAYMENT_STATUS.FAILED,
        },
        session,
      );
    });

    const failedPayment = await paymentRepository.findById(payment._id);
    return toPaymentResponse(failedPayment);
  },

  async getPaymentById(id, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    assertOrderAccess(payment.orderId, requestingUserId, requestingRole);
    return toPaymentResponse(payment, { includeAuditTrail: true });
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
      ? await orderRepository.findIdsByOrderNumberKeyword(searchKeyword)
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
