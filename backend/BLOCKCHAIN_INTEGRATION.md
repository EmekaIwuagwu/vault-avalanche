# Blockchain Integration - Implementation Guide

## What Was Done

The Vault backend has been integrated with Avalanche blockchain to register file metadata on-chain after each successful upload.

### Full Breakdown:

1. **backend/include/vault.hpp**
   - Added `BlockchainHelper` class declaration with two methods:
     - `registerFileOnChain()` - Registers file metadata to VaultRegistry smart contract
     - `getOnChainRecord()` - Retrieves file metadata from blockchain

2. **backend/src/blockchain.cpp**
   - Implemented `BlockchainHelper` methods
   - Uses Node.js proxy script to interact with Avalanche via ethers.js
   - Executes `blockchain_proxy.js` to send transactions

3. **backend/src/server.cpp**
   - Modified `/api/upload` endpoint (both file upload paths)
   - After successful local storage, calls `BlockchainHelper::registerFileOnChain()`
   - Logs blockchain registration status to activity log
   - Continues operation even if blockchain registration fails (graceful degradation)

## How It Works

### File Upload Flow:
```
1. User uploads file → Backend receives
2. Backend encrypts file with AES-256
3. Backend stores encrypted file locally
4. Backend computes SHA-256 hash
5. Backend saves metadata to vault.vdb
6. NEW: Backend calls BlockchainHelper::registerFileOnChain()
7. blockchain_proxy.js sends transaction to Avalanche
8. VaultRegistry.sol stores metadata on-chain
9. Transaction hash returned
10. Activity log updated with blockchain status
```

### On-Chain Data Stored:
- Owner wallet address
- File ID (numeric)
- SHA-256 hash (bytes32)
- File size (uint256)
- Shard count (always 12)
- Timestamp (block timestamp)

## Prerequisites

You mentioned you've already completed:
- ✅ Deployed contracts to Avalanche Fuji testnet
- ✅ Set `AVALANCHE_REGISTRY_ADDRESS` environment variable
- ✅ Set `VAULT_SIGNER_PRIVATE_KEY` environment variable

### Additional Requirements:

4. **Node.js must be installed** on the backend server
   - The C++ backend calls `node scripts/blockchain_proxy.js`
   - Check: `node --version` (should be v18+)

5. **Install Node.js dependencies** in backend/scripts:
   ```bash
   cd backend/scripts
   npm install ethers dotenv
   ```

6. **Ensure .env file exists** in `backend/scripts/.env`:
   ```env
   AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
   VAULT_SIGNER_PRIVATE_KEY=0xYourPrivateKeyHere
   AVALANCHE_REGISTRY_ADDRESS=0xYourContractAddressHere
   ```

## Testing

### 1. Rebuild the Backend
```bash
cd backend/build
cmake ..
cmake --build .
```

### 2. Run the Backend
```bash
./vault_server
```

### 3. Upload a Test File
```bash
curl -X POST http://localhost:8081/api/upload \
  -H "X-Wallet-Address: 0xYourWalletAddress" \
  -F "file=@test.txt"
```

### 4. Check Console Output
You should see:
```
[Blockchain] Executing: node scripts/blockchain_proxy.js register ...
[Blockchain] Output: {"status":"success","txHash":"0x..."}
[Blockchain] File registered on-chain successfully
```

### 5. Verify Activity Log
```bash
curl http://localhost:8081/api/activity
```

Look for entries with:
- `type: "Blockchain"`
- `status: "Success"` or `"Warning"`
- `nodes: "Avalanche Fuji"`

### 6. Verify On-Chain (Optional)
Check the transaction on Avalanche Fuji Explorer:
```
https://testnet.snowtrace.io/tx/0xYourTransactionHash
```

## Troubleshooting

### "node: command not found"
- Install Node.js on your system
- Ensure it's in your PATH

### "Missing AVALANCHE_REGISTRY_ADDRESS"
- Check `backend/scripts/.env` file exists
- Verify the contract address is set correctly

### "Transaction failed" or "insufficient funds"
- Ensure your signer wallet has AVAX on Fuji testnet
- Get free testnet AVAX: https://faucet.avax.network/

### Blockchain registration fails but file uploads successfully
- This is expected behavior (graceful degradation)
- File is stored locally even if blockchain fails
- Check activity log for "Blockchain Warning" entries

## Environment Variables

The backend needs these environment variables (set in `backend/scripts/.env`):

```env
# Avalanche Fuji Testnet RPC
AVALANCHE_FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# Private key of wallet that will sign transactions (needs AVAX for gas)
VAULT_SIGNER_PRIVATE_KEY=0x...

# Address of deployed VaultRegistry contract
AVALANCHE_REGISTRY_ADDRESS=0x...
```

## Gas Costs

Each file upload now triggers an on-chain transaction:
- **Gas per registration**: ~50,000-80,000 gas
- **Cost on Fuji**: FREE (testnet)
- **Cost on Mainnet**: ~0.001-0.002 AVAX per file

## Next Steps

To make this production-ready:

1. **Add transaction hash to API response**
   - Return `txHash` to frontend
   - Display in UI as "Blockchain Proof"

2. **Implement retry logic**
   - Queue failed blockchain registrations
   - Retry with exponential backoff

3. **Add verification endpoint**
   - `/api/verify/:fileId` - Check on-chain vs local hash
   - Prove file integrity via blockchain

4. **Optimize gas costs**
   - Batch multiple file registrations
   - Use Avalanche subnets for lower fees

5. **Add event listening**
   - Listen for `FileRegistered` events
   - Update local database with confirmed tx hashes

## Architecture Diagram

```
┌─────────────┐
│   Frontend  │
└──────┬──────┘
       │ HTTP POST /api/upload
       ▼
┌─────────────────────────────┐
│   C++ Backend (server.cpp)  │
│  1. Encrypt & Store Locally │
│  2. Call BlockchainHelper   │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  blockchain.cpp             │
│  Execute: node proxy.js     │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  blockchain_proxy.js        │
│  ethers.js → Avalanche RPC  │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│  Avalanche Fuji Testnet     │
│  VaultRegistry.sol          │
│  registerFile() transaction │
└─────────────────────────────┘
```

## Success Indicators

✅ Backend compiles without errors
✅ Console shows "[Blockchain] Executing..." on upload
✅ Console shows transaction hash in output
✅ Activity log contains "Blockchain Success" entries
✅ Transaction visible on Snowtrace explorer
✅ File metadata retrievable via `getFileRecord()` on contract

---

**Integration Complete!** 

The Vault backend now writes file provenance to the Avalanche blockchain with every upload.
