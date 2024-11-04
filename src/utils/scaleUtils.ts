import { Point } from '../types'

export function applyScaleFromFocalPoint(
  point: Point,
  focalPoint: Point,
  zoom: number,
  depth: number
): { x: number; y: number; scale: number } {
  // Calculate scale based on zoom and depth
  // Objects closer to camera (depth near 0) scale more than distant objects (depth near 1)
  const depthFactor = 1 - depth
  const scale = 1 + ((zoom - 1) * depthFactor)
  
  // Calculate vector from focal point to object
  const dx = point.x - focalPoint.x
  const dy = point.y - focalPoint.y
  
  // Scale the vector based on zoom and depth
  const scaledDx = dx * scale
  const scaledDy = dy * scale
  
  // Calculate new position relative to focal point
  const newX = focalPoint.x + scaledDx
  const newY = focalPoint.y + scaledDy
  
  return { x: newX, y: newY, scale }
}