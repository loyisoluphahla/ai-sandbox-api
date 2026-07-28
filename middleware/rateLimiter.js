const rateLimit = require("express-rate-limit");
const config = require("../config");
const logger = require("../utils/logger");

const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler(req, res) {
    logger.warn({ msg: "Rate limit exceeded", ip: req.ip });
    res.status(429).json({
      success: false,
      error: "Too many requests — please slow down.",
    });
  },
});

module.exports = limiter;
