export interface ParallaxConfig {
  depthScale: boolean
  focalStrength: number
  cameraDistance: number
}

export interface ParallaxResult {
  x: number
  y: number
  scale: number
  opacity: number
}