import express from "express";

import * as foodItemController from "./food_item.controller.js";
import {
  getFoodItemByIdValidation,
  validateArchive,
  validateCreate,
  validateDelete,
  validateListQuery,
  validateUpdate,
} from "./food_item.validation.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { FOOD_ITEM_ALLOWED_ROLES } from "./food_item.constants.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles(...FOOD_ITEM_ALLOWED_ROLES));

router.get("/", validateListQuery, validateRequest, foodItemController.getFoodItems);
router.get("/:id", getFoodItemByIdValidation, validateRequest, foodItemController.getFoodItemById);
router.post("/", validateCreate, validateRequest, foodItemController.createFoodItem);
router.put("/:id", validateUpdate, validateRequest, foodItemController.updateFoodItem);
router.patch("/:id/archive", validateArchive, validateRequest, foodItemController.updateFoodItemArchive);
router.delete("/:id", validateDelete, validateRequest, foodItemController.deleteFoodItem);

export default router;
