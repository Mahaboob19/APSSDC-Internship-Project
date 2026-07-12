/**
 * Simple structured logger.
 *
 * Why not a heavy library (Winston/Pino) here?
 * - This is a prototype app; the goal is to produce clean, timestamped,
 *   greppable log lines on stdout.
 * - PM2 captures stdout/stderr into log files automatically.
 * - The CloudWatch Agent (configured in a later phase) will tail those
 *   PM2 log files and ship them to CloudWatch Logs.
 * - Keeping this dependency-free avoids unnecessary complexity, in line
 *   with the project's "simple but professional" principle.
 */

function timestamp() {
  return new Date().toISOString();
}

function info(message, meta = {}) {
  console.log(`[INFO] [${timestamp()}] ${message}`, Object.keys(meta).length ? meta : '');
}

function warn(message, meta = {}) {
  console.warn(`[WARN] [${timestamp()}] ${message}`, Object.keys(meta).length ? meta : '');
}

function error(message, meta = {}) {
  console.error(`[ERROR] [${timestamp()}] ${message}`, Object.keys(meta).length ? meta : '');
}

module.exports = { info, warn, error };
