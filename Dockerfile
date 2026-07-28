# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:22-slim AS base

# Install language runtimes and compilers
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    golang \
    rustc \
    default-jdk \
    gcc \
    g++ \
    php-cli \
    ruby \
    bash \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Node dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# ── Runtime ───────────────────────────────────────────────────────────────────
ENV NODE_ENV=production
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', r => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "server.js"]
