const express = require('express');
const helmet = require('helmet');
const path = require('path');

const companyRoutes = require('./routes/companies');
const applicationRoutes = require('./routes/applications');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// --- Global middleware ---
// helmet sets standard security-related HTTP headers (X-Content-Type-Options,
// X-Frame-Options, etc.) — baseline hardening for any public-facing Express app.
app.use(helmet());

// NOTE: cors() was intentionally removed. The frontend (public/) and the API
// are served by this same Express app on the same origin, so cross-origin
// requests are never needed. Leaving CORS enabled would only widen the
// attack surface by letting any external website call this API from a
// browser. If a separate frontend origin is ever introduced, CORS should
// be re-added with an explicit allow-list, not a wildcard.

// Parses JSON request bodies (for POST/PUT). A size limit is set to reduce
// the risk of oversized-payload abuse; this app's payloads (company/
// application records) are small, so 10kb is generous headroom.
app.use(express.json({ limit: '10kb' }));

// Basic request logging — helps trace activity in CloudWatch Logs later
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// --- Static frontend ---
// Serves everything in src/public (HTML/CSS/JS) as the website itself.
app.use(express.static(path.join(__dirname, 'public')));

// --- Health check endpoint ---
// Used by: deployment scripts (to confirm the app started successfully)
// and, later, CloudWatch (to confirm the process is alive).
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use('/api/companies', companyRoutes);
app.use('/api/applications', applicationRoutes);

// --- 404 + centralized error handling (must be registered last) ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
