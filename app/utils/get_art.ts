import { ethers } from "ethers";
import axios from "axios";
import ArtNFT from "@/frontend/src/abi/ArtNFT.json"

const CONTRACT_ADDRESS = "0xE1A7e60d1728EFe9735355A57BAb3D40965332AE"; // replace with your actual one

const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/e707ebfa79fb45daa8d79565b3ce4cee`);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ArtNFT.abi, provider);

export async function fetchOnChainArtworks() {
  const artworks = [];
  const total = await contract.totalSupply();

  for (let tokenId = 0; tokenId < total; tokenId++) {
    try {
      const tokenURI = await contract.tokenURI(tokenId);
      const { data } = await axios.get(tokenURI); // Load metadata from IPFS

      artworks.push({
        tokenId,
        name: data.name || `Artwork #${tokenId}`,
        category: data.category || "Uncategorized",
        price: parseFloat(data.price || 0),
        dataURL: data.image, // image URL saved in IPFS
        forSale: parseFloat(data.price || 0) > 0,
        ipfsUrl: tokenURI,
        date: new Date().toISOString(), // you can ignore or enhance this
      });
    } catch (err) {
      console.error(`Failed to fetch token ${tokenId}`, err);
    }
  }

  return artworks;
}
