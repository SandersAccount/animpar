import React, { useState } from 'react'
import { Plus, Wand2 } from 'lucide-react'
import BackgroundRemover from './BackgroundRemover'
import AIImageGenerator from './AIImageGenerator'

interface ImageLibraryProps {
  images: string[]
  onImageUpload: (file: File) => void
  onImageSelect: (imageUrl: string) => void
  replacingShapeId: number | null
}

const ImageLibrary: React.FC<ImageLibraryProps> = ({
  images,
  onImageUpload,
  onImageSelect,
  replacingShapeId
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [errorImages, setErrorImages] = useState<Set<string>>(new Set())
  const [showAIGenerator, setShowAIGenerator] = useState(false)

  const handleImageClick = (imageUrl: string) => {
    if (replacingShapeId !== null) {
      onImageSelect(imageUrl)
    } else {
      setSelectedImage(imageUrl)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach(file => onImageUpload(file))
    }
  }

  const handleRemoveBackground = (newImageUrl: string) => {
    onImageSelect(newImageUrl)
    setSelectedImage(newImageUrl)
  }

  const handleImageError = (imageUrl: string) => {
    setErrorImages(prev => new Set(prev).add(imageUrl))
  }

  const handleAIImageGenerated = (imageUrl: string) => {
    onImageSelect(imageUrl)
    setShowAIGenerator(false)
    if (!replacingShapeId) {
      setSelectedImage(imageUrl)
    }
  }

  const isValidImageUrl = (url: string) => {
    return url.startsWith('data:image/') || url.startsWith('http://') || url.startsWith('https://')
  }

  const renderImage = (imageUrl: string, index: number) => {
    if (!isValidImageUrl(imageUrl) || errorImages.has(imageUrl)) {
      return (
        <div key={index} className="aspect-square bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">Invalid Image</span>
        </div>
      )
    }

    return (
      <img
        key={index}
        src={imageUrl}
        alt={`Library image ${index + 1}`}
        className="aspect-square object-cover cursor-pointer hover:opacity-80"
        onClick={() => handleImageClick(imageUrl)}
        onError={() => handleImageError(imageUrl)}
      />
    )
  }

  return (
    <div className="mt-4">
      <button
        className="flex items-center justify-between w-full p-2 bg-gray-100 rounded"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-bold">
          {replacingShapeId !== null ? 'Select Image to Replace' : 'Image Library'}
        </span>
        <span>{isExpanded ? '▲' : '▼'}</span>
      </button>
      {isExpanded && (
        <div className="mt-2 p-2 bg-white border border-gray-200 rounded">
          <div className="grid grid-cols-3 gap-2">
            {images.map((imageUrl, index) => renderImage(imageUrl, index))}
            <div className="grid grid-cols-2 gap-1">
              <label className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Plus size={24} />
              </label>
              <button
                onClick={() => setShowAIGenerator(true)}
                className="aspect-square bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200"
                title="Generate AI Image"
              >
                <Wand2 size={24} />
              </button>
            </div>
          </div>
          {showAIGenerator && (
            <div className="mt-4">
              <AIImageGenerator
                onImageGenerated={handleAIImageGenerated}
                onClose={() => setShowAIGenerator(false)}
              />
            </div>
          )}
          {selectedImage && isValidImageUrl(selectedImage) && !errorImages.has(selectedImage) && replacingShapeId === null && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Selected Image</h4>
              <img 
                src={selectedImage} 
                alt="Selected" 
                className="max-w-full h-auto mb-2"
                onError={() => handleImageError(selectedImage)}
              />
              <BackgroundRemover imageUrl={selectedImage} onRemoveBackground={handleRemoveBackground} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ImageLibrary