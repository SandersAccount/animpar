import React from 'react'
import { Shape, Keyframe, AnimationType } from '../types'
import { X } from 'lucide-react'

interface KeyframeUpdate {
  frame: number
  changes: Partial<Keyframe>
}

interface TimelinePanelProps {
  object: Shape
  selectedFrame: number
  onUpdate: (update: KeyframeUpdate) => void
  onClose: () => void
  onAddStayHere: () => void
  onRemoveStayHere: () => void
  isFocalPoint?: boolean
}

export const TimelinePanel: React.FC<TimelinePanelProps> = ({
  object,
  selectedFrame,
  onUpdate,
  onClose,
  onAddStayHere,
  onRemoveStayHere,
  isFocalPoint = false
}) => {
  const keyframe = object.keyframes.find(kf => kf.frame === selectedFrame)
  if (!keyframe) return null

  const handleAnimationTypeChange = (type: AnimationType) => {
    onUpdate({
      frame: selectedFrame,
      changes: {
        animation: {
          ...keyframe.animation,
          type,
          duration: keyframe.animation?.duration || 30
        }
      }
    })
  }

  const handleDurationChange = (duration: number) => {
    onUpdate({
      frame: selectedFrame,
      changes: {
        animation: {
          ...keyframe.animation,
          duration: Math.max(1, duration)
        }
      }
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 min-w-[300px]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Keyframe {selectedFrame}</h3>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <X size={20} />
        </button>
      </div>

      <div className="space-y-4">
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
        </div>

        {keyframe.animation?.type && keyframe.animation.type !== 'none' && (
          <div>
            <label className="block text-sm font-medium mb-2">Duration (frames)</label>
            <input
              type="number"
              min={1}
              value={keyframe.animation?.duration || 30}
              onChange={(e) => handleDurationChange(parseInt(e.target.value))}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button
            onClick={onAddStayHere}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Stay Here
          </button>
          <button
            onClick={onRemoveStayHere}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Remove Stay
          </button>
        </div>

        {!isFocalPoint && (
          <div className="pt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">X</label>
                <input
                  type="number"
                  value={Math.round(keyframe.x)}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Y</label>
                <input
                  type="number"
                  value={Math.round(keyframe.y)}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500">Rotation</label>
                <input
                  type="number"
                  value={Math.round(keyframe.rotation)}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500">Scale</label>
                <input
                  type="number"
                  value={keyframe.scale.toFixed(2)}
                  readOnly
                  className="w-full px-3 py-2 border rounded bg-gray-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500">Depth</label>
              <input
                type="number"
                value={keyframe.depth.toFixed(2)}
                readOnly
                className="w-full px-3 py-2 border rounded bg-gray-50"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelinePanel