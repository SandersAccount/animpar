import React, { useRef, useEffect } from 'react'
import { Shape } from '../types'
import { Play, Pause } from 'lucide-react'
import TimelineTrack from './TimelineTrack'
import KeyframePropertiesPanel from './KeyframePropertiesPanel'

interface TimelineProps {
  selectedShape: Shape | null
  camera: Shape
  currentFrame: number
  setCurrentFrame: (frame: number) => void
  addKeyframe: (shape: Shape) => void
  duration: number
  isPlaying: boolean
  togglePlay: () => void
  updateShape: (shape: Shape) => void
  updateCamera: (camera: Shape) => void
}

const Timeline: React.FC<TimelineProps> = ({
  selectedShape,
  camera,
  currentFrame,
  setCurrentFrame,
  addKeyframe,
  duration,
  isPlaying,
  togglePlay,
  updateShape,
  updateCamera
}) => {
  const [selectedKeyframe, setSelectedKeyframe] = React.useState<number | null>(null)

  const handleKeyframeDrag = (shape: Shape, oldFrame: number, newFrame: number) => {
    const updatedShape = {
      ...shape,
      keyframes: shape.keyframes.map(kf => 
        kf.frame === oldFrame ? { ...kf, frame: newFrame } : kf
      ).sort((a, b) => a.frame - b.frame)
    }
    if (shape.type === 'camera') {
      updateCamera(updatedShape)
    } else {
      updateShape(updatedShape)
    }
  }

  const handlePrevKeyframe = () => {
    const activeShape = selectedShape || camera
    const keyframes = activeShape.keyframes.sort((a, b) => a.frame - b.frame)
    const prevKeyframe = keyframes.reverse().find(kf => kf.frame < currentFrame)
    
    if (prevKeyframe) {
      setCurrentFrame(prevKeyframe.frame)
      setSelectedKeyframe(prevKeyframe.frame)
    }
  }

  const handleNextKeyframe = () => {
    const activeShape = selectedShape || camera
    const keyframes = activeShape.keyframes.sort((a, b) => a.frame - b.frame)
    const nextKeyframe = keyframes.find(kf => kf.frame > currentFrame)
    
    if (nextKeyframe) {
      setCurrentFrame(nextKeyframe.frame)
      setSelectedKeyframe(nextKeyframe.frame)
    }
  }

  const renderTimeMarkers = () => {
    const markers = []
    const step = Math.ceil(duration / 10)
    for (let i = 0; i <= duration; i += step) {
      markers.push(
        <div
          key={i}
          className="absolute text-xs"
          style={{ left: `${(i / duration) * 100}%`, top: '-20px' }}
        >
          {i}
        </div>
      )
    }
    return markers
  }

  const activeShape = selectedShape || camera

  return (
    <div className="bg-gray-200 p-4 rounded-lg">
      <div className="flex items-center mb-4">
        <button
          className="bg-blue-500 text-white p-2 rounded mr-2"
          onClick={handlePrevKeyframe}
          title="Go to Previous Keyframe"
        >
          &lt;&lt;
        </button>
        <button
          className="bg-blue-500 text-white p-2 rounded mr-2"
          onClick={handleNextKeyframe}
          title="Go to Next Keyframe"
        >
          &gt;&gt;
        </button>
        <button
          className="bg-green-500 text-white p-2 rounded mr-2"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <span className="mr-4">Frame: {currentFrame}</span>
        {activeShape && (
          <button
            className="bg-green-500 text-white p-2 rounded mr-4"
            onClick={() => addKeyframe(activeShape)}
          >
            Add Keyframe
          </button>
        )}
      </div>
      <div className="relative h-12">
        {renderTimeMarkers()}
        <TimelineTrack
          shape={activeShape}
          duration={duration}
          currentFrame={currentFrame}
          onFrameChange={setCurrentFrame}
          onKeyframeDrag={(oldFrame, newFrame) => handleKeyframeDrag(activeShape, oldFrame, newFrame)}
          selectedKeyframe={selectedKeyframe}
          onKeyframeSelect={setSelectedKeyframe}
        />
      </div>
      {activeShape && selectedKeyframe !== null && (
        <KeyframePropertiesPanel
          shape={activeShape}
          selectedKeyframe={selectedKeyframe}
          updateShape={activeShape.type === 'camera' ? updateCamera : updateShape}
        />
      )}
    </div>
  )
}

export default Timeline