// src/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responses");

const JWT_SECRET =
  process.env.JWT_SECRET || "your_jwt_secret_key_change_this_in_production";

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return errorResponse(res, "Access token required", 401);
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          return errorResponse(res, "Token expired", 401);
        }
        if (err.name === "JsonWebTokenError") {
          return errorResponse(res, "Invalid token", 401);
        }
        return errorResponse(res, "Token verification failed", 403);
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return errorResponse(res, "Authentication failed", 500);
  }
};

// Optional middleware for routes that work with or without authentication
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      req.user = decoded;
    }
    next();
  });
};

// Middleware to check if user is admin (example for future use)
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, "Authentication required", 401);
  }

  // You would typically check user role from database
  // For now, this is a placeholder
  if (!req.user.isAdmin) {
    return errorResponse(res, "Admin access required", 403);
  }

  next();
};

// Rate limiting middleware (basic implementation)
const rateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();

    if (!requests.has(clientId)) {
      requests.set(clientId, []);
    }

    const clientRequests = requests.get(clientId);

    // Remove old requests outside the window
    const validRequests = clientRequests.filter(
      (timestamp) => now - timestamp < windowMs
    );

    if (validRequests.length >= maxRequests) {
      return errorResponse(
        res,
        "Too many requests, please try again later",
        429
      );
    }

    validRequests.push(now);
    requests.set(clientId, validRequests);

    next();
  };
};

// Middleware to validate request body size
const validateBodySize = (maxSize = "10mb") => {
  return (req, res, next) => {
    const contentLength = req.get("content-length");

    if (contentLength) {
      const sizeInMB = parseInt(contentLength) / (1024 * 1024);
      const maxSizeNum = parseInt(maxSize);

      if (sizeInMB > maxSizeNum) {
        return errorResponse(
          res,
          `Request body too large. Maximum size is ${maxSize}`,
          413
        );
      }
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireAdmin,
  rateLimit,
  validateBodySize,
};
