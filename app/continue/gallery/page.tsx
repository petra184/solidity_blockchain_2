"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Notification from "@/components/notification"
import type { Artwork } from "@/app/types/artwork"
import { Download, Tag, Trash, ImageIcon, Search } from "lucide-react"
import Navbar from "@/components/navbar"

export default function Gallery() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState({ message: "", type: "success" as "success" | "error" })

  // Load artworks from localStorage
  useEffect(() => {
    const storedArtworks = JSON.parse(localStorage.getItem("artworks") || "[]")
    setArtworks(storedArtworks)
    setFilteredArtworks(storedArtworks)
  }, [])

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

  const downloadArtwork = () => {
    if (!selectedArtwork) return

    const link = document.createElement("a")
    link.download = `${selectedArtwork.name}.png`
    link.href = selectedArtwork.dataURL
    link.click()
  }

  const deleteArtwork = () => {
    if (!selectedArtwork) return

    const updatedArtworks = artworks.filter((a) => a.id !== selectedArtwork.id)
    localStorage.setItem("artworks", JSON.stringify(updatedArtworks))

    setNotification({
      message: "Artwork deleted successfully",
      type: "success",
    })

    setArtworks(updatedArtworks)
    closeModal()
  }

  const sellArtwork = () => {
    if (!selectedArtwork) return

    const price = prompt("Enter the price for your artwork ($):", "50")
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

    localStorage.setItem("artworks", JSON.stringify(updatedArtworks))

    setNotification({
      message: "Artwork listed for sale successfully",
      type: "success",
    })

    setArtworks(updatedArtworks)
    closeModal()
  }

  return (
    <div className="min-h-screen">
      <Navbar/>
      <main className="py-12">
        <div className="container mx-auto px-6 md:px-8 lg:px-12 max-w-7xl">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Your Artwork Gallery</h1>
            <p className="text-muted-foreground text-lg">Browse and explore your creative collection</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-end gap-6 mb-10 bg-white p-6 rounded-lg shadow-sm">
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
                  className="w-full pl-9 pr-3 py-2.5 rounded-md border border-input bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
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
                className="w-full md:w-56 px-3 py-2.5 rounded-md border border-input bg-white focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-0.5 bg-center pr-8"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredArtworks.length > 0 ? (
              filteredArtworks.map((artwork) => (
                <div
                  key={artwork.id}
                  className="rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                  onClick={() => openArtworkModal(artwork)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={artwork.dataURL || "/placeholder.svg"}
                    alt={artwork.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-base font-semibold mb-2">{artwork.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{new Date(artwork.date).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      Category: {artwork.category.charAt(0).toUpperCase() + artwork.category.slice(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Price: {artwork.price > 0 ? `$${artwork.price.toFixed(2)}` : "Not for sale"}
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
              <p className="text-sm text-muted-foreground mb-6">
                Price: {selectedArtwork.price > 0 ? `$${selectedArtwork.price.toFixed(2)}` : "Not for sale"}
              </p>
              <div className="rounded-lg overflow-hidden shadow-md mb-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedArtwork.dataURL || "/placeholder.svg"}
                  alt={selectedArtwork.name}
                  className="w-full h-auto"
                />
              </div>
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  className="flex items-center justify-center px-5 py-2.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium"
                  onClick={downloadArtwork}
                >
                  <Download className="w-4 h-4 mr-2" /> Download
                </button>
                <button
                  className="flex items-center justify-center px-5 py-2.5 rounded-md bg-secondary text-secondary-foreground hover:bg-muted text-sm font-medium"
                  onClick={sellArtwork}
                  disabled={selectedArtwork.forSale}
                >
                  {selectedArtwork.forSale ? (
                    `Listed for $${selectedArtwork.price.toFixed(2)}`
                  ) : (
                    <>
                      <Tag className="w-4 h-4 mr-2" /> Sell on Marketplace
                    </>
                  )}
                </button>
                <button
                  className="flex items-center justify-center px-5 py-2.5 rounded-md bg-destructive text-destructive-foreground hover:opacity-90 text-sm font-medium"
                  onClick={deleteArtwork}
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Notification message={notification.message} type={notification.type} />
    </div>
  )
}
