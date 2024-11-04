import React, { useState } from 'react'
import { X } from 'lucide-react'

interface AIImagePromptProps {
  onSubmit: (prompt: string) => void
  onClose: () => void
  isLoading: boolean
  error: string | null
}

const AIImagePrompt: React.FC<AIImagePromptProps> = ({
  onSubmit,
  onClose,
  isLoading,
  error
}) => {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit(prompt.trim())
    }
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">AI Image Generator</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Describe the image you want to generate:
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full px-3 py-2 border rounded resize-none"
            rows={3}
            placeholder="E.g., A serene landscape with mountains and a lake at sunset"
            disabled={isLoading}
          />
        </div>
        {error && (
          <div className="text-red-500 text-sm" role="alert">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`w-full py-2 px-4 rounded transition-colors ${
            isLoading || !prompt.trim()
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>
    </div>
  )
}

export default AIImagePrompt