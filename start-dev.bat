@echo off
setlocal enabledelayedexpansion

:: Vault Avalanche - Unified Starter Script
:: This script launches the C++ Backend in WSL and the Next.js Frontend in Windows CMD.

echo ============================================================
echo   🔐 VAULT PROTOCOL - DEVELOPMENT STARTER
echo ============================================================

set ROOT_DIR=%~dp0

:: 1. Launch Backend in WSL
echo [*] Launching C++ Backend in WSL Terminal...
:: Convert Windows path to WSL path
for /f "usebackq tokens=*" %%i in (`wsl wslpath "%ROOT_DIR%backend"`) do set WSL_PATH=%%i

:: Start backend: create build dir, cmake, make, and run
start "Vault Backend (WSL)" wsl bash -c "cd '!WSL_PATH!' && mkdir -p build && cd build && cmake .. && make && echo '--- Backend Started ---' && ./vault_server"

:: 2. Launch Frontend in Windows
echo [*] Launching Next.js Frontend in Windows CMD...
start "Vault Frontend (CMD)" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

echo.
echo 🚀 Both services are starting!
echo    - Backend: http://localhost:8081
echo    - Frontend: http://localhost:3000
echo.
echo Keep these windows open during development.
pause
