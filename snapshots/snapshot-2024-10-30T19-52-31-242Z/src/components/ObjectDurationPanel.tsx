import React from 'react'
import { Shape, AnimationType, AnimationDirection } from '../types'
import { Clock } from 'lucide-react'

interface ObjectDurationPanelProps {
  shape: Shape
  duration: number
  onStartFrameChange: (frame: number) => void
  onEndFrameChange: (frame: number) => void
  onAnimationChange: (type: 'enter' | 'exit', animation: { type: AnimationType, direction: AnimationDirection, duration: number }) => void
}

const ObjectDurationPanel: React.FC<ObjectDurationPanelProps> = ({
  shape,
  duration,
  onStartFrameChange,
  onEndFrameChange,
  onAnimationChange
}) => {
  const handleStartFrameChange = (frame: number) => {
    // Ensure first keyframe moves with start frame
    const frameShift = frame - (shape.startFrame || 0)
    const firstKeyframe = shape.keyframes[0]
    
    if (frameShift !== 0 && firstKeyframe) {
      // Update first keyframe to maintain relative position
      const updatedFirstKeyframe = {
        ...firstKeyframe,
        frame: firstKeyframe.frame + frameShift
      }
      shape.keyframes[0] = updatedFirstKeyframe
    }
    
    onStartFrameChange(frame)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Clock className="mr-2" size={20} />
        <h3 className="font-bold">Object Duration</h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Frame</label>
          <input
            type="number"
            min={0}
            max={shape.endFrame || duration}
            value={shape.startFrame || 0}
            onChange={(e) => handleStartFrameChange(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">End Frame</label>
          <input
            type="number"
            min={shape.startFrame || 0}
            max={duration}
            value={shape.endFrame || duration}
            onChange={(e) => onEndFrameChange(Math.max(shape.startFrame || 0, parseInt(e.target.value) || 0))}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Enter Animation</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={shape.animation?.enter.type || 'none'}
              onChange={(e) => onAnimationChange('enter', {
                ...shape.animation.enter,
                type: e.target.value as AnimationType
              })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="none">None</option>
              <option value="linear">Linear</option>
              <option value="bounce">Bounce</option>
              <option value="elastic-out">Elastic</option>
            </select>
            <select
              value={shape.animation?.enter.direction || 'center'}
              onChange={(e) => onAnimationChange('enter', {
                ...shape.animation.enter,
                direction: e.target.value as AnimationDirection
              })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Duration (frames)</label>
            <input
              type="number"
              min={1}
              max={duration}
              value={shape.animation?.enter.duration || 30}
              onChange={(e) => onAnimationChange('enter', {
                ...shape.animation.enter,
                duration: Math.max(1, parseInt(e.target.value) || 30)
              })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Exit Animation</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={shape.animation?.exit.type || 'none'}
              onChange={(e) => onAnimationChange('exit', {
                ...shape.animation.exit,
                type: e.target.value as AnimationType
              })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="none">None</option>
              <option value="linear">Linear</option>
              <option value="bounce">Bounce</option>
              <option value="elastic-out">Elastic</option>
            </select>
            <select
              value={shape.animation?.exit.direction || 'center'}
              onChange={(e) => onAnimationChange('exit', {
                ...shape.animation.exit,
                direction: e.target.value as AnimationDirection
              })}
              className="w-full px-3 py-2 border rounded"
            >
              <option value="center">Center</option>
              <option value="left">Left</option>
              <option value="right">Right</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div className="mt-2">
            <label className="block text-sm font-medium mb-1">Duration (frames)</label>
            <input
              type="number"
              min={1}
              max={duration}
              value={shape.animation?.exit.duration || 30}
              onChange={(e) => onAnimationChange('exit', {
                ...shape.animation.exit,
                duration: Math.max(1, parseInt(e.target.value) || 30)
              })}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ObjectDurationPanel