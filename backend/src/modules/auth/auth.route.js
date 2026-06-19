import express from "express";
import * as authController from "./auth.controller.js";
import { loginValidation } from "./auth.validation.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";

const router = express.Router();

router.post("/login", loginValidation, validateRequest, authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authController.logout);

export default router;
