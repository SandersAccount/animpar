import { TimelineObject, KeyframeUpdate, PanelState } from '../types'
import { Shape, FocalPoint, AnimationType } from '../../../types'
import { getEaseValue } from './easing'

export interface KeyframePanelConfig {
  position: { x: number; y: number }
  onUpdate: (object: TimelineObject, update: KeyframeUpdate) => void
  onClose: () => void
  onAddStayHere: (object: TimelineObject, frame: number) => void
  onRemoveStayHere: (object: TimelineObject, frame: number) => void
}

export class KeyframePanel {
  private state: PanelState = {
    isOpen: false,
    selectedFrame: null,
    selectedObject: null,
    hasStayHere: false,
    isFocalPoint: false
  }

  constructor(private config: KeyframePanelConfig) {}

  open(frame: number, object: TimelineObject, isFocalPoint: boolean = false) {
    // Check if this keyframe has a "stay here" by looking for a duplicate keyframe
    const hasStayHere = object.keyframes.some(
      kf => kf.frame === frame + 30 && kf.animation?.type === 'none'
    )

    this.state = {
      isOpen: true,
      selectedFrame: frame,
      selectedObject: object,
      hasStayHere,
      isFocalPoint
    }
    this.render()
  }

  close() {
    this.state = {
      isOpen: false,
      selectedFrame: null,
      selectedObject: null,
      hasStayHere: false,
      isFocalPoint: false
    }
    this.config.onClose()
  }

  updateAnimation(type: AnimationType, duration: number, easing: string = 'linear') {
    if (!this.state.selectedObject || !this.state.selectedFrame) return

    const update: KeyframeUpdate = {
      frame: this.state.selectedFrame,
      changes: {
        animation: { 
          type, 
          duration,
          easing
        }
      }
    }

    this.config.onUpdate(this.state.selectedObject, update)
  }

  toggleStayHere() {
    if (!this.state.selectedObject || !this.state.selectedFrame) return

    if (this.state.hasStayHere) {
      this.config.onRemoveStayHere(this.state.selectedObject, this.state.selectedFrame)
    } else {
      this.config.onAddStayHere(this.state.selectedObject, this.state.selectedFrame)
    }

    this.state.hasStayHere = !this.state.hasStayHere
    this.render()
  }

  getKeyframeEasing(): string {
    if (!this.state.selectedObject || !this.state.selectedFrame) return 'linear'

    const keyframe = this.state.selectedObject.keyframes.find(
      kf => kf.frame === this.state.selectedFrame
    )

    return keyframe?.animation?.easing || 'linear'
  }

  updateEasing(easing: string) {
    if (!this.state.selectedObject || !this.state.selectedFrame) return

    const update: KeyframeUpdate = {
      frame: this.state.selectedFrame,
      changes: {
        animation: {
          ...this.state.selectedObject.keyframes.find(
            kf => kf.frame === this.state.selectedFrame
          )?.animation,
          easing
        }
      }
    }

    this.config.onUpdate(this.state.selectedObject, update)
  }

  private render() {
    // Panel rendering logic handled by React component
  }
}