"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Palette, WalletCards } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()

  const linkClasses = (path: string) =>
    `relative px-3 py-2 text-sm font-medium transition-colors ${
      pathname === path
        ? "text-purple-700"
        : "text-muted-foreground hover:bg-purple-50 rounded-xl"
    }`

  const connectToMetaMask = async () => {
    try {
      const { ethereum } = window as any

      if (!ethereum || !ethereum.isMetaMask) {
        alert("MetaMask is not installed. Please install it from https://metamask.io")
        return
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })
      const account = accounts[0]
      console.log("Connected account:", account)
      alert(`Connected to: ${account}`)
    } catch (error) {
      console.error("Error connecting to MetaMask:", error)
      alert("Failed to connect to MetaMask.")
    }
  }

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md transition-colors shadow-sm">
      <div className="container w-[90%] mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Palette className="h-6 w-6 text-purple-700" />
          <span className="text-xl font-bold tracking-tight">ArtCanvas</span>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/continue/marketplace" className={linkClasses("/continue/marketplace")}>
            Marketplace
          </Link>
          <Link href="/continue/draw" className={linkClasses("/continue/draw")}>
            Draw
          </Link>
          <Link href="/continue/gallery" className={linkClasses("/continue/gallery")}>
            Gallery
          </Link>

          <button
            onClick={connectToMetaMask}
            className="p-2 rounded-full hover:bg-orange-100 transition"
            title="Connect Wallet"
          >
            <WalletCards className="text-orange-600 h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}
