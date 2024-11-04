export type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'pentagon' | 'star' | 'speech-bubble' | 'camera' | 'image'

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
  image?: string // Add this line for image URL
}

export interface Keyframe {
  frame: number
  x: number
  y: number
  rotation: number
  scale: number
  depth: number
  zoom?: number
}