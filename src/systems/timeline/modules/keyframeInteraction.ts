import { Shape, Keyframe, FocalPoint, FocalPointKeyframe } from '../../../types'
import { TimelineObject, KeyframeUpdate } from '../types'

export function handleKeyframeClick(
  frame: number,
  object: TimelineObject,
  currentSelection: number | null,
  onSelect: (frame: number | null) => void
) {
  // Toggle selection if clicking same keyframe
  if (frame === currentSelection) {
    onSelect(null)
    return
  }

  onSelect(frame)
}

export function updatePreviousKeyframe(
  object: TimelineObject,
  currentFrame: number,
  changes: Partial<Keyframe | FocalPointKeyframe>
): TimelineObject {
  const prevKeyframe = object.keyframes
    .filter(kf => kf.frame <= currentFrame)
    .sort((a, b) => b.frame - a.frame)[0]

  if (!prevKeyframe) {
    // If no previous keyframe, create one at frame 0
    const newKeyframe = {
      frame: 0,
      ...changes
    }
    return {
      ...object,
      keyframes: [...object.keyframes, newKeyframe].sort((a, b) => a.frame - b.frame)
    }
  }

  // Update the previous keyframe with changes
  const updatedKeyframes = object.keyframes.map(kf => 
    kf.frame === prevKeyframe.frame ? { ...kf, ...changes } : kf
  )

  return {
    ...object,
    keyframes: updatedKeyframes
  }
}