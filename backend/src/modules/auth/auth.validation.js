import { body } from "express-validator";

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

export const loginValidation = [
  body().custom((value) => {
    const identifier = value.identifier || value.username || value.email;

    if (!identifier || String(identifier).trim().length === 0) {
      throw new Error("Username or email is required");
    }

    return true;
  }),

  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .notEmpty()
    .withMessage("Password is required"),
];

export const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
];

export const resetPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .bail()
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .bail()
    .matches(/^\d{6}$/)
    .withMessage("OTP must be 6 digits"),

  passwordValidation("newPassword"),

  body("confirmPassword")
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage("Confirm password does not match new password"),
];