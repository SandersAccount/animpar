import React, { useEffect, useRef } from 'react'
import { Shape } from '../types'
import { Switch } from './ui/switch'
import { getCurrentKeyframe } from '../utils/keyframeUtils'

interface CameraViewSchemeProps {
  shapes: Shape[]
  camera: Shape
  currentFrame: number
  isDepthScaleEnabled: boolean
  setIsDepthScaleEnabled: (enabled: boolean) => void
}

const CameraViewScheme: React.FC<CameraViewSchemeProps> = ({
  shapes,
  camera,
  currentFrame,
  isDepthScaleEnabled,
  setIsDepthScaleEnabled
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw camera view
    ctx.beginPath()
    ctx.moveTo(0, canvas.height)
    ctx.lineTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width, canvas.height)
    ctx.closePath()
    ctx.strokeStyle = '#888'
    ctx.stroke()

    // Draw camera
    ctx.fillStyle = '#000'
    ctx.fillRect(canvas.width / 2 - 10, canvas.height - 20, 20, 20)

    // Draw other shapes
    shapes.forEach((shape) => {
      if (shape.type !== 'camera') {
        const currentKeyframe = getCurrentKeyframe(shape, currentFrame)
        const y = canvas.height - 30 - (currentKeyframe.depth * (canvas.height - 30))
        
        // Draw depth line
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
        ctx.strokeStyle = shape.color || '#000'
        ctx.lineWidth = 2
        ctx.stroke()

        // Draw shape representation
        const size = isDepthScaleEnabled ? 10 * (1 + (1 - currentKeyframe.depth) * 2) : 10
        ctx.fillStyle = shape.color || '#000'
        ctx.fillRect(canvas.width / 2 - size / 2, y - size / 2, size, size)

        // Add shape label
        ctx.fillStyle = '#000'
        ctx.font = '12px Arial'
        ctx.fillText(shape.type, 5, y - 5)
      }
    })
  }, [shapes, camera, currentFrame, isDepthScaleEnabled])

  return (
    <div className="mt-4 bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-2">Camera View Scheme</h3>
      <canvas
        ref={canvasRef}
        width={200}
        height={150}
        className="border border-gray-300 mb-4"
      />
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">Depth Scale:</span>
        <Switch
          checked={isDepthScaleEnabled}
          onCheckedChange={setIsDepthScaleEnabled}
          className="bg-gray-300"
        />
      </div>
      <p className="text-xs text-gray-600">
        {isDepthScaleEnabled
          ? "ON: Objects scale based on depth"
          : "OFF: Objects maintain constant size"}
      </p>
    </div>
  )
}

export default CameraViewScheme