import React, { useRef, useEffect, useState } from 'react'
import { Shape, FocalPoint, Point } from '../types'
import { getCurrentKeyframe } from '../utils/keyframeUtils'
import { getCurrentFocalPoint } from '../utils/focalPointUtils'
import { applyParallax } from '../utils/cameraUtils'
import { applyEnterExitEffects } from '../utils/animationUtils'

interface CanvasProps {
  shapes: Shape[]
  selectedShape: Shape | null
  setSelectedShape: (shape: Shape | null) => void
  updateShape: (shape: Shape) => void
  currentFrame: number
  camera: Shape
  updateCamera: (camera: Shape) => void
  isDepthScaleEnabled: boolean
  focalPoint: FocalPoint
  updateFocalPoint: (focalPoint: FocalPoint) => void
}

const Canvas: React.FC<CanvasProps> = ({
  shapes,
  selectedShape,
  setSelectedShape,
  updateShape,
  currentFrame,
  camera,
  updateCamera,
  isDepthScaleEnabled,
  focalPoint,
  updateFocalPoint
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragTarget, setDragTarget] = useState<'shape' | 'focal-point' | null>(null)
  const [loadedImages, setLoadedImages] = useState<Record<number, HTMLImageElement>>({})
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Get current camera and focal point states
      const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)
      const focalKeyframe = getCurrentFocalPoint(focalPoint, currentFrame)

      // Draw focal point
      ctx.beginPath()
      ctx.arc(focalKeyframe.x, focalKeyframe.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      ctx.fill()
      ctx.strokeStyle = 'red'
      ctx.stroke()

      // Sort shapes by depth
      const sortedShapes = [...shapes].sort((a, b) => {
        const aKeyframe = getCurrentKeyframe(a, currentFrame)
        const bKeyframe = getCurrentKeyframe(b, currentFrame)
        return bKeyframe.depth - aKeyframe.depth
      })

      // Draw shapes
      sortedShapes.forEach(shape => {
        const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
        const { x, y } = applyParallax(shapeKeyframe, cameraKeyframe)

        // Apply enter/exit animations
        let animatedShape = { ...shape }
        if (shape.animation?.enter || shape.animation?.exit) {
          animatedShape = applyEnterExitEffects(shape, currentFrame)
          if (animatedShape.opacity === 0) return
        }

        ctx.save()

        // Apply focal point influence
        const focalInfluence = 0.2 * (1 - shapeKeyframe.depth)
        const focalDeltaX = (focalKeyframe.x - x) * focalInfluence
        const focalDeltaY = (focalKeyframe.y - y) * focalInfluence

        // Calculate center point for transformations
        const centerX = x + focalDeltaX
        const centerY = y + focalDeltaY

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
      })

      animationFrameRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [shapes, currentFrame, camera, isDepthScaleEnabled, loadedImages, focalPoint])

  const getMousePosition = (e: React.MouseEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePosition(e)

    // Check if clicking focal point
    const dx = pos.x - focalPoint.x
    const dy = pos.y - focalPoint.y
    const distanceToFocalPoint = Math.sqrt(dx * dx + dy * dy)

    if (distanceToFocalPoint <= 10) {
      setIsDragging(true)
      setDragTarget('focal-point')
      setDragStart(pos)
      return
    }

    // Check for shape under cursor
    const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)
    const clickedShape = shapes.find(shape => {
      const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
      const { x: shapeX, y: shapeY } = applyParallax(shapeKeyframe, cameraKeyframe)
      
      let scale = shapeKeyframe.scale
      if (isDepthScaleEnabled) {
        scale *= 1 + (1 - shapeKeyframe.depth) * 2
      }
      
      const width = shape.width * scale * (cameraKeyframe.zoom || 1)
      const height = shape.height * scale * (cameraKeyframe.zoom || 1)

      return (
        pos.x >= shapeX - width / 2 &&
        pos.x <= shapeX + width / 2 &&
        pos.y >= shapeY - height / 2 &&
        pos.y <= shapeY + height / 2
      )
    })

    if (clickedShape) {
      setSelectedShape(clickedShape)
      setIsDragging(true)
      setDragTarget('shape')
      setDragStart(pos)
    } else {
      setSelectedShape(null)
      setDragTarget(null)
    }
  }

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragTarget) return

    const pos = getMousePosition(e)
    const dx = pos.x - dragStart.x
    const dy = pos.y - dragStart.y

    if (dragTarget === 'focal-point') {
      updateFocalPoint({
        ...focalPoint,
        x: focalPoint.x + dx,
        y: focalPoint.y + dy
      })
    } else if (dragTarget === 'shape' && selectedShape) {
      const currentKeyframe = getCurrentKeyframe(selectedShape, currentFrame)
      const updatedKeyframe = {
        ...currentKeyframe,
        x: currentKeyframe.x + dx,
        y: currentKeyframe.y + dy
      }
      
      const updatedShape = {
        ...selectedShape,
        keyframes: selectedShape.keyframes.map(kf =>
          kf.frame === currentFrame ? updatedKeyframe : kf
        )
      }
      
      updateShape(updatedShape)
    }

    setDragStart(pos)
  }

  const handleCanvasMouseUp = () => {
    setIsDragging(false)
    setDragTarget(null)
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
}

export default Canvas