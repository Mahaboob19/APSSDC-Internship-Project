const logger = require('../utils/logger');

/**
 * Centralized error-handling middleware.
 *
 * Express recognizes this as an error handler because it has 4 arguments
 * (err, req, res, next). It must be registered LAST, after all routes.
 *
 * Why centralize this instead of try/catch + res.status() in every
 * controller? It keeps controllers focused on business logic, guarantees
 * a consistent error response shape for the frontend, and gives us a
 * single place to log failures (useful for CloudWatch later).
 */
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  logger.error(`${req.method} ${req.originalUrl} failed: ${err.message}`, {
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
}

/**
 * 404 handler for routes that don't match anything.
 * Registered after all valid routes, before the error handler.
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFoundHandler };
