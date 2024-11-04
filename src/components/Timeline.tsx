import React from 'react'
import { Shape, FocalPoint } from '../types'
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
  focalPoint: FocalPoint
  setFocalPoint: (focalPoint: FocalPoint) => void
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
  updateCamera,
  focalPoint,
  setFocalPoint
}) => {
  const [selectedKeyframe, setSelectedKeyframe] = React.useState<number | null>(null)
  const [selectedTrack, setSelectedTrack] = React.useState<'shape' | 'camera' | 'focal-point'>('shape')

  const handleKeyframeDrag = (oldFrame: number, newFrame: number) => {
    if (selectedTrack === 'focal-point' && focalPoint?.keyframes) {
      const updatedKeyframes = focalPoint.keyframes.map(kf => 
        kf.frame === oldFrame ? { ...kf, frame: newFrame } : kf
      ).sort((a, b) => a.frame - b.frame)
      setFocalPoint({ ...focalPoint, keyframes: updatedKeyframes })
    } else {
      const activeShape = selectedShape || camera
      if (!activeShape) return

      const updatedKeyframes = activeShape.keyframes.map(kf => 
        kf.frame === oldFrame ? { ...kf, frame: newFrame } : kf
      ).sort((a, b) => a.frame - b.frame)

      if (activeShape.type === 'camera') {
        updateCamera({ ...activeShape, keyframes: updatedKeyframes })
      } else {
        updateShape({ ...activeShape, keyframes: updatedKeyframes })
      }
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

  const handleAddKeyframe = () => {
    if (selectedTrack === 'focal-point') {
      const newKeyframe = {
        frame: currentFrame,
        x: focalPoint.x,
        y: focalPoint.y,
        animation: { type: 'linear', duration: 30 }
      }
      const updatedKeyframes = [...focalPoint.keyframes, newKeyframe]
        .sort((a, b) => a.frame - b.frame)
      setFocalPoint({ ...focalPoint, keyframes: updatedKeyframes })
    } else {
      const activeShape = selectedShape || camera
      if (!activeShape) return
      addKeyframe(activeShape)
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
        
        <div className="flex gap-2 mr-4">
          <button
            className={`px-3 py-1 rounded ${selectedTrack === 'shape' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setSelectedTrack('shape')}
            disabled={!selectedShape}
          >
            Shape
          </button>
          <button
            className={`px-3 py-1 rounded ${selectedTrack === 'camera' ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setSelectedTrack('camera')}
          >
            Camera
          </button>
          <button
            className={`px-3 py-1 rounded ${selectedTrack === 'focal-point' ? 'bg-yellow-500 text-white' : 'bg-gray-300'}`}
            onClick={() => setSelectedTrack('focal-point')}
          >
            Focal Point
          </button>
        </div>

        <button
          className="bg-green-500 text-white p-2 rounded"
          onClick={handleAddKeyframe}
        >
          Add Keyframe
        </button>
      </div>

      <div className="relative h-12">
        {renderTimeMarkers()}
        {selectedTrack === 'focal-point' ? (
          <TimelineTrack
            shape={focalPoint}
            duration={duration}
            currentFrame={currentFrame}
            onFrameChange={setCurrentFrame}
            onKeyframeDrag={handleKeyframeDrag}
            selectedKeyframe={selectedKeyframe}
            onKeyframeSelect={setSelectedKeyframe}
            trackType={selectedTrack}
          />
        ) : (
          <TimelineTrack
            shape={activeShape}
            duration={duration}
            currentFrame={currentFrame}
            onFrameChange={setCurrentFrame}
            onKeyframeDrag={handleKeyframeDrag}
            selectedKeyframe={selectedKeyframe}
            onKeyframeSelect={setSelectedKeyframe}
            trackType={selectedTrack}
          />
        )}
      </div>

      {activeShape && selectedKeyframe !== null && selectedTrack !== 'focal-point' && (
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