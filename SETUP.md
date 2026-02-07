# Vault Avalanche - Setup Guide

This guide provides step-by-step instructions to clone, install, and run the Vault Avalanche application. This setup assumes you are using **WSL (Linux)** for the Backend and **Windows CMD** for the Frontend.

---

## 1. Prerequisites

### Windows Side (Frontend)
- **Node.js**: [Download and install Node.js (v18 or higher)](https://nodejs.org/)
- **Git**: [Download and install Git for Windows](https://git-scm.com/)

### WSL Side (Backend)
Open your WSL terminal (e.g., Ubuntu) and install the build tools:
```bash
sudo apt update
sudo apt install -y build-essential cmake libssl-dev
```

---

## 2. Clone the Repository

Open a terminal (CMD or WSL) and run:
```bash
git clone https://github.com/EmekaIwuagwu/vault-avalanche.git
cd vault-avalanche
```

---

## 3. Quick Start (Run Both Together)

If you are on Windows, you can launch both the Backend (in WSL) and the Frontend (in CMD) with a single command:

1. Double-click `start-dev.bat` in the root directory.
2. **OR** run it from CMD:
   ```cmd
   start-dev.bat
   ```

*This will open two separate terminal windows for the Backend and Frontend logs.*

---

## 4. Manual Setup (Step-by-Step)

1. Open your **WSL Terminal**.
2. Navigate to the backend directory:
   ```bash
   cd /mnt/c/Users/emi/Desktop/blockchains/vault-avalanche/backend
   ```
3. Build the application:
   ```bash
   # Create a build directory
   mkdir -p build && cd build
   
   # Generate makefiles
   cmake ..
   
   # Compile the backend
   make
   ```
4. Run the backend server:
   ```bash
   ./vault_server
   ```
   *The server will start listening on port `8081`.*

---

## 4. Frontend Setup (Windows CMD)

1. Open a **Windows Command Prompt (CMD)**.
2. Navigate to the frontend directory:
   ```cmd
   cd C:\Users\emi\Desktop\blockchains\vault-avalanche\frontend
   ```
3. Install dependencies:
   ```cmd
   npm install
   ```
4. Run the development server:
   ```cmd
   npm run dev
   ```
   *The frontend will be available at `http://localhost:3000`.*

---

## 5. Deployment (Azure)

If you are deploying to an Azure Linux VM, use the automated script:
```bash
chmod +x azure-deploy.sh
./azure-deploy.sh
```

---

## Troubleshooting

- **PDF Files Corrupted?**: Ensure you have pulled the latest changes with `git pull`. Previous uploads might remain corrupted; delete them and upload new ones.
- **Backend Build Fails**: Double-check that `libssl-dev` is installed in WSL.
- **Port Conflict**: If port 8081 or 3000 is in use, the application won't start. Ensure no other instances are running.
