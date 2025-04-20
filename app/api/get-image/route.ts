import { type NextRequest, NextResponse } from "next/server"
import { getFiles } from "@/app/utils/web3_storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cid = searchParams.get("cid")

    if (cid) {
      const fileUrl = `https://${cid}.ipfs.w3s.link`
      return NextResponse.json([
        {
          cid,
          url: fileUrl,
          name: searchParams.get("name") || "Artwork",
          created: new Date().toISOString(),
        },
      ])
    }

    const images = await getFiles()
    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching images:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch images",
      },
      { status: 500 }
    )
  }
}
