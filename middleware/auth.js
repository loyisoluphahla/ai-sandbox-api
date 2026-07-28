const config = require("../config");
const logger = require("../utils/logger");

/**
 * API key authentication middleware.
 *
 * Reads the key from:
 *   - Authorization: Bearer <key>
 *   - X-API-Key: <key>
 *
 * If no API_KEYS are configured the middleware is a no-op (open access),
 * which is handy for local development.
 */
function authMiddleware(req, res, next) {
  if (!config.apiKeys.length) {
    return next(); // no keys configured → open
  }

  const authHeader = req.headers["authorization"] || "";
  const headerKey = req.headers["x-api-key"] || "";

  let provided = headerKey;
  if (!provided && authHeader.startsWith("Bearer ")) {
    provided = authHeader.slice(7).trim();
  }

  if (!provided || !config.apiKeys.includes(provided)) {
    logger.warn({ msg: "Unauthorized request", ip: req.ip, path: req.path });
    return res.status(401).json({
      success: false,
      error: "Unauthorized — provide a valid API key via X-API-Key or Authorization: Bearer",
    });
  }

  next();
}

module.exports = authMiddleware;
