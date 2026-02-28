import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
    solidity: "0.8.20",
    networks: {
        fuji: {
            url: process.env.AVALANCHE_FUJI_RPC_URL || "https://api.avax-test.network/ext/bc/C/rpc",
            accounts: process.env.VAULT_SIGNER_PRIVATE_KEY ? [process.env.VAULT_SIGNER_PRIVATE_KEY] : [],
        },
        avalanche: {
            url: process.env.AVALANCHE_RPC_URL || "https://api.avax.network/ext/bc/C/rpc",
            accounts: process.env.VAULT_SIGNER_PRIVATE_KEY ? [process.env.VAULT_SIGNER_PRIVATE_KEY] : [],
        },
    },
};

export default config;
