"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Notification from "@/components/notification"
import type { Artwork } from "@/app/types/artwork"
import { ShoppingBag, PaintbrushIcon as PaintBrush, Search, ShoppingCart } from "lucide-react"
import Navbar from "@/components/navbar"

export default function Marketplace() {
  const [marketplaceItems, setMarketplaceItems] = useState<Artwork[]>([])
  const [filteredItems, setFilteredItems] = useState<Artwork[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceFilter, setPriceFilter] = useState("all")
  const [sortFilter, setSortFilter] = useState("newest")
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [notification, setNotification] = useState({ message: "", type: "success" as "success" | "error" })

  // Load marketplace items from localStorage
  useEffect(() => {
    const artworks = JSON.parse(localStorage.getItem("artworks") || "[]")
    const forSaleArtworks = artworks.filter((artwork: Artwork) => artwork.forSale)
    setMarketplaceItems(forSaleArtworks)
    setFilteredItems(forSaleArtworks)
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
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    // Filter by price
    if (priceFilter !== "all") {
      filtered = filtered.filter((item) => {
        const price = item.price
        switch (priceFilter) {
          case "under-50":
            return price < 50
          case "50-100":
            return price >= 50 && price <= 100
          case "100-200":
            return price > 100 && price <= 200
          case "over-200":
            return price > 200
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

  const handleBuyArtwork = () => {
    setNotification({
      message: "Purchase functionality will be implemented with your backend",
      type: "success",
    })
    closeModal()
  }

  return (
    <>
    <Navbar />
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-light to-white via-white py-20">
        <div className="container mx-auto px-6 md:px-8 text-center max-w-3xl relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Discover & Collect <span className="text-primary">Digital Art</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10">
            Buy and sell original artwork from talented artists around the world
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <a
              href="#marketplace"
              className="flex items-center justify-center px-6 py-3 rounded bg-primary text-primary-foreground hover:opacity-90 text-base font-medium"
            >
              <ShoppingBag className="w-5 h-5 mr-2" /> Browse Artwork
            </a>
            <Link
              href="/continue/draw"
              className="flex items-center justify-center px-6 py-3 rounded border border-border bg-transparent hover:bg-secondary text-base font-medium"
            >
              <PaintBrush className="w-5 h-5 mr-2" /> Create Art
            </Link>
          </div>
        </div>
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-primary-light blur-3xl opacity-50"></div>
        <div className="absolute top-32 -right-16 w-64 h-64 rounded-full bg-secondary blur-3xl opacity-30"></div>
      </div>

      <main className="container mx-auto px-6 md:px-8 lg:px-12 py-16 max-w-7xl">
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Browse Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="#"
              className="block rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
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
              href="#"
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
              href="#"
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
              href="#"
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
                  className="w-full pl-9 pr-3 py-2 rounded border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm"
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
                className="w-full px-3 py-2 rounded border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-0.5 bg-center pr-8"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="digital-painting">Digital Painting</option>
                <option value="abstract">Abstract</option>
                <option value="illustration">Illustration</option>
                <option value="pixel-art">Pixel Art</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="price-filter" className="text-xs font-medium text-muted-foreground">
                Price:
              </label>
              <select
                id="price-filter"
                className="w-full px-3 py-2 rounded border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-0.5 bg-center pr-8"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                <option value="all">All Prices</option>
                <option value="under-50">Under $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="over-200">Over $200</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sort-filter" className="text-xs font-medium text-muted-foreground">
                Sort by:
              </label>
              <select
                id="sort-filter"
                className="w-full px-3 py-2 rounded border border-input focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-0.5 bg-center pr-8"
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
            {filteredItems.length > 0 ? (
              filteredItems.map((artwork) => (
                <div
                  key={artwork.id}
                  className="rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col h-full"
                  onClick={() => openModal(artwork)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={artwork.dataURL || "/placeholder.svg"}
                      alt={artwork.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
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
                      <div className="text-base font-bold text-primary">${artwork.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">by You</div>
                    </div>
                  </div>
                  <div className="px-5 pb-5 pt-0">
                    <button
                      className="w-full flex items-center justify-center px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation()
                        setNotification({
                          message: "Purchase functionality will be implemented with your backend",
                          type: "success",
                        })
                      }}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" /> Buy Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-lg text-muted-foreground">
                <div className="mb-4 opacity-50">
                  <ShoppingBag className="w-10 h-10 mx-auto" />
                </div>
                <p className="mb-4">No artwork available in the marketplace</p>
                <Link
                  href="/draw"
                  className="flex items-center justify-center px-4 py-2 rounded bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium"
                >
                  Create and sell your art
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-lg bg-gradient-to-r from-primary-light via-primary-light to-white py-16 px-8 text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Ready to Sell Your Art?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Join our community of artists and start selling your creations today
          </p>
          <Link
            href="/draw"
            className="inline-flex items-center justify-center px-6 py-3 rounded bg-primary text-primary-foreground hover:opacity-90 text-base font-medium"
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
                Category: {selectedArtwork.category.charAt(0).toUpperCase() + selectedArtwork.category.slice(1)}
              </p>
              <p className="text-sm text-muted-foreground mb-4">Price: ${selectedArtwork.price.toFixed(2)}</p>
              <div className="rounded-lg overflow-hidden shadow-md mb-6">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedArtwork.dataURL || "/placeholder.svg"}
                  alt={selectedArtwork.name}
                  className="w-full h-auto"
                />
              </div>
              <div className="flex justify-center">
                <button
                  className="flex items-center justify-center px-6 py-3 rounded bg-primary text-primary-foreground hover:opacity-90 text-base font-medium"
                  onClick={handleBuyArtwork}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Notification message={notification.message} type={notification.type} />
    </>
  )
}
