# Vault Protocol Interoperability Examples

This directory demonstrates how the Vault Protocol's multi-language SDK suite allows different systems to collaborate seamlessly on the same sharded data.

## The Scenario

1.  **Ingestion (Python)**: A data ingestion service creates a folder and uploads a configuration file.
2.  **Audit & Recovery (Rust)**: A high-performance audit service inspects the version history of that file and restores a previous version if an anomaly is detected.
3.  **Collaboration (Go)**: An organization-wide tool lists the directories and generates secure sharing links for external partners.

## Scripts

| Language | Script | Primary Focus |
| :--- | :--- | :--- |
| **Python** | `python_demo.py` | Folder creation and Shard Upload |
| **Rust** | `rust_demo.rs` | Version Listing and Protocol Restoration |
| **Go** | `go_demo.go` | Directory Discovery and Sharing |

## How to Run

### Prerequisites
1.  **Backend**: Ensure the Vault C++ backend is running on `localhost:8081`.
2.  **Authentication**: Replace `your_jwt_here` in the scripts with a valid JWT generated from the Dashboard.
3.  **Wallet**: Use the same `0x` wallet address across all scripts to see shared state.

### Running Python
```bash
# From the project root
pip install requests
python examples/python_demo.py
```

### Running Rust
Follow the instructions in the code to link the local crate in `sdks/rust`.

### Running Go
Ensure `vault.go` is accessible to your Go compiler.
