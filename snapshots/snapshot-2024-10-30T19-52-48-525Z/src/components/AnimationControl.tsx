import React, { useState } from 'react'
import { AnimationType } from '../types'

interface AnimationControlProps {
  type: 'enter' | 'exit'
  currentValue: AnimationType
  onChange: (type: AnimationType) => void
  position: { x: number, y: number }
}

const AnimationControl: React.FC<AnimationControlProps> = ({
  type,
  currentValue,
  onChange,
  position
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const options: AnimationType[] = ['none', 'linear', 'bounce']

  return (
    <div 
      className="absolute z-50"
      style={{ 
        left: position.x,
        top: position.y
      }}
    >
      <div 
        className="w-3 h-3 bg-blue-500 cursor-pointer hover:bg-blue-600"
        onClick={() => setIsOpen(!isOpen)}
      />
      {isOpen && (
        <div className="absolute left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg">
          {options.map((option) => (
            <div
              key={option}
              className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${
                currentValue === option ? 'bg-blue-100' : ''
              }`}
              onClick={() => {
                onChange(option)
                setIsOpen(false)
              }}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AnimationControl