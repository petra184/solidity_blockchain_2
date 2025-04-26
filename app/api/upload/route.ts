import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/app/utils/web3_storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const name = formData.get("name")?.toString() || "Untitled Artwork"
    const category = formData.get("category")?.toString() || "Uncategorized"
    const price = formData.get("price")?.toString() || "0"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()

    // 1. Upload the image file
    const imageResult = await uploadFile(buffer, file.name)
    const imageCid = imageResult.cid
    const imageUrl = `https://${imageCid}.ipfs.w3s.link`

    // 2. Create metadata JSON
    const metadata = {
      name,
      description: `A ${category} artwork listed for ${price} ETH.`,
      image: imageUrl,
      attributes: [
        { trait_type: "Category", value: category },
        { trait_type: "Price", value: `${price} ETH` },
      ]
    }
    console.log("Metadata:", metadata)
    const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" })
    const metadataFile = new File([metadataBlob], "metadata.json")

    const metadataBuffer = await metadataFile.arrayBuffer()
    const metadataResult = await uploadFile(metadataBuffer, "metadata.json")

    console.log("Uploaded metadata CID:", metadataResult.cid)

    return NextResponse.json({
      cid: metadataResult.cid,
      url: `ipfs://${metadataResult.cid}`
    })

  } catch (error) {
    console.error("Error uploading:", error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Failed to upload"
    }, { status: 500 })
  }
}
