import { Shape, Keyframe } from '../types'

export const getCurrentKeyframe = (shape: Shape, frame: number): Keyframe => {
  const keyframe = shape.keyframes.find(kf => kf.frame === frame)
  if (keyframe) return keyframe

  const prevKeyframe = shape.keyframes.filter(kf => kf.frame < frame).sort((a, b) => b.frame - a.frame)[0]
  const nextKeyframe = shape.keyframes.filter(kf => kf.frame > frame).sort((a, b) => a.frame - b.frame)[0]

  if (!prevKeyframe) return nextKeyframe || shape.keyframes[0]
  if (!nextKeyframe) return prevKeyframe

  const t = (frame - prevKeyframe.frame) / (nextKeyframe.frame - prevKeyframe.frame)
  return {
    frame,
    x: interpolate(prevKeyframe.x, nextKeyframe.x, t),
    y: interpolate(prevKeyframe.y, nextKeyframe.y, t),
    rotation: interpolateAngle(prevKeyframe.rotation, nextKeyframe.rotation, t),
    scale: interpolate(prevKeyframe.scale, nextKeyframe.scale, t),
    depth: interpolate(prevKeyframe.depth, nextKeyframe.depth, t),
    zoom: interpolate(prevKeyframe.zoom || 1, nextKeyframe.zoom || 1, t),
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
  const existingKeyframeIndex = shape.keyframes.findIndex(kf => kf.frame === currentFrame)
  
  if (existingKeyframeIndex !== -1) {
    // Update existing keyframe
    const updatedKeyframes = [...shape.keyframes]
    updatedKeyframes[existingKeyframeIndex] = {
      ...updatedKeyframes[existingKeyframeIndex],
      ...newKeyframeData
    }
    return { ...shape, keyframes: updatedKeyframes }
  } else {
    // Add new keyframe
    const newKeyframe: Keyframe = {
      ...getCurrentKeyframe(shape, currentFrame),
      frame: currentFrame,
      ...newKeyframeData
    }
    return {
      ...shape,
      keyframes: [...shape.keyframes, newKeyframe].sort((a, b) => a.frame - b.frame),
    }
  }
}

export const updateShapeWithoutKeyframe = (shape: Shape, currentFrame: number, newData: Partial<Keyframe>): Shape => {
  const currentKeyframe = getCurrentKeyframe(shape, currentFrame)
  const updatedKeyframe = { ...currentKeyframe, ...newData }
  
  // Find the nearest keyframes
  const prevKeyframe = shape.keyframes.filter(kf => kf.frame <= currentFrame).sort((a, b) => b.frame - a.frame)[0]
  const nextKeyframe = shape.keyframes.filter(kf => kf.frame > currentFrame).sort((a, b) => a.frame - b.frame)[0]

  // Update the shape's keyframes
  let updatedKeyframes = shape.keyframes.map(kf => {
    if (kf === prevKeyframe) {
      return { ...kf, ...newData }
    }
    if (kf === nextKeyframe && prevKeyframe) {
      const t = (currentFrame - prevKeyframe.frame) / (nextKeyframe.frame - prevKeyframe.frame)
      return {
        ...kf,
        x: kf.x + (newData.x! - currentKeyframe.x) * (1 - t),
        y: kf.y + (newData.y! - currentKeyframe.y) * (1 - t),
        rotation: kf.rotation + (newData.rotation! - currentKeyframe.rotation) * (1 - t),
        scale: kf.scale + (newData.scale! - currentKeyframe.scale) * (1 - t),
        depth: kf.depth + (newData.depth! - currentKeyframe.depth) * (1 - t),
      }
    }
    return kf
  })

  // If there are no keyframes or the current frame is outside the existing keyframe range, add a new keyframe
  if (shape.keyframes.length === 0 || currentFrame < shape.keyframes[0].frame || currentFrame > shape.keyframes[shape.keyframes.length - 1].frame) {
    updatedKeyframes = [...updatedKeyframes, updatedKeyframe].sort((a, b) => a.frame - b.frame)
  }

  return { ...shape, keyframes: updatedKeyframes }
}