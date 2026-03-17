const express = require("express");
const { body } = require("express-validator");
const { register, login, getMe } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 32 })
      .withMessage("Username must be 3–32 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username may only contain letters, numbers, and underscores"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  login
);

router.get("/me", authenticate, getMe);

module.exports = router;
