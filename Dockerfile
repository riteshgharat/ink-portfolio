# ─── Production Dockerfile for Ink SSH TUI Portfolio ──────────────
FROM docker.io/oven/bun:1.2-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    PORT=2222 \
    HOST=0.0.0.0 \
    MAX_CONNECTIONS=50 \
    MAX_PER_IP=5 \
    IDLE_TIMEOUT_MS=600000

# Install dependencies with frozen lockfile
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source code and assets
COPY tsconfig.json index.ts ./
COPY src/ ./src/

# Expose SSH Port
EXPOSE 2222

# Security: Run as non-root user
USER bun

# Run hardened SSH TUI server
CMD ["bun", "run", "src/server.ts"]
