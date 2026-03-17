const express = require("express");
const { body } = require("express-validator");
const { getChannels, createChannel, deleteChannel } = require("../controllers/channel.controller");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router({ mergeParams: true });

router.use(authenticate);

router.get("/", getChannels);

router.post(
  "/",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Channel name must be 2–100 characters"),
    body("type").optional().isIn(["TEXT", "ANNOUNCEMENT"]).withMessage("Invalid channel type"),
  ],
  validate,
  createChannel
);

router.delete("/:channelId", deleteChannel);

module.exports = router;
