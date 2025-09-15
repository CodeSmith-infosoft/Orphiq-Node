// src/routes/screenshotRoutes.js
const express = require("express");
const router = express.Router();
const screenshotController = require("../controllers/screenshotController");

// Save screenshot
router.post("/", screenshotController.saveScreenshot);

router.post("/take", screenshotController.uploadScreenshotController);

// Get all screenshots grouped by user & date
router.get("/", screenshotController.getAllScreenshotsGrouped);

// Get screenshots of a specific user on a specific date
router.get("/:userId", screenshotController.getUserScreenshotsByDate);

module.exports = router;
