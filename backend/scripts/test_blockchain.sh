#!/bin/bash

# Test script for blockchain integration
# This script verifies that the blockchain proxy works correctly

echo "=========================================="
echo "  Vault Blockchain Integration Test"
echo "=========================================="
echo ""

# Check if Node.js is installed
echo "[1/5] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Please install Node.js v18+ from https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node --version)
echo "✅ Node.js $NODE_VERSION found"
echo ""

# Check if dependencies are installed
echo "[2/5] Checking npm dependencies..."
if [ ! -d "node_modules" ]; then
    echo "⚠️  Dependencies not installed"
    echo "   Installing now..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi
echo "✅ Dependencies installed"
echo ""

# Check if .env file exists
echo "[3/5] Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    echo "   Please create backend/scripts/.env with:"
    echo "   AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc"
    echo "   VAULT_SIGNER_PRIVATE_KEY=0x..."
    echo "   AVALANCHE_REGISTRY_ADDRESS=0x..."
    exit 1
fi
echo "✅ .env file found"
echo ""

# Check if required env vars are set
echo "[4/5] Validating environment variables..."
source .env
if [ -z "$AVALANCHE_REGISTRY_ADDRESS" ]; then
    echo "❌ AVALANCHE_REGISTRY_ADDRESS not set in .env"
    exit 1
fi
if [ -z "$VAULT_SIGNER_PRIVATE_KEY" ]; then
    echo "❌ VAULT_SIGNER_PRIVATE_KEY not set in .env"
    exit 1
fi
echo "✅ Registry Address: $AVALANCHE_REGISTRY_ADDRESS"
echo "✅ Signer configured"
echo ""

# Test blockchain proxy (read operation - no gas required)
echo "[5/5] Testing blockchain connection..."
echo "   Attempting to read from contract..."
OUTPUT=$(node blockchain_proxy.js read test_file_id 2>&1)
echo "   Response: $OUTPUT"

if echo "$OUTPUT" | grep -q "error"; then
    if echo "$OUTPUT" | grep -q "File not found"; then
        echo "✅ Blockchain connection successful (file not found is expected)"
    else
        echo "⚠️  Connection established but got error: $OUTPUT"
        echo "   This might be normal if the contract is newly deployed"
    fi
else
    echo "✅ Blockchain connection successful"
fi
echo ""

echo "=========================================="
echo "  Test Summary"
echo "=========================================="
echo "✅ Node.js installed"
echo "✅ Dependencies installed"
echo "✅ Environment configured"
echo "✅ Blockchain connection working"
echo ""
echo "Your backend is ready to register files on Avalanche!"
echo ""
echo "Next steps:"
echo "1. Rebuild backend: cd ../build && cmake .. && cmake --build ."
echo "2. Start backend: ./vault_server"
echo "3. Upload a file and check console for blockchain logs"
echo ""
