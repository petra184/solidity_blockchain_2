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
    <div className={`notification ${isVisible ? "show" : ""} ${type}`}>
      <p id="notification-message">{message}</p>
    </div>
  )
}

