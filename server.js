// server.js
require("dotenv").config();

const app = require("./src/app");
const { connectDB, disconnectDB } = require("./src/config/database");
const cron = require("node-cron");
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

let server;

const startServer = async () => {
  try {
    cron.schedule("*/10 * * * *", async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/auth/serverNotSleep"
        );
        const data = await response.json();
        console.log("Cron Ping Response:", data);
      } catch (error) {
        console.error("Cron Ping Failed:", error);
      }
    });

    // Connect to database
    await connectDB();

    // Start server
    server = app.listen(PORT, () => {
      console.log(`🚀 Orphiq API Server Started Successfully!`);
    });

    // Handle server errors
    server.on("error", (error) => {
      if (error.syscall !== "listen") {
        throw error;
      }

      switch (error.code) {
        case "EACCES":
          console.error(`❌ Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case "EADDRINUSE":
          console.error(`❌ Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      console.log("📴 HTTP server closed");

      try {
        await disconnectDB();
        console.log("📴 Database connection closed");
        console.log("✅ Graceful shutdown completed");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error during graceful shutdown:", error);
        process.exit(1);
      }
    });

    // Force close after timeout
    setTimeout(() => {
      console.error("⚠️  Forced shutdown due to timeout");
      process.exit(1);
    }, 30000); // 30 seconds timeout
  } else {
    process.exit(0);
  }
};

// Handle shutdown signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions and rejections
process.on("uncaughtException", (error) => {
  console.error("💥 Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("unhandledRejection");
});

// Start the server
startServer();
