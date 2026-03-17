const { sendError } = require("../utils/response");

// 404 handler — must be placed after all routes
const notFound = (req, res, next) => {
  sendError(res, `Route ${req.originalUrl} not found`, 404);
};

// Global error handler — must be last middleware (4 params)
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error("[ErrorHandler]", err);

  // Prisma-specific errors
  if (err.code === "P2002") {
    const field = err.meta?.target?.[0] || "field";
    return sendError(res, `A record with this ${field} already exists`, 409);
  }
  if (err.code === "P2025") {
    return sendError(res, "Record not found", 404);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal server error";
  sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
