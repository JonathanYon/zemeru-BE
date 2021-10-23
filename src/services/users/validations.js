import { body } from "express-validator";

export const userValidator = [
  body("username").exists().withMessage("username is required field!"),
  body("role").exists().withMessage("role is required field!"),
  body("email").exists().isEmail().withMessage("email is required field!"),
  body("password")
    .exists()
    .isStrongPassword()
    .withMessage("password is required field!"),
];
