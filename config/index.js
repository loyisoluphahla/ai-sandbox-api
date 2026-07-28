require("dotenv").config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // API key auth — comma-separated list in API_KEYS env var
  apiKeys: process.env.API_KEYS
    ? process.env.API_KEYS.split(",").map((k) => k.trim()).filter(Boolean)
    : [],

  // Code execution limits
  execution: {
    timeoutMs: parseInt(process.env.EXEC_TIMEOUT_MS, 10) || 10000,
    maxOutputBytes: parseInt(process.env.MAX_OUTPUT_BYTES, 10) || 1024 * 1024, // 1 MB
  },

  // Rate limiting
  rateLimit: {
    windowMs: 60 * 1000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 30,
  },
};
