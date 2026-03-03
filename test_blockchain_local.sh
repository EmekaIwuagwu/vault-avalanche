#!/bin/bash

echo "=== Testing Blockchain Integration Locally ==="
echo ""

# Test 1: Check if Node.js is available
echo "1. Checking Node.js..."
if command -v node &> /dev/null; then
    echo "✅ Node.js found: $(node --version)"
else
    echo "❌ Node.js not found"
    exit 1
fi

# Test 2: Check if scripts directory exists
echo ""
echo "2. Checking scripts directory..."
if [ -d "backend/scripts" ]; then
    echo "✅ Scripts directory exists"
else
    echo "❌ Scripts directory not found"
    exit 1
fi

# Test 3: Check if blockchain_proxy.js exists
echo ""
echo "3. Checking blockchain_proxy.js..."
if [ -f "backend/scripts/blockchain_proxy.js" ]; then
    echo "✅ blockchain_proxy.js found"
else
    echo "❌ blockchain_proxy.js not found"
    exit 1
fi

# Test 4: Check if .env file exists
echo ""
echo "4. Checking .env file..."
if [ -f "backend/scripts/.env" ]; then
    echo "✅ .env file found"
    cat backend/scripts/.env
else
    echo "⚠️  .env file not found (will use system env vars)"
fi

# Test 5: Check if npm packages are installed
echo ""
echo "5. Checking npm packages..."
if [ -d "backend/scripts/node_modules" ]; then
    echo "✅ node_modules found"
else
    echo "⚠️  node_modules not found, installing..."
    cd backend/scripts && npm install && cd ../..
fi

# Test 6: Test blockchain proxy directly
echo ""
echo "6. Testing blockchain proxy..."
echo "Command: cd backend/scripts && node blockchain_proxy.js register 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 999 abc123def456789012345678901234567890123456789012345678901234 1024 12"
cd backend/scripts
OUTPUT=$(node blockchain_proxy.js register 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 999 abc123def456789012345678901234567890123456789012345678901234 1024 12 2>&1)
cd ../..

echo ""
echo "Output:"
echo "$OUTPUT"

if echo "$OUTPUT" | grep -q "txHash"; then
    echo ""
    echo "✅ SUCCESS! Transaction hash received"
    echo "$OUTPUT" | grep "txHash"
elif echo "$OUTPUT" | grep -q "error"; then
    echo ""
    echo "❌ ERROR detected:"
    echo "$OUTPUT" | grep "error"
else
    echo ""
    echo "⚠️  Unexpected output"
fi

echo ""
echo "=== Test Complete ==="
