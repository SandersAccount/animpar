import React, { useState, useCallback } from 'react'
import { Wand2 } from 'lucide-react'
import { generateImage } from '../services/openai'
import { urlToBase64 } from '../utils/imageUtils'

interface AIImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void
  onClose: () => void
}

const AIImageGenerator: React.FC<AIImageGeneratorProps> = ({ onImageGenerated, onClose }) => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = useCallback(async () => {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt) {
      setError('Please enter a prompt')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const imageUrl = await generateImage(trimmedPrompt)
      
      if (!imageUrl) {
        throw new Error('No image URL received')
      }

      const base64Image = await urlToBase64(imageUrl)
      
      if (!base64Image) {
        throw new Error('Failed to process image')
      }

      onImageGenerated(base64Image)
      setPrompt('')
      onClose()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [prompt, onImageGenerated, onClose])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">AI Image Generator</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe the image you want to generate:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setError(null)
              }}
              className="w-full px-3 py-2 border rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Enter a detailed description..."
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4" role="alert">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Generate Image</span>
              </>
            )}
          </button>

          <p className="text-xs text-gray-500 mt-2">
            Using DALL-E 2 model. Generated images will be 256x256 pixels.
            The process may take a few moments.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AIImageGenerator