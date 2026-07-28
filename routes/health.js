const express = require("express");
const router = express.Router();
const { SUPPORTED_LANGUAGES } = require("../services/runner");

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "AI Sandbox API",
    supportedLanguages: SUPPORTED_LANGUAGES,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
