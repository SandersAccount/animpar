import { FocalPoint, FocalPointKeyframe, AnimationType } from '../types'
import { getEaseValue } from './animationUtils'

export function getCurrentFocalPoint(focalPoint: FocalPoint | null, frame: number): FocalPointKeyframe {
  if (!focalPoint || !Array.isArray(focalPoint.keyframes) || focalPoint.keyframes.length === 0) {
    return { frame: 0, x: 400, y: 300 }
  }

  const keyframe = focalPoint.keyframes.find(kf => kf.frame === frame)
  if (keyframe) return keyframe

  const prevKeyframe = focalPoint.keyframes
    .filter(kf => kf.frame < frame)
    .sort((a, b) => b.frame - a.frame)[0]
  const nextKeyframe = focalPoint.keyframes
    .filter(kf => kf.frame > frame)
    .sort((a, b) => a.frame - b.frame)[0]

  if (!prevKeyframe) return nextKeyframe || focalPoint.keyframes[0]
  if (!nextKeyframe) return prevKeyframe

  // Calculate progress between keyframes
  const totalFrames = nextKeyframe.frame - prevKeyframe.frame
  const currentProgress = (frame - prevKeyframe.frame) / totalFrames

  // Get animation type and apply easing
  const animationType = nextKeyframe.animation?.type || 'linear'
  const easedProgress = getEaseValue(currentProgress, animationType)

  // Calculate duration-adjusted progress if animation duration is specified
  let adjustedProgress = easedProgress
  if (nextKeyframe.animation?.duration) {
    const animationProgress = (frame - prevKeyframe.frame) / nextKeyframe.animation.duration
    adjustedProgress = getEaseValue(Math.min(1, animationProgress), animationType)
  }

  // Interpolate values
  return {
    frame,
    x: interpolate(prevKeyframe.x, nextKeyframe.x, adjustedProgress),
    y: interpolate(prevKeyframe.y, nextKeyframe.y, adjustedProgress),
    animation: nextKeyframe.animation
  }
}

const interpolate = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
}

export function addOrUpdateFocalPoint(
  focalPoint: FocalPoint | null,
  frame: number,
  keyframeData?: Partial<FocalPointKeyframe>
): FocalPoint {
  // Initialize focalPoint if null or missing keyframes
  if (!focalPoint || !Array.isArray(focalPoint.keyframes)) {
    focalPoint = {
      x: 400,
      y: 300,
      keyframes: []
    }
  }

  const currentPoint = getCurrentFocalPoint(focalPoint, frame)
  const newKeyframe: FocalPointKeyframe = {
    frame,
    x: currentPoint.x,
    y: currentPoint.y,
    animation: { type: 'linear', duration: 30 },
    ...keyframeData
  }

  const existingKeyframeIndex = focalPoint.keyframes.findIndex(kf => kf.frame === frame)
  let updatedKeyframes: FocalPointKeyframe[]
  
  if (existingKeyframeIndex !== -1) {
    updatedKeyframes = focalPoint.keyframes.map((kf, index) => 
      index === existingKeyframeIndex ? newKeyframe : kf
    )
  } else {
    updatedKeyframes = [...focalPoint.keyframes, newKeyframe]
  }

  updatedKeyframes.sort((a, b) => a.frame - b.frame)

  return {
    ...focalPoint,
    keyframes: updatedKeyframes
  }
}