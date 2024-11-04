import React from 'react'

interface CurrentFrameIndicatorProps {
  currentFrame: number
  duration: number
}

const CurrentFrameIndicator: React.FC<CurrentFrameIndicatorProps> = ({
  currentFrame,
  duration
}) => {
  return (
    <div
      className="absolute top-0 bottom-0 bg-red-500 w-0.5 pointer-events-none z-20"
      style={{ left: `${(currentFrame / duration) * 100}%` }}
    />
  )
}

export default CurrentFrameIndicator