const express = require("express");
const router = express.Router();
const { runCode, SUPPORTED_LANGUAGES } = require("../services/runner");
const logger = require("../utils/logger");

/**
 * GET /execute
 * Returns the list of supported languages.
 */
router.get("/", (req, res) => {
  res.json({ success: true, supportedLanguages: SUPPORTED_LANGUAGES });
});

/**
 * POST /execute
 * Body: { language: string, code: string }
 * Returns: { success, output: { stdout, stderr, language, executionTimeMs } }
 */
router.post("/", async (req, res) => {
  const { language, code } = req.body;

  if (!language || typeof language !== "string") {
    return res.status(400).json({ success: false, error: "language is required and must be a string" });
  }
  if (!code || typeof code !== "string") {
    return res.status(400).json({ success: false, error: "code is required and must be a string" });
  }
  if (!SUPPORTED_LANGUAGES.includes(language.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: `Unsupported language: '${language}'. Supported: ${SUPPORTED_LANGUAGES.join(", ")}`,
    });
  }

  logger.info({ msg: "Execute request", language, ip: req.ip });

  try {
    const result = await runCode(language, code);
    return res.json({ success: true, output: result });
  } catch (err) {
    if (err.timedOut) {
      return res.status(408).json({
        success: false,
        error: "Execution timed out",
        output: { stdout: err.stdout || "", stderr: err.stderr || "" },
      });
    }
    // Compile / runtime errors — still a 200-level response with failure details
    if (err.exitCode !== undefined) {
      return res.status(422).json({
        success: false,
        error: err.message,
        output: { stdout: err.stdout || "", stderr: err.stderr || "" },
      });
    }
    logger.error({ msg: "Unexpected runner error", error: err.message, stack: err.stack });
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;
