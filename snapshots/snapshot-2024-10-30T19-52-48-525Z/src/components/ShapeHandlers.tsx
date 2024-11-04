import React from 'react'
import { Shape } from '../types'
import { getCurrentKeyframe, updateShapeWithoutKeyframe } from '../utils/keyframeUtils'
import { applyParallax } from '../utils/cameraUtils'
import ColorPicker from './ColorPicker'

interface ShapeHandlersProps {
  shape: Shape
  camera: Shape
  currentFrame: number
  updateShape: (shape: Shape) => void
  onReplace: (shapeId: number) => void
}

const ShapeHandlers: React.FC<ShapeHandlersProps> = ({
  shape,
  camera,
  currentFrame,
  updateShape,
  onReplace
}) => {
  const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
  const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)
  const { x, y } = applyParallax(shapeKeyframe, cameraKeyframe)

  const handlePropertyChange = (property: keyof Keyframe, value: number) => {
    const updatedKeyframe = { ...shapeKeyframe, [property]: value }
    const updatedShape = updateShapeWithoutKeyframe(shape, currentFrame, updatedKeyframe)
    updateShape(updatedShape)
  }

  const handleColorChange = (color: string) => {
    const updatedShape = { ...shape, color }
    updateShape(updatedShape)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold mb-4">Shape Properties</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Position X:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={Math.round(shapeKeyframe.x)}
              onChange={(e) => handlePropertyChange('x', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handlePropertyChange('x', shapeKeyframe.x + 1)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ↑
              </button>
              <button
                onClick={() => handlePropertyChange('x', shapeKeyframe.x - 1)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ↓
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Position Y:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={Math.round(shapeKeyframe.y)}
              onChange={(e) => handlePropertyChange('y', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex flex-col gap-1">
              <button
                onClick={() => handlePropertyChange('y', shapeKeyframe.y - 1)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ↑
              </button>
              <button
                onClick={() => handlePropertyChange('y', shapeKeyframe.y + 1)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                ↓
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Rotation:</label>
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(shapeKeyframe.rotation)}
            onChange={(e) => handlePropertyChange('rotation', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>{Math.round(shapeKeyframe.rotation)}°</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Scale:</label>
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={shapeKeyframe.scale}
            onChange={(e) => handlePropertyChange('scale', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>{shapeKeyframe.scale.toFixed(1)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Depth:</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={shapeKeyframe.depth}
            onChange={(e) => handlePropertyChange('depth', parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-sm">
            <span>{shapeKeyframe.depth.toFixed(2)}</span>
          </div>
        </div>

        {shape.type !== 'image' && (
          <div>
            <label className="block text-sm font-medium mb-2">Color:</label>
            <ColorPicker color={shape.color} onChange={handleColorChange} />
          </div>
        )}

        <button
          onClick={() => onReplace(shape.id)}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Replace
        </button>
      </div>
    </div>
  )
}

export default ShapeHandlers