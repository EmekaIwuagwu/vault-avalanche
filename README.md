# 🔐 Vault Protocol

**Enterprise-Grade Decentralized Cloud Storage on Avalanche**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![C++](https://img.shields.io/badge/C++-17-00599C.svg?logo=c%2B%2B)](backend/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000.svg?logo=next.js)](frontend/)
[![Avalanche](https://img.shields.io/badge/Avalanche-Network-E84142.svg)](https://www.avax.network/)

---

## 📖 Overview

**Vault** is a production-ready, decentralized cloud storage platform built on the Avalanche network. It transforms the security of blockchain technology into a high-performance cloud experience, offering enterprise-grade sharding, military-grade encryption, and real-time on-chain provenance.

**🆕 Blockchain Integration Active**: Every file upload is automatically registered to the Avalanche Fuji testnet via the VaultRegistry smart contract, providing immutable proof of existence with transaction hash verification.

### 🎯 Key Features

- **🚀 Native C++ Performance**: Custom VaultDB engine for sub-second file operations.
- **🔒 Web3 Security**: AES-256-CBC encryption with EIP-191 wallet authentication.
- **📂 Cloud Organization**: Hierarchical folder structures and team collaboration.
- **🔄 File Versioning**: Automatic snapshotting and instant restoration of previous file states.
- **🔗 On-Chain Provenance**: **Every file upload automatically registered to Avalanche blockchain** with immutable proof.
- **⛓️ Smart Contract Integration**: VaultRegistry, VaultAccess, and VaultStorageTiers deployed on Fuji testnet.
- **🌍 Multi-Language SDKs**: Native libraries for Rust, Python, Go, Ruby, PHP, and C#.
- **� Publric Sharing**: Secure, time-limited sharing links with cryptographic preview tokens.
- **💎 Enterprise Scale**: 10TB storage allocation for all users during the promotional phase.

---

## 🏗️ Architecture

```
vault-avalanche/
├── backend/                 # C++ Storage Engine & REST API
├── frontend/                # Next.js 16 + TypeScript UI
├── contracts/               # Solidity Smart Contracts (Hardhat)
├── sdks/                    # Multi-language SDK Suite
│   ├── rust/ | python/ | go/ | ruby/ | php/ | csharp/
├── .github/workflows/       # CI/CD (GitHub Actions)
└── docker-compose.yml       # Production Orchestration
```

---

## 📡 API Reference (Cloud Extensions)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/folders` | List user folders |
| `POST` | `/api/folders` | Create new folder |
| `GET` | `/api/files/:id/versions` | List file versions |
| `POST` | `/api/files/:id/restore/:v` | Restore specific version |
| `POST` | `/api/files/:id/share-link` | Generate public URL |
| `GET` | `/api/public/:token` | Retrieve public file data |
| `GET` | `/api/verify/:id` | Get on-chain verification data |
| `POST` | `/api/onchain/:id` | Register file on Avalanche |

---

## 🛠️ SDK Integration

### Rust
```rust
let client = VaultClient::new("https://vault.ava", "API_KEY", "0xWALLET");
let file_id = client.upload("document.pdf")?;
```

### Python
```python
client = VaultClient("https://vault.ava", "API_KEY", "0xWALLET")
files = client.list_files()
```

---

## 🚀 DevOps & CI/CD

### Environment Variables (Production)

For blockchain integration, set these environment variables in your deployment platform (Render, AWS, etc.):

```bash
# Backend Blockchain Integration
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_REGISTRY_ADDRESS=0x30c7e4Fcb29c8F935855b22931D773817b0Aa98A
VAULT_SIGNER_PRIVATE_KEY=0xYourPrivateKeyWithAVAXForGas
VAULT_ENCRYPTION_KEY=YourSecure32CharacterKeyHere!!

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://your-backend-url.com
NEXT_PUBLIC_CHAIN_ID=43113
NEXT_PUBLIC_REGISTRY_ADDRESS=0x30c7e4Fcb29c8F935855b22931D773817b0Aa98A
```

### Docker Compose
Run the entire stack (Backend + Frontend) with a single command:
```bash
docker-compose up -d
```

The docker-compose.yml is pre-configured to read these environment variables from your host system.

### GitHub Actions
The repository includes automated workflows for:
- **Backend**: C++ compilation and dependency verification.
- **Frontend**: Next.js build and linting.
- **Contracts**: Hardhat compilation and unit testing.

---

## 🔐 Smart Contracts (Avalanche Fuji Testnet)

Vault uses three core contracts deployed on Avalanche Fuji Testnet:

1. **VaultRegistry** ([`0x30c7e4Fcb29c8F935855b22931D773817b0Aa98A`](https://testnet.snowtrace.io/address/0x30c7e4Fcb29c8F935855b22931D773817b0Aa98A))
   - On-chain file metadata and hash verification
   - Immutable proof of file existence
   - Automatic registration on every upload

2. **VaultAccess** ([`0xdF9896db7E338647e835F1C316b2D928A3A7E3CA`](https://testnet.snowtrace.io/address/0xdF9896db7E338647e835F1C316b2D928A3A7E3CA))
   - Decentralized access control and role management
   - Granular permission system (view, download, manage)

3. **VaultStorageTiers** ([`0x90C118e8B4E17C55B0928E14C923bFa2e4EeaB3d`](https://testnet.snowtrace.io/address/0x90C118e8B4E17C55B0928E14C923bFa2e4EeaB3d))
   - Subscription and capacity management
   - 10TB free tier for all users

**View all transactions**: [Snowtrace Testnet Explorer](https://testnet.snowtrace.io)

---

## 🗺️ Roadmap (Updated Q1 2026)

- [x] VaultDB custom engine & AES-256 Encryption
- [x] Hierarchical Folders & Team Management
- [x] File Versioning & Restoration logic
- [x] Public Sharing with Preview Tokens
- [x] **Smart Contracts Deployed on Avalanche Fuji Testnet**
- [x] **Blockchain Integration - Automatic On-Chain File Registration**
- [x] Multi-Language SDK Suite (Rust, Python, Go, etc.)
- [x] CI/CD Pipeline & Docker Orchestration
- [ ] Deploy to Avalanche C-Chain Mainnet
- [ ] IPFS integration for redundancy
- [ ] Mobile SDK (React Native)

---

## 🔗 Live Deployment

- **Frontend**: [vault.avalanche.app](https://vault.avalanche.app) *(if applicable)*
- **Backend API**: Production endpoint
- **Blockchain**: Avalanche Fuji Testnet (C-Chain)
- **Explorer**: [View Contracts on Snowtrace](https://testnet.snowtrace.io/address/0x30c7e4Fcb29c8F935855b22931D773817b0Aa98A)

---

## 🙏 Acknowledgments

- **Avalanche Network** for the high-throughput blockchain infrastructure.
- **OpenSSL** for robust cryptographic primitives.
- **cpp-httplib** for the lightweight backend server.

---

<div align="center">
**Built with ❤️ by the Vault Engineering Team**
</div>
