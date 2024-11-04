import { Shape, Keyframe, AnimationType, AnimationDirection } from '../../types'

export interface TimelineObject {
  id: number
  keyframes: Keyframe[]
  startFrame?: number
  endFrame?: number
  indicators?: TimelineIndicator[]
  animation?: {
    enter: {
      type: AnimationType
      direction: AnimationDirection
      duration: number
    }
    exit: {
      type: AnimationType
      direction: AnimationDirection
      duration: number
    }
  }
}

export interface TimelineIndicator {
  type: 'stay-here'
  startFrame: number
  endFrame: number
  color: string
}

export interface KeyframeUpdate {
  frame: number
  changes: Partial<Keyframe>
}

export interface PanelState {
  isOpen: boolean
  selectedFrame: number | null
  selectedObject: TimelineObject | null
}

export interface LifecycleConfig {
  defaultStartFrame: number
  defaultEndFrame: number
  minDuration: number
  maxDuration: number
}

export interface StayHereConfig {
  defaultDuration: number
  indicatorColor: string
  totalFrames: number
}

export interface AnimationConfig {
  animationDistance: number
  defaultDuration: number
  easingFunctions: Record<AnimationType, (t: number) => number>
}