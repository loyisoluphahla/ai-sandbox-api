require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const config = require("./config");
const logger = require("./utils/logger");
const authMiddleware = require("./middleware/auth");
const rateLimiter = require("./middleware/rateLimiter");

const executeRoute = require("./routes/execute");
const healthRoute = require("./routes/health");

const app = express();

// ── Security & parsing ────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "512kb" }));

// ── Public routes ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "online", service: "AI Sandbox API" });
});
app.use("/health", healthRoute);

// ── Authenticated & rate-limited routes ───────────────────────────────────────
app.use(rateLimiter);
app.use(authMiddleware);

app.use("/execute", executeRoute);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// ── Global error handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error({ msg: "Unhandled error", error: err.message, stack: err.stack });
  res.status(500).json({ success: false, error: "Internal server error" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  logger.info({
    msg: "Sandbox API started",
    port: config.port,
    env: config.nodeEnv,
    auth: config.apiKeys.length ? "enabled" : "disabled (no API_KEYS set)",
  });
});

module.exports = app;
