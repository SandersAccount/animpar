export type AnimationDirection = 'center' | 'left' | 'right' | 'top' | 'bottom'
export type AnimationType = 'none' | 'linear' | 'bounce' | 'elastic-out'
export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'pentagon' | 'star' | 'speech-bubble' | 'camera' | 'image'

export interface Animation {
  type: AnimationType
  direction: AnimationDirection
  duration: number
}

export interface KeyframeAnimation {
  type: AnimationType
  duration?: number
}

export interface Shape {
  id: number
  type: ShapeType
  x: number
  y: number
  width: number
  height: number
  rotation: number
  scale: number
  color: string
  keyframes: Keyframe[]
  depth: number
  image?: string
  startFrame?: number
  endFrame?: number
  animation: {
    enter: Animation
    exit: Animation
  }
}

export interface Keyframe {
  frame: number
  x: number
  y: number
  rotation: number
  scale: number
  depth: number
  zoom?: number
  animation?: KeyframeAnimation
  stayHere?: boolean
}

export interface FocalPointKeyframe {
  frame: number
  x: number
  y: number
  animation?: KeyframeAnimation
}

export interface FocalPoint {
  x: number
  y: number
  keyframes: FocalPointKeyframe[]
}

export interface Point {
  x: number
  y: number
}