import express from "express";
import * as categoryController from "./category.controller.js";
import {
  validateCreate,
  validateDelete,
  getCategoryByIdValidation,
  validateListQuery,
  validateStatus,
  validateUpdate,
} from "./category.validation.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import { CATEGORY_ALLOWED_ROLES } from "./category.constants.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles(...CATEGORY_ALLOWED_ROLES));

router.get("/", validateListQuery, validateRequest, categoryController.getCategories);
router.get("/:id", getCategoryByIdValidation, validateRequest, categoryController.getCategoryById);
router.post("/", validateCreate, validateRequest, categoryController.createCategory);
router.put("/:id", validateUpdate, validateRequest, categoryController.updateCategory);
router.patch("/:id/status", validateStatus, validateRequest, categoryController.updateCategoryStatus);
router.delete("/:id", validateDelete, validateRequest, categoryController.deleteCategory);

export default router;