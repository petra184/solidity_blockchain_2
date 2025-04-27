"use server"

import { create } from "@web3-storage/w3up-client"

let clientInstance: Awaited<ReturnType<typeof create>> | null = null

export async function getClient() {
  if (clientInstance) {
    return clientInstance
  }

  try {
    clientInstance = await create()
    return clientInstance
  } catch (error) {
    throw new Error("Failed to initialize Web3 Storage client")
  }
}

export async function isAuthenticated() {
  try {
    const client = await getClient()
    const space = await client.currentSpace()
    return !!space
  } catch (error) {
    return false
  }
}

export async function authenticateWithEmail() {
  try {
    const client = await getClient()
    const userEmail = "juric.petra18@gmail.com"
    console.log(`Authenticating with email: ${userEmail}...`)
    const account = await client.login(userEmail)
    console.log("Authentication successful")

    await account.plan.wait()
    return account
  } catch (error) {
    throw error
  }
}

export async function ensureSpace(spaceName = "blockchain project") {
  try {
    const client = await getClient()
    // Check if we already have a current space
    const space = await client.currentSpace()

    if (space) {
      console.log("Using space:", space.did())
      return space
    }

    // No space, need to create one
    const account = await authenticateWithEmail()
    const newSpace = await client.createSpace(spaceName, { account })
    
    // Set as current space
    await client.setCurrentSpace(newSpace.did())
    console.log(`Current space ${spaceName} set`)

    return newSpace
  } catch (error) {
    throw error
  }
}

// Improve error handling in the server action
export async function uploadFile(fileBuffer: ArrayBuffer, fileName: string) {
  try {
    const client = await getClient()
    
    try {
      await ensureSpace()
    } catch (spaceError) {
      throw new Error(`Failed to ensure space: ${spaceError instanceof Error ? spaceError.message : "Unknown error"}`)
    }

    // Create a File object from the buffer
    const file = new File([fileBuffer], fileName, { type: "image/png" })

    try {
      const cid = await client.uploadFile(file)
      const url = `https://${cid}.ipfs.w3s.link`
      console.log("File uploaded, IPFS URL:", url)
      return { cid: cid.toString(), url }
    } catch (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`)
    }
  } catch (error) {
    throw error
  }
}


export async function getFiles() {
  try {
    console.log("📥 Retrieving files from Web3.Storage...")
    const client = await getClient()

    // Ensure we have a space
    try {
      await ensureSpace()
    } catch (spaceError) {
      console.error("Error ensuring space:", spaceError)
      throw new Error(`Failed to ensure space: ${spaceError instanceof Error ? spaceError.message : "Unknown error"}`)
    }

    const space = await client.currentSpace()
    if (!space) {
      throw new Error("No space available")
    }

    console.log("🔍 Listing uploads from space...")
    const uploadList = await client.capability.upload.list()
    console.log("Upload list:", uploadList)

    const files = []

    if (uploadList && typeof uploadList === 'object' && 'results' in uploadList && Array.isArray(uploadList.results)) {
      for (const upload of uploadList.results) {
        const cid = upload.root?.toString()
        if (!cid) continue

        try {
          const url = `https://${cid}.ipfs.w3s.link`
          const res = await fetch(url)
          if (!res.ok) {
            console.warn(`⚠️ Failed to fetch file at CID ${cid}: ${res.statusText}`)
            continue
          }

          const contentType = res.headers.get('Content-Type') || ''
          if (!contentType.includes('application/json')) {
            console.warn(`⚠️ CID ${cid} is not a JSON file, skipping...`)
            continue
          }

          const metadata = await res.json()
          console.log("🎨 Fetched metadata:", metadata)

          let imageUrl = ''
          if (metadata.image) {
            if (metadata.image.startsWith('ipfs://')) {
              const extractedCID = metadata.image.replace('ipfs://', '')
              imageUrl = `https://${extractedCID}.ipfs.w3s.link`; // ← use ipfs.io
            } else {
              imageUrl = metadata.image
            }
          }

          files.push({
            cid,
            url,
            name: metadata.name || cid.substring(0, 10),
            description: metadata.description || '',
            image: imageUrl,
            attributes: metadata.attributes || [],
            created: upload.insertedAt || new Date().toISOString(),
          })
        } catch (fetchError) {
          console.warn(`⚠️ Error fetching/parsing file at CID ${cid}:`, fetchError)
        }
      }
    } else {
      console.log("No uploads found or unexpected response format:", uploadList)
    }

    console.log(`✅ Retrieved ${files.length} files`)
    return files
  } catch (error) {
    console.error("❌ Failed to retrieve files:", error)
    throw new Error(`Failed to retrieve files: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}




// Add function to get a specific file by CID
export async function getFileByCid(cid: string) {
  try {
    console.log(`🔍 Retrieving file with CID: ${cid}...`)
    // Construct the IPFS URL
    const url = `https://${cid}.ipfs.w3s.link`
    console.log("✅ File URL constructed:", url)
    return { cid, url }
  } catch (error) {
    console.error(`❌ Failed to retrieve file with CID ${cid}:`, error)
    throw new Error(`Failed to retrieve file: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
