import { type NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/app/utils/web3_storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Convert file to ArrayBuffer
    const buffer = await file.arrayBuffer()

    // Upload to Web3.Storage
    const result = await uploadFile(buffer, file.name)
    console.log("Uploaded file CID:", result.cid)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error uploading file:", error)
    // Always return JSON, even for errors
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to upload file" 
    }, { status: 500 })
  }
}


