# Build Stage
FROM ubuntu:22.04 AS builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy source code
COPY . .

# Build the application
RUN mkdir build && cd build && \
    cmake .. && \
    make

# Production Stage
FROM ubuntu:22.04 AS runner

# Install runtime dependencies and Node.js for blockchain proxy
RUN apt-get update && apt-get install -y \
    libssl3 \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Create a directory for data persistence
WORKDIR /data

# Copy the binary and proxy scripts
COPY --from=builder /app/build/vault_server /usr/local/bin/vault_server
COPY --from=builder /app/scripts ./scripts

# Initialize proxy dependencies
RUN cd scripts && npm install

# Expose the backend port
EXPOSE 8081

# Run the server from the data directory so files are created there
CMD ["vault_server"]
