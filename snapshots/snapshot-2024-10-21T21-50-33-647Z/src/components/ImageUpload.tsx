import React, { useRef } from 'react'

interface ImageUploadProps {
  onImageUpload: (file: File) => void
  children: React.ReactNode
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUpload, children }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageUpload(file)
    }
  }

  return (
    <div onClick={handleClick} className="cursor-pointer">
      {children}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default ImageUpload