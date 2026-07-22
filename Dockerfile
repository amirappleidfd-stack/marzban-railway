# ──────────────────────────────────────────────────────────
# MHRV Tunnel Panel — Multi-stage Dockerfile
# ──────────────────────────────────────────────────────────

# ── Stage 1: Build Frontend ──────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files first for layer caching
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install

# Copy source and build
COPY frontend/ .
RUN npm run build

# ── Stage 2: Build Backend ──────────────────────────────
FROM python:3.11-slim AS backend-builder

WORKDIR /app/backend

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy and install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ .

# ── Stage 3: Runtime ────────────────────────────────────
FROM python:3.11-slim

# Create non-root user
RUN addgroup --system --gid 1001 tunnel && \
    adduser --system --uid 1001 --gid 1001 tunnel

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    sqlite3 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create directories
WORKDIR /app

# Copy backend from builder
COPY --from=backend-builder /app/backend /app/backend
COPY --from=backend-builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=backend-builder /usr/local/bin /usr/local/bin

# Copy frontend dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R tunnel:tunnel /app

# Switch to non-root user
USER tunnel

# Environment variables
ENV PORT=8080
ENV DB_PATH=/app/data/tunnel.db

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD python3 -c "import urllib.request; urllib.request.urlopen('http://localhost:8080/api/health')" || exit 1

# Run the application
CMD ["python3", "/app/backend/main.py"]
