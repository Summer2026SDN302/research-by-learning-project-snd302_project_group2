import { Router } from "express";

import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  categoryErrorHandler,
} from "./category.controller.js";
import {
  validateCreate,
  validateListQuery,
  validateStatus,
  validateUpdate,
} from "./category.validation.js";

// TODO: Uncomment when auth middleware is merged from auth team
// import authenticateToken from "../../../middlewares/authenticateToken.js";
// import authorizeRoles from "../../../middlewares/authorizeRoles.js";

const router = Router();

// router.use(authenticateToken, authorizeRoles(["Admin"]));

router.get("/", validateListQuery, getCategories);
router.get("/:id", getCategoryById);
router.post("/", validateCreate, createCategory);
router.put("/:id", validateUpdate, updateCategory);
router.patch("/:id/status", validateStatus, updateCategoryStatus);
router.delete("/:id", deleteCategory);

router.use(categoryErrorHandler);

export default router;
