import React from 'react'

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF',
    '#808080', '#800000', '#008000', '#000080',
    '#808000', '#800080', '#008080', '#C0C0C0',
  ]

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {colors.map((c) => (
        <button
          key={c}
          className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-gray-600' : 'border-gray-300'}`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        />
      ))}
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-6 h-6"
      />
    </div>
  )
}

export default ColorPicker