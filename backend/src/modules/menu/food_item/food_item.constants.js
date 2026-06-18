import { USER_ROLES } from "../../user/user.constants.js";

export const FOOD_ITEM_READ_ROLES = [
  USER_ROLES.ADMIN,
  USER_ROLES.MANAGER,
];

export const FOOD_ITEM_WRITE_ROLES = [USER_ROLES.ADMIN];