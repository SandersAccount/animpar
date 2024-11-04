import { TimelineObject, KeyframeUpdate } from './types'
import { Shape, Keyframe, AnimationType, FocalPointKeyframe } from '../../types'

export function getKeyframeAtFrame(obj: TimelineObject, frame: number): Keyframe | FocalPointKeyframe | null {
  return obj.keyframes.find(kf => kf.frame === frame) || null
}

export function getNearestKeyframe(obj: TimelineObject, frame: number, direction: 'prev' | 'next'): Keyframe | FocalPointKeyframe | null {
  const sorted = [...obj.keyframes].sort((a, b) => direction === 'prev' ? b.frame - a.frame : a.frame - b.frame)
  return sorted.find(kf => direction === 'prev' ? kf.frame <= frame : kf.frame >= frame) || null
}

export function updateKeyframe(obj: TimelineObject, update: KeyframeUpdate): TimelineObject {
  const updatedKeyframes = obj.keyframes.map(kf => 
    kf.frame === update.frame ? { ...kf, ...update.changes } : kf
  )

  return {
    ...obj,
    keyframes: updatedKeyframes
  }
}

export function addKeyframe(obj: TimelineObject, frame: number, data: Partial<Keyframe | FocalPointKeyframe>): TimelineObject {
  const newKeyframe = {
    frame,
    ...data
  }

  const updatedKeyframes = [...obj.keyframes, newKeyframe]
    .sort((a, b) => a.frame - b.frame)

  return {
    ...obj,
    keyframes: updatedKeyframes
  }
}