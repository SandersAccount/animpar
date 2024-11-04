import React from 'react'
import { Shape } from '../../types'

interface DurationIndicatorProps {
  shape: Shape
  duration: number
}

const DurationIndicator: React.FC<DurationIndicatorProps> = ({ shape, duration }) => {
  if (!shape.startFrame || !shape.endFrame) return null

  return (
    <div
      className="absolute h-full bg-blue-100 opacity-30"
      style={{
        left: `${(shape.startFrame / duration) * 100}%`,
        width: `${((shape.endFrame - shape.startFrame) / duration) * 100}%`
      }}
    />
  )
}

export default DurationIndicator