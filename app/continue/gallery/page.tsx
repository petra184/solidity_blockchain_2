"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Notification from "@/components/notification"
import type { Artwork } from "@/app/types/artwork"
import { Tag, Trash, ImageIcon, Search, Edit, Loader2 } from "lucide-react"
import Navbar from "@/components/navbar"

export default function Gallery() {
  const router = useRouter()
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState({ message: "", type: "success" as "success" | "error" })
  const [isLoading, setIsLoading] = useState(true)


  // Load artworks from both localStorage and Web3 storage
  useEffect(() => {
    async function loadArtworks() {
      setIsLoading(true)

      try {
        // Load artworks from localStorage
        const storedArtworks = JSON.parse(localStorage.getItem("artworks") || "[]") as Artwork[]

        // Fetch artworks from Web3 storage API
        const response = await fetch("/api/get-images")
        console.log("Response from Web3 storage:", response)
        if (!response.ok) {
        throw new Error("Failed to fetch images from Web3 storage")
        }

        const web3Artworks = (await response.json()) as Artwork[]

        // Merge without duplicates (by cid if present, otherwise id)
        const mergedArtworks = [...storedArtworks]

        web3Artworks.forEach((web3Artwork) => {
          const exists = storedArtworks.some(
            (artwork) =>
              (artwork.cid && artwork.cid === web3Artwork.cid) ||
              (!artwork.cid && artwork.id === web3Artwork.id)
          )

          if (!exists) {
            mergedArtworks.push(web3Artwork)
          }
        })

        // Update state with merged list
        setArtworks(mergedArtworks)
        setFilteredArtworks(mergedArtworks)
      } catch (error) {
        console.error("Error loading artworks:", error)

        setNotification({
          message: `Failed to load some artworks from Web3 storage`,
          type: "error",
        })

        // Fallback: load localStorage artworks only
        const storedArtworks = JSON.parse(localStorage.getItem("artworks") || "[]") as Artwork[]
        setArtworks(storedArtworks)
        setFilteredArtworks(storedArtworks)
      } finally {
        setIsLoading(false)
      }
    }

    loadArtworks()
  }, [setArtworks, setFilteredArtworks, setIsLoading, setNotification])

  

  // Filter and sort artworks when search or sort changes
  useEffect(() => {
    let filtered = [...artworks]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((artwork) => artwork.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Sort artworks
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
    }

    setFilteredArtworks(filtered)
  }, [searchTerm, sortBy, artworks])

  const openArtworkModal = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedArtwork(null)
  }

  const deleteArtwork = () => {
    if (!selectedArtwork) return

    // Only remove from localStorage - we can't delete from IPFS
    const updatedArtworks = artworks.filter((a) => a.id !== selectedArtwork.id)
    localStorage.setItem("artworks", JSON.stringify(updatedArtworks.filter((a) => !a.ipfsUrl)))

    setNotification({
      message: selectedArtwork.ipfsUrl
        ? "Artwork removed from gallery (but still exists on IPFS)"
        : "Artwork deleted successfully",
      type: "success",
    })

    setArtworks(updatedArtworks)
    closeModal()
  }

  const sellArtwork = () => {
    if (!selectedArtwork) return

    const price = prompt("Enter the price for your artwork (ETH):", "0.1")
    if (price === null) return

    const priceValue = Number.parseFloat(price)
    if (isNaN(priceValue) || priceValue <= 0) {
      setNotification({
        message: "Please enter a valid price",
        type: "error",
      })
      return
    }

    // Update artwork with price and forSale flag
    const updatedArtworks = artworks.map((a) => {
      if (a.id === selectedArtwork.id) {
        return { ...a, forSale: true, price: priceValue }
      }
      return a
    })

    // Only update localStorage for local artworks
    localStorage.setItem("artworks", JSON.stringify(updatedArtworks.filter((a) => !a.ipfsUrl)))

    setNotification({
      message: "Artwork listed for sale successfully",
      type: "success",
    })

    setArtworks(updatedArtworks)
    closeModal()
  }

  const editArtwork = () => {
    if (!selectedArtwork) return

    // Can only edit local artworks, not those from IPFS
    if (selectedArtwork.ipfsUrl && !selectedArtwork.dataURL) {
      setNotification({
        message: "Cannot edit artworks stored on IPFS. You can only edit local artworks.",
        type: "error",
      })
      return
    }

    // Store the artwork to edit in localStorage
    localStorage.setItem("artworkToEdit", JSON.stringify(selectedArtwork))

    // Navigate to the draw page
    router.push("/continue/draw")
    closeModal()
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-12">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-7xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Your Artwork Gallery</h1>
            <p className="text-muted-foreground text-lg">Here you can see the Art you've already uploaded to the Marketplace, and the art you've decided to keep private</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-6 mb-10 rounded-lg">
            <div className="relative flex-grow max-w-md">
              <label htmlFor="searchArtwork" className="block text-sm font-medium text-muted-foreground mb-2">
                Search:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  id="searchArtwork"
                  placeholder="Search by name..."
                  className="w-full bg-white pl-9 pr-3 py-2.5 border-input rounded-md border border-gray-300 focus:outline-none focus:border-transparent text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full md:w-auto">
              <label htmlFor="sortBy" className="block text-sm font-medium text-muted-foreground mb-2">
                Sort by:
              </label>
              <select
                id="sortBy"
                className="px-3 pr-15 bg-white py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-transparent"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your artwork from Web Storage...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {filteredArtworks.length > 0 ? (
                filteredArtworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="rounded-lg overflow-hidden bg-slate-50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                    onClick={() => openArtworkModal(artwork)}
                  >
                    <div className="relative aspect-square">
                      <img
                        src={artwork.dataURL || "/placeholder.png"}
                        alt={artwork.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback if image fails to load
                          e.currentTarget.src = "/placeholder.png"
                        }}
                      />
                      {artwork.ipfsUrl && (
                        <div className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-1 rounded-full">
                          IPFS
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-semibold mb-2">{artwork.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(artwork.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        Category: {artwork.category.charAt(0).toUpperCase() + artwork.category.slice(1)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Price: {artwork.price > 0 ? `${artwork.price} ETH` : "Not for sale"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center text-center p-16 border border-dashed border-border rounded-lg text-muted-foreground">
                  <ImageIcon className="w-16 h-16 mb-6 opacity-50" />
                  <p className="mb-6 text-lg">Your gallery is empty. Start creating some artwork!</p>
                  <Link
                    href="/draw"
                    className="flex items-center justify-center px-6 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-base font-medium"
                  >
                    Create Artwork
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Artwork Modal */}
      {isModalOpen && selectedArtwork && (
        <div
          className="fixed inset-0 bg-black/50 z-50 overflow-auto flex items-center justify-center p-6"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full relative p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl text-muted-foreground hover:text-foreground"
              onClick={closeModal}
            >
              &times;
            </button>
            <div>
              <h2 className="text-2xl font-bold mb-2">{selectedArtwork.name}</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Created on: {new Date(selectedArtwork.date).toLocaleDateString()}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Category: {selectedArtwork.category.charAt(0).toUpperCase() + selectedArtwork.category.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                Price: {selectedArtwork.price > 0 ? `${selectedArtwork.price} ETH` : "Not for sale"}
              </p>
              {selectedArtwork.cid && (
                <p className="text-sm text-muted-foreground mb-6">
                  Stored on IPFS: <span className="font-mono text-xs">{selectedArtwork.cid}</span>
                </p>
              )}
              <div className="rounded-lg overflow-hidden shadow-md mb-8">
                <img
                  src={selectedArtwork.dataURL || "/placeholder.png"}
                  alt={selectedArtwork.name}
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.src = "/placeholder.png"
                  }}
                />
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                {!selectedArtwork.ipfsUrl && (
                  <button
                    className="flex items-center bg-blue-600 text-white hover:bg-blue-700 justify-center px-5 py-2.5 rounded-md font-medium"
                    onClick={editArtwork}
                  >
                    <Edit className="w-4 h-4 mr-2" /> Continue Editing
                  </button>
                )}
                  {selectedArtwork.forSale ? (
                    <button
                    className="flex items-center justify-center px-5 text-white py-2.5 bg-[#fc3737] rounded-md hover:opacity-90 text-sm font-medium"
                    onClick={deleteArtwork}
                  >
                    <Trash className="w-4 h-4 mr-2" /> {selectedArtwork.ipfsUrl ? "Remove" : "Delete"}
                  </button>
                  ) : (
                    <>
                    <button
                  className="flex items-center bg-emerald-600 text-white hover:bg-emerald-700 justify-center px-5 py-2.5 rounded-md font-medium"
                  onClick={sellArtwork}
                  disabled={selectedArtwork.forSale}
                >
                  <Tag className="w-4 h-4 mr-2" /> Sell on Marketplace
                </button>
                      
                    <button
                      className="flex items-center justify-center px-5 text-white py-2.5 bg-[#fc3737] rounded-md hover:opacity-90 text-sm font-medium"
                      onClick={deleteArtwork}
                    >
                      <Trash className="w-4 h-4 mr-2" /> {selectedArtwork.ipfsUrl ? "Remove" : "Delete"}
                    </button>
                    </>
                    
                  )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Notification message={notification.message} type={notification.type} />
    </div>
  )
}
