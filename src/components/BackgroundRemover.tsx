import React, { useState } from 'react'
import { createImageFromUrl } from '../utils/imageUtils'

interface BackgroundRemoverProps {
  imageUrl: string
  onRemoveBackground: (newImageUrl: string) => void
}

const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({ imageUrl, onRemoveBackground }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const removeBackground = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const img = await createImageFromUrl(imageUrl)

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        throw new Error('Unable to get canvas context')
      }

      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      // Find the most common color (assuming it's the background)
      const colorCounts: Record<string, number> = {}
      let maxCount = 0
      let backgroundColor = ''

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const color = `${r},${g},${b}`

        colorCounts[color] = (colorCounts[color] || 0) + 1
        if (colorCounts[color] > maxCount) {
          maxCount = colorCounts[color]
          backgroundColor = color
        }
      }

      const [bgR, bgG, bgB] = backgroundColor.split(',').map(Number)
      const tolerance = 30

      // Remove background color with anti-aliasing consideration
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]

        const colorDiff = Math.sqrt(
          Math.pow(r - bgR, 2) +
          Math.pow(g - bgG, 2) +
          Math.pow(b - bgB, 2)
        )

        if (colorDiff < tolerance) {
          // Calculate opacity based on color difference
          const opacity = Math.min(1, colorDiff / tolerance)
          data[i + 3] = Math.round(opacity * 255) // Alpha channel
        }
      }

      ctx.putImageData(imageData, 0, 0)

      const newImageUrl = canvas.toDataURL('image/png')
      onRemoveBackground(newImageUrl)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to remove background: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={removeBackground}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
            <span>Processing...</span>
          </div>
        ) : (
          'Remove Background'
        )}
      </button>
      {error && (
        <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

export default BackgroundRemover