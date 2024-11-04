import React from 'react'
import { Shape } from '../types'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { getCurrentKeyframe, updateShapeWithoutKeyframe, addOrUpdateKeyframe } from '../utils/keyframeUtils'

interface CameraPanelProps {
  camera: Shape
  selectedShape: Shape | null
  updateShape: (shape: Shape) => void
  updateCamera: (camera: Shape) => void
  currentFrame: number
}

const CameraPanel: React.FC<CameraPanelProps> = ({
  camera,
  selectedShape,
  updateShape,
  updateCamera,
  currentFrame
}) => {
  const handleCameraMove = (dx: number, dy: number) => {
    const currentKeyframe = getCurrentKeyframe(camera, currentFrame)
    const updatedKeyframe = { ...currentKeyframe, x: currentKeyframe.x + dx, y: currentKeyframe.y + dy }
    const updatedCamera = updateShapeWithoutKeyframe(camera, currentFrame, updatedKeyframe)
    updateCamera(updatedCamera)
  }

  const handleDepthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedShape && selectedShape.type !== 'camera') {
      const newDepth = parseFloat(e.target.value)
      const currentKeyframe = getCurrentKeyframe(selectedShape, currentFrame)
      const updatedKeyframe = { ...currentKeyframe, depth: newDepth }
      const updatedShape = updateShapeWithoutKeyframe(selectedShape, currentFrame, updatedKeyframe)
      updateShape(updatedShape)
    }
  }

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value)
    const currentKeyframe = getCurrentKeyframe(camera, currentFrame)
    const updatedKeyframe = { ...currentKeyframe, zoom: newZoom }
    const updatedCamera = updateShapeWithoutKeyframe(camera, currentFrame, updatedKeyframe)
    updateCamera(updatedCamera)
  }

  const handleAddCameraKeyframe = () => {
    const updatedCamera = addOrUpdateKeyframe(camera, currentFrame)
    updateCamera(updatedCamera)
  }

  const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold mb-2">Camera Controls</h3>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button onClick={() => handleCameraMove(0, -10)} className="p-2 bg-blue-500 text-white rounded"><ChevronUp /></button>
        <button onClick={() => handleCameraMove(-10, 0)} className="p-2 bg-blue-500 text-white rounded"><ChevronLeft /></button>
        <button onClick={() => handleCameraMove(10, 0)} className="p-2 bg-blue-500 text-white rounded"><ChevronRight /></button>
        <button onClick={() => handleCameraMove(0, 10)} className="p-2 bg-blue-500 text-white rounded"><ChevronDown /></button>
      </div>
      <div className="mb-2">
        <label className="block">
          Camera X: {Math.round(cameraKeyframe.x)}
        </label>
      </div>
      <div className="mb-2">
        <label className="block">
          Camera Y: {Math.round(cameraKeyframe.y)}
        </label>
      </div>
      <div className="mb-4">
        <label className="block">
          Zoom:
          <div className="flex items-center">
            <ZoomOut size={16} />
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={cameraKeyframe.zoom || 1}
              onChange={handleZoomChange}
              className="w-full mx-2"
            />
            <ZoomIn size={16} />
          </div>
          <span>{(cameraKeyframe.zoom || 1).toFixed(1)}x</span>
        </label>
      </div>
      <button
        onClick={handleAddCameraKeyframe}
        className="bg-green-500 text-white p-2 rounded mb-4"
      >
        Add Camera Keyframe
      </button>
      {selectedShape && selectedShape.type !== 'camera' && (
        <div>
          <h4 className="font-bold mb-2">Depth Control</h4>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={getCurrentKeyframe(selectedShape, currentFrame).depth}
            onChange={handleDepthChange}
            className="w-full"
          />
          <span>{getCurrentKeyframe(selectedShape, currentFrame).depth.toFixed(2)}</span>
        </div>
      )}
    </div>
  )
}

export default CameraPanel