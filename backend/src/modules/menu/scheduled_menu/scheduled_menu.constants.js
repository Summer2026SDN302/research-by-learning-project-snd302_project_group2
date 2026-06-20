import { USER_ROLES } from "../../user/user.constants.js";

export const DAY_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const SCHEDULED_MENU_READ_ROLES = [USER_ROLES.ADMIN, USER_ROLES.MANAGER];
export const SCHEDULED_MENU_WRITE_ROLES = [USER_ROLES.ADMIN];
