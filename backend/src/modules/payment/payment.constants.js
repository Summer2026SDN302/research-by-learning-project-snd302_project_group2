import { USER_ROLES } from "../user/user.constants.js";

export const PAYMENT_METHOD = {
  CASH: "Cash",
  CARD: "Card",
  QR: "QR",
};

export const PAYMENT_STATUS = {
  PENDING: "Pending",
  PAID: "Paid",
  FAILED: "Failed",
  REFUNDED: "Refunded",
};

export const PAYMENT_TRANSACTION_CODE_LOCKED_STATUSES = [
  PAYMENT_STATUS.PAID,
  PAYMENT_STATUS.REFUNDED,
];

export const PAYMENT_PROCESS_ROLES = [
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
];

export const PAYMENT_READ_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
];

export const PAYMENT_LIST_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];
