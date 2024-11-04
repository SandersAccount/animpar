import React from 'react'
import { Square, Circle, Triangle, Pentagon, Star, MessageCircle, Camera } from 'lucide-react'
import { ShapeType } from '../types'
import ImageLibrary from './ImageLibrary'

interface ShapeSidebarProps {
  addShape: (type: ShapeType) => void
  onImageUpload: (file: File) => void
  onImageSelect: (imageUrl: string) => void
  images: string[]
  replacingShapeId: number | null
}

const ShapeSidebar: React.FC<ShapeSidebarProps> = ({
  addShape,
  onImageUpload,
  onImageSelect,
  images,
  replacingShapeId
}) => {
  const shapes: { type: ShapeType; icon: React.ReactNode }[] = [
    { type: 'rectangle', icon: <Square /> },
    { type: 'circle', icon: <Circle /> },
    { type: 'triangle', icon: <Triangle /> },
    { type: 'pentagon', icon: <Pentagon /> },
    { type: 'star', icon: <Star /> },
    { type: 'speech-bubble', icon: <MessageCircle /> },
    { type: 'camera', icon: <Camera /> },
  ]

  return (
    <div className="bg-white shadow-lg w-64 overflow-y-auto h-full">
      <div className="p-4">
        <h2 className="font-bold mb-4">Shapes</h2>
        <div className="grid grid-cols-2 gap-4">
          {shapes.map(({ type, icon }) => (
            <button
              key={type}
              onClick={() => addShape(type)}
              className="p-4 border rounded hover:bg-gray-100 transition-colors duration-200"
            >
              {icon}
            </button>
          ))}
        </div>
        <ImageLibrary
          images={images}
          onImageUpload={onImageUpload}
          onImageSelect={onImageSelect}
          replacingShapeId={replacingShapeId}
        />
      </div>
    </div>
  )
}

export default ShapeSidebar