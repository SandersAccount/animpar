import { Shape } from '../../types'
import { getCurrentKeyframe } from '../../utils/keyframeUtils'
import { isShapeVisible } from '../shapeVisibility'

interface Point {
  x: number
  y: number
}

export function getShapeUnderPoint(
  point: Point,
  shapes: Shape[],
  currentFrame: number,
  camera: Shape,
  isDepthScaleEnabled: boolean
): Shape | null {
  return shapes.find((shape) => {
    if (!isShapeVisible(shape, currentFrame)) return false

    const shapeKeyframe = getCurrentKeyframe(shape, currentFrame)
    const cameraKeyframe = getCurrentKeyframe(camera, currentFrame)
    const zoom = cameraKeyframe.zoom || 1
    const shapeZoom = isDepthScaleEnabled 
      ? shapeKeyframe.scale * (1 + (1 - shapeKeyframe.depth) * 2) 
      : shapeKeyframe.scale
    const scaledWidth = shape.width * shapeZoom * zoom
    const scaledHeight = shape.height * shapeZoom * zoom

    return (
      point.x >= shapeKeyframe.x - scaledWidth / 2 &&
      point.x <= shapeKeyframe.x + scaledWidth / 2 &&
      point.y >= shapeKeyframe.y - scaledHeight / 2 &&
      point.y <= shapeKeyframe.y + scaledHeight / 2
    )
  }) || null
}

export function getCanvasPoint(e: React.MouseEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): Point {
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  }
}