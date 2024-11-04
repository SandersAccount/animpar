import React from 'react'
import { Shape, AnimationType } from '../types'
import { getCurrentKeyframe } from '../utils/keyframeUtils'

interface KeyframePropertiesPanelProps {
  shape: Shape
  selectedKeyframe: number | null
  updateShape: (shape: Shape) => void
}

const KeyframePropertiesPanel: React.FC<KeyframePropertiesPanelProps> = ({
  shape,
  selectedKeyframe,
  updateShape
}) => {
  if (!selectedKeyframe) return null

  const keyframe = shape.keyframes.find(kf => kf.frame === selectedKeyframe)
  if (!keyframe) return null

  const handleAnimationTypeChange = (type: AnimationType) => {
    const updatedKeyframes = shape.keyframes.map(kf => {
      if (kf.frame === selectedKeyframe) {
        return {
          ...kf,
          animation: { 
            ...kf.animation,
            type,
            duration: kf.animation?.duration || 30 // Default duration
          }
        }
      }
      return kf
    })

    updateShape({
      ...shape,
      keyframes: updatedKeyframes
    })
  }

  const handleDurationChange = (duration: number) => {
    const updatedKeyframes = shape.keyframes.map(kf => {
      if (kf.frame === selectedKeyframe) {
        return {
          ...kf,
          animation: { 
            ...kf.animation,
            duration
          }
        }
      }
      return kf
    })

    updateShape({
      ...shape,
      keyframes: updatedKeyframes
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="font-bold mb-4">Keyframe Properties</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Frame: {selectedKeyframe}</label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Animation Type</label>
          <select
            value={keyframe.animation?.type || 'linear'}
            onChange={(e) => handleAnimationTypeChange(e.target.value as AnimationType)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="none">None</option>
            <option value="linear">Linear</option>
            <option value="bounce">Bounce</option>
            <option value="elastic-out">Elastic</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Animation applies from previous keyframe to this one
          </p>
        </div>

        {keyframe.animation?.type && keyframe.animation.type !== 'none' && (
          <div>
            <label className="block text-sm font-medium mb-2">Duration (frames)</label>
            <input
              type="number"
              min={1}
              value={keyframe.animation?.duration || 30}
              onChange={(e) => handleDurationChange(Math.max(1, parseInt(e.target.value)))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">X</label>
              <input
                type="number"
                value={Math.round(keyframe.x)}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Y</label>
              <input
                type="number"
                value={Math.round(keyframe.y)}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Properties</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Rotation</label>
              <input
                type="number"
                value={Math.round(keyframe.rotation)}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Scale</label>
              <input
                type="number"
                value={keyframe.scale.toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Depth</label>
          <input
            type="number"
            value={keyframe.depth.toFixed(2)}
            readOnly
            className="w-full px-3 py-2 border rounded bg-gray-50"
          />
        </div>
      </div>
    </div>
  )
}

export default KeyframePropertiesPanel