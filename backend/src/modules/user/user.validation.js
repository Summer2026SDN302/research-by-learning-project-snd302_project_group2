import mongoose from "mongoose";
import { body, param, query } from "express-validator";
import { USER_ROLE_VALUES } from "./user.constants.js";

const passwordValidation = (fieldName) =>
  body(fieldName)
    .isString()
    .withMessage("Password must be a string")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .bail()
    .custom((value) => {
      if (String(value).trim().length < 6) {
        throw new Error("Password must not be only spaces");
      }
      return true;
    });

const objectIdParamValidation = [
  param("id").custom((value) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid user id");
    }
    return true;
  }),
];

export const getUsersValidation = [
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be greater than 0"),
  query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("Limit must be from 1 to 100"),
  query("role").optional().isIn(USER_ROLE_VALUES).withMessage("Invalid role"),
  query("isActive").optional().isBoolean().withMessage("isActive must be true or false"),
];

export const getUserByIdValidation = objectIdParamValidation;

export const createUserValidation = [
  body("username")
    .trim()
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters")
    .bail()
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Username can only contain letters, numbers, dot, underscore, and hyphen"),
  passwordValidation("password"),
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("phone").optional({ nullable: true, checkFalsy: true }).trim(),
  body("role").isIn(USER_ROLE_VALUES).withMessage("Invalid role"),
];

export const updateUserValidation = [
  ...objectIdParamValidation,
  body("username")
    .optional()
    .trim()
    .isLength({ min: 4 })
    .withMessage("Username must be at least 4 characters")
    .bail()
    .matches(/^[a-zA-Z0-9._-]+$/)
    .withMessage("Username can only contain letters, numbers, dot, underscore, and hyphen"),
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("email").optional().trim().isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("phone").optional({ nullable: true, checkFalsy: true }).trim(),
  body("role").optional().isIn(USER_ROLE_VALUES).withMessage("Invalid role"),
];

export const updateProfileValidation = [
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("email").optional().trim().isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("phone").optional({ nullable: true, checkFalsy: true }).trim(),
  body("role").not().exists().withMessage("Role cannot be changed from profile"),
  body("isActive").not().exists().withMessage("Status cannot be changed from profile"),
  body("password").not().exists().withMessage("Password cannot be changed from profile update"),
];

export const changeOwnPasswordValidation = [
  passwordValidation("currentPassword"),
  passwordValidation("newPassword"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm password does not match new password"),
];

export const disableUserValidation = objectIdParamValidation;
export const enableUserValidation = objectIdParamValidation;

export const resetUserPasswordValidation = [
  ...objectIdParamValidation,
  passwordValidation("newPassword"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm password does not match new password"),
];