import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Shape } from '../types'
import { getCurrentKeyframe } from '../utils/keyframeUtils'
import { applyParallax } from '../utils/cameraUtils'
import { applyEnterAnimation, applyExitAnimation } from '../utils/animationUtils'

interface CanvasProps {
  shapes: Shape[]
  selectedShape: Shape | null
  setSelectedShape: (shape: Shape | null) => void
  updateShape: (shape: Shape) => void
  currentFrame: number
  camera: Shape
  updateCamera: (camera: Shape) => void
  isDepthScaleEnabled: boolean
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>(({
  shapes,
  selectedShape,
  setSelectedShape,
  updateShape,
  currentFrame,
  camera,
  updateCamera,
  isDepthScaleEnabled
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [loadedImages, setLoadedImages] = useState<Record<number, HTMLImageElement>>({})

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawShape = (shape: Shape, cameraKeyframe: any) => {
      const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
      const { x, y } = applyParallax(shapeKeyframe, cameraKeyframe)

      let animatedShape = { ...shape }
      animatedShape.x = x
      animatedShape.y = y

      // Apply enter/exit animations
      if (shape.animation?.enter) {
        animatedShape = applyEnterAnimation(animatedShape, currentFrame)
      }
      if (shape.animation?.exit) {
        animatedShape = applyExitAnimation(animatedShape, currentFrame)
      }

      // Skip rendering if fully transparent
      if (animatedShape.opacity === 0) return

      ctx.save()

      // Calculate center point for scaling
      const centerX = animatedShape.x
      const centerY = animatedShape.y

      // Move to center point
      ctx.translate(centerX, centerY)

      // Apply rotation
      ctx.rotate((shapeKeyframe.rotation * Math.PI) / 180)

      // Calculate base scale
      let baseScale = shapeKeyframe.scale * (animatedShape.scale || 1)

      // Apply depth-based scale if enabled
      if (isDepthScaleEnabled) {
        const depthScale = 1 + (1 - shapeKeyframe.depth) * 2
        baseScale *= depthScale
      }

      // Apply camera zoom with depth-based parallax
      const cameraZoom = cameraKeyframe.zoom || 1
      const zoomDelta = cameraZoom - 1 // How much we're zooming beyond normal
      const depthFactor = 1 - shapeKeyframe.depth // Invert depth so closer objects (depth=0) get more effect
      const zoomParallaxFactor = 1 + (zoomDelta * depthFactor)
      
      // Apply final scale
      const finalScale = baseScale * zoomParallaxFactor
      ctx.scale(finalScale, finalScale)

      // Apply opacity if set
      if (animatedShape.opacity !== undefined) {
        ctx.globalAlpha = animatedShape.opacity
      }

      // Draw the shape
      if (shape.type === 'image' && shape.image) {
        if (loadedImages[shape.id]) {
          ctx.drawImage(
            loadedImages[shape.id],
            -shape.width / 2,
            -shape.height / 2,
            shape.width,
            shape.height
          )
        } else {
          const img = new Image()
          img.src = shape.image
          img.onload = () => {
            setLoadedImages(prev => ({ ...prev, [shape.id]: img }))
          }
        }
      } else {
        ctx.fillStyle = shape.color
        ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
      }

      ctx.restore()
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)

      // Sort shapes by depth to handle overlapping correctly
      const sortedShapes = [...shapes].sort((a, b) => {
        const aKeyframe = getCurrentKeyframe(a, currentFrame)
        const bKeyframe = getCurrentKeyframe(b, currentFrame)
        return bKeyframe.depth - aKeyframe.depth
      })

      sortedShapes.forEach(shape => drawShape(shape, cameraKeyframe))

      requestAnimationFrame(render)
    }

    render()
  }, [shapes, currentFrame, camera, isDepthScaleEnabled, loadedImages])

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const clickedShape = shapes.find((shape) => {
      const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
      const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)
      const { x: shapeX, y: shapeY } = applyParallax(shapeKeyframe, cameraKeyframe)
      const zoom = cameraKeyframe.zoom || 1
      const shapeZoom = isDepthScaleEnabled ? shapeKeyframe.scale * (1 + (1 - shapeKeyframe.depth) * 2) : shapeKeyframe.scale
      const scaledWidth = shape.width * shapeZoom * zoom
      const scaledHeight = shape.height * shapeZoom * zoom
      return (
        x >= shapeX - scaledWidth / 2 &&
        x <= shapeX + scaledWidth / 2 &&
        y >= shapeY - scaledHeight / 2 &&
        y <= shapeY + scaledHeight / 2
      )
    })

    if (clickedShape) {
      setSelectedShape(clickedShape)
      setIsDragging(true)
      setDragStart({ x, y })
    } else {
      setSelectedShape(null)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedShape || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const dx = x - dragStart.x
    const dy = y - dragStart.y

    const currentKeyframe = getCurrentKeyframe(selectedShape, currentFrame)
    const updatedKeyframe = { ...currentKeyframe, x: currentKeyframe.x + dx, y: currentKeyframe.y + dy }
    const updatedShape = { ...selectedShape, keyframes: selectedShape.keyframes.map(kf => kf.frame === currentFrame ? updatedKeyframe : kf) }

    updateShape(updatedShape)
    setDragStart({ x, y })
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className="border border-gray-300"
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
      onMouseLeave={handleCanvasMouseUp}
    />
  )
})

Canvas.displayName = 'Canvas'

export default Canvas