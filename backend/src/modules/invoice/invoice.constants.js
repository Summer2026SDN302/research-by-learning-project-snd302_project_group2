import { USER_ROLES } from "../user/user.constants.js";

export const INVOICE_STATUS = {
  ISSUED: "Issued",
  VOIDED: "Voided",
};

export const INVOICE_READ_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
];

export const INVOICE_PRINT_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
  USER_ROLES.STAFF,
];
