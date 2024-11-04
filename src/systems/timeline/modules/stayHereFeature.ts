import { TimelineObject, StayHereConfig } from '../types'

export class StayHereFeature {
  constructor(private config: StayHereConfig) {}

  addStayHere(object: TimelineObject, frame: number): TimelineObject {
    const keyframe = object.keyframes.find(kf => kf.frame === frame)
    if (!keyframe) return object

    const stayDuration = this.config.defaultDuration
    const stayEndFrame = frame + stayDuration

    // Create duplicate keyframe at end of stay duration
    const stayKeyframe = {
      ...keyframe,
      frame: stayEndFrame,
      animation: {
        type: 'none' as AnimationType,
        duration: 0
      }
    }

    // Add visual indicator
    const indicator = {
      type: 'stay-here',
      startFrame: frame,
      endFrame: stayEndFrame,
      color: this.config.indicatorColor
    }

    return {
      ...object,
      keyframes: [
        ...object.keyframes.filter(kf => kf.frame !== stayEndFrame),
        stayKeyframe
      ].sort((a, b) => a.frame - b.frame),
      indicators: [...(object.indicators || []), indicator]
    }
  }

  removeStayHere(object: TimelineObject, frame: number): TimelineObject {
    const keyframeIndex = object.keyframes.findIndex(kf => kf.frame === frame)
    if (keyframeIndex === -1) return object

    return {
      ...object,
      keyframes: object.keyframes.filter((_, index) => index !== keyframeIndex + 1),
      indicators: (object.indicators || []).filter(
        ind => ind.type !== 'stay-here' || ind.startFrame !== frame
      )
    }
  }

  renderIndicators(
    ctx: CanvasRenderingContext2D,
    object: TimelineObject,
    currentFrame: number
  ) {
    if (!object.indicators) return

    object.indicators
      .filter(ind => ind.type === 'stay-here')
      .forEach(ind => {
        ctx.save()
        ctx.fillStyle = ind.color
        ctx.globalAlpha = 0.3
        
        const x = (ind.startFrame / this.config.totalFrames) * ctx.canvas.width
        const width = ((ind.endFrame - ind.startFrame) / this.config.totalFrames) * ctx.canvas.width
        
        ctx.fillRect(x, 0, width, ctx.canvas.height)
        
        // Add highlight for current frame
        if (currentFrame >= ind.startFrame && currentFrame <= ind.endFrame) {
          ctx.globalAlpha = 0.5
          ctx.fillRect(x, 0, 2, ctx.canvas.height)
        }
        
        ctx.restore()
      })
  }
}