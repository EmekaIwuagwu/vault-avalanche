# Test Blockchain Integration Locally

Write-Host "=== Testing Blockchain Integration Locally ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if Node.js is available
Write-Host "1. Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found" -ForegroundColor Red
    exit 1
}

# Test 2: Check if scripts directory exists
Write-Host ""
Write-Host "2. Checking scripts directory..." -ForegroundColor Yellow
if (Test-Path "backend/scripts") {
    Write-Host "✅ Scripts directory exists" -ForegroundColor Green
} else {
    Write-Host "❌ Scripts directory not found" -ForegroundColor Red
    exit 1
}

# Test 3: Check if blockchain_proxy.js exists
Write-Host ""
Write-Host "3. Checking blockchain_proxy.js..." -ForegroundColor Yellow
if (Test-Path "backend/scripts/blockchain_proxy.js") {
    Write-Host "✅ blockchain_proxy.js found" -ForegroundColor Green
} else {
    Write-Host "❌ blockchain_proxy.js not found" -ForegroundColor Red
    exit 1
}

# Test 4: Check if .env file exists
Write-Host ""
Write-Host "4. Checking .env file..." -ForegroundColor Yellow
if (Test-Path "backend/scripts/.env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    Write-Host "Contents:" -ForegroundColor Gray
    Get-Content "backend/scripts/.env"
} else {
    Write-Host "⚠️  .env file not found (will use system env vars)" -ForegroundColor Yellow
}

# Test 5: Check if npm packages are installed
Write-Host ""
Write-Host "5. Checking npm packages..." -ForegroundColor Yellow
if (Test-Path "backend/scripts/node_modules") {
    Write-Host "✅ node_modules found" -ForegroundColor Green
} else {
    Write-Host "⚠️  node_modules not found, installing..." -ForegroundColor Yellow
    Push-Location backend/scripts
    npm install
    Pop-Location
}

# Test 6: Test blockchain proxy directly
Write-Host ""
Write-Host "6. Testing blockchain proxy..." -ForegroundColor Yellow
Write-Host "Command: node blockchain_proxy.js register 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 999 abc123def456789012345678901234567890123456789012345678901234 1024 12" -ForegroundColor Gray

Push-Location backend/scripts
$output = node blockchain_proxy.js register 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb 999 abc123def456789012345678901234567890123456789012345678901234 1024 12 2>&1 | Out-String
Pop-Location

Write-Host ""
Write-Host "Output:" -ForegroundColor Gray
Write-Host $output

if ($output -match "txHash") {
    Write-Host ""
    Write-Host "✅ SUCCESS! Transaction hash received" -ForegroundColor Green
    $output -split "`n" | Where-Object { $_ -match "txHash" }
} elseif ($output -match "error") {
    Write-Host ""
    Write-Host "❌ ERROR detected:" -ForegroundColor Red
    $output -split "`n" | Where-Object { $_ -match "error" }
} else {
    Write-Host ""
    Write-Host "⚠️  Unexpected output" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
