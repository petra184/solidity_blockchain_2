"use client"

import { useEffect, useState } from "react"

interface NotificationProps {
  message: string
  type?: "success" | "error"
  duration?: number
}

export default function Notification({ message, type = "success", duration = 3000 }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [message, duration])

  if (!message) return null

  return (
    <>
      <div
        className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
        } ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white max-w-sm`}
      >
        <p id="notification-message">{message}</p>
      </div>
    </>
  )
}