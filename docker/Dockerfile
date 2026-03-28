# ── Stage 1: Frontend build ──
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY src/frontend/package*.json ./
RUN npm ci --production=false
COPY src/frontend/ ./
RUN npm run build

# ── Stage 2: Production image ──
FROM python:3.12-slim
WORKDIR /app

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx supervisor curl && \
    rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY src/backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Data directory (SQLite + auto-generated keys)
RUN mkdir -p /app/data
VOLUME /app/data

# Copy backend
COPY src/backend/ ./

# Copy frontend build
COPY --from=frontend-build /app/frontend/dist /var/www/html

# Copy nginx + supervisor config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Build args
ARG BUILD_DATE
ARG COMMIT_SHA
ARG VERSION
ENV BUILD_DATE=${BUILD_DATE} COMMIT_SHA=${COMMIT_SHA} VERSION=${VERSION}

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health || exit 1

CMD ["supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
