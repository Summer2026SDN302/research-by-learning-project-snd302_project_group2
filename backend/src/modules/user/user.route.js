import express from "express";
import * as userController from "./user.controller.js";
import {
  createUserValidation,
  disableUserValidation,
  enableUserValidation,
  getUserByIdValidation,
  getUsersValidation,
  resetUserPasswordValidation,
  updateUserValidation,
} from "./user.validation.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeRoles } from "../../middlewares/role.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.use(authenticate);
router.use(authorizeRoles("Admin"));

router.get("/", getUsersValidation, validateRequest, userController.getUsers);
router.get("/:id", getUserByIdValidation, validateRequest, userController.getUserById);
router.post("/", createUserValidation, validateRequest, userController.createUser);
router.patch("/:id", updateUserValidation, validateRequest, userController.updateUser);
router.patch("/:id/disable", disableUserValidation, validateRequest, userController.disableUser);
router.patch("/:id/enable", enableUserValidation, validateRequest, userController.enableUser);
router.patch("/:id/reset-password", resetUserPasswordValidation, validateRequest, userController.resetUserPassword);

export default router;
