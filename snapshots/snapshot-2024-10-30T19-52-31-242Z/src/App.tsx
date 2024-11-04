import React, { useState, useRef, useEffect } from 'react'
import { Shape, ShapeType, AnimationType } from './types'
import ShapeSidebar from './components/ShapeSidebar'
import Canvas from './components/Canvas'
import Timeline from './components/Timeline'
import CameraPanel from './components/CameraPanel'
import CameraViewScheme from './components/CameraViewScheme'
import TemplateLibrary from './components/TemplateLibrary'
import ShapeHandlers from './components/ShapeHandlers'
import ObjectDurationPanel from './components/ObjectDurationPanel'
import KeyframePropertiesPanel from './components/KeyframePropertiesPanel'
import { addOrUpdateKeyframe } from './utils/keyframeUtils'

const App: React.FC = () => {
  const [shapes, setShapes] = useState<Shape[]>([])
  const [selectedShape, setSelectedShape] = useState<Shape | null>(null)
  const [selectedKeyframe, setSelectedKeyframe] = useState<number | null>(null)
  const [camera, setCamera] = useState<Shape>({
    id: 0,
    type: 'camera',
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation: 0,
    scale: 1,
    color: '',
    keyframes: [{ frame: 0, x: 0, y: 0, rotation: 0, scale: 1, depth: 0, zoom: 1 }],
    depth: 0,
    animation: { 
      enter: { type: 'none' as AnimationType, direction: 'center', duration: 30 },
      exit: { type: 'none' as AnimationType, direction: 'center', duration: 30 }
    }
  })
  const [currentFrame, setCurrentFrame] = useState(0)
  const [duration, setDuration] = useState(100)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isDepthScaleEnabled, setIsDepthScaleEnabled] = useState(false)
  const [replacingShapeId, setReplacingShapeId] = useState<number | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [templates, setTemplates] = useState<any[]>([])

  const addShape = (type: ShapeType) => {
    const newShape: Shape = {
      id: shapes.length + 1,
      type,
      x: 400,
      y: 300,
      width: 50,
      height: 50,
      rotation: 0,
      scale: 1,
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      keyframes: [{
        frame: currentFrame,
        x: 400,
        y: 300,
        rotation: 0,
        scale: 1,
        depth: 0.5,
        zoom: 1
      }],
      depth: 0.5,
      startFrame: currentFrame,
      endFrame: duration,
      animation: {
        enter: { type: 'none' as AnimationType, direction: 'center', duration: 30 },
        exit: { type: 'none' as AnimationType, direction: 'center', duration: 30 }
      }
    }
    setShapes([...shapes, newShape])
    setSelectedShape(newShape)
  }

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setImages([...images, imageUrl])
    }
    reader.readAsDataURL(file)
  }

  const handleReplaceShape = (shapeId: number) => {
    setReplacingShapeId(shapeId)
  }

  const handleImageSelect = (imageUrl: string) => {
    if (replacingShapeId !== null) {
      const updatedShapes = shapes.map(shape => {
        if (shape.id === replacingShapeId) {
          return {
            ...shape,
            type: 'image' as ShapeType,
            image: imageUrl,
          }
        }
        return shape
      })
      setShapes(updatedShapes)
      setReplacingShapeId(null)
    } else {
      const newShape: Shape = {
        id: shapes.length + 1,
        type: 'image',
        x: 400,
        y: 300,
        width: 100,
        height: 100,
        rotation: 0,
        scale: 1,
        color: '',
        keyframes: [{
          frame: currentFrame,
          x: 400,
          y: 300,
          rotation: 0,
          scale: 1,
          depth: 0.5,
          zoom: 1
        }],
        depth: 0.5,
        image: imageUrl,
        startFrame: currentFrame,
        endFrame: duration,
        animation: {
          enter: { type: 'none' as AnimationType, direction: 'center', duration: 30 },
          exit: { type: 'none' as AnimationType, direction: 'center', duration: 30 }
        }
      }
      setShapes([...shapes, newShape])
      setSelectedShape(newShape)
    }
  }

  const handleSelectTemplate = (template: any) => {
    const newShapes = template.sceneData.shapes.map((shape: Shape) => ({
      ...shape,
      id: shapes.length + shape.id,
      keyframes: shape.keyframes.map(kf => ({ ...kf })),
    }))
    setShapes(newShapes)
    setCamera(template.sceneData.camera)
    setDuration(template.sceneData.duration)
    setCurrentFrame(0)
  }

  const handleSaveTemplate = () => {
    const newTemplate = {
      id: `template-${templates.length + 1}`,
      name: `Template ${templates.length + 1}`,
      thumbnail: '',
      sceneData: {
        shapes,
        camera,
        duration,
      },
    }
    setTemplates([...templates, newTemplate])
  }

  const updateShape = (updatedShape: Shape) => {
    setShapes(shapes.map(shape => shape.id === updatedShape.id ? updatedShape : shape))
    if (selectedShape && selectedShape.id === updatedShape.id) {
      setSelectedShape(updatedShape)
    }
  }

  const updateCamera = (updatedCamera: Shape) => {
    setCamera(updatedCamera)
  }

  const handleAddKeyframe = (shape: Shape) => {
    if (shape.type === 'camera') {
      setCamera(addOrUpdateKeyframe(shape, currentFrame))
    } else {
      updateShape(addOrUpdateKeyframe(shape, currentFrame))
    }
  }

  const handleStartFrameChange = (frame: number) => {
    if (selectedShape) {
      const updatedShape = { ...selectedShape, startFrame: frame }
      updateShape(updatedShape)
    }
  }

  const handleEndFrameChange = (frame: number) => {
    if (selectedShape) {
      const updatedShape = { ...selectedShape, endFrame: frame }
      updateShape(updatedShape)
    }
  }

  const handleAnimationChange = (type: 'enter' | 'exit', animation: Shape['animation']['enter']) => {
    if (selectedShape) {
      const updatedShape = {
        ...selectedShape,
        animation: {
          ...selectedShape.animation,
          [type]: animation
        }
      }
      updateShape(updatedShape)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentFrame((prevFrame) => (prevFrame + 1) % (duration + 1))
      }, 1000 / 30) // 30 fps
      return () => clearInterval(interval)
    }
  }, [isPlaying, duration])

  return (
    <div className="flex h-screen bg-gray-100">
      <ShapeSidebar
        addShape={addShape}
        onImageUpload={handleImageUpload}
        onImageSelect={handleImageSelect}
        images={images}
        replacingShapeId={replacingShapeId}
      />
      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1">
          <Canvas
            shapes={shapes}
            selectedShape={selectedShape}
            setSelectedShape={setSelectedShape}
            updateShape={updateShape}
            currentFrame={currentFrame}
            camera={camera}
            updateCamera={updateCamera}
            isDepthScaleEnabled={isDepthScaleEnabled}
          />
        </div>
        <Timeline
          selectedShape={selectedShape}
          camera={camera}
          currentFrame={currentFrame}
          setCurrentFrame={setCurrentFrame}
          addKeyframe={handleAddKeyframe}
          duration={duration}
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          updateShape={updateShape}
          updateCamera={updateCamera}
        />
        <button
          onClick={handleSaveTemplate}
          className="bg-green-500 text-white px-4 py-2 rounded mt-2"
        >
          Save Template
        </button>
        <TemplateLibrary
          templates={templates}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>
      <div className="w-64 bg-white shadow-lg p-4 space-y-4">
        <CameraPanel
          camera={camera}
          selectedShape={selectedShape}
          updateShape={updateShape}
          updateCamera={updateCamera}
          currentFrame={currentFrame}
        />
        <CameraViewScheme
          shapes={shapes}
          camera={camera}
          currentFrame={currentFrame}
          isDepthScaleEnabled={isDepthScaleEnabled}
          setIsDepthScaleEnabled={setIsDepthScaleEnabled}
        />
        {selectedShape && (
          <ObjectDurationPanel
            shape={selectedShape}
            duration={duration}
            onStartFrameChange={handleStartFrameChange}
            onEndFrameChange={handleEndFrameChange}
            onAnimationChange={handleAnimationChange}
          />
        )}
        {selectedShape && selectedKeyframe !== null && (
          <KeyframePropertiesPanel
            shape={selectedShape}
            selectedKeyframe={selectedKeyframe}
            updateShape={updateShape}
          />
        )}
        {!selectedShape && selectedKeyframe !== null && (
          <KeyframePropertiesPanel
            shape={camera}
            selectedKeyframe={selectedKeyframe}
            updateShape={updateCamera}
          />
        )}
      </div>
      {selectedShape && (
        <ShapeHandlers
          shape={selectedShape}
          camera={camera}
          currentFrame={currentFrame}
          updateShape={updateShape}
          onReplace={handleReplaceShape}
        />
      )}
    </div>
  )
}

export default App