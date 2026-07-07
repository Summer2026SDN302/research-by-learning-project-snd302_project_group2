import { getPaymentCompletedAt } from "./payment.derived.js";
import { TAX_PERCENT } from "../order/order.constants.js";

const mapOrderReference = (order) => {
  if (!order) {
    return null;
  }

  if (typeof order === "string") {
    return order;
  }

  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    staffId: order.staffId?._id
      ? {
          _id: order.staffId._id,
          username: order.staffId.username,
          fullName: order.staffId.fullName,
          role: order.staffId.role,
        }
      : order.staffId ?? null,
  };
};

const mapUserReference = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user === "string") {
    return user;
  }

  return {
    _id: user._id,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
  };
};

export const toPaymentListItem = (payment) => ({
  _id: payment._id,
  paymentNumber: payment.paymentNumber,
  orderId: mapOrderReference(payment.orderId),
  paymentMethod: payment.paymentMethod,
  paymentStatus: payment.paymentStatus,
  finalAmount: payment.finalAmount,
  transactionCode: payment.transactionCode ?? null,
  paidAt: getPaymentCompletedAt(payment),
  createdAt: payment.createdAt,
});

export const toPaymentResponse = (payment) => ({
  _id: payment._id,
  paymentNumber: payment.paymentNumber,
  orderId: mapOrderReference(payment.orderId),
  finalAmount: payment.finalAmount,
  paymentMethod: payment.paymentMethod,
  amountReceived: payment.amountReceived,
  changeReturned: payment.changeReturned,
  transactionCode: payment.transactionCode ?? null,
  paymentStatus: payment.paymentStatus,
  paidAt: getPaymentCompletedAt(payment),
  refundedAt: payment.refundedAt ?? null,
  refundedBy: mapUserReference(payment.refundedBy),
  refundReason: payment.refundReason ?? null,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
});

export const toPaymentReceiptResponse = (payment, order) => ({
  paymentId: payment._id,
  paymentNumber: payment.paymentNumber,
  orderId: order?._id ?? payment.orderId?._id ?? payment.orderId,
  orderNumber: order?.orderNumber ?? payment.orderId?.orderNumber ?? null,
  issuedAt: getPaymentCompletedAt(payment) ?? payment.createdAt,
  paymentStatus: payment.paymentStatus,
  staff:
    mapUserReference(order?.staffId) ||
    mapUserReference(payment.orderId?.staffId) ||
    null,
  lineItems: (order?.items ?? []).map((item) => ({
    foodItemId: item.foodItemId?._id ?? item.foodItemId,
    name: item.name,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    note: item.note ?? null,
  })),
  notes: order?.notes ?? null,
  subtotalAmount: order?.subTotal ?? 0,
  discountAmount: order?.discountAmount ?? 0,
  taxRate: order?.taxRate ?? TAX_PERCENT,
  taxAmount: order?.taxAmount ?? 0,
  finalAmount: payment.finalAmount ?? order?.totalAmount ?? 0,
  paymentMethod: payment.paymentMethod,
  amountReceived: payment.amountReceived,
  changeReturned: payment.changeReturned,
  transactionCode: payment.transactionCode ?? null,
});
