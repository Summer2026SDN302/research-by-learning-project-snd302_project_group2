import express from "express";
import * as authController from "./auth.controller.js";
import {
  forgotPasswordValidation,
  loginValidation,
  resetPasswordValidation,
} from "./auth.validation.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/login", loginValidation, validateRequest, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateRequest,
  authController.forgotPassword,
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  authController.resetPassword,
);

export default router;