const { ethers } = require("ethers");

const privateKey = "c111e3d2385fdfe5ae2b98ea77322ea7c594c6e24e5c5cc141edd09f7cea047f";

try {
    const wallet = new ethers.Wallet(privateKey);
    console.log("Private Key:", privateKey);
    console.log("Wallet Address:", wallet.address);
    console.log("");
    console.log("✅ This is the CORRECT address to use!");
} catch (error) {
    console.error("Error:", error.message);
}

