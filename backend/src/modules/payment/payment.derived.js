import { PAYMENT_STATUS } from "./payment.constants.js";

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
