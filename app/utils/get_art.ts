import { ethers } from "ethers"
import axios from "axios"
import ArtNFT from "@/frontend/src/abi/ArtNFT.json"
import { Artwork, UploadedArtwork } from "@/app/types/artwork"  

const CONTRACT_ADDRESS = "0x453A81c3Bd8e5396987981399625D94BBC1fe47E" // replace with your actual one

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/68706c3269f648478c50f00661141a86`)
const contract = new ethers.Contract(CONTRACT_ADDRESS, ArtNFT.abi, provider)

const convertIpfsToHttp = (ipfsUrl: string) =>
  ipfsUrl.replace("ipfs://", "https://ipfs.io/ipfs/");

let cachedTotalSupply: number | null = null;

async function fetchWithRetry(url: string, retries = 3, delay = 500): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await axios.get(url)
    } catch (err) {
      if (attempt === retries) throw err
      console.warn(`Retrying (${attempt + 1}/${retries})...`)
      await new Promise(res => setTimeout(res, delay))
    }
  }
}

export async function fetchOnChainArtworks(): Promise<UploadedArtwork[]> {
  const artworks: UploadedArtwork[] = [];

  if (cachedTotalSupply === null) {
    cachedTotalSupply = Number(await contract.totalSupply());
  }

  for (let tokenId = 0; tokenId < cachedTotalSupply; tokenId++) {
    try {
      const tokenURI = await contract.tokenURI(tokenId);
      const priceInWei = await contract.prices(tokenId);
      const owner = await contract.ownerOf(tokenId);

      console.log(`tokenURI for tokenId ${tokenId}:`, tokenURI);

      const httpUri = convertIpfsToHttp(tokenURI);
      const { data: metadata } = await fetchWithRetry(httpUri)

      const categoryAttr = metadata.attributes?.find((a: any) => a.trait_type === "Category");
  
      artworks.push({
        id: `artwork-${tokenId}`,
        tokenId,
        name: metadata.name || `Artwork #${tokenId}`,
        category: categoryAttr?.value || "Uncategorized",
        dataURL: metadata.image ? convertIpfsToHttp(metadata.image) : "",
        price: Number(ethers.formatEther(priceInWei)),
        forSale: priceInWei > 0,
        date: metadata.date || new Date().toISOString(),
        cid: metadata.cid || "",
        ipfsUrl: metadata.image || "",
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
