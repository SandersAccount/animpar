import React, { useState } from 'react'
import { Shape } from '../types'

interface TimelineTrackProps {
  shape: Shape
  duration: number
  currentFrame: number
  onFrameChange: (frame: number) => void
  onKeyframeDrag: (oldFrame: number, newFrame: number) => void
  selectedKeyframe: number | null
  onKeyframeSelect: (frame: number | null) => void
  trackType?: 'shape' | 'camera' | 'focal-point'
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
  shape,
  duration,
  currentFrame,
  onFrameChange,
  onKeyframeDrag,
  selectedKeyframe,
  onKeyframeSelect,
  trackType = 'shape'
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedKeyframe, setDraggedKeyframe] = useState<number | null>(null)

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newFrame = Math.round((clickX / rect.width) * duration)
    onFrameChange(Math.max(0, Math.min(newFrame, duration)))
    onKeyframeSelect(null)
  }

  const handleKeyframeClick = (e: React.MouseEvent, frame: number) => {
    e.stopPropagation()
    onKeyframeSelect(frame === selectedKeyframe ? null : frame)
  }

  const handleKeyframeDragStart = (e: React.MouseEvent, frame: number) => {
    e.stopPropagation()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDraggedKeyframe(frame)
  }

  const handleKeyframeDrag = (e: React.MouseEvent) => {
    if (!isDragging || draggedKeyframe === null) return
    e.stopPropagation()

    const rect = e.currentTarget.getBoundingClientRect()
    const dx = e.clientX - dragStart.x
    const frameChange = Math.round((dx / rect.width) * duration)
    const newFrame = Math.max(0, Math.min(duration, draggedKeyframe + frameChange))
    
    onKeyframeDrag(draggedKeyframe, newFrame)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDraggedKeyframe(newFrame)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedKeyframe(null)
  }

  // Find "Stay Here" keyframes
  const stayHereRanges = shape.keyframes.reduce((ranges: { start: number, end: number }[], kf, index) => {
    if (kf.animation?.type === 'none' && index > 0) {
      const prevKf = shape.keyframes[index - 1]
      ranges.push({ start: prevKf.frame, end: kf.frame })
    }
    return ranges
  }, [])

  return (
    <div 
      className="absolute inset-0 bg-white rounded cursor-pointer overflow-hidden"
      onClick={handleTrackClick}
      onMouseMove={handleKeyframeDrag}
      onMouseUp={handleDragEnd}
      onMouseLeave={handleDragEnd}
    >
      {/* Object Duration Indicator */}
      {shape.startFrame !== undefined && shape.endFrame !== undefined && (
        <div
          className="absolute h-full bg-blue-100 opacity-30"
          style={{
            left: `${(shape.startFrame / duration) * 100}%`,
            width: `${((shape.endFrame - shape.startFrame) / duration) * 100}%`
          }}
        />
      )}
      
      {/* Stay Here Indicators */}
      {stayHereRanges.map((range, index) => (
        <div
          key={`stay-${index}`}
          className="absolute h-full bg-green-200 opacity-30"
          style={{
            left: `${(range.start / duration) * 100}%`,
            width: `${((range.end - range.start) / duration) * 100}%`
          }}
        />
      ))}
      
      {/* Keyframes */}
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
          onClick={(e) => handleKeyframeClick(e, keyframe.frame)}
          onMouseDown={e => handleKeyframeDragStart(e, keyframe.frame)}
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

      {/* Current Frame Indicator */}
      <div
        className="absolute top-0 bottom-0 bg-red-500 w-0.5 pointer-events-none z-20"
        style={{ left: `${(currentFrame / duration) * 100}%` }}
      />
    </div>
  )
}

export default TimelineTrack