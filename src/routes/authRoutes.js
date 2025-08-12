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
  updateUser
} = require("../controllers/authController");

const {
  authenticateToken,
  optionalAuth,
} = require("../middleware/authMiddleware");

const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many accounts created from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordChangeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 password changes per hour
  message: {
    success: false,
    message: "Too many password change attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", createAccountLimiter, register);
router.post("/login", loginLimiter, login);

router.use(authenticateToken);

router.get("/profile", generalLimiter, getProfile);
router.put("/profile", generalLimiter, updateProfile);
router.put("/deactive/:id", generalLimiter, deactivateUser);
router.put("/update/:id", generalLimiter, updateUser);

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
