import { Shape } from '../types'

export function isShapeVisible(shape: Shape, currentFrame: number): boolean {
  // Skip if shape is outside its duration
  if (shape.startFrame !== undefined && currentFrame < shape.startFrame) {
    return false
  }
  if (shape.endFrame !== undefined && currentFrame > shape.endFrame) {
    return false
  }
  return true
}