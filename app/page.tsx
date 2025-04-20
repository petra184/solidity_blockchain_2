"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { RoundedButton } from "@/components/button"

export default function MetaMaskSignIn() {
  const router = useRouter()
  const [hasMetaMask, setHasMetaMask] = useState<boolean | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ethereum = (window as any).ethereum
      setHasMetaMask(!!ethereum && ethereum.isMetaMask)
    }
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError(null)

    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) throw new Error("MetaMask not detected")

      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setTimeout(() => {
          router.push("/continue/marketplace")
        }, 1000)
      } else {
        throw new Error("No accounts found")
      }
    } catch (err: any) {
      console.error("Connection error:", err)
      setError(err.message || "Failed to connect to MetaMask")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center  p-4">
      <div className="w-full max-w-md rounded-lg border border-purple-200 bg-white p-6 shadow-lg">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-purple-700">Sign in with MetaMask</h1>
          <p className="text-sm text-gray-500 mt-1">Connect your wallet to access the marketplace</p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="h-24 w-24 relative">
            <Image
              src="/fox.png"
              alt="MetaMask Fox"
              width={96}
              height={96}
              className="object-contain"
            />
          </div>

          {hasMetaMask === null ? (
            <p className="text-sm text-gray-500">Checking for MetaMask...</p>
          ) : hasMetaMask ? (
            <>
              {account ? (
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <p className="text-sm font-medium text-green-700">Connected!</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {account.slice(0, 6)}...{account.slice(-4)}
                  </p>
                  <p className="text-sm text-purple-600">Redirecting to marketplace...</p>
                </div>
              ) : (
                <RoundedButton onClick={connectWallet} disabled={isConnecting} className="w-full py-3">
                  {isConnecting ? "Connecting..." : "Connect Wallet"}
                </RoundedButton>
              )}

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            </>
          ) : (
            <RoundedButton
              onClick={() => window.open("https://metamask.io/download/", "_blank")}
              className="w-full py-3"
            >
              Download MetaMask
            </RoundedButton>
          )}

          {/* Always-visible download link */}
          <p className="text-sm text-gray-500 text-center">
            Don’t have MetaMask?{" "}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-600 underline"
            >
              Download it here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
