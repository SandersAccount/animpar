import { TimelineObject, AnimationConfig } from '../types'
import { AnimationType, AnimationDirection } from '../../../types'
import { getEaseValue } from './easing'

export class EnterExitAnimations {
  constructor(private config: AnimationConfig) {}

  applyEnterAnimation(
    object: TimelineObject,
    currentFrame: number
  ): TimelineObject {
    if (!object.animation?.enter || object.animation.enter.type === 'none') {
      return object
    }

    const startFrame = object.startFrame || 0
    if (currentFrame < startFrame) {
      return { ...object, opacity: 0, scale: 0.001 }
    }

    const { progress, offset, scale, opacity } = this.calculateAnimationProgress(
      currentFrame,
      startFrame,
      object.animation.enter
    )

    return {
      ...object,
      x: object.x + offset.x,
      y: object.y + offset.y,
      scale: object.scale * (object.animation.enter.direction === 'center' ? scale : 1),
      opacity
    }
  }

  applyExitAnimation(
    object: TimelineObject,
    currentFrame: number
  ): TimelineObject {
    if (!object.animation?.exit || 
        object.animation.exit.type === 'none' || 
        !object.endFrame) {
      return object
    }

    const exitStartFrame = object.endFrame - object.animation.exit.duration
    if (currentFrame < exitStartFrame) {
      return object
    }

    if (currentFrame > object.endFrame) {
      return { ...object, opacity: 0, scale: 0.001 }
    }

    const { progress, offset, scale, opacity } = this.calculateAnimationProgress(
      object.endFrame - currentFrame,
      0,
      object.animation.exit
    )

    return {
      ...object,
      x: object.x + offset.x,
      y: object.y + offset.y,
      scale: object.scale * (object.animation.exit.direction === 'center' ? scale : 1),
      opacity
    }
  }

  private calculateAnimationProgress(
    currentFrame: number,
    startFrame: number,
    animation: {
      type: AnimationType
      direction: AnimationDirection
      duration: number
    }
  ) {
    const rawProgress = (currentFrame - startFrame) / animation.duration
    let progress = Math.min(1, Math.max(0, rawProgress))
    let scale = 1
    let opacity = 1

    progress = getEaseValue(progress, animation.type)

    if (animation.direction === 'center') {
      scale = progress
      opacity = progress
    }

    const offset = { x: 0, y: 0 }
    const distance = this.config.animationDistance

    if (animation.direction !== 'center') {
      const inverseProgress = 1 - progress
      switch (animation.direction) {
        case 'left':
          offset.x = -distance * inverseProgress
          break
        case 'right':
          offset.x = distance * inverseProgress
          break
        case 'top':
          offset.y = -distance * inverseProgress
          break
        case 'bottom':
          offset.y = distance * inverseProgress
          break
      }
    }

    return { progress, offset, scale, opacity }
  }
}