const fs = require("fs");
const path = require("path");
const logger = require("./logger");

/**
 * Recursively delete a directory (safe: only removes paths inside os.tmpdir).
 */
function removeDir(dirPath) {
  const os = require("os");
  if (!dirPath.startsWith(os.tmpdir())) {
    logger.warn({ msg: "Refusing to remove non-temp path", dirPath });
    return;
  }
  try {
    fs.rmSync(dirPath, { recursive: true, force: true });
  } catch (err) {
    logger.warn({ msg: "Failed to clean up temp dir", dirPath, err: err.message });
  }
}

module.exports = { removeDir };
