const { ethers } = require("hardhat");

async function main() {
    if (!process.env.INFURA_ID || !process.env.PRIVATE_KEY) {
        console.error("INFURA_ID or PRIVATE_KEY not found in environment variables");
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log("Deploying from:", deployer.address);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");

    const ArtNFT = await ethers.getContractFactory("ArtNFT");
    console.log("Starting contract deployment...");

    let artNFT;
    try {
        artNFT = await ArtNFT.deploy();
        console.log("Waiting for deployment to be mined...");

        await artNFT.waitForDeployment(); // Ethers v6 replaces .deployed()

        const contractAddress = await artNFT.getAddress(); // Also new in v6
        console.log("Contract deployed at:", contractAddress);
    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error("Deployment error:", error);
    process.exit(1);
});
