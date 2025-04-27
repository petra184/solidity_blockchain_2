"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingBag, PaintbrushIcon as PaintBrush, Search, ShoppingCart, CheckCircle } from "lucide-react"
import { fetchOnChainArtworks, buyArtwork } from "@/app/utils/get_art"
import Navbar from "@/components/navbar"
import Notification from "@/components/notification"
import type { Artwork, UploadedArtwork } from "@/app/types/artwork"

export default function Marketplace() {
  const [marketplaceItems, setMarketplaceItems] = useState<Artwork[]>([])
  const [filteredItems, setFilteredItems] = useState<Artwork[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sortFilter, setSortFilter] = useState("newest")
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState({ message: "", type: "success" as "success" | "error" })
  const [isBuying, setIsBuying] = useState(false)

  useEffect(() => {
    const loadArtworks = async () => {
      try {
        setIsLoading(true)
        const onChainArtworks = await fetchOnChainArtworks()

        // Map the blockchain artworks to your Artwork type format
        const formattedArtworks: UploadedArtwork[] = onChainArtworks.map((art) => ({
          id: art.tokenId.toString(),
          name: art.name,
          dataURL: art.dataURL,
          category: art.category,
          price: Number.parseFloat(String(art.price)),
          forSale: art.forSale,
          ipfsUrl: art.ipfsUrl,
          tokenId: art.tokenId,
          date: art.date,
        }))

        setMarketplaceItems(formattedArtworks)
        setFilteredItems(formattedArtworks)
      } catch (error) {
        console.error("Error loading artworks:", error)
        setNotification({
          message: "Failed to load artworks from blockchain",
          type: "error",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadArtworks()
  }, [])

  // Filter items when filters change
  useEffect(() => {
    filterItems()
  }, [searchTerm, categoryFilter, priceFilter, sortFilter, marketplaceItems])

  const filterItems = () => {
    let filtered = [...marketplaceItems]

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Filter by price
    if (priceFilter !== "all") {
      filtered = filtered.filter((item) => {
        const price = item.price
        switch (priceFilter) {
          case "under-0.01":
            return price < 0.01
          case "0.01-0.05":
            return price >= 0.01 && price <= 0.05
          case "0.05-0.1":
            return price > 0.05 && price <= 0.1
          case "over-0.1":
            return price > 0.1
          default:
            return true
        }
      })
    }

    // Sort items
    switch (sortFilter) {
      case "newest":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "popular":
        // This would normally use a popularity metric
        // For now, just randomize
        filtered.sort(() => Math.random() - 0.5)
        break
    }

    setFilteredItems(filtered)
  }

  const openModal = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedArtwork(null)
  }

  // Add a handleBuyArtwork function
  const handleBuyArtwork = async () => {
    if (!selectedArtwork) return

    try {
      setIsBuying(true)
      setNotification({ message: "", type: "success" })

      // Check if MetaMask is installed
      if (!window.ethereum) {
        setNotification({
          message: "Please install MetaMask to purchase NFTs",
          type: "error",
        })
        return
      }

      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Execute purchase
      const result = await buyArtwork(Number.parseFloat(selectedArtwork.id), Number(selectedArtwork.price))

      if (result.success) {
        setNotification({
          message: `You've successfully purchased "${selectedArtwork.name}"`,
          type: "success",
        })

        // Refresh artwork list
        const updatedArtworks = await fetchOnChainArtworks()
        const formattedArtworks: UploadedArtwork[] = updatedArtworks.map((art) => ({
          id: art.tokenId.toString(),
          name: art.name,
          category: art.category,
          price: Number.parseFloat(String(art.price)),
          dataURL: art.dataURL,
          forSale: art.forSale,
          date: art.date,
          ipfsUrl: art.ipfsUrl,
          tokenId: art.tokenId,
        }))
        setMarketplaceItems(formattedArtworks)

        closeModal()
      } else {
        setNotification({
          message: result.error || "Transaction failed",
          type: "error",
        })
      }
    } catch (error) {
      console.error("Error purchasing artwork:", error)
      setNotification({
        message: error instanceof Error ? error.message : "Unknown error occurred",
        type: "error",
      })
    } finally {
      setIsBuying(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-100 to-white via-white py-20">
        <div className="container mx-auto px-6 md:px-8 text-center max-w-3xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover & Collect <span className="text-purple-700">Digital Art</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            Buy and sell original artwork from talented artists around the world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <a
              href="#marketplace"
              className="flex items-center text-white bg-purple-700 justify-center px-6 py-3 rounded-xl hover:bg-purple-800 text-base font-medium"
            >
              <ShoppingBag className="w-5 h-5 mr-2" /> Browse Artwork
            </a>
            <Link
              href="/continue/draw"
              className="flex items-center justify-center px-6 py-3 rounded-xl text-white bg-orange-600 hover:bg-orange-700 text-base font-medium"
            >
              <PaintBrush className="w-5 h-5 mr-2" /> Create Art
            </Link>
          </div>
        </div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-purple-100 blur-3xl opacity-50"></div>
        <div className="absolute top-32 -right-16 w-64 h-64 rounded-full bg-orange-100 blur-3xl opacity-30"></div>
      </div>

      <main className="container mx-auto px-6 md:px-8 lg:px-12 py-16 max-w-7xl">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Browse Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="#marketplace"
              className="block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              onClick={() => setCategoryFilter("digital-painting")}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/digital.jpg"
                  alt="Digital Painting"
                  width={400}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Digital Painting</h3>
              </div>
            </a>
            <a
              href="#marketplace"
              className="block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/abstract.webp"
                  alt="Abstract"
                  width={400}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Abstract</h3>
              </div>
            </a>
            <a
              href="#marketplace"
              className="block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/illustration.png"
                  alt="Illustration"
                  width={400}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Illustration</h3>
              </div>
            </a>
            <a
              href="#marketplace"
              className="block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/pixel.jpg"
                  alt="Pixel Art"
                  width={400}
                  height={300}
                  className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">Pixel Art</h3>
              </div>
            </a>
          </div>
        </section>

        <section id="marketplace" className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Marketplace</h2>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <label htmlFor="search-input" className="text-xs font-medium text-muted-foreground">
                Search:
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  id="search-input"
                  className="w-full pl-9 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-transparent"
                  placeholder="Search artwork or artist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="category-filter" className="text-xs font-medium text-muted-foreground">
                Category:
              </label>
              <select
                id="category-filter"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-transparent"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="digital-painting">Digital Painting</option>
                <option value="abstract">Abstract</option>
                <option value="illustration">Illustration</option>
                <option value="pixel-art">Pixel Art</option>
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="price-filter" className="text-xs font-medium text-muted-foreground">
                Price:
              </label>
              <select
                id="price-filter"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-transparent"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="under-0.01">Under 0.01 ETH</option>
                <option value="0.01-0.05">0.01 - 0.05 ETH</option>
                <option value="0.05-0.1">0.05 - 0.1 ETH</option>
                <option value="over-0.1">Over 0.1 ETH</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sort-filter" className="text-xs font-medium text-muted-foreground">
                Sort by:
              </label>
              <select
                id="sort-filter"
                className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-transparent"
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          <div id="marketplace-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {isLoading ? (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-12">
                <div className="mb-4">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
                <p className="text-muted-foreground">Loading artwork from blockchain...</p>
              </div>
            ) : filteredItems.length > 0 ? (
              filteredItems.map((artwork) => (
                <div
                  key={artwork.id}
                  className="rounded-lg overflow-hidden bg-slate-50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-full"
                  onClick={() => openModal(artwork)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artwork.dataURL || "/placeholder.png"}
                      alt={artwork.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        // Fallback if IPFS image fails to load
                        e.currentTarget.src = "/placeholder.png"
                      }}
                    />
                    {artwork.price === 0 && (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-full">
                        Sold
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="text-base font-semibold truncate mb-1">{artwork.name}</h3>
                    <div className="text-xs text-muted-foreground mb-2">
                      {artwork.category.charAt(0).toUpperCase() + artwork.category.slice(1)}
                    </div>
                    <div className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      A beautiful piece of {artwork.category.toLowerCase()} art.
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <div className="text-base font-bold text-primary">
                        {artwork.price === 0 ? "Sold" : `${artwork.price} ETH`}
                      </div>
                      <div className="text-xs text-muted-foreground">Token #{artwork.id}</div>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-0">
                    {artwork.price === 0 ? (
                      <div className="w-full flex items-center justify-center rounded-xl px-4 py-2 text-white bg-emerald-600 text-primary-foreground text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-2" /> Art Already Bought
                      </div>
                    ) : (
                      <button
                        className="w-full flex items-center justify-center rounded-xl px-4 py-2 text-white bg-purple-700 text-primary-foreground hover:opacity-90 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation()
                          openModal(artwork)
                        }}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-lg text-muted-foreground">
                <div className="mb-4 opacity-50">
                  <ShoppingBag className="w-10 h-10 mx-auto" />
                </div>
                <p className="mb-4">No artwork available in the marketplace</p>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg bg-gradient-to-r from-purple-100 via-purple-100 to-white py-16 px-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Ready to Sell Your Art?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Join our community of artists and start selling your creations today
          </p>
          <Link
            href="/continue/draw"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white bg-orange-600 hover:bg-orange-700 text-base font-medium"
          >
            <PaintBrush className="w-5 h-5 mr-2" /> Create Art
          </Link>
        </section>
      </main>

      {/* Artwork Modal */}
      {isModalOpen && selectedArtwork && (
        <div
          className="fixed inset-0 bg-black/50 z-50 overflow-auto flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-xl w-full relative p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-2xl text-muted-foreground hover:text-foreground"
              onClick={closeModal}
            >
              &times;
            </button>
            <div>
              <h2 className="text-xl font-bold mb-1">{selectedArtwork.name}</h2>
              <p className="text-sm text-muted-foreground mb-1">
                Category:{" "}
                {selectedArtwork.category.charAt(0).toUpperCase() +
                  selectedArtwork.category.slice(1).replace(/-/g, " ")}
              </p>
              <p className="text-sm text-muted-foreground mb-1">Token ID: {selectedArtwork.id}</p>
              <p className="text-sm text-muted-foreground mb-4">
                Price: {selectedArtwork.price === 0 ? "Sold" : `${selectedArtwork.price} ETH`}
              </p>
              <div className="rounded-lg overflow-hidden shadow-md mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedArtwork.dataURL || "/placeholder.png?height=400&width=400"}
                  alt={selectedArtwork.name}
                  className="w-full h-auto"
                  onError={(e) => {
                    // Fallback if IPFS image fails to load
                    e.currentTarget.src = "/placeholder.png?height=400&width=400"
                  }}
                />
              </div>
              <div className="flex justify-center">
                {selectedArtwork.price === 0 ? (
                  <div className="flex items-center justify-center px-6 py-2 bg-emerald-600 text-white rounded-xl text-base font-medium">
                    <CheckCircle className="w-5 h-5 mr-2" /> Art Already Bought
                  </div>
                ) : (
                  <button
                    className="flex items-center justify-center px-6 py-2 bg-purple-700 text-white rounded-xl bg-primary text-primary-foreground hover:opacity-90 text-base font-medium disabled:opacity-70"
                    onClick={handleBuyArtwork}
                    disabled={isBuying}
                  >
                    {isBuying ? (
                      <>
                        <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now
                      </>
                    )}
                  </button>
                )}
              </div>
              <p className="text-xs text-center mt-4 text-muted-foreground">
                {selectedArtwork.price === 0
                  ? "This artwork has already been purchased"
                  : "Purchasing this NFT will require a transaction on the Sepolia testnet"}
              </p>
            </div>
          </div>
        </div>
      )}

      <Notification message={notification.message} type={notification.type} />
    </>
  )
}
