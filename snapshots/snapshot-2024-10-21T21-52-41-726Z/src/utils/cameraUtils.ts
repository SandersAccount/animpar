import { Keyframe } from '../types'

export const applyParallax = (shapeKeyframe: Keyframe, cameraKeyframe: Keyframe) => {
  const parallaxFactor = 1 - shapeKeyframe.depth
  return {
    x: shapeKeyframe.x - cameraKeyframe.x * parallaxFactor,
    y: shapeKeyframe.y - cameraKeyframe.y * parallaxFactor,
  }
}