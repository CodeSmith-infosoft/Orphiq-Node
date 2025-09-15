// src/services/screenshotService.js
const { prisma } = require("../config/database");
const { v2: cloudinary } = require("cloudinary");
const dotenv = require("dotenv");

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = {
  uploadScreenshot: async (image) => {
    if (!image) {
      throw new Error("No image provided");
    }
    const result = await cloudinary.uploader.upload(image, {
      folder: "screenshots",
    });
    return result.secure_url;
  },

  // Save screenshot path for employee
  saveScreenshot: async (employeeId, imagePath, takenAt = new Date()) => {
    return await prisma.screenshot.create({
      data: {
        employeeId,
        imagePath,
        takenAt,
      },
    });
  },

  // Get all users with screenshot dates
  getAllScreenshotsGrouped: async () => {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        screenshots: {
          orderBy: { capturedAt: "desc" },
        },
      },
    });

    // Group screenshots by date for each user
    return users.map((user) => {
      const grouped = {};
      user.screenshots.forEach((s) => {
        const dateKey = s.capturedAt.toISOString().split("T")[0]; // YYYY-MM-DD
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(s);
      });

      return {
        id: user.id,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        screenshotsByDate: grouped,
      };
    });
  },

  // Get screenshots of a specific user on a particular date
  getUserScreenshotsByDate: async (userId, date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return await prisma.screenshot.findMany({
      where: {
        employeeId: userId,
        capturedAt: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { capturedAt: "asc" },
    });
  },
};
