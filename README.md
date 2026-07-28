# AI Sandbox API

A production-ready REST API for executing untrusted code snippets across multiple languages, built with Node.js and Express.

## Features

- **11 languages**: Python, JavaScript, TypeScript, Go, Rust, Java, C, C++, PHP, Ruby, Bash
- **Isolated execution**: each run gets a unique temporary workspace, cleaned up after execution
- **Timeouts**: hard kill after configurable timeout (default 10 s)
- **Output limits**: captured stdout/stderr capped at 1 MB
- **API key auth**: zero-config for local dev; set `API_KEYS` for production
- **Rate limiting**: per-IP request cap (default 30 req/min)
- **Structured logging**: JSON logs via Winston
- **Security headers**: Helmet.js

---

## Quick Start

```bash
cp .env.example .env   # set API_KEYS and any other vars
npm install
npm run dev            # uses nodemon for auto-reload
```

The server starts on `http://localhost:3000` (or `$PORT`).

---

## API Reference

### `GET /`
Returns service status.

### `GET /health`
Returns health check with supported language list.

### `GET /execute`
Returns the list of supported languages.

### `POST /execute`
Execute a code snippet.

**Headers**
```
Content-Type: application/json
X-API-Key: <your-key>          # or Authorization: Bearer <your-key>
```

**Request body**
```json
{
  "language": "python",
  "code": "print('Hello, World!')"
}
```

**Supported language values**
`python` · `javascript` · `typescript` · `go` · `rust` · `java` · `c` · `cpp` · `php` · `ruby` · `bash`

> **Java note**: the public class in your snippet must be named `Main`.

**Success response** `200`
```json
{
  "success": true,
  "output": {
    "stdout": "Hello, World!\n",
    "stderr": "",
    "language": "python",
    "executionTimeMs": 87
  }
}
```

**Error responses**

| Status | Meaning |
|--------|---------|
| 400 | Missing / invalid request body |
| 401 | Missing or invalid API key |
| 408 | Execution timed out |
| 422 | Compile or runtime error (stdout/stderr included) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Configuration

All settings are environment variables (see `.env.example`).

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | `development` / `production` |
| `API_KEYS` | _(empty)_ | Comma-separated valid API keys |
| `EXEC_TIMEOUT_MS` | `10000` | Per-execution hard timeout (ms) |
| `MAX_OUTPUT_BYTES` | `1048576` | Max captured output per run (bytes) |
| `RATE_LIMIT_MAX` | `30` | Max requests per IP per minute |
| `LOG_LEVEL` | `info` | Winston log level |

---

## Deploy on Railway

1. Connect your GitHub repo in the Railway dashboard.
2. Railway auto-detects the Dockerfile — no extra config needed.
3. Add environment variables (`API_KEYS`, `NODE_ENV=production`, etc.) in the Railway **Variables** tab.
4. Deploy. The `/health` endpoint serves the built-in health check.

---

## Project Structure

```
ai-sandbox-api/
├── config/
│   └── index.js          # Centralised config from env vars
├── middleware/
│   ├── auth.js            # API key authentication
│   └── rateLimiter.js     # express-rate-limit setup
├── routes/
│   ├── execute.js         # POST /execute
│   └── health.js          # GET /health
├── services/
│   └── runner.js          # Language runners + temp workspace management
├── utils/
│   ├── cleanup.js         # Safe temp-dir removal
│   └── logger.js          # Winston structured logger
├── server.js              # Express app + startup
├── .env.example
├── Dockerfile
└── package.json
```

---

## License

MIT
