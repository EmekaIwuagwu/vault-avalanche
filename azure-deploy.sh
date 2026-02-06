#!/bin/bash

# Vault Avalanche - Azure Deployment Script
# This script installs Docker prerequisites and starts the services.

set -e

echo "------------------------------------------------"
echo "  Vault Avalanche Deployment Script for Azure   "
echo "------------------------------------------------"

# Try to detect Public IP for Metadata (Azure specific)
PUBLIC_IP=$(curl -s -H Metadata:true --noproxy "*" --connect-timeout 2 "http://169.254.169.254/metadata/instance/network/interface/0/ipv4/ipAddress/0/publicIpAddress?api-version=2021-02-01&format=text" || echo "")

if [ -z "$PUBLIC_IP" ]; then
    # Fallback to general public IP detection
    PUBLIC_IP=$(curl -s https://ifconfig.me || echo "localhost")
fi

echo "Detected Public IP: $PUBLIC_IP"

# 1. Update and install prerequisites
echo "[1/4] Updating system and installing prerequisites..."
sudo apt-get update -y
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 2. Install Docker
echo "[2/4] Installing Docker..."
if ! command -v docker &> /dev/null; then
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update -y
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
else
    echo "Docker is already installed."
fi

# 3. Start services with Docker Compose
echo "[3/4] Starting frontend and backend services..."
# Ensure we are in the directory of the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$DIR"

# Set NEXT_PUBLIC_API_URL so the frontend knows where the backend is
export NEXT_PUBLIC_API_URL="http://$PUBLIC_IP:8081"

# Build and start the containers sequentially to avoid RAM issues on small VMs
echo "Building Backend..."
sudo docker compose build backend
echo "Building Frontend (this may take a while)..."
sudo NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL docker compose build frontend

echo "Starting services..."
sudo NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL docker compose up -d

# 4. Success message
echo "------------------------------------------------"
echo "  Deployment Complete!                          "
echo "  Backend: http://$PUBLIC_IP:8081                "
echo "  Frontend: http://$PUBLIC_IP:3000               "
echo "------------------------------------------------"
echo "  Note: Ensure Azure Network Security Group (NSG)"
echo "  allows traffic on ports 3000 and 8081.        "
echo "------------------------------------------------"
echo "  If the Public IP is incorrect, you can re-run:"
echo "  NEXT_PUBLIC_API_URL=http://your-ip:8081 docker compose up -d --build"
echo "------------------------------------------------"
