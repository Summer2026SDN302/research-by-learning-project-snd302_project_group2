import express from "express";
import * as userController from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { validateRequest } from "../../middlewares/validate.middleware.js";
import { changeOwnPasswordValidation, updateProfileValidation } from "./user.validation.js";

const router = express.Router();

router.use(authenticate);

router.get("/me", userController.getProfile);
router.patch("/me", updateProfileValidation, validateRequest, userController.updateProfile);
router.patch("/me/password", changeOwnPasswordValidation, validateRequest, userController.changeOwnPassword);

export default router;
