import { ORDER_PAYMENT_STATUS } from "../order/order.constants.js";
import { PAYMENT_STATUS } from "./payment.constants.js";

const toTimestamp = (value) => {
  if (!value) {
    return 0;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const normalizeOrderId = (value) => {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  if (value._id) {
    return String(value._id);
  }

  return String(value);
};

export const deriveOrderPaymentStatus = (payment) => {
  if (!payment) {
    return ORDER_PAYMENT_STATUS.UNPAID;
  }

  switch (payment.paymentStatus) {
    case PAYMENT_STATUS.PAID:
      return ORDER_PAYMENT_STATUS.PAID;
    case PAYMENT_STATUS.PENDING:
      return ORDER_PAYMENT_STATUS.PENDING;
    case PAYMENT_STATUS.REFUNDED:
      return ORDER_PAYMENT_STATUS.REFUNDED;
    default:
      return ORDER_PAYMENT_STATUS.UNPAID;
  }
};

export const getPaymentCompletedAt = (payment) => {
  if (!payment) {
    return null;
  }

  if (
    ![PAYMENT_STATUS.PAID, PAYMENT_STATUS.REFUNDED].includes(
      payment.paymentStatus,
    )
  ) {
    return null;
  }

  return payment.paidAt ?? payment.updatedAt ?? payment.createdAt ?? null;
};

export const comparePaymentsByRecencyDesc = (left, right) =>
  toTimestamp(right?.updatedAt ?? right?.createdAt) -
  toTimestamp(left?.updatedAt ?? left?.createdAt);

export const selectLatestPayment = (payments = []) => {
  if (!Array.isArray(payments) || payments.length === 0) {
    return null;
  }

  return [...payments].sort(comparePaymentsByRecencyDesc)[0];
};

export const mapLatestPaymentsByOrderId = (payments = []) => {
  const entries = new Map();

  [...payments]
    .sort(comparePaymentsByRecencyDesc)
    .forEach((payment) => {
      const orderId = normalizeOrderId(payment.orderId);

      if (!orderId || entries.has(orderId)) {
        return;
      }

      entries.set(orderId, payment);
    });

  return entries;
};
