require('dotenv').config();

const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`PlaceSync server running on port ${PORT}`);
});

/**
 * Graceful shutdown for PM2 compatibility.
 *
 * PM2 sends SIGINT/SIGTERM on `pm2 restart`, `pm2 reload`, `pm2 stop`,
 * and during deployments. Without handling these signals, in-flight
 * requests can be cut off abruptly mid-response when the process exits.
 * Here we stop accepting new connections and let existing ones finish
 * before exiting, which makes deploys/restarts cleaner.
 */
function shutdown(signal) {
  logger.info(`${signal} received, shutting down gracefully`);
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Safety net: force-exit if connections don't close in time.
  setTimeout(() => {
    logger.warn('Forcing shutdown after timeout');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
