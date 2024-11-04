import { Shape, Keyframe } from '../../types'
import { ParallaxConfig, ParallaxResult } from './types'
import { getCurrentKeyframe } from '../../utils/keyframeUtils'
import { getCurrentFocalPoint } from '../../utils/focalPointUtils'

export function calculateParallax(
  shape: Shape,
  camera: Shape,
  focalPoint: FocalPoint | null,
  currentFrame: number,
  config: ParallaxConfig
): ParallaxResult {
  const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
  const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)
  const focalKeyframe = getCurrentFocalPoint(focalPoint, currentFrame)

  // Calculate base parallax based on depth
  const parallaxFactor = 1 - shapeKeyframe.depth
  const baseX = shapeKeyframe.x - cameraKeyframe.x * parallaxFactor
  const baseY = shapeKeyframe.y - cameraKeyframe.y * parallaxFactor

  // Calculate focal point influence
  const focalInfluence = config.focalStrength * (1 - shapeKeyframe.depth)
  const focalDeltaX = focalKeyframe.x - 400 // Center point
  const focalDeltaY = focalKeyframe.y - 300 // Center point

  // Apply focal point offset
  const x = baseX - (focalDeltaX * focalInfluence)
  const y = baseY - (focalDeltaY * focalInfluence)

  // Calculate scale based on depth and camera distance
  let scale = shapeKeyframe.scale
  if (config.depthScale) {
    const depthScale = 1 + ((1 - shapeKeyframe.depth) * 2)
    scale *= depthScale
  }

  // Apply camera zoom with depth-based parallax
  const cameraZoom = cameraKeyframe.zoom || 1
  const zoomDelta = cameraZoom - 1
  const depthFactor = 1 - shapeKeyframe.depth
  const zoomParallaxFactor = 1 + (zoomDelta * depthFactor)
  scale *= zoomParallaxFactor

  // Calculate distance-based effects
  const distanceFactor = Math.max(0, 1 - (shapeKeyframe.depth * config.cameraDistance / 1000))
  const opacity = distanceFactor

  return { x, y, scale, opacity }
}

export function calculateCameraView(
  shape: Shape,
  camera: Shape,
  currentFrame: number,
  config: ParallaxConfig
): { x: number; y: number; scale: number } {
  const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
  const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)

  // Calculate camera-relative position
  const relativeX = shapeKeyframe.x - cameraKeyframe.x
  const relativeY = shapeKeyframe.y - cameraKeyframe.y

  // Apply depth-based scaling
  const depthScale = config.depthScale ? 
    1 + ((1 - shapeKeyframe.depth) * 2) : 1

  return {
    x: relativeX,
    y: relativeY,
    scale: depthScale * (cameraKeyframe.zoom || 1)
  }
}