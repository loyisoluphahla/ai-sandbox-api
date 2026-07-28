const { createLogger, format, transports } = require("winston");
const { combine, timestamp, errors, json, colorize, printf } = format;

const isProd = process.env.NODE_ENV === "production";

// Dev format: [LEVEL] msg key=val key=val ...
const devFormat = printf(({ level, msg, timestamp: ts, stack, ...meta }) => {
  const extras = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
  return `[${ts}] ${level}: ${msg || JSON.stringify(meta)}${stack ? "\n" + stack : ""}${extras && !msg ? "" : extras}`;
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp(), errors({ stack: true }), json()),
  transports: [
    new transports.Console({
      format: isProd
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(colorize(), timestamp({ format: "HH:mm:ss" }), errors({ stack: true }), devFormat),
    }),
  ],
});

module.exports = logger;
