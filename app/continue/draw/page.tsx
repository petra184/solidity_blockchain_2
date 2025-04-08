"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Notification from "@/components/notification"
import type { Artwork } from "@/app/types/artwork"
import {
  Eraser,
  Trash2,
  Save,
  Paintbrush,
  Circle,
  Square,
  Minus,
  Palette,
  SlidersHorizontal,
  Layers,
  ImagePlus,
} from "lucide-react"
import Navbar from "@/components/navbar"

export default function DrawPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastX, setLastX] = useState(0)
  const [lastY, setLastY] = useState(0)
  const [brushSize, setBrushSize] = useState(5)
  const [color, setColor] = useState("#8b5cf6")
  const [isEraser, setIsEraser] = useState(false)
  const [originalColor, setOriginalColor] = useState("#8b5cf6")
  const [drawingName, setDrawingName] = useState("")
  const [category, setCategory] = useState("digital-painting")
  const [price, setPrice] = useState("")
  const [notification, setNotification] = useState({ message: "", type: "success" as "success" | "error" })
  const [showColorPalette, setShowColorPalette] = useState(false)
  const [showBrushSettings, setShowBrushSettings] = useState(false)
  const [tool, setTool] = useState<"brush" | "eraser" | "line" | "circle" | "rectangle">("brush")
  const [opacity, setOpacity] = useState(100)

  // Predefined color palette
  const colorPalette = [
    "#000000",
    "#ffffff",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#00ffff",
    "#ff00ff",
    "#8b5cf6",
    "#f97316",
    "#10b981",
    "#ef4444",
    "#3b82f6",
    "#ec4899",
    "#f59e0b",
  ]

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement
      if (!container) return

      const width = container.clientWidth
      canvas.width = width
      canvas.height = 600

      // Fill with white background
      const context = canvas.getContext("2d")
      if (context) {
        context.fillStyle = "white"
        context.fillRect(0, 0, canvas.width, canvas.height)
        setCtx(context)
      }
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const coords = getCoordinates(e)
    setLastX(coords[0])
    setLastY(coords[1])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return

    // Prevent default behavior to avoid scrolling on touch devices
    e.preventDefault?.()

    const [currentX, currentY] = getCoordinates(e)

    ctx.lineJoin = "round"
    ctx.lineCap = "round"
    ctx.lineWidth = brushSize
    ctx.strokeStyle = isEraser ? "white" : color

    ctx.beginPath()
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(currentX, currentY)
    ctx.stroke()

    setLastX(currentX)
    setLastY(currentY)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ): [number, number] => {
    const canvas = canvasRef.current
    if (!canvas) return [0, 0]

    const rect = canvas.getBoundingClientRect()

    if ("touches" in e && e.touches.length > 0) {
      // Touch event
      return [e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top]
    } else if ("clientX" in e) {
      // Mouse event
      return [e.clientX - rect.left, e.clientY - rect.top]
    }

    return [0, 0]
  }

  const toggleEraser = () => {
    if (!isEraser) {
      setOriginalColor(color)
      setIsEraser(true)
    } else {
      setColor(originalColor)
      setIsEraser(false)
    }
  }

  const setDrawingTool = (selectedTool: "brush" | "eraser" | "line" | "circle" | "rectangle") => {
    setTool(selectedTool)
    if (selectedTool === "eraser") {
      toggleEraser()
    }
  }

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height)
  }

  const saveDrawing = () => {
    if (!canvasRef.current) return

    const name = drawingName.trim() || "Untitled Artwork"
    const artworkPrice = Number.parseFloat(price) || 0
    const forSale = artworkPrice > 0

    // Convert canvas to data URL
    const dataURL = canvasRef.current.toDataURL("image/png")

    // Create artwork object
    const artwork: Artwork = {
      id: Date.now().toString(),
      name,
      category,
      dataURL,
      date: new Date().toISOString(),
      forSale,
      price: artworkPrice,
    }

    // Get existing artworks from localStorage
    const artworks = JSON.parse(localStorage.getItem("artworks") || "[]")

    // Add new artwork
    artworks.push(artwork)

    // Save to localStorage
    localStorage.setItem("artworks", JSON.stringify(artworks))

    // Show notification
    setNotification({
      message: `"${name}" saved successfully!`,
      type: "success",
    })

    // Reset drawing name and price
    setDrawingName("")
    setPrice("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-light/30 via-white to-primary-light/30">
      <Navbar />
      <main className="py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Your Art</h1>
            <p className="text-muted-foreground">Express yourself through digital art and share your creations</p>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="flex flex-col md:flex-row">
              {/* Left Sidebar - Tools */}
              <div className="w-full md:w-64 bg-slate-50 p-4 border-r border-border">
                <div className="space-y-6">
                  {/* Drawing Tools */}
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Tools</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          tool === "brush" && !isEraser
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "hover:bg-slate-100"
                        }`}
                        onClick={() => setDrawingTool("brush")}
                        title="Brush"
                      >
                        <Paintbrush className="w-5 h-5 mb-1" />
                        <span className="text-xs">Brush</span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          isEraser ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "hover:bg-slate-100"
                        }`}
                        onClick={() => setDrawingTool("eraser")}
                        title="Eraser"
                      >
                        <Eraser className="w-5 h-5 mb-1" />
                        <span className="text-xs">Eraser</span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          tool === "line" ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "hover:bg-slate-100"
                        }`}
                        onClick={() => setDrawingTool("line")}
                        title="Line"
                      >
                        <Minus className="w-5 h-5 mb-1" />
                        <span className="text-xs">Line</span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          tool === "circle" ? "bg-primary/10 text-primary ring-1 ring-primary/30" : "hover:bg-slate-100"
                        }`}
                        onClick={() => setDrawingTool("circle")}
                        title="Circle"
                      >
                        <Circle className="w-5 h-5 mb-1" />
                        <span className="text-xs">Circle</span>
                      </button>
                      <button
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 rounded-lg ${
                          tool === "rectangle"
                            ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                            : "hover:bg-slate-100"
                        }`}
                        onClick={() => setDrawingTool("rectangle")}
                        title="Rectangle"
                      >
                        <Square className="w-5 h-5 mb-1" />
                        <span className="text-xs">Rectangle</span>
                      </button>
                      <button
                        type="button"
                        className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-slate-100"
                        onClick={clearCanvas}
                        title="Clear Canvas"
                      >
                        <Trash2 className="w-5 h-5 mb-1" />
                        <span className="text-xs">Clear</span>
                      </button>
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Color</h3>
                      <button
                        className="text-xs text-primary flex items-center"
                        onClick={() => setShowColorPalette(!showColorPalette)}
                      >
                        <Palette className="w-4 h-4 mr-1" />
                        {showColorPalette ? "Hide" : "Show"} Palette
                      </button>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-full border border-slate-200 shadow-sm"
                        style={{ backgroundColor: color }}
                      ></div>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => {
                          setColor(e.target.value)
                          if (isEraser) setIsEraser(false)
                        }}
                        className="w-full h-10 cursor-pointer"
                      />
                    </div>

                    {showColorPalette && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {colorPalette.map((paletteColor) => (
                          <button
                            key={paletteColor}
                            className={`w-full aspect-square rounded-md border ${
                              color === paletteColor ? "ring-2 ring-primary ring-offset-2" : "border-slate-200"
                            }`}
                            style={{ backgroundColor: paletteColor }}
                            onClick={() => setColor(paletteColor)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Brush Settings */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Brush Settings
                      </h3>
                      <button
                        className="text-xs text-primary flex items-center"
                        onClick={() => setShowBrushSettings(!showBrushSettings)}
                      >
                        <SlidersHorizontal className="w-4 h-4 mr-1" />
                        {showBrushSettings ? "Hide" : "Show"}
                      </button>
                    </div>

                    <div className={`space-y-4 ${showBrushSettings ? "block" : "hidden"}`}>
                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-muted-foreground">Size: {brushSize}px</label>
                          <span className="text-xs text-muted-foreground">{brushSize}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="50"
                          value={brushSize}
                          onChange={(e) => setBrushSize(Number.parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <label className="text-xs text-muted-foreground">Opacity: {opacity}%</label>
                          <span className="text-xs text-muted-foreground">{opacity}%</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="100"
                          value={opacity}
                          onChange={(e) => setOpacity(Number.parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Canvas Area */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-border bg-slate-50">
                  <div className="flex items-center gap-2"></div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="flex items-center justify-center px-3 py-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm"
                    >
                      <Layers className="w-4 h-4 mr-1" /> Layers
                    </button>
                  </div>
                </div>

                <div className="flex-1 bg-slate-200 p-4 flex items-center justify-center">
                  <canvas
                    id="drawCanvas"
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseOut={stopDrawing}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      startDrawing(e)
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      draw(e)
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault()
                      stopDrawing()
                    }}
                    className="rounded-lg shadow-lg bg-white max-w-full touch-none"
                    style={{ touchAction: "none" }}
                  ></canvas>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border bg-white">
              <div className="flex flex-wrap gap-5 mb-5">
                <div className="flex flex-col gap-2 min-w-[200px] flex-1">
                  <label htmlFor="drawingName" className="text-sm font-medium text-gray-700">
                    Artwork Title
                  </label>
                  <input
                    type="text"
                    id="drawingName"
                    placeholder="Name your artwork"
                    value={drawingName}
                    onChange={(e) => setDrawingName(e.target.value)}
                    className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
                <div className="flex flex-col gap-2 min-w-[200px] flex-1">
                  <label htmlFor="drawingCategory" className="text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    id="drawingCategory"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-right-4 bg-[length:16px] pr-10"
                  >
                    <option value="digital-painting">Digital Painting</option>
                    <option value="abstract">Abstract</option>
                    <option value="illustration">Illustration</option>
                    <option value="pixel-art">Pixel Art</option>
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 min-w-[150px]">
                  <label htmlFor="drawingPrice" className="text-sm font-medium text-gray-700">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    id="drawingPrice"
                    min="0"
                    step="0.01"
                    placeholder="Set a price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  id="saveDrawing"
                  className="flex items-center justify-center px-6 py-3 rounded-md bg-primary text-white hover:bg-primary/90 text-sm font-medium shadow-sm"
                  onClick={saveDrawing}
                >
                  <Save className="w-4 h-4 mr-2" /> Save Artwork
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-6 py-3 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium shadow-sm"
                  onClick={() => {
                    saveDrawing()
                    setNotification({
                      message: "Artwork uploaded to marketplace!",
                      type: "success",
                    })
                  }}
                >
                  <ImagePlus className="w-4 h-4 mr-2" /> Upload to Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Notification message={notification.message} type={notification.type} />
    </div>
  )
}
