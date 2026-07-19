import express from "express";
import * as dailyMenuController from "./daily-menu.controller.js";
import {
  generateDailyMenuValidation,
  getMenuByDateValidation,
  updateDailyMenuItemValidation,
  applyAiQuantityValidation,
  applyAiPriceValidation,
  addFoodItemToDailyMenuValidation,
  removeFoodItemFromDailyMenuValidation,
} from "./daily-menu.validation.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { USER_ROLES } from "../../user/user.constants.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET /export - Admin, Manager can export inventory report
router.get(
  "/export",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  dailyMenuController.exportInventory,
);

// GET /today - Staff, Manager, Admin can view today's menu
router.get(
  "/today",
  authorizeRoles(USER_ROLES.STAFF, USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  dailyMenuController.getTodayMenu,
);

// GET /:date - Manager, Admin can view menu by date
router.get(
  "/date/:date",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  getMenuByDateValidation,
  validateRequest,
  dailyMenuController.getMenuByDate,
);

// POST /generate - Manager, Admin can generate daily menu
router.post(
  "/generate",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  generateDailyMenuValidation,
  validateRequest,
  dailyMenuController.generateDailyMenu,
);

// PATCH /:menuId/publish - Manager, Admin can publish daily menu
router.patch(
  "/:menuId/publish",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  validateRequest,
  dailyMenuController.publishDailyMenu,
);

// PATCH /:menuId/items/:itemId - Manager, Admin can update item
router.patch(
  "/:menuId/items/:itemId",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  updateDailyMenuItemValidation,
  validateRequest,
  dailyMenuController.updateDailyMenuItem,
);

// PATCH /:menuId/items/:itemId/apply-ai-quantity - Manager, Admin can apply AI quantity
router.patch(
  "/:menuId/items/:itemId/apply-ai-quantity",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  applyAiQuantityValidation,
  validateRequest,
  dailyMenuController.applyAiQuantity,
);

// PATCH /:menuId/items/:itemId/apply-ai-price - Manager, Admin can apply AI price
router.patch(
  "/:menuId/items/:itemId/apply-ai-price",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  applyAiPriceValidation,
  validateRequest,
  dailyMenuController.applyAiPrice,
);

// POST /:menuId/items - Manager, Admin add a food item to daily menu
router.post(
  "/:menuId/items",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  addFoodItemToDailyMenuValidation,
  validateRequest,
  dailyMenuController.addFoodItemToDailyMenu,
);

// DELETE /:menuId/items/:itemId - Manager, Admin remove a food item from daily menu
router.delete(
  "/:menuId/items/:itemId",
  authorizeRoles(USER_ROLES.MANAGER, USER_ROLES.ADMIN),
  removeFoodItemFromDailyMenuValidation,
  validateRequest,
  dailyMenuController.removeFoodItemFromDailyMenu,
);

export default router;
