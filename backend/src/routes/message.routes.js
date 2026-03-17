const express = require("express");
const { body } = require("express-validator");
const { getMessages, createMessage, updateMessage, deleteMessage } = require("../controllers/message.controller");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get("/", getMessages);

router.post(
  "/",
  [body("content").trim().isLength({ min: 1, max: 4000 }).withMessage("Message must be 1–4000 characters")],
  validate,
  createMessage
);

router.patch(
  "/:messageId",
  [body("content").trim().isLength({ min: 1, max: 4000 }).withMessage("Message must be 1–4000 characters")],
  validate,
  updateMessage
);

router.delete("/:messageId", deleteMessage);

module.exports = router;
