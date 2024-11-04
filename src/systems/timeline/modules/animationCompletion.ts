import { TimelineObject, KeyframeAnimation } from '../types'
import { getEaseValue } from '../../animation/easing'

export function calculateAnimationProgress(
  currentFrame: number,
  startFrame: number,
  endFrame: number,
  animation: KeyframeAnimation
): number {
  const duration = animation.duration || (endFrame - startFrame)
  const rawProgress = (currentFrame - startFrame) / duration
  
  // Ensure animation completes exactly at the next keyframe
  if (rawProgress >= 1) return 1
  if (rawProgress <= 0) return 0

  return getEaseValue(rawProgress, animation.type)
}

export function interpolateKeyframeValues(
  startValue: number,
  endValue: number,
  progress: number
): number {
  return startValue + (endValue - startValue) * progress
}

export function getKeyframeAtFrame(
  object: TimelineObject,
  frame: number,
  enforceCompletion: boolean = true
) {
  const keyframe = object.keyframes.find(kf => kf.frame === frame)
  if (keyframe) return keyframe

  const prevKeyframe = object.keyframes
    .filter(kf => kf.frame < frame)
    .sort((a, b) => b.frame - a.frame)[0]

  const nextKeyframe = object.keyframes
    .filter(kf => kf.frame > frame)
    .sort((a, b) => a.frame - b.frame)[0]

  if (!prevKeyframe || !nextKeyframe) {
    return prevKeyframe || nextKeyframe
  }

  const progress = calculateAnimationProgress(
    frame,
    prevKeyframe.frame,
    nextKeyframe.frame,
    nextKeyframe.animation || { type: 'linear' }
  )

  // If enforcing completion and we're at the end, return exact next keyframe values
  if (enforceCompletion && progress === 1) {
    return nextKeyframe
  }

  // Interpolate all numeric values
  const interpolated = Object.entries(prevKeyframe).reduce((acc, [key, value]) => {
    if (typeof value === 'number' && typeof nextKeyframe[key] === 'number') {
      acc[key] = interpolateKeyframeValues(value, nextKeyframe[key], progress)
    } else {
      acc[key] = value
    }
    return acc
  }, {} as Record<string, any>)

  return {
    ...interpolated,
    frame
  }
}