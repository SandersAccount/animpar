import { Keyframe } from '../types'

export const applyParallax = (shapeKeyframe: Keyframe, cameraKeyframe: Keyframe) => {
  const parallaxFactor = 1 - shapeKeyframe.depth
  const cameraZoom = cameraKeyframe.zoom || 1
  
  // Apply camera position with depth-based parallax
  const x = shapeKeyframe.x - cameraKeyframe.x * parallaxFactor
  const y = shapeKeyframe.y - cameraKeyframe.y * parallaxFactor

  // Apply zoom effect
  const zoomOffsetX = (x - 400) * (cameraZoom - 1)
  const zoomOffsetY = (y - 300) * (cameraZoom - 1)

  return {
    x: x + zoomOffsetX,
    y: y + zoomOffsetY,
  }
}