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
FROM ubuntu:22.04 AS runner
WORKDIR /app

# Install runtime dependencies: OpenSSL, Node.js, and CA Certificates
RUN apt-get update && apt-get install -y \
    curl \
    libssl-dev \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
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

# Expose Render's default port ($PORT)
EXPOSE 3000

# Start script to run both
RUN echo '#!/bin/sh\n\
echo "Protocol Initialization: Starting Vault Engine..."\n\
# Touch log file so tail doesn't fail immediately\n\
touch /app/backend.log\n\
# Run backend in background and log to a file we can tail\n\
/usr/local/bin/vault_server > /app/backend.log 2>&1 & \n\
# Stream backend logs to stdout so they show up in Render dashboard\n\
tail -f /app/backend.log & \n\
\n\
# Wait for backend to start\n\
sleep 5\n\
if grep -q "VAULT Engine" /app/backend.log; then\n\
    echo "✓ Vault Engine stable on port 8081"\n\
else\n\
    echo "⚠ Vault Engine startup warning. Checking log..."\n\
    cat /app/backend.log\n\
fi\n\
\n\
echo "Starting Frontend on port $PORT..."\n\
PORT=${PORT:-3000} npm start\n\
' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
