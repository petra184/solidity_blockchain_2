export interface Artwork {
  id: string
  name: string
  dataURL: string
  image?: string  // <- add this optional field
  date: string
  category: string
  price: number
  forSale: boolean
  cid?: string
  ipfsUrl?: string
  purchased?: boolean
}


export interface UploadedArtwork extends Artwork {
  tokenId: number;
}

export interface Web3StorageFile {
  cid: string
  url: string
  name: string
  created: string
  size?: number
}

// Define the expected structure from w3up-client
export interface UploadInfo {
  root?: {
    toString: () => string
  }
  name?: string
  created?: string
  size?: number
}
