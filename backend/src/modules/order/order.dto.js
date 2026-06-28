import { ORDER_PAYMENT_STATUS, TAX_PERCENT } from "./order.constants.js";
import { deriveOrderPaymentStatus } from "../payment/payment.derived.js";

const mapUserReference = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user === "string") {
    return user;
  }

  if (user._id) {
    return {
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    };
  }

  return user;
};

export const toOrderResponse = (order, { payment = null } = {}) => {
  const taxRate = order.taxRate ?? TAX_PERCENT;
  const staff = mapUserReference(order.staffId);
  const paymentStatus = deriveOrderPaymentStatus(payment);
  const paymentId = payment?._id ?? null;

  return {
    _id: order._id,
    orderNumber: order.orderNumber,
    staffId: staff,
    servedBy: staff,
    items: (order.items ?? []).map((item) => ({
      foodItemId: item.foodItemId?._id ?? item.foodItemId,
      name: item.name,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      note: item.note ?? null,
    })),
    notes: order.notes ?? null,
    subTotal: order.subTotal,
    subtotalAmount: order.subTotal,
    discountAmount: order.discountAmount,
    taxRate,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount,
    finalAmount: order.totalAmount,
    orderStatus: order.orderStatus,
    paymentStatus: paymentStatus ?? ORDER_PAYMENT_STATUS.UNPAID,
    paymentId,
    orderDate: order.orderDate,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
};
