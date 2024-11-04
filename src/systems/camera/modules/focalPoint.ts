import { FocalPoint, FocalPointKeyframe, AnimationType } from '../../../types'
import { getEaseValue } from './easing'

export function interpolateFocalPoint(
  prevKeyframe: FocalPointKeyframe,
  nextKeyframe: FocalPointKeyframe,
  currentFrame: number
): FocalPointKeyframe {
  const totalFrames = nextKeyframe.frame - prevKeyframe.frame
  const progress = (currentFrame - prevKeyframe.frame) / totalFrames

  // Get animation type and apply easing
  const animationType = nextKeyframe.animation?.type || 'linear'
  const duration = nextKeyframe.animation?.duration || totalFrames
  const animationProgress = Math.min(1, (currentFrame - prevKeyframe.frame) / duration)
  const easedProgress = getEaseValue(animationProgress, animationType)

  return {
    frame: currentFrame,
    x: prevKeyframe.x + (nextKeyframe.x - prevKeyframe.x) * easedProgress,
    y: prevKeyframe.y + (nextKeyframe.y - prevKeyframe.y) * easedProgress,
    animation: nextKeyframe.animation
  }
}