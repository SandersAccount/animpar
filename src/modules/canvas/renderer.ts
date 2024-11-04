import { Shape, Keyframe, FocalPoint } from '../../types'
import { getCurrentKeyframe } from '../../utils/keyframeUtils'
import { getCurrentFocalPoint } from '../../utils/focalPointUtils'
import { renderShape } from '../shapeRendering'
import { ImageLoader } from './imageLoader'

export class CanvasRenderer {
  private ctx: CanvasRenderingContext2D
  private imageLoader: ImageLoader
  private animationFrame: number | null = null
  private loadedImages: Record<number, HTMLImageElement> = {}
  private lastFrameTime: number = 0
  private readonly targetFPS = 60

  constructor(
    private canvas: HTMLCanvasElement,
    private shapes: Shape[],
    private camera: Shape,
    private focalPoint: FocalPoint,
    private currentFrame: number,
    private isDepthScaleEnabled: boolean
  ) {
    const context = canvas.getContext('2d', { alpha: false })
    if (!context) throw new Error('Could not get canvas context')
    this.ctx = context
    this.imageLoader = new ImageLoader()

    // Enable image smoothing for better quality
    this.ctx.imageSmoothingEnabled = true
    this.ctx.imageSmoothingQuality = 'high'

    // Setup image loader callback
    this.imageLoader.onLoad(() => this.render())
  }

  start() {
    this.lastFrameTime = performance.now()
    this.render()
  }

  stop() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  private render = (timestamp = performance.now()) => {
    // Calculate time since last frame
    const deltaTime = timestamp - this.lastFrameTime
    const frameTime = 1000 / this.targetFPS

    // Only render if enough time has passed
    if (deltaTime >= frameTime) {
      this.lastFrameTime = timestamp - (deltaTime % frameTime)

      // Clear the canvas with a solid color for better performance
      this.ctx.fillStyle = '#f0f0f0'
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

      const cameraKeyframe = getCurrentKeyframe(this.camera, this.currentFrame)
      const focalKeyframe = getCurrentFocalPoint(this.focalPoint, this.currentFrame)

      // Draw focal point
      this.ctx.beginPath()
      this.ctx.arc(this.focalPoint.x, this.focalPoint.y, 10, 0, Math.PI * 2)
      this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
      this.ctx.fill()
      this.ctx.strokeStyle = 'red'
      this.ctx.stroke()

      // Sort shapes by depth
      const sortedShapes = [...this.shapes].sort((a, b) => {
        const aKeyframe = getCurrentKeyframe(a, this.currentFrame)
        const bKeyframe = getCurrentKeyframe(b, this.currentFrame)
        return bKeyframe.depth - aKeyframe.depth
      })

      // Render each shape
      sortedShapes.forEach(shape => {
        renderShape(shape, {
          ctx: this.ctx,
          currentFrame: this.currentFrame,
          cameraKeyframe,
          focalKeyframe,
          isDepthScaleEnabled: this.isDepthScaleEnabled,
          loadedImages: this.loadedImages,
          setLoadedImages: (images) => {
            this.loadedImages = images
          }
        })
      })
    }

    this.animationFrame = requestAnimationFrame(this.render)
  }

  updateProps(
    shapes: Shape[],
    camera: Shape,
    focalPoint: FocalPoint,
    currentFrame: number,
    isDepthScaleEnabled: boolean
  ) {
    this.shapes = shapes
    this.camera = camera
    this.focalPoint = focalPoint
    this.currentFrame = currentFrame
    this.isDepthScaleEnabled = isDepthScaleEnabled
  }
}