import React from 'react'
import { Shape, FocalPoint } from '../types'
import { CameraSystem } from '../systems/camera/CameraSystem'
import { Switch } from './ui/switch'

interface CameraViewPanelProps {
  shapes: Shape[]
  camera: Shape
  focalPoint: FocalPoint | null
  currentFrame: number
  isDepthScaleEnabled: boolean
  setIsDepthScaleEnabled: (enabled: boolean) => void
  onCameraDistanceChange: (distance: number) => void
  onFocalStrengthChange: (strength: number) => void
}

const CameraViewPanel: React.FC<CameraViewPanelProps> = ({
  shapes,
  camera,
  focalPoint,
  currentFrame,
  isDepthScaleEnabled,
  setIsDepthScaleEnabled,
  onCameraDistanceChange,
  onFocalStrengthChange
}) => {
  const cameraSystem = new CameraSystem(camera, focalPoint, {
    width: 200,
    height: 150
  }, {
    depthScale: isDepthScaleEnabled,
    cameraDistance: 1000,
    focalStrength: 0.5
  })

  return (
    <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
      <h3 className="font-bold">Camera View Settings</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Depth Scale:</span>
          <Switch
            checked={isDepthScaleEnabled}
            onCheckedChange={setIsDepthScaleEnabled}
            className="bg-gray-300"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Camera Distance (affects depth perception):
          </label>
          <input
            type="range"
            min="500"
            max="2000"
            step="100"
            defaultValue="1000"
            onChange={(e) => onCameraDistanceChange(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Focal Point Strength:
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            defaultValue="0.5"
            onChange={(e) => onFocalStrengthChange(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="text-xs text-gray-600">
          {isDepthScaleEnabled
            ? "ON: Objects scale based on depth"
            : "OFF: Objects maintain constant size"}
        </div>
      </div>
    </div>
  )
}

export default CameraViewPanel