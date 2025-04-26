import { NextRequest, NextResponse } from "next/server"
import { getFiles } from "@/app/utils/web3_storage"

export async function GET(request: NextRequest) {
  try {
    const files = await getFiles()

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json([])
    }

    const artworks = await Promise.all(
      files.map(async (file) => {
        try {
          // Fetch the metadata JSON from IPFS
          const metadataResponse = await fetch(file.url)
          const metadata = await metadataResponse.json()

          return {
            cid: file.cid,
            url: `https://${file.cid}.ipfs.w3s.link`,
            name: metadata.name || "Untitled Artwork",
            created: file.created,
            image: metadata.image,
            category: metadata.attributes?.find((attr: { trait_type: string; value: string }) => attr.trait_type === "Category")?.value || "digital-painting",
            price: parseFloat(metadata.attributes?.find((attr: { trait_type: string; value: string }) => attr.trait_type === "Price")?.value || "0"),

          }
        } catch (err) {
          console.error(`Failed to fetch metadata for CID ${file.cid}`, err)
          return null // Skip if failed
        }
      })
    )

    // Filter out null results
    const validArtworks = artworks.filter(Boolean)

    return NextResponse.json(validArtworks)
  } catch (error) {
    console.error("Error fetching files:", error)
    return NextResponse.json(
      { error: "Failed to fetch images from Web3 storage", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
      )
  }
}
