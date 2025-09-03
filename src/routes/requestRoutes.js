const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { addRequest, getRequest } = require("../controllers/requestController");

router.use(authenticateToken);

router.post("/", addRequest);
router.get("/", getRequest);

module.exports = router;
