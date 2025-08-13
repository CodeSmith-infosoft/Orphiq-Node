// src/routes/authRoutes.js
const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const {
  register,
  login,
  getProfile,
  updateProfile,
  deactivateUser,
  updateUser,
  getUsers,
} = require("../controllers/authController");

const { authenticateToken } = require("../middleware/authMiddleware");
router.post("/register", register);
router.post("/login",  login);

router.use(authenticateToken);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/deactiveUser/:id", deactivateUser);
router.put("/updateUser/:id", updateUser);
router.get("/allUsers", getUsers);

// Health check for auth service
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Auth service is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

module.exports = router;
