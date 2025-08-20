// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const holidayRoutes = require("./routes/holidayRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const { errorHandler, notFoundHandler } = require("./utils/responses");
const { healthCheck } = require("./config/database");

const app = express();

// Trust proxy (important for rate limiting and getting real IP addresses)
app.set("trust proxy", 1);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL || "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
    ];

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(
  express.json({
    limit: "10mb",
    strict: true,
  })
);
app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// Request timeout middleware
app.use((req, res, next) => {
  req.setTimeout(30000); // 30 seconds timeout
  res.setTimeout(30000);
  next();
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/holiday", holidayRoutes);
app.use("/api/leave", leaveRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Orphiq API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Health check endpoint with database status
app.get("/health", async (req, res) => {
  try {
    const dbHealth = await healthCheck();

    res.json({
      success: true,
      message: "Server is healthy",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
      },
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: "Server is unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Graceful shutdown handling
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

module.exports = app;
