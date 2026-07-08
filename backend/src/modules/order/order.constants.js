import { USER_ROLES } from "../user/user.constants.js";

export const ORDER_READ_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
];

export const ORDER_READ_ALL_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];
export const ORDER_MY_ORDERS_ROLES = [USER_ROLES.MANAGER, USER_ROLES.STAFF];

export const ORDER_CREATE_ROLES = [
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
];

export const ORDER_STATUS_MANAGE_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER, USER_ROLES.STAFF];


export const ORDER_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RETURNED: "Returned",
};

export const VALID_STATUS_TRANSITIONS = {
  Pending: ["Confirmed", "Cancelled"],
  Confirmed: ["Completed", "Returned"],
  Completed: [],
  Cancelled: [],
  Returned: [],
};
