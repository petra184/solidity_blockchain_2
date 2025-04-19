export interface Artwork {
  id: string
  name: string
  dataURL: string
  date: string
  category: string
  price: number
  forSale: boolean
  // Add Web3 storage specific fields
  cid?: string
  ipfsUrl?: string
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
