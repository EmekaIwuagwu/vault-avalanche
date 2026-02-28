import { ethers } from "hardhat";

async function main() {
    console.log("Deploying Vault Protocol contracts...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // 1. Deploy VaultRegistry
    const VaultRegistry = await ethers.getContractFactory("VaultRegistry");
    const registry = await VaultRegistry.deploy();
    await registry.waitForDeployment();
    console.log("VaultRegistry deployed to:", await registry.getAddress());

    // 2. Deploy VaultAccess
    const VaultAccess = await ethers.getContractFactory("VaultAccess");
    const access = await VaultAccess.deploy();
    await access.waitForDeployment();
    console.log("VaultAccess deployed to:", await access.getAddress());

    // 3. Deploy VaultStorageTiers
    const VaultStorageTiers = await ethers.getContractFactory("VaultStorageTiers");
    const tiers = await VaultStorageTiers.deploy();
    await tiers.waitForDeployment();
    console.log("VaultStorageTiers deployed to:", await tiers.getAddress());

    console.log("Deployment complete.");

    console.log("\nUpdate your .env or backend environment with these addresses:");
    console.log(`AVALANCHE_REGISTRY_ADDRESS=${await registry.getAddress()}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
