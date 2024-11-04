import React from 'react'
import { Shape } from '../../types'

interface KeyframeMarkersProps {
  shape: Shape
  duration: number
  selectedKeyframe: number | null
  onKeyframeClick: (e: React.MouseEvent, frame: number) => void
  onKeyframeDragStart: (e: React.MouseEvent, frame: number) => void
}

const KeyframeMarkers: React.FC<KeyframeMarkersProps> = ({
  shape,
  duration,
  selectedKeyframe,
  onKeyframeClick,
  onKeyframeDragStart
}) => {
  if (!shape.keyframes?.length) return null

  return (
    <>
      {shape.keyframes.map((keyframe, index) => (
        <div
          key={`${shape.id}-${keyframe.frame}-${index}`}
          className={`absolute w-2 h-8 cursor-move z-10 ${
            keyframe.frame === selectedKeyframe ? 'bg-green-500' : 'bg-blue-500'
          } hover:bg-opacity-80`}
          style={{ 
            left: `${(keyframe.frame / duration) * 100}%`,
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          onClick={(e) => onKeyframeClick(e, keyframe.frame)}
          onMouseDown={e => onKeyframeDragStart(e, keyframe.frame)}
        >
          {keyframe.animation && (
            <div 
              className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full"
              style={{ 
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '4px solid #3B82F6'
              }}
            />
          )}
        </div>
      ))}
    </>
  )
}

export default KeyframeMarkers