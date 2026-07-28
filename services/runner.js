const { spawn } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { removeDir } = require("../utils/cleanup");
const config = require("../config");
const logger = require("../utils/logger");

/**
 * Language configuration.
 * Each entry describes how to write the source file and how to run it.
 *
 * prepare(dir)  → optional async fn that runs before execution (e.g. compile)
 * run(dir)      → returns [command, args[]] to execute
 * filename      → source file name inside the workspace
 */
const LANGUAGES = {
  python: {
    filename: "code.py",
    run: (dir) => ["python3", [path.join(dir, "code.py")]],
  },
  javascript: {
    filename: "code.js",
    run: (dir) => ["node", [path.join(dir, "code.js")]],
  },
  typescript: {
    filename: "code.ts",
    run: (dir) => ["npx", ["tsx", path.join(dir, "code.ts")]],
  },
  go: {
    filename: "code.go",
    run: (dir) => ["go", ["run", path.join(dir, "code.go")]],
  },
  rust: {
    filename: "code.rs",
    prepare: async (dir) => compile(dir, "rustc", ["path.join(dir,'code.rs')", "-o", path.join(dir, "out")]),
    run: (dir) => [path.join(dir, "out"), []],
    customPrepare: async (dir) => {
      await runProcess("rustc", [path.join(dir, "code.rs"), "-o", path.join(dir, "out")], dir);
    },
  },
  java: {
    filename: "Main.java",
    customPrepare: async (dir) => {
      await runProcess("javac", [path.join(dir, "Main.java")], dir);
    },
    run: (dir) => ["java", ["-cp", dir, "Main"]],
  },
  c: {
    filename: "code.c",
    customPrepare: async (dir) => {
      await runProcess("gcc", [path.join(dir, "code.c"), "-o", path.join(dir, "out")], dir);
    },
    run: (dir) => [path.join(dir, "out"), []],
  },
  cpp: {
    filename: "code.cpp",
    customPrepare: async (dir) => {
      await runProcess("g++", [path.join(dir, "code.cpp"), "-o", path.join(dir, "out")], dir);
    },
    run: (dir) => [path.join(dir, "out"), []],
  },
  php: {
    filename: "code.php",
    run: (dir) => ["php", [path.join(dir, "code.php")]],
  },
  ruby: {
    filename: "code.rb",
    run: (dir) => ["ruby", [path.join(dir, "code.rb")]],
  },
  bash: {
    filename: "code.sh",
    run: (dir) => ["bash", [path.join(dir, "code.sh")]],
  },
};

/**
 * Run a process and collect stdout/stderr.
 * Throws an error (with stdout+stderr attached) if exit code is non-zero.
 */
function runProcess(cmd, args, cwd, timeoutMs = config.execution.timeoutMs) {
  return new Promise((resolve, reject) => {
    const proc = spawn(cmd, args, { cwd, shell: false });

    let stdout = "";
    let stderr = "";
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      proc.kill("SIGKILL");
    }, timeoutMs);

    proc.stdout.on("data", (d) => {
      stdout += d.toString();
      if (stdout.length > config.execution.maxOutputBytes) proc.kill("SIGKILL");
    });
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      if (stderr.length > config.execution.maxOutputBytes) proc.kill("SIGKILL");
    });

    proc.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        return reject(Object.assign(new Error("Execution timed out"), { stdout, stderr, timedOut: true }));
      }
      if (code !== 0) {
        return reject(Object.assign(new Error(`Process exited with code ${code}`), { stdout, stderr, exitCode: code }));
      }
      resolve({ stdout, stderr });
    });

    proc.on("error", (err) => {
      clearTimeout(timer);
      reject(Object.assign(err, { stdout, stderr }));
    });
  });
}

/**
 * Execute code in an isolated temporary workspace.
 *
 * @param {string} language
 * @param {string} code
 * @returns {{ stdout, stderr, language, executionTimeMs }}
 */
async function runCode(language, code) {
  const lang = language.toLowerCase();
  const langConfig = LANGUAGES[lang];

  if (!langConfig) {
    const err = new Error(`Unsupported language: ${language}`);
    err.statusCode = 400;
    throw err;
  }

  const workspaceId = uuidv4();
  const workDir = path.join(os.tmpdir(), `sandbox-${workspaceId}`);

  fs.mkdirSync(workDir, { recursive: true });
  logger.info({ msg: "Workspace created", language: lang, workspaceId });

  const start = Date.now();

  try {
    // Write source file
    const srcPath = path.join(workDir, langConfig.filename);
    fs.writeFileSync(srcPath, code, "utf8");

    // Optional compile / prepare step
    if (langConfig.customPrepare) {
      await langConfig.customPrepare(workDir);
    }

    // Execute
    const [cmd, args] = langConfig.run(workDir);
    const { stdout, stderr } = await runProcess(cmd, args, workDir);

    const executionTimeMs = Date.now() - start;
    logger.info({ msg: "Execution complete", language: lang, workspaceId, executionTimeMs });

    return { stdout, stderr, language: lang, executionTimeMs };
  } catch (err) {
    const executionTimeMs = Date.now() - start;
    logger.warn({ msg: "Execution failed", language: lang, workspaceId, executionTimeMs, error: err.message });

    // Attach extra context and re-throw
    err.stdout = err.stdout || "";
    err.stderr = err.stderr || "";
    err.executionTimeMs = executionTimeMs;
    throw err;
  } finally {
    removeDir(workDir);
  }
}

module.exports = { runCode, SUPPORTED_LANGUAGES: Object.keys(LANGUAGES) };
