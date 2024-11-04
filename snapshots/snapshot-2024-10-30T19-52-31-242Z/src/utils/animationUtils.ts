import { Animation, AnimationType } from '../types'

function getEaseValue(t: number, type: AnimationType): number {
  switch (type) {
    case 'linear':
      return t
    case 'bounce':
      if (t < 1) {
        const n1 = 7.5625
        const d1 = 2.75
        
        if (t < 1 / d1) {
          return n1 * t * t
        } else if (t < 2 / d1) {
          t -= 1.5 / d1
          return n1 * t * t + 0.75
        } else if (t < 2.5 / d1) {
          t -= 2.25 / d1
          return n1 * t * t + 0.9375
        } else {
          t -= 2.625 / d1
          return n1 * t * t + 0.984375
        }
      }
      return t
    case 'elastic-out':
      if (t === 0 || t === 1) return t
      const period = 0.3
      const s = period / 4
      return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / period) + 1
    default:
      return t
  }
}

export function getAnimationProgress(
  currentFrame: number,
  startFrame: number,
  animation: Animation
): { progress: number; offset: { x: number; y: number }; scale: number; opacity: number } {
  // Calculate progress
  const rawProgress = (currentFrame - startFrame) / animation.duration
  let progress = Math.min(1, Math.max(0, rawProgress))
  let scale = 1
  let opacity = 1
  
  // Apply easing based on animation type
  progress = getEaseValue(progress, animation.type)

  // Handle center animation differently
  if (animation.direction === 'center') {
    scale = progress
    opacity = progress
  }

  // Calculate direction offset
  const offset = { x: 0, y: 0 }
  const distance = 500 // Distance to travel during animation
  
  if (animation.direction !== 'center') {
    const inverseProgress = 1 - progress
    switch (animation.direction) {
      case 'left':
        offset.x = -distance * inverseProgress
        break
      case 'right':
        offset.x = distance * inverseProgress
        break
      case 'top':
        offset.y = -distance * inverseProgress
        break
      case 'bottom':
        offset.y = distance * inverseProgress
        break
    }
  }

  return { progress, offset, scale, opacity }
}

export function applyEnterAnimation(shape: any, currentFrame: number): any {
  if (!shape.animation?.enter || shape.animation.enter.type === 'none') {
    return shape
  }

  const startFrame = shape.startFrame || 0
  if (currentFrame < startFrame) {
    return { ...shape, opacity: 0, scale: 0.001 }
  }

  const { offset, scale, opacity } = getAnimationProgress(
    currentFrame,
    startFrame,
    shape.animation.enter
  )

  return {
    ...shape,
    x: shape.x + offset.x,
    y: shape.y + offset.y,
    scale: shape.scale * (shape.animation.enter.direction === 'center' ? scale : 1),
    opacity
  }
}

export function applyExitAnimation(shape: any, currentFrame: number): any {
  if (!shape.animation?.exit || shape.animation.exit.type === 'none' || !shape.endFrame) {
    return shape
  }

  const exitStartFrame = shape.endFrame - shape.animation.exit.duration
  if (currentFrame < exitStartFrame) {
    return shape
  }

  if (currentFrame > shape.endFrame) {
    return { ...shape, opacity: 0, scale: 0.001 }
  }

  const { offset, scale, opacity } = getAnimationProgress(
    shape.endFrame - currentFrame,
    0,
    shape.animation.exit
  )

  return {
    ...shape,
    x: shape.x + offset.x,
    y: shape.y + offset.y,
    scale: shape.scale * (shape.animation.exit.direction === 'center' ? scale : 1),
    opacity
  }
}