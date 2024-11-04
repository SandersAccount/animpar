import { Shape, Keyframe, FocalPointKeyframe } from '../types'
import { getCurrentKeyframe } from '../utils/keyframeUtils'
import { applyParallax } from '../utils/cameraUtils'
import { applyEnterExitEffects } from './enterExit'

interface RenderContext {
  ctx: CanvasRenderingContext2D
  currentFrame: number
  cameraKeyframe: Keyframe
  focalKeyframe: FocalPointKeyframe
  isDepthScaleEnabled: boolean
  loadedImages: Record<number, HTMLImageElement>
  setLoadedImages: (images: Record<number, HTMLImageElement>) => void
}

export function renderShape(shape: Shape, context: RenderContext): void {
  const { 
    ctx, 
    currentFrame, 
    cameraKeyframe, 
    focalKeyframe,
    isDepthScaleEnabled, 
    loadedImages, 
    setLoadedImages 
  } = context

  const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
  const { x, y } = applyParallax(shapeKeyframe, cameraKeyframe)

  // Apply enter/exit animations
  const { opacity, scale: animationScale, offset } = applyEnterExitEffects(shape, currentFrame)
  if (opacity === 0) return // Skip if fully transparent

  ctx.save()

  // Apply focal point influence
  const focalInfluence = 0.2 * (1 - shapeKeyframe.depth)
  const focalDeltaX = (focalKeyframe.x - x) * focalInfluence
  const focalDeltaY = (focalKeyframe.y - y) * focalInfluence

  // Apply transformations with focal point offset
  ctx.translate(x + offset.x + focalDeltaX, y + offset.y + focalDeltaY)
  ctx.rotate((shapeKeyframe.rotation * Math.PI) / 180)

  // Calculate final scale
  let finalScale = shapeKeyframe.scale * animationScale
  if (isDepthScaleEnabled) {
    const depthScale = 1 + (1 - shapeKeyframe.depth) * 2
    finalScale *= depthScale
  }
  
  // Apply camera zoom with depth-based parallax
  const cameraZoom = cameraKeyframe.zoom || 1
  const zoomDelta = cameraZoom - 1
  const depthFactor = 1 - shapeKeyframe.depth
  const zoomParallaxFactor = 1 + (zoomDelta * depthFactor)
  finalScale *= zoomParallaxFactor

  ctx.scale(finalScale, finalScale)
  ctx.globalAlpha = opacity

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
        setLoadedImages({ ...loadedImages, [shape.id]: img })
      }
    }
  } else {
    ctx.fillStyle = shape.color
    ctx.fillRect(-shape.width / 2, -shape.height / 2, shape.width, shape.height)
  }

  ctx.restore()
}