# AI Sandbox API

A production-ready REST API for executing code snippets in 11 languages, built with Node.js and Express.

## How to run

```bash
npm start        # production
npm run dev      # development (nodemon auto-reload)
```

The server starts on port **3000** (configurable via `PORT` env var).

## Workflow

- **Start application** — `npm start` → listens on port 3000

## Environment variables

Copy `.env.example` to `.env` and set values before running:

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | `3000` | HTTP port |
| `NODE_ENV` | `development` | Set to `production` on Railway |
| `API_KEYS` | _(empty = open)_ | Comma-separated valid API keys |
| `EXEC_TIMEOUT_MS` | `10000` | Per-execution hard kill timeout (ms) |
| `MAX_OUTPUT_BYTES` | `1048576` | Max captured output per run |
| `RATE_LIMIT_MAX` | `30` | Max requests per IP per minute |
| `LOG_LEVEL` | `info` | Winston log level |

## Key endpoints

- `GET /` — status check
- `GET /health` — health + language list
- `GET /execute` — list supported languages
- `POST /execute` — run code (`{ language, code }`)

## Supported languages

`python` · `javascript` · `typescript` · `go` · `rust` · `java` · `c` · `cpp` · `php` · `ruby` · `bash`

> Java: the top-level public class must be named `Main`.

## Deploy on Railway

1. Push to GitHub, connect repo in Railway dashboard.
2. Railway auto-detects the Dockerfile.
3. Set `API_KEYS`, `NODE_ENV=production`, and any other vars in the Variables tab.
4. Deploy — `/health` serves the built-in Docker health check.

## User preferences

- Keep the existing project structure (no migration or restructuring).
