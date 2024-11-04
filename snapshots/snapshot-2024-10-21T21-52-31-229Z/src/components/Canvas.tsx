import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react'
import { Shape } from '../types'
import { getCurrentKeyframe } from '../utils/keyframeUtils'
import { applyParallax } from '../utils/cameraUtils'

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

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate((shapeKeyframe.rotation * Math.PI) / 180)

      let shapeZoom = shapeKeyframe.scale
      if (isDepthScaleEnabled) {
        const depthScale = 1 + (1 - shapeKeyframe.depth) * 2
        shapeZoom *= depthScale
      }
      shapeZoom *= cameraKeyframe.zoom || 1

      ctx.scale(shapeZoom, shapeZoom)

      if (shape.type === 'image' && shape.image) {
        if (loadedImages[shape.id]) {
          ctx.drawImage(loadedImages[shape.id], -shape.width / 2, -shape.height / 2, shape.width, shape.height)
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

      shapes.forEach(shape => drawShape(shape, cameraKeyframe))

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

export default Canvas