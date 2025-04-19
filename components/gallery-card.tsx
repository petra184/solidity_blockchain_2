"use client"

import { useState } from "react"
import type { Artwork } from "@/app/types/artwork"

interface GalleryCardProps {
  artwork: Artwork
  onClick: (artwork: Artwork) => void
}

export default function GalleryCard({ artwork, onClick }: GalleryCardProps) {
  const [imageError, setImageError] = useState(false)

  // Handle image loading errors
  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div
      className="rounded-lg overflow-hidden bg-slate-50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer"
      onClick={() => onClick(artwork)}
    >
      {/* Use IPFS URL if available, otherwise fall back to dataURL */}
      <img
        src={!imageError && artwork.ipfsUrl ? artwork.ipfsUrl : artwork.dataURL || "/placeholder.svg"}
        alt={artwork.name}
        className="w-full aspect-square object-cover"
        onError={handleImageError}
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
        {artwork.cid && (
          <p className="text-xs text-muted-foreground mt-2 truncate">CID: {artwork.cid.substring(0, 10)}...</p>
        )}
      </div>
    </div>
  )
}
