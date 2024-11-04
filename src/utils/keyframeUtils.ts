import { Shape, Keyframe, AnimationType } from '../types'

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

export const getCurrentKeyframe = (shape: Shape, frame: number): Keyframe => {
  // Check if frame is outside object's duration
  if (shape.startFrame !== undefined && frame < shape.startFrame) {
    return { ...shape.keyframes[0], opacity: 0 }
  }
  if (shape.endFrame !== undefined && frame > shape.endFrame) {
    return { ...shape.keyframes[shape.keyframes.length - 1], opacity: 0 }
  }

  const keyframe = shape.keyframes.find(kf => kf.frame === frame)
  if (keyframe) return keyframe

  const prevKeyframe = shape.keyframes
    .filter(kf => kf.frame < frame)
    .sort((a, b) => b.frame - a.frame)[0]
  const nextKeyframe = shape.keyframes
    .filter(kf => kf.frame > frame)
    .sort((a, b) => a.frame - b.frame)[0]

  if (!prevKeyframe) return nextKeyframe || shape.keyframes[0]
  if (!nextKeyframe) return prevKeyframe

  // If previous keyframe has stayHere, maintain its values
  if (prevKeyframe.stayHere) {
    return { ...prevKeyframe, frame }
  }

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
    rotation: interpolateAngle(prevKeyframe.rotation, nextKeyframe.rotation, adjustedProgress),
    scale: interpolate(prevKeyframe.scale, nextKeyframe.scale, adjustedProgress),
    depth: interpolate(prevKeyframe.depth, nextKeyframe.depth, adjustedProgress),
    zoom: interpolate(prevKeyframe.zoom || 1, nextKeyframe.zoom || 1, adjustedProgress),
  }
}

const interpolate = (start: number, end: number, t: number): number => {
  return start + (end - start) * t
}

const interpolateAngle = (start: number, end: number, t: number): number => {
  const shortestAngle = ((((end - start) % 360) + 540) % 360) - 180
  return start + shortestAngle * t
}

export const addOrUpdateKeyframe = (shape: Shape, currentFrame: number, newKeyframeData?: Partial<Keyframe>): Shape => {
  const currentKeyframe = getCurrentKeyframe(shape, currentFrame)
  const existingKeyframeIndex = shape.keyframes.findIndex(kf => kf.frame === currentFrame)
  
  // Create new keyframe with current interpolated values
  const newKeyframe: Keyframe = {
    frame: currentFrame,
    x: currentKeyframe.x,
    y: currentKeyframe.y,
    rotation: currentKeyframe.rotation,
    scale: currentKeyframe.scale,
    depth: currentKeyframe.depth,
    zoom: currentKeyframe.zoom || 1,
    animation: { type: 'linear', duration: 30 }, // Default animation type and duration
    ...newKeyframeData
  }

  let updatedKeyframes: Keyframe[]
  
  if (existingKeyframeIndex !== -1) {
    // Update existing keyframe while preserving other keyframes
    updatedKeyframes = shape.keyframes.map((kf, index) => 
      index === existingKeyframeIndex ? newKeyframe : kf
    )
  } else {
    // Add new keyframe while preserving existing ones
    updatedKeyframes = [...shape.keyframes, newKeyframe]
  }

  // Sort keyframes by frame number
  updatedKeyframes.sort((a, b) => a.frame - b.frame)

  return {
    ...shape,
    keyframes: updatedKeyframes
  }
}

export const updateShapeWithoutKeyframe = (shape: Shape, currentFrame: number, newData: Partial<Keyframe>): Shape => {
  const prevKeyframe = shape.keyframes
    .filter(kf => kf.frame <= currentFrame)
    .sort((a, b) => b.frame - a.frame)[0]

  if (!prevKeyframe) {
    // If no previous keyframe, update the first keyframe
    const updatedKeyframes = [...shape.keyframes]
    if (updatedKeyframes.length > 0) {
      updatedKeyframes[0] = { ...updatedKeyframes[0], ...newData }
    }
    return { ...shape, keyframes: updatedKeyframes }
  }

  // Update the previous keyframe with the new data
  const updatedKeyframes = shape.keyframes.map(kf => 
    kf === prevKeyframe ? { ...kf, ...newData } : kf
  )

  return { ...shape, keyframes: updatedKeyframes }
}

export const addStayHereKeyframe = (shape: Shape, frame: number): Shape => {
  const currentKeyframe = getCurrentKeyframe(shape, frame)
  const stayKeyframe: Keyframe = {
    ...currentKeyframe,
    frame: frame + 30, // Default stay duration
    stayHere: true,
    animation: { type: 'none' }
  }

  const updatedKeyframes = [...shape.keyframes, stayKeyframe]
    .sort((a, b) => a.frame - b.frame)

  return {
    ...shape,
    keyframes: updatedKeyframes
  }
}

export const removeStayHereKeyframe = (shape: Shape, frame: number): Shape => {
  const updatedKeyframes = shape.keyframes.filter(kf => 
    !(kf.frame > frame && kf.stayHere)
  )

  return {
    ...shape,
    keyframes: updatedKeyframes
  }
}