import { type NextRequest, NextResponse } from "next/server"
import { getFiles, getFileByCid } from "@/app/utils/web3_storage"

// Define types to match your implementation
interface ImageFile {
  cid: string;
  url: string;
  name: string;
  created: string;
  size?: number;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cid = searchParams.get("cid")
    
    // If a specific CID is requested, return just that file
    if (cid) {
      try {
        const file = await getFileByCid(cid)
        return NextResponse.json([
          {
            cid,
            url: file.url,
            name: searchParams.get("name") || "Artwork",
            created: new Date().toISOString(),
          },
        ])
      } catch (error) {
        console.error(`Failed to fetch file with CID ${cid}:`, error)
        return NextResponse.json(
          {
            error: `Failed to fetch file with CID ${cid}`,
            details: error instanceof Error ? error.message : "Unknown error"
          },
          { status: 404 }
        )
      }
    }
    
    // Otherwise, fetch all files
    try {
      const files = await getFiles()
      
      // If we got files back, return them
      if (files && Array.isArray(files) && files.length > 0) {
        console.log(`Successfully fetched ${files.length} files`)
        return NextResponse.json(files)
      }
      
      // If we got an empty array, that's still a success (just no files)
      if (files && Array.isArray(files) && files.length === 0) {
        console.log("No files found")
        return NextResponse.json([])
      }
      
      // If we got something unexpected
      console.warn("Unexpected response format from getFiles():", files)
      return NextResponse.json(
        { 
          error: "No files found or unexpected response format",
          details: files
        },
        { status: 404 }
      )
    } catch (error) {
      // This is where the error from getFiles() would be caught
      console.error("Error fetching files:", error)
      
      // Return a proper error response
      return NextResponse.json(
        {
          error: "Failed to fetch files",
          details: error instanceof Error ? error.message : "Unknown error"
        },
        { status: 500 }
      )
    }
  } catch (error) {
    // Catch any other errors in the route handler
    console.error("Error in API route:", error)
      
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}