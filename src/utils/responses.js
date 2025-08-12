// src/utils/responses.js

// Standard success response format
const successResponse = (res, data = {}, statusCode = 200) => {
  const response = {
    success: true,
    timestamp: new Date().toISOString(),
    ...data,
  };

  return res.status(statusCode).json(response);
};

// Standard error response format
const errorResponse = (
  res,
  message = "An error occurred",
  statusCode = 500,
  details = null
) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  // Add error details in development mode
  if (process.env.NODE_ENV === "development" && details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

// Validation error response
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: "Validation failed",
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString(),
  });
};

// Pagination response format
const paginatedResponse = (res, data, pagination, statusCode = 200) => {
  const response = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasNext: pagination.page < Math.ceil(pagination.total / pagination.limit),
      hasPrev: pagination.page > 1,
    },
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("Global error handler:", err);

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(res, "Token expired", 401);
  }

  // Validation errors
  if (err.name === "ValidationError") {
    return validationErrorResponse(res, err.message);
  }

  // Database errors
  if (err.code) {
    switch (err.code) {
      case "23505": // Unique violation
        return errorResponse(res, "Resource already exists", 400);
      case "23503": // Foreign key violation
        return errorResponse(res, "Referenced resource does not exist", 400);
      case "23502": // Not null violation
        return errorResponse(res, "Required field is missing", 400);
      case "42P01": // Undefined table
        return errorResponse(res, "Database table not found", 500);
      default:
        console.error("Database error:", err);
        return errorResponse(res, "Database error occurred", 500);
    }
  }

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    return errorResponse(res, "File size too large", 400);
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return errorResponse(res, "Too many files", 400);
  }

  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return errorResponse(res, "Unexpected file field", 400);
  }

  // Default error response
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || "Internal server error";

  return errorResponse(
    res,
    message,
    statusCode,
    process.env.NODE_ENV === "development" ? err.stack : null
  );
};

// Not found middleware
const notFoundHandler = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};

// Async error wrapper - wraps async functions to catch errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
