const { ethers } = require("ethers");

try {
    require("dotenv").config();
} catch (e) {
    console.error("[Blockchain Proxy] dotenv not available, using system environment variables");
}

const ABI = [
    "function registerFile(address owner, string fileId, bytes32 sha256Hash, uint256 fileSize, uint256 shardCount, uint256 timestamp) external",
    "function getFileRecord(string memory fileId) external view returns (tuple(address owner, string fileId, bytes32 sha256Hash, uint256 fileSize, uint256 shardCount, uint256 timestamp, bool exists))"
];

async function main() {
    const command = process.argv[2];
    const rpcUrl = process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc";
    const privateKey = process.env.VAULT_SIGNER_PRIVATE_KEY;
    const contractAddress = process.env.AVALANCHE_REGISTRY_ADDRESS;

    // Debug logging
    console.error("[Blockchain Proxy] Command:", command);
    console.error("[Blockchain Proxy] RPC URL:", rpcUrl);
    console.error("[Blockchain Proxy] Contract Address:", contractAddress ? "SET" : "MISSING");
    console.error("[Blockchain Proxy] Private Key:", privateKey ? "SET" : "MISSING");

    if (!contractAddress) {
        process.stdout.write(JSON.stringify({ error: "Missing AVALANCHE_REGISTRY_ADDRESS" }));
        process.exit(1);
    }

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(contractAddress, ABI, provider);

    if (command === "register") {
        if (!privateKey) {
            process.stdout.write(JSON.stringify({ error: "Missing VAULT_SIGNER_PRIVATE_KEY" }));
            process.exit(1);
        }
        
        try {
            const wallet = new ethers.Wallet(privateKey, provider);
            const contractWithSigner = contract.connect(wallet);

            const [ownerAddress, fileId, hash, size, shards] = process.argv.slice(3);
            
            // Validate and normalize the owner address
            let normalizedOwner;
            try {
                normalizedOwner = ethers.utils.getAddress(ownerAddress);
            } catch (e) {
                console.error("[Blockchain Proxy] Invalid owner address:", ownerAddress);
                process.stdout.write(JSON.stringify({ error: "Invalid owner address: " + ownerAddress }));
                process.exit(1);
            }
            
            console.error("[Blockchain Proxy] Registering file:", { 
                owner: normalizedOwner, 
                fileId, 
                hash, 
                size, 
                shards 
            });
            
            const tx = await contractWithSigner.registerFile(
                normalizedOwner,
                fileId,
                hash.startsWith("0x") ? hash : "0x" + hash,
                size,
                shards,
                Math.floor(Date.now() / 1000)
            );
            
            console.error("[Blockchain Proxy] Transaction sent:", tx.hash);
            
            const receipt = await tx.wait();
            
            console.error("[Blockchain Proxy] Transaction confirmed:", receipt.transactionHash);
            
            process.stdout.write(JSON.stringify({ status: "success", txHash: receipt.transactionHash }));
        } catch (error) {
            console.error("[Blockchain Proxy] Registration error:", error.message);
            process.stdout.write(JSON.stringify({ error: error.message }));
            process.exit(1);
        }
    } else if (command === "read") {
        const fileId = process.argv[3];
        try {
            const record = await contract.getFileRecord(fileId);
            process.stdout.write(JSON.stringify({
                exists: record.exists,
                owner: record.owner,
                fileId: record.fileId,
                hash: record.sha256Hash,
                size: record.fileSize.toString(),
                shards: record.shardCount.toString(),
                timestamp: record.timestamp.toString()
            }));
        } catch (e) {
            console.error("[Blockchain Proxy] Read error:", e.message);
            process.stdout.write(JSON.stringify({ error: "File not found or contract error: " + e.message }));
        }
    }
}

main().catch(err => {
    console.error("[Blockchain Proxy] Fatal error:", err.message);
    process.stdout.write(JSON.stringify({ error: err.message }));
    process.exit(1);
});
