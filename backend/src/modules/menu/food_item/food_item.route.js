import express from "express";

import * as foodItemController from "./food_item.controller.js";
import {
  getFoodItemByIdValidation,
  validateArchive,
  validateCreate,
  validateListQuery,
  validateUpdate,
} from "./food_item.validation.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { FOOD_ITEM_READ_ROLES, FOOD_ITEM_WRITE_ROLES } from "./food_item.constants.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorizeRoles(...FOOD_ITEM_READ_ROLES), validateListQuery, validateRequest, foodItemController.getFoodItems);
router.get("/:id", authorizeRoles(...FOOD_ITEM_READ_ROLES), getFoodItemByIdValidation, validateRequest, foodItemController.getFoodItemById);
router.post("/", authorizeRoles(...FOOD_ITEM_WRITE_ROLES), validateCreate, validateRequest, foodItemController.createFoodItem);
router.put("/:id", authorizeRoles(...FOOD_ITEM_WRITE_ROLES), validateUpdate, validateRequest, foodItemController.updateFoodItem);
router.patch("/:id/archive", authorizeRoles(...FOOD_ITEM_WRITE_ROLES), validateArchive, validateRequest, foodItemController.updateFoodItemArchive);

export default router;
