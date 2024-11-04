import { TimelineObject } from '../types'

export interface DurationConfig {
  defaultStart: number
  defaultEnd: number
  minDuration: number
}

export function initializeObjectDuration(
  object: TimelineObject,
  config: DurationConfig = { defaultStart: 0, defaultEnd: 100, minDuration: 1 }
): TimelineObject {
  return {
    ...object,
    startFrame: config.defaultStart,
    endFrame: config.defaultEnd
  }
}

export function updateObjectDuration(
  object: TimelineObject,
  startFrame: number,
  endFrame: number,
  config: DurationConfig = { defaultStart: 0, defaultEnd: 100, minDuration: 1 }
): TimelineObject {
  // Ensure minimum duration
  if (endFrame - startFrame < config.minDuration) {
    endFrame = startFrame + config.minDuration
  }

  // Update keyframes if they fall outside new duration
  const updatedKeyframes = object.keyframes
    .filter(kf => kf.frame >= startFrame && kf.frame <= endFrame)
    .map(kf => ({
      ...kf,
      frame: Math.max(startFrame, Math.min(endFrame, kf.frame))
    }))

  return {
    ...object,
    startFrame,
    endFrame,
    keyframes: updatedKeyframes
  }
}