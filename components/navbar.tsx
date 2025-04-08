"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Palette } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md transition-colors shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">ArtCanvas</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/continue/marketplace"
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/continue/marketplace"
                ? "text-primary before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-primary"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md"
            }`}
          >
            Marketplace
          </Link>
          <Link
            href="/continue/draw"
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/continue/draw"
                ? "text-primary before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-primary"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md"
            }`}
          >
            Draw
          </Link>
          <Link
            href="/continue/gallery"
            className={`relative px-3 py-2 text-sm font-medium transition-colors ${
              pathname === "/continue/gallery"
                ? "text-primary before:absolute before:bottom-0 before:left-0 before:h-0.5 before:w-full before:bg-primary"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-md"
            }`}
          >
            Gallery
          </Link>
        </div>
        <div className="md:hidden">
          {/* Mobile menu button would go here */}
          <button className="p-2 text-muted-foreground hover:text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" x2="20" y1="12" y2="12"></line>
              <line x1="4" x2="20" y1="6" y2="6"></line>
              <line x1="4" x2="20" y1="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
