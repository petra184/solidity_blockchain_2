import { ethers } from "ethers"
import axios from "axios"
import ArtNFT from "@/frontend/src/abi/ArtNFT.json"
import { Artwork, UploadedArtwork } from "@/app/types/artwork"  

const CONTRACT_ADDRESS = "0xBc84172d0f92F244202906622B1757C66FAB82E3" // replace with your actual one

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/68706c3269f648478c50f00661141a86`)
const contract = new ethers.Contract(CONTRACT_ADDRESS, ArtNFT.abi, provider)

const convertIpfsToHttp = (ipfsUrl: string) =>
  ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");

export async function fetchOnChainArtworks(): Promise<UploadedArtwork[]> {
  const artworks: UploadedArtwork[] = [];
  const total = await contract.totalSupply();
  console.log(await provider.getBlockNumber());

  for (let tokenId = 0; tokenId < total; tokenId++) {
    try {
      const tokenURI = await contract.tokenURI(tokenId);
      const priceInWei = await contract.prices(tokenId);
      const owner = await contract.ownerOf(tokenId);

      console.log(`tokenURI for tokenId ${tokenId}:`, tokenURI);

      const httpUri = convertIpfsToHttp(tokenURI);
      const { data: metadata } = await axios.get(httpUri);

      artworks.push({
        id: `artwork-${tokenId}`,
        tokenId,
        name: metadata.name || `Artwork #${tokenId}`,
        category: metadata.category || "Uncategorized",
        dataURL: metadata.dataURL || "",
        price: Number(ethers.formatEther(priceInWei)),
        forSale: priceInWei > 0,
        date: metadata.date || new Date().toISOString(),
        cid: metadata.cid || "",
        ipfsUrl: tokenURI,
      });
    } catch (err) {
      console.error(`Failed to fetch token ${tokenId}`, err);
    }
  }

  return artworks;
}



export async function buyArtwork(tokenId: number, price: number) {
  try {
    // Connect with signer for transactions
    if (!window.ethereum) {
      return {
        success: false,
        error: "No wallet found. Please install MetaMask.",
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ArtNFT.abi, signer)

    // Convert price to wei
    const priceInWei = ethers.parseEther(price.toString())

    // Execute buy transaction
    const tx = await contract.buy(tokenId, { value: priceInWei })
    await tx.wait()

    return {
      success: true,
      hash: tx.hash,
    }
  } catch (err) {
    console.error("Error buying artwork:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}

export async function listArtworkForSale(tokenId: number, price: number) {
  try {
    // Connect with signer for transactions
    if (!window.ethereum) {
      return {
        success: false,
        error: "No wallet found. Please install MetaMask.",
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ArtNFT.abi, signer)

    // Convert price to wei
    const priceInWei = ethers.parseEther(price.toString())

    // Execute listing transaction
    const tx = await contract.listForSale(tokenId, priceInWei)
    await tx.wait()

    return {
      success: true,
      hash: tx.hash,
    }
  } catch (err) {
    console.error("Error listing artwork:", err)
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    }
  }
}
