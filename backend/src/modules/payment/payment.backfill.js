import { ORDER_PAYMENT_STATUS } from "../order/order.constants.js";
import { PAYMENT_METHOD, PAYMENT_STATUS } from "./payment.constants.js";

const LEGACY_QR_PROVIDER_BY_METHOD = {
  Momo: "Momo",
  VNPay: "VNPay",
};

const normalizeText = (value) => {
  if (value == null) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized || null;
};

const toComparableId = (value) => {
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

const assignIfChanged = (updates, key, nextValue, currentValue) => {
  if (toComparableId(nextValue) !== toComparableId(currentValue)) {
    updates[key] = nextValue;
  }
};

export const normalizeLegacyPaymentMethod = (paymentMethod, providerName) => {
  const normalizedProviderName = normalizeText(providerName);

  if (Object.values(PAYMENT_METHOD).includes(paymentMethod)) {
    return {
      paymentMethod,
      providerName: normalizedProviderName,
    };
  }

  if (LEGACY_QR_PROVIDER_BY_METHOD[paymentMethod]) {
    return {
      paymentMethod: PAYMENT_METHOD.QR,
      providerName:
        normalizedProviderName ?? LEGACY_QR_PROVIDER_BY_METHOD[paymentMethod],
    };
  }

  return {
    paymentMethod,
    providerName: normalizedProviderName,
  };
};

export const deriveOrderPaymentStatus = (payment) => {
  if (!payment) {
    return ORDER_PAYMENT_STATUS.UNPAID;
  }

  if (payment.paymentStatus === PAYMENT_STATUS.PAID) {
    return ORDER_PAYMENT_STATUS.PAID;
  }

  if (payment.paymentStatus === PAYMENT_STATUS.PENDING) {
    return ORDER_PAYMENT_STATUS.PENDING;
  }

  if (payment.paymentStatus === PAYMENT_STATUS.REFUNDED) {
    return ORDER_PAYMENT_STATUS.REFUNDED;
  }

  return ORDER_PAYMENT_STATUS.UNPAID;
};

export const buildPaymentBackfillUpdate = (payment, linkedInvoice = null) => {
  const updates = {};
  const { paymentMethod, providerName } = normalizeLegacyPaymentMethod(
    payment.paymentMethod,
    payment.providerName,
  );

  if (paymentMethod !== payment.paymentMethod) {
    updates.paymentMethod = paymentMethod;
  }

  if (providerName !== normalizeText(payment.providerName)) {
    updates.providerName = providerName;
  }

  if (!Array.isArray(payment.auditTrail)) {
    updates.auditTrail = [];
  }

  const resolvedInvoiceId = linkedInvoice?._id ?? payment.invoiceId ?? null;

  if (resolvedInvoiceId) {
    assignIfChanged(updates, "invoiceId", resolvedInvoiceId, payment.invoiceId);
  }

  if (
    payment.paymentStatus === PAYMENT_STATUS.PAID &&
    !payment.paidAt
  ) {
    updates.paidAt = payment.updatedAt ?? payment.createdAt ?? new Date();
  }

  return updates;
};

export const buildInvoiceBackfillUpdate = (invoice) => {
  const updates = {};

  if (!Object.prototype.hasOwnProperty.call(invoice, "notes")) {
    updates.notes = null;
  }

  if (typeof invoice.printCount !== "number") {
    updates.printCount = 0;
  }

  if (!Object.prototype.hasOwnProperty.call(invoice, "lastPrintedAt")) {
    updates.lastPrintedAt = null;
  }

  if (!Object.prototype.hasOwnProperty.call(invoice, "lastPrintedBy")) {
    updates.lastPrintedBy = null;
  }

  return updates;
};

export const buildOrderBackfillUpdate = (
  order,
  linkedPayment = null,
  linkedInvoice = null,
) => {
  const updates = {};

  if (!Object.prototype.hasOwnProperty.call(order, "notes")) {
    updates.notes = null;
  }

  if (Array.isArray(order.items)) {
    const normalizedItems = order.items.map((item) =>
      Object.prototype.hasOwnProperty.call(item, "note")
        ? item
        : { ...item, note: null },
    );

    const hasItemNoteBackfill = normalizedItems.some(
      (item, index) => !Object.prototype.hasOwnProperty.call(order.items[index], "note"),
    );

    if (hasItemNoteBackfill) {
      updates.items = normalizedItems;
    }
  }

  const resolvedPaymentId = linkedPayment?._id ?? null;
  const resolvedInvoiceId = linkedInvoice?._id ?? linkedPayment?.invoiceId ?? null;

  if (resolvedPaymentId) {
    assignIfChanged(updates, "paymentId", resolvedPaymentId, order.paymentId);
  } else if (order.paymentId) {
    updates.paymentId = null;
  }

  if (resolvedInvoiceId) {
    assignIfChanged(updates, "invoiceId", resolvedInvoiceId, order.invoiceId);
  } else if (order.invoiceId) {
    updates.invoiceId = null;
  }

  const nextPaymentStatus = deriveOrderPaymentStatus(linkedPayment);

  if (order.paymentStatus !== nextPaymentStatus) {
    updates.paymentStatus = nextPaymentStatus;
  }

  return updates;
};
