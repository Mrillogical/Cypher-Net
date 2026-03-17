const express = require("express");
const { getMembers } = require("../controllers/member.controller");
const { authenticate } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.use(authenticate);
router.get("/", getMembers);

module.exports = router;
