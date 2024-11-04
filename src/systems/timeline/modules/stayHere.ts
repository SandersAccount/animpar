import { TimelineObject, KeyframeUpdate } from '../types'

export interface StayHereConfig {
  duration: number
  indicatorColor: string
}

export function addStayHereKeyframe(
  object: TimelineObject,
  frame: number,
  config: StayHereConfig
): TimelineObject {
  const currentKeyframe = object.keyframes.find(kf => kf.frame === frame)
  if (!currentKeyframe) return object

  // Create a duplicate keyframe after the specified duration
  const stayHereKeyframe = {
    ...currentKeyframe,
    frame: frame + config.duration,
    animation: {
      type: 'none',
      duration: 0
    }
  }

  const updatedKeyframes = [
    ...object.keyframes.filter(kf => kf.frame !== stayHereKeyframe.frame),
    stayHereKeyframe
  ].sort((a, b) => a.frame - b.frame)

  return {
    ...object,
    keyframes: updatedKeyframes
  }
}

export function removeStayHereKeyframe(
  object: TimelineObject,
  frame: number
): TimelineObject {
  const keyframeIndex = object.keyframes.findIndex(kf => kf.frame === frame)
  if (keyframeIndex === -1) return object

  const updatedKeyframes = object.keyframes.filter((_, index) => index !== keyframeIndex + 1)

  return {
    ...object,
    keyframes: updatedKeyframes
  }
}

export function renderStayHereIndicator(
  ctx: CanvasRenderingContext2D,
  object: TimelineObject,
  frame: number,
  config: StayHereConfig
) {
  const keyframe = object.keyframes.find(kf => kf.frame === frame)
  if (!keyframe) return

  const nextKeyframe = object.keyframes.find(kf => kf.frame > frame)
  if (!nextKeyframe) return

  const duration = nextKeyframe.frame - frame
  
  ctx.save()
  ctx.fillStyle = config.indicatorColor
  ctx.globalAlpha = 0.3
  ctx.fillRect(frame, 0, duration, ctx.canvas.height)
  ctx.restore()
}