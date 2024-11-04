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

  const handlePositionChange = (newX: number, newY: number) => {
    const updatedKeyframe = { ...shapeKeyframe, x: newX, y: newY }
    const updatedShape = updateShapeWithoutKeyframe(shape, currentFrame, updatedKeyframe)
    updateShape(updatedShape)
  }

  const handleRotationChange = (rotation: number) => {
    const updatedKeyframe = { ...shapeKeyframe, rotation }
    const updatedShape = updateShapeWithoutKeyframe(shape, currentFrame, updatedKeyframe)
    updateShape(updatedShape)
  }

  const handleScaleChange = (scale: number) => {
    const updatedKeyframe = { ...shapeKeyframe, scale }
    const updatedShape = updateShapeWithoutKeyframe(shape, currentFrame, updatedKeyframe)
    updateShape(updatedShape)
  }

  const handleDepthChange = (depth: number) => {
    const updatedKeyframe = { ...shapeKeyframe, depth }
    const updatedShape = updateShapeWithoutKeyframe(shape, currentFrame, updatedKeyframe)
    updateShape(updatedShape)
  }

  const handleColorChange = (color: string) => {
    const updatedShape = { ...shape, color }
    updateShape(updatedShape)
  }

  return (
    <div>
      <h3 className="font-bold mb-2">Shape Properties</h3>
      <div className="mb-2">
        <label className="block">
          X:
          <input
            type="number"
            value={Math.round(shapeKeyframe.x)}
            onChange={(e) => handlePositionChange(parseFloat(e.target.value), shapeKeyframe.y)}
            className="w-full mt-1"
          />
        </label>
      </div>
      <div className="mb-2">
        <label className="block">
          Y:
          <input
            type="number"
            value={Math.round(shapeKeyframe.y)}
            onChange={(e) => handlePositionChange(shapeKeyframe.x, parseFloat(e.target.value))}
            className="w-full mt-1"
          />
        </label>
      </div>
      <div className="mb-2">
        <label className="block">
          Rotation:
          <input
            type="range"
            min="0"
            max="360"
            value={Math.round(shapeKeyframe.rotation)}
            onChange={(e) => handleRotationChange(parseFloat(e.target.value))}
            className="w-full mt-1"
          />
          <span>{Math.round(shapeKeyframe.rotation)}°</span>
        </label>
      </div>
      <div className="mb-2">
        <label className="block">
          Scale:
          <input
            type="range"
            min="0.1"
            max="5"
            step="0.1"
            value={shapeKeyframe.scale}
            onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
            className="w-full mt-1"
          />
          <span>{shapeKeyframe.scale.toFixed(1)}</span>
        </label>
      </div>
      <div className="mb-2">
        <label className="block">
          Depth:
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={shapeKeyframe.depth}
            onChange={(e) => handleDepthChange(parseFloat(e.target.value))}
            className="w-full mt-1"
          />
          <span>{shapeKeyframe.depth.toFixed(2)}</span>
        </label>
      </div>
      {shape.type !== 'image' && (
        <div className="mb-2">
          <label className="block">
            Color:
            <ColorPicker color={shape.color} onChange={handleColorChange} />
          </label>
        </div>
      )}
      <button
        onClick={() => onReplace(shape.id)}
        className="bg-blue-500 text-white px-2 py-1 rounded mt-2"
      >
        Replace
      </button>
    </div>
  )
}

export default ShapeHandlers