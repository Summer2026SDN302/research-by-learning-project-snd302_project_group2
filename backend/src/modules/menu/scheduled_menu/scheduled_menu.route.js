import express from "express";
import * as scheduledMenuController from "./scheduled_menu.controller.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { validateDayParam, validateUpdateBody, validateBatchUpdateBody } from "./scheduled_menu.validation.js";
import {
  SCHEDULED_MENU_READ_ROLES,
  SCHEDULED_MENU_WRITE_ROLES,
} from "./scheduled_menu.constants.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(...SCHEDULED_MENU_READ_ROLES),
  scheduledMenuController.getWeeklySchedule,
);

router.put(
  "/batch",
  authorizeRoles(...SCHEDULED_MENU_WRITE_ROLES),
  validateBatchUpdateBody,
  validateRequest,
  scheduledMenuController.batchUpdateSchedule,
);

router.put(
  "/:dayOfWeek",
  authorizeRoles(...SCHEDULED_MENU_WRITE_ROLES),
  validateDayParam,
  validateUpdateBody,
  validateRequest,
  scheduledMenuController.updateDaySchedule,
);

export default router;
