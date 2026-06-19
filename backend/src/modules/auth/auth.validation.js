import { body } from "express-validator";

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
