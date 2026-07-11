import AppError from "../../shared/exceptions/AppError.js";
import payos from "../../config/payos.js";
import {
  triggerLowStockNotification,
  triggerOrderStatusNotification,
} from "../notification/notification.service.js";
import * as dailyMenuRepository from "../menu/daily-menu/daily-menu.repository.js";
import { formatVNDateString } from "../../shared/helpers/date.helper.js";
import { buildPaginationMeta } from "../../shared/helpers/pagination.helper.js";

import {
  parsePagination,
  parseSearchQuery,
} from "../../shared/helpers/query.helper.js";
import { generateReferenceNumber } from "../../shared/helpers/reference-number.helper.js";
import { withTransaction } from "../../shared/helpers/transaction.helper.js";
import { ORDER_STATUS } from "../order/order.constants.js";
import orderRepository from "../order/order.repository.js";
import { USER_ROLES } from "../user/user.constants.js";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "./payment.constants.js";
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

const findOrderIdsByOrderNumberKeyword = async (keyword) => {
  return orderRepository.findIdsByOrderNumberKeyword(keyword);
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

/**
 * Service-layer helper: find the daily menu for the order date, then decrement
 * soldQuantity and remainingQuantity for every item in the order.
 * Throws AppError on missing menu or unmatched item (follows project error-handling rules).
 */
const deductInventoryForOrder = async (order, session) => {
  const dateStr = formatVNDateString(order.orderDate);
  const dailyMenu = await dailyMenuRepository.findMenuByDate(dateStr);

  if (!dailyMenu) {
    throw new AppError(
      `Daily menu not found for date ${dateStr}`,
      404,
      "DAILY_MENU_NOT_FOUND",
    );
  }

  for (const item of order.items) {
    const foodItemId = item.foodItemId?._id ?? item.foodItemId;
    const result = await dailyMenuRepository.decrementItemSoldQuantity(
      dailyMenu._id,
      foodItemId,
      item.quantity,
      session,
    );

    if (result.matchedCount === 0) {
      throw new AppError(
        `Item "${item.name ?? foodItemId}" not found in daily menu`,
        400,
        "INSUFFICIENT_QUANTITY",
      );
    }
  }

  // Fetch updated dailyMenu to check remainingQuantity and trigger low stock alerts
  const updatedMenu = await dailyMenuRepository.findMenuByDate(dateStr, {}, { session });
  if (updatedMenu?.items) {
    for (const item of order.items) {
      const foodItemId = item.foodItemId?._id ?? item.foodItemId;
      const updatedItem = updatedMenu.items.find(
        (i) => i.foodItemId._id.toString() === foodItemId.toString(),
      );
      if (updatedItem) {
        triggerLowStockNotification(
          dateStr,
          foodItemId.toString(),
          updatedItem.foodItemId.name,
          updatedItem.remainingQuantity,
        ).catch((err) =>
          console.error("Error triggering low stock notification:", err),
        );
      }
    }
  }
};

const reconcilePaymentStatus = async (payment, order) => {
  if (
    payment.paymentStatus === PAYMENT_STATUS.PENDING &&
    payment.paymentMethod === PAYMENT_METHOD.QR
  ) {
    try {
      const orderCode = parseInt(order.orderNumber.replace(/\D/g, ""), 10);
      const payosPayment = await payos.paymentRequests.get(orderCode);

      if (payosPayment && payosPayment.status === "PAID") {
        await withTransaction(async (session) => {
          await deductInventoryForOrder(order, session);

           order.orderStatus = ORDER_STATUS.COMPLETED;
          await order.save({ session });

          triggerOrderStatusNotification(order, ORDER_STATUS.COMPLETED).catch((err) =>
            console.error("Error triggering order completed notification:", err),
          );

          payment.paymentStatus = PAYMENT_STATUS.PAID;
          payment.amountReceived = payosPayment.amountPaid;
          const mainTransaction = payosPayment.transactions?.[0];
          payment.transactionCode = mainTransaction?.reference ?? null;
          await payment.save({ session });
        });
      }
    } catch (payosError) {
      console.error(
        "Failed to fetch PayOS status for auto-reconciliation:",
        payosError,
      );
    }
  }
};

const ensureUniqueTransactionCode = async (
  transactionCode,
  excludePaymentId,
) => {
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
  async checkout(body, requestingUserId, requestingRole) {
    const order = await getOrderByIdOrThrow(body.orderId);

    assertOrderAccess(order, requestingUserId, requestingRole);

    if (order.orderStatus !== ORDER_STATUS.PENDING) {
      throw new AppError(
        "Order is not in a payable state",
        400,
        "INVALID_ORDER_STATUS",
      );
    }

    const totalAmount = order.totalAmount;

    if (body.paymentMethod === PAYMENT_METHOD.QR) {
      const orderCode = parseInt(order.orderNumber.replace(/\D/g, ""), 10);
      const description = `STB ${order.orderNumber}`
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .slice(0, 25);

      let paymentLinkRes;
      try {
        paymentLinkRes = await payos.paymentRequests.create({
          orderCode,
          amount: 2000, // Override amount to 2000 VND for testing/demo purposes
          description,
          cancelUrl: `${process.env.CLIENT_URL}/payment/cancel`,
          returnUrl: `${process.env.CLIENT_URL}/payment/success`,
        });
      } catch (payosError) {
        if (
          payosError?.code === "231" ||
          payosError?.error?.code === "231" ||
          String(payosError?.message).includes("231")
        ) {
          paymentLinkRes = await payos.paymentRequests.get(orderCode);
        } else {
          throw payosError;
        }
      }

      const paymentId = await withTransaction(async (session) => {
        const existingPayment = await paymentRepository.findByOrderId(
          order._id,
          { session },
        );
        if (
          existingPayment &&
          existingPayment.paymentStatus === PAYMENT_STATUS.PENDING
        ) {
          return existingPayment._id;
        }

        const payment = await paymentRepository.create(
          {
            paymentNumber: generateReferenceNumber("PAY"),
            orderId: order._id,
            finalAmount: totalAmount,
            paymentMethod: body.paymentMethod,
            amountReceived: 0,
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

      const completedPayment = await paymentRepository.findById(paymentId);
      return {
        ...toPaymentResponse(completedPayment),
        checkoutUrl: paymentLinkRes.checkoutUrl,
      };
    }

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
      await deductInventoryForOrder(order, session);

      order.orderStatus = ORDER_STATUS.COMPLETED;
      await order.save({ session });

      triggerOrderStatusNotification(order, ORDER_STATUS.COMPLETED).catch((err) =>
        console.error("Error triggering order completed notification:", err),
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

  async handlePayOSWebhook(webhookBody) {
    const verifiedData = await payos.webhooks.verify(webhookBody);

    if (verifiedData.code === "00") {
      const order = await orderRepository.findByOrderCodeInt(
        verifiedData.orderCode,
      );
      if (!order) {
        throw new AppError(
          "Order not found from PayOS webhook",
          404,
          "ORDER_NOT_FOUND",
        );
      }

      const payment = await paymentRepository.findByOrderId(order._id);
      if (payment && payment.paymentStatus === PAYMENT_STATUS.PENDING) {
        await withTransaction(async (session) => {
          await deductInventoryForOrder(order, session);

          order.orderStatus = ORDER_STATUS.COMPLETED;
          await order.save({ session });

          triggerOrderStatusNotification(order, ORDER_STATUS.COMPLETED).catch((err) =>
            console.error("Error triggering order completed notification:", err),
          );

          payment.paymentStatus = PAYMENT_STATUS.PAID;
          payment.amountReceived = verifiedData.amount;
          payment.transactionCode = verifiedData.reference;
          await payment.save({ session });
        });
      }
    }
    return { received: true };
  },

  async getPaymentReceipt(id, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    const order = await getOrderByIdOrThrow(
      payment.orderId?._id ?? payment.orderId,
    );

    assertOrderAccess(order, requestingUserId, requestingRole);
    await reconcilePaymentStatus(payment, order);
    assertReceiptAvailable(payment);

    return toPaymentReceiptResponse(payment, order);
  },

  async printPaymentReceipt(id, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    const order = await getOrderByIdOrThrow(
      payment.orderId?._id ?? payment.orderId,
    );

    assertOrderAccess(order, requestingUserId, requestingRole);
    await reconcilePaymentStatus(payment, order);
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
      startDate: query.startDate,
      endDate: query.endDate,
      page,
      limit,
    });

    return {
      items: items.map(toPaymentListItem),
      pagination: buildPaginationMeta({ page, limit, total }),
    };
  },

  async confirmPayment(id, body, requestingUserId, requestingRole) {
    const payment = await getPaymentOrThrow(id);
    const order = await getOrderByIdOrThrow(
      payment.orderId?._id ?? payment.orderId,
    );

    assertOrderAccess(order, requestingUserId, requestingRole);

    if (payment.paymentStatus !== PAYMENT_STATUS.PENDING) {
      throw new AppError(
        "Only pending payments can be confirmed",
        400,
        "PAYMENT_NOT_PENDING",
      );
    }

    const validatedTxCode = await ensureUniqueTransactionCode(
      body.transactionCode,
      payment._id,
    );

    await withTransaction(async (session) => {
      await deductInventoryForOrder(order, session);

      order.orderStatus = ORDER_STATUS.COMPLETED;
      await order.save({ session });

      triggerOrderStatusNotification(order, ORDER_STATUS.COMPLETED).catch((err) =>
        console.error("Error triggering order completed notification:", err),
      );

      payment.paymentStatus = PAYMENT_STATUS.PAID;
      payment.amountReceived = payment.finalAmount;
      if (validatedTxCode) {
        payment.transactionCode = validatedTxCode;
      }
      await payment.save({ session });
    });

    const completedPayment = await paymentRepository.findById(payment._id);
    return toPaymentResponse(completedPayment);
  },

  async getPaymentByOrderId(orderId, requestingUserId, requestingRole) {
    const order = await getOrderByIdOrThrow(orderId);
    assertOrderAccess(order, requestingUserId, requestingRole);

    const payment = await paymentRepository.findByOrderId(order._id);
    if (!payment) {
      throw new AppError(
        "Payment not found for this order",
        404,
        "PAYMENT_NOT_FOUND",
      );
    }

    return toPaymentResponse(payment);
  },
};

export default paymentService;
