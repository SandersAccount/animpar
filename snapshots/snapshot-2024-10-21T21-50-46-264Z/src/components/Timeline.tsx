import React, { useRef, useEffect } from 'react'
import { Shape, Keyframe } from '../types'
import { Play, Pause } from 'lucide-react'

interface TimelineProps {
  selectedShape: Shape | null
  camera: Shape
  currentFrame: number
  setCurrentFrame: (frame: number) => void
  addKeyframe: (shape: Shape) => void
  duration: number
  isPlaying: boolean
  togglePlay: () => void
}

const Timeline: React.FC<TimelineProps> = ({
  selectedShape,
  camera,
  currentFrame,
  setCurrentFrame,
  addKeyframe,
  duration,
  isPlaying,
  togglePlay
}) => {
  const timelineRef = useRef<HTMLDivElement>(null)

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newFrame = Math.round((clickX / rect.width) * duration)
      setCurrentFrame(Math.max(0, Math.min(newFrame, duration)))
    }
  }

  useEffect(() => {
    const updateTimeIndicator = () => {
      if (timelineRef.current) {
        const indicator = timelineRef.current.querySelector('.time-indicator') as HTMLElement
        if (indicator) {
          const position = (currentFrame / duration) * 100
          indicator.style.left = `${position}%`
        }
      }
    }

    updateTimeIndicator()
  }, [currentFrame, duration])

  const renderKeyframes = (shape: Shape) => {
    return shape.keyframes.map((keyframe, index) => (
      <div
        key={`keyframe-${shape.id}-${keyframe.frame}-${index}`}
        className="absolute w-2 h-4 bg-blue-500"
        style={{ left: `${(keyframe.frame / duration) * 100}%`, bottom: 0 }}
      />
    ))
  }

  const renderTimeMarkers = () => {
    const markers = []
    const step = Math.ceil(duration / 10)
    for (let i = 0; i <= duration; i += step) {
      markers.push(
        <div
          key={i}
          className="absolute bottom-full mb-1 text-xs"
          style={{ left: `${(i / duration) * 100}%` }}
        >
          {i}
        </div>
      )
    }
    return markers
  }

  return (
    <div className="bg-gray-200 p-4 rounded-lg">
      <div className="flex items-center mb-2">
        <button
          className="bg-blue-500 text-white p-2 rounded mr-2"
          onClick={() => setCurrentFrame(Math.max(0, currentFrame - 1))}
        >
          &lt;
        </button>
        <button
          className="bg-blue-500 text-white p-2 rounded mr-2"
          onClick={() => setCurrentFrame(Math.min(duration, currentFrame + 1))}
        >
          &gt;
        </button>
        <button
          className="bg-green-500 text-white p-2 rounded mr-2"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <span className="mr-2">Frame: {currentFrame}</span>
        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={() => selectedShape ? addKeyframe(selectedShape) : addKeyframe(camera)}
        >
          Add Keyframe
        </button>
      </div>
      <div
        ref={timelineRef}
        className="bg-white h-12 relative cursor-pointer"
        onClick={handleTimelineClick}
      >
        {renderTimeMarkers()}
        <div
          className="time-indicator absolute top-0 bottom-0 bg-red-500 w-0.5"
          style={{ left: `${(currentFrame / duration) * 100}%` }}
        />
        {selectedShape && renderKeyframes(selectedShape)}
        {renderKeyframes(camera)}
      </div>
    </div>
  )
}

export default Timeline