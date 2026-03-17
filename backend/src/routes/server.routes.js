const express = require("express");
const { body } = require("express-validator");
const {
  getServers,
  createServer,
  joinServer,
  leaveServer,
  deleteServer,
  discoverServers,
} = require("../controllers/server.controller");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// All server routes require authentication
router.use(authenticate);

router.get("/", getServers);
router.get("/discover", discoverServers);

router.post(
  "/",
  [body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Server name must be 2–100 characters")],
  validate,
  createServer
);

router.post("/:serverId/join", joinServer);
router.delete("/:serverId/leave", leaveServer);
router.delete("/:serverId", deleteServer);

module.exports = router;
