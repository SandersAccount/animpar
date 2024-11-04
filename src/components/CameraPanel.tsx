import React, { useRef, useEffect } from 'react'
import { Shape, AnimationType, AnimationDirection } from '../types'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, ArrowUp, ArrowDown } from 'lucide-react'
import { getCurrentKeyframe, updateShapeWithoutKeyframe } from '../utils/keyframeUtils'

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
  const moveIntervalRef = useRef<number | null>(null)
  const moveStepRef = useRef(5)

  const handleCameraMove = (dx: number, dy: number) => {
    const currentKeyframe = getCurrentKeyframe(camera, currentFrame)
    const updatedKeyframe = { ...currentKeyframe, x: currentKeyframe.x + dx, y: currentKeyframe.y + dy }
    const updatedCamera = updateShapeWithoutKeyframe(camera, currentFrame, updatedKeyframe)
    updateCamera(updatedCamera)
  }

  const startContinuousMove = (dx: number, dy: number) => {
    handleCameraMove(dx, dy)
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current)
    }
    moveIntervalRef.current = window.setInterval(() => {
      handleCameraMove(dx, dy)
    }, 16)
  }

  const stopContinuousMove = () => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current)
      moveIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current)
      }
    }
  }, [])

  const handleCoordinateChange = (axis: 'x' | 'y', value: number) => {
    const currentKeyframe = getCurrentKeyframe(camera, currentFrame)
    const updatedKeyframe = { ...currentKeyframe, [axis]: value }
    const updatedCamera = updateShapeWithoutKeyframe(camera, currentFrame, updatedKeyframe)
    updateCamera(updatedCamera)
  }

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value)
    const currentKeyframe = getCurrentKeyframe(camera, currentFrame)
    const updatedKeyframe = { ...currentKeyframe, zoom: newZoom }
    const updatedCamera = updateShapeWithoutKeyframe(camera, currentFrame, updatedKeyframe)
    updateCamera(updatedCamera)
  }

  const handleAnimationChange = (type: 'enter' | 'exit', field: keyof Shape['animation']['enter'], value: any) => {
    const updatedCamera = {
      ...camera,
      animation: {
        ...camera.animation,
        [type]: {
          ...camera.animation[type],
          [field]: value
        }
      }
    }
    updateCamera(updatedCamera)
  }

  const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-6">
      <h3 className="font-bold mb-4">Camera Controls</h3>
      
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onMouseDown={() => startContinuousMove(0, -moveStepRef.current)}
          onMouseUp={stopContinuousMove}
          onMouseLeave={stopContinuousMove}
          className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700"
        >
          <ChevronUp />
        </button>
        <button
          onMouseDown={() => startContinuousMove(-moveStepRef.current, 0)}
          onMouseUp={stopContinuousMove}
          onMouseLeave={stopContinuousMove}
          className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700"
        >
          <ChevronLeft />
        </button>
        <button
          onMouseDown={() => startContinuousMove(moveStepRef.current, 0)}
          onMouseUp={stopContinuousMove}
          onMouseLeave={stopContinuousMove}
          className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700"
        >
          <ChevronRight />
        </button>
        <button
          onMouseDown={() => startContinuousMove(0, moveStepRef.current)}
          onMouseUp={stopContinuousMove}
          onMouseLeave={stopContinuousMove}
          className="p-3 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700"
        >
          <ChevronDown />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Camera X:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={Math.round(cameraKeyframe.x)}
              onChange={(e) => handleCoordinateChange('x', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex flex-col gap-1">
              <button
                onMouseDown={() => startContinuousMove(moveStepRef.current, 0)}
                onMouseUp={stopContinuousMove}
                onMouseLeave={stopContinuousMove}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onMouseDown={() => startContinuousMove(-moveStepRef.current, 0)}
                onMouseUp={stopContinuousMove}
                onMouseLeave={stopContinuousMove}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Camera Y:</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={Math.round(cameraKeyframe.y)}
              onChange={(e) => handleCoordinateChange('y', parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
            <div className="flex flex-col gap-1">
              <button
                onMouseDown={() => startContinuousMove(0, -moveStepRef.current)}
                onMouseUp={stopContinuousMove}
                onMouseLeave={stopContinuousMove}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <ArrowUp size={16} />
              </button>
              <button
                onMouseDown={() => startContinuousMove(0, moveStepRef.current)}
                onMouseUp={stopContinuousMove}
                onMouseLeave={stopContinuousMove}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <ArrowDown size={16} />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Zoom:</label>
          <div className="flex items-center">
            <ZoomOut size={16} />
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={cameraKeyframe.zoom || 1}
              onChange={handleZoomChange}
              className="w-full mx-2"
            />
            <ZoomIn size={16} />
          </div>
          <span>{(cameraKeyframe.zoom || 1).toFixed(1)}x</span>
        </div>
      </div>

      {/* Animation Controls */}
      <div className="space-y-4">
        <h4 className="font-semibold text-sm">Camera Animations</h4>
        
        {/* Enter Animation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Enter Animation</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={camera.animation.enter.type}
              onChange={(e) => handleAnimationChange('enter', 'type', e.target.value as AnimationType)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="none">None</option>
              <option value="linear">Linear</option>
              <option value="bounce">Bounce</option>
              <option value="elastic-out">Elastic</option>
            </select>
            <select
              value={camera.animation.enter.direction}
              onChange={(e) => handleAnimationChange('enter', 'direction', e.target.value as AnimationDirection)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <input
            type="number"
            min={1}
            value={camera.animation.enter.duration}
            onChange={(e) => handleAnimationChange('enter', 'duration', Math.max(1, parseInt(e.target.value)))}
            className="w-full px-3 py-2 border rounded"
            placeholder="Duration (frames)"
          />
        </div>

        {/* Exit Animation */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Exit Animation</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={camera.animation.exit.type}
              onChange={(e) => handleAnimationChange('exit', 'type', e.target.value as AnimationType)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="none">None</option>
              <option value="linear">Linear</option>
              <option value="bounce">Bounce</option>
              <option value="elastic-out">Elastic</option>
            </select>
            <select
              value={camera.animation.exit.direction}
              onChange={(e) => handleAnimationChange('exit', 'direction', e.target.value as AnimationDirection)}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <input
            type="number"
            min={1}
            value={camera.animation.exit.duration}
            onChange={(e) => handleAnimationChange('exit', 'duration', Math.max(1, parseInt(e.target.value)))}
            className="w-full px-3 py-2 border rounded"
            placeholder="Duration (frames)"
          />
        </div>
      </div>
    </div>
  )
}

export default CameraPanel