# 🔐 Vault Protocol

**Enterprise-Grade Decentralized Cloud Storage on Avalanche**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![C++](https://img.shields.io/badge/C++-17-00599C.svg?logo=c%2B%2B)](backend/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1-000000.svg?logo=next.js)](frontend/)
[![Avalanche](https://img.shields.io/badge/Avalanche-Network-E84142.svg)](https://www.avax.network/)

---

## 📖 Overview

**Vault** is a production-ready, decentralized cloud storage platform built on the Avalanche network. It transforms the security of blockchain technology into a high-performance cloud experience, offering enterprise-grade sharding, military-grade encryption, and real-time on-chain provenance.

### 🎯 Key Features

- **🚀 Native C++ Performance**: Custom VaultDB engine for sub-second file operations.
- **🔒 Web3 Security**: AES-256-CBC encryption with EIP-191 wallet authentication.
- **📂 Cloud Organization**: Hierarchical folder structures and team collaboration.
- **🔄 File Versioning**: Automatic snapshotting and instant restoration of previous file states.
- **🔗 On-Chain Provenance**: Permanent file registration and access control on Avalanche Fuji/Mainnet.
- **🌍 Multi-Language SDKs**: Native libraries for Rust, Python, Go, Ruby, PHP, and C#.
- **📡 Public Sharing**: Secure, time-limited sharing links with cryptographic preview tokens.
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

### Docker Compose
Run the entire stack (Backend + Frontend) with a single command:
```bash
docker-compose up -d
```

### GitHub Actions
The repository includes automated workflows for:
- **Backend**: C++ compilation and dependency verification.
- **Frontend**: Next.js build and linting.
- **Contracts**: Hardhat compilation and unit testing.

---

## 🔐 Smart Contracts

Vault uses three core contracts deployed on Avalanche:
1. **VaultRegistry**: On-chain file metadata and hash verification.
2. **VaultAccess**: Decentralized access control and role management.
3. **VaultStorageTiers**: Subscription and capacity management.

---

## 🗺️ Roadmap (Updated Q1 2026)

- [x] VaultDB custom engine & AES-256 Encryption.
- [x] Hierarchical Folders & Team Management.
- [x] File Versioning & Restoration logic.
- [x] Public Sharing with Preview Tokens.
- [x] On-chain Provenance Contracts (Solidity).
- [x] Multi-Language SDK Suite (Rust, Python, Go, etc.).
- [x] CI/CD Pipeline & Docker Orchestration.

---

## 🙏 Acknowledgments

- **Avalanche Network** for the high-throughput blockchain infrastructure.
- **OpenSSL** for robust cryptographic primitives.
- **cpp-httplib** for the lightweight backend server.

---

<div align="center">
**Built with ❤️ by the Vault Engineering Team**
</div>
