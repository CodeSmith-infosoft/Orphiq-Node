// src/controllers/screenshotController.js
const screenshotService = require("../models/screenshotService");

module.exports = {
  uploadScreenshotController: async(req, res) => {
    try {
      const { image } = req.body;

      const url = await screenshotService.uploadScreenshot(image);

      res.json({ success: true, url });
    } catch (error) {
      console.error("Screenshot upload error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  saveScreenshot: async (req, res) => {
    try {
      const { employeeId, imagePath } = req.body;
      const screenshot = await screenshotService.saveScreenshot(employeeId, imagePath);
      res.status(201).json({ success: true, screenshot });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error saving screenshot" });
    }
  },

  // API to get all screenshots grouped by user & date
  getAllScreenshotsGrouped: async (req, res) => {
    try {
      const data = await screenshotService.getAllScreenshotsGrouped();
      res.json({ success: true, data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error fetching screenshots" });
    }
  },

  // API to get user screenshots by date
  getUserScreenshotsByDate: async (req, res) => {
    try {
      const { userId, date } = req.params; // e.g. /screenshots/1/2025-08-21
      const screenshots = await screenshotService.getUserScreenshotsByDate(
        parseInt(userId),
        date
      );
      res.json({ success: true, screenshots });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Error fetching user screenshots" });
    }
  },
};
