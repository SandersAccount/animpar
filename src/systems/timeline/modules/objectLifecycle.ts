import { TimelineObject, LifecycleConfig } from '../types'

export class ObjectLifecycle {
  constructor(private config: LifecycleConfig) {}

  initializeObject(object: TimelineObject): TimelineObject {
    return {
      ...object,
      startFrame: this.config.defaultStartFrame,
      endFrame: this.config.defaultEndFrame,
      keyframes: [
        {
          frame: this.config.defaultStartFrame,
          ...this.getDefaultKeyframe(object)
        }
      ]
    }
  }

  updateDuration(
    object: TimelineObject,
    startFrame: number,
    endFrame: number
  ): TimelineObject {
    // Ensure minimum duration
    const duration = Math.max(
      this.config.minDuration,
      endFrame - startFrame
    )

    // Adjust keyframes to fit within new duration
    const adjustedKeyframes = object.keyframes
      .filter(kf => kf.frame >= startFrame && kf.frame <= endFrame)
      .map(kf => ({
        ...kf,
        frame: Math.max(startFrame, Math.min(endFrame, kf.frame))
      }))

    return {
      ...object,
      startFrame,
      endFrame: startFrame + duration,
      keyframes: adjustedKeyframes
    }
  }

  private getDefaultKeyframe(object: TimelineObject) {
    return {
      x: object.x || 400,
      y: object.y || 300,
      rotation: 0,
      scale: 1,
      depth: 0.5,
      opacity: 1,
      animation: {
        type: 'linear' as AnimationType,
        duration: 30
      }
    }
  }
}