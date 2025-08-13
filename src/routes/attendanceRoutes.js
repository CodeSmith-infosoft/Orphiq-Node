// src/routes/attendanceRoutes.js
const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
const { authenticateToken } = require("../middleware/authMiddleware");

router.use(authenticateToken);
// Events
router.post("/clockin", attendanceController.clockIn);
router.post("/clockout", attendanceController.clockOut);
router.post("/breakin", attendanceController.breakIn);
router.post("/breakout", attendanceController.breakOut);

// Fetch data
router.get("/today/:employeeId", attendanceController.getToday);
router.get("/all/:employeeId", attendanceController.getAll);

module.exports = router;
