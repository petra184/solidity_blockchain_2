const { ethers } = require("ethers");

// Replace with your actual Infura Project ID
const provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/e707ebfa79fb45daa8d79565b3ce4cee");

// Replace with your actual private key (without the '0x' prefix)
const privateKey = "0x3c5bf5d34f782d0982ec7e97322da3cab696bcfd29b31b32de7dbdee07470aed";  // Example: "0x4c0883a69102937d6231471b5dbb6204a6ad4a3a5a49d5d6e12d6b42e1e428f7";

// Create a signer instance from your private key
const signer = new ethers.Wallet(privateKey, provider);

// Fetch and log the balance
async function checkBalance() {
    const balance = await provider.getBalance(signer.address);
    if (balance) {
        console.log("Your balance:", ethers.utils.formatEther(balance), "ETH");
    } else {
        console.log("Balance not found");
    }
}

checkBalance().catch((error) => {
    console.error(error);
});
