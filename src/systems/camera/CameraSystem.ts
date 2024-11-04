import { Shape, FocalPoint } from '../../types'
import { CameraState, ParallaxConfig, ViewportDimensions } from './types'
import { calculateParallax, calculateCameraView } from './parallaxEngine'

export class CameraSystem {
  private state: CameraState
  private viewport: ViewportDimensions

  constructor(
    camera: Shape,
    focalPoint: FocalPoint | null,
    viewport: ViewportDimensions,
    config?: Partial<ParallaxConfig>
  ) {
    this.state = {
      camera,
      focalPoint,
      config: {
        depthScale: true,
        cameraDistance: 1000,
        focalStrength: 0.5,
        ...config
      }
    }
    this.viewport = viewport
  }

  updateCamera(camera: Shape) {
    this.state.camera = camera
  }

  updateFocalPoint(focalPoint: FocalPoint | null) {
    this.state.focalPoint = focalPoint
  }

  updateConfig(config: Partial<ParallaxConfig>) {
    this.state.config = { ...this.state.config, ...config }
  }

  getShapeTransform(shape: Shape, currentFrame: number) {
    return calculateParallax(
      shape,
      this.state.camera,
      this.state.focalPoint,
      currentFrame,
      this.state.config
    )
  }

  getCameraView(shape: Shape, currentFrame: number) {
    return calculateCameraView(
      shape,
      this.state.camera,
      currentFrame,
      this.state.config
    )
  }

  getConfig() {
    return { ...this.state.config }
  }

  getViewport() {
    return { ...this.viewport }
  }
}