import express from "express";
import * as categoryController from "./category.controller.js";
import {
  validateCreate,
  getCategoryByIdValidation,
  validateListQuery,
  validateStatus,
  validateUpdate,
} from "./category.validation.js";
import { authenticate } from "../../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../../middlewares/role.middleware.js";
import { validateRequest } from "../../../middlewares/validate.middleware.js";
import {
  CATEGORY_READ_ROLES,
  CATEGORY_WRITE_ROLES,
} from "./category.constants.js";

const router = express.Router();

router.use(authenticate);

router.get(
  "/",
  authorizeRoles(...CATEGORY_READ_ROLES),
  validateListQuery,
  validateRequest,
  categoryController.getCategories,
);
router.get(
  "/:id",
  authorizeRoles(...CATEGORY_READ_ROLES),
  getCategoryByIdValidation,
  validateRequest,
  categoryController.getCategoryById,
);
router.post(
  "/",
  authorizeRoles(...CATEGORY_WRITE_ROLES),
  validateCreate,
  validateRequest,
  categoryController.createCategory,
);
router.put(
  "/:id",
  authorizeRoles(...CATEGORY_WRITE_ROLES),
  validateUpdate,
  validateRequest,
  categoryController.updateCategory,
);
router.patch(
  "/:id/status",
  authorizeRoles(...CATEGORY_WRITE_ROLES),
  validateStatus,
  validateRequest,
  categoryController.updateCategoryStatus,
);

export default router;
