# ==========================================
# STAGE 1: Build Backend (C++)
# ==========================================
FROM ubuntu:22.04 AS backend-builder
RUN apt-get update && apt-get install -y \
    build-essential cmake libssl-dev \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY backend/ .
RUN mkdir build && cd build && cmake .. && make

# ==========================================
# STAGE 2: Build Frontend (Next.js)
# ==========================================
FROM node:20 AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
# Important: Set API URL to empty so the frontend uses relative paths
# and triggers the Next.js rewrites we added to next.config.ts
ENV NEXT_PUBLIC_API_URL=""
RUN npm run build

# ==========================================
# STAGE 3: Final Runner
# ==========================================
FROM node:20-slim AS runner
WORKDIR /app

# Install runtime dependencies for the C++ backend
RUN apt-get update && apt-get install -y \
    libssl3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create data directory for VaultDB
RUN mkdir -p /app/data
ENV VAULT_DATA_PATH=/app/data

# Copy Backend binary
COPY --from=backend-builder /app/build/vault_server /usr/local/bin/vault_server

# Copy Frontend files
COPY --from=frontend-builder /app/next.config.ts ./
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/node_modules ./node_modules
COPY --from=frontend-builder /app/package.json ./package.json

# Expose Render's default port (typically 10000 or the $PORT env var)
EXPOSE 3000

# Start script to run both
RUN echo '#!/bin/sh\n\
echo "Starting Backend on port 8081..."\n\
cd /app/data && vault_server & \n\
echo "Starting Frontend..."\n\
cd /app && npm start\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
