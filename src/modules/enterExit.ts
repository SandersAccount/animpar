import { Shape } from '../types'
import { getAnimationProgress } from '../utils/animationUtils'

export function applyEnterExitEffects(shape: Shape, currentFrame: number): {
  opacity: number;
  scale: number;
  offset: { x: number; y: number };
} {
  let opacity = 1
  let scale = 1
  let offset = { x: 0, y: 0 }

  // Apply enter animation
  if (shape.animation?.enter && shape.animation.enter.type !== 'none') {
    const startFrame = shape.startFrame || 0
    if (currentFrame < startFrame) {
      return { opacity: 0, scale: 0.001, offset: { x: 0, y: 0 } }
    }

    const { progress, offset: enterOffset, scale: enterScale, opacity: enterOpacity } = 
      getAnimationProgress(currentFrame, startFrame, shape.animation.enter)

    opacity *= enterOpacity
    scale *= enterScale
    offset.x += enterOffset.x
    offset.y += enterOffset.y
  }

  // Apply exit animation
  if (shape.animation?.exit && shape.animation.exit.type !== 'none' && shape.endFrame) {
    const exitStartFrame = shape.endFrame - shape.animation.exit.duration
    if (currentFrame > shape.endFrame) {
      return { opacity: 0, scale: 0.001, offset: { x: 0, y: 0 } }
    }

    if (currentFrame >= exitStartFrame) {
      const { progress, offset: exitOffset, scale: exitScale, opacity: exitOpacity } = 
        getAnimationProgress(shape.endFrame - currentFrame, 0, shape.animation.exit)

      opacity *= exitOpacity
      scale *= exitScale
      offset.x += exitOffset.x
      offset.y += exitOffset.y
    }
  }

  return { opacity, scale, offset }
}