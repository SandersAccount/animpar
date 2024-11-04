import { useRef, useEffect } from 'react'
import { Shape, FocalPoint } from '../types'
import { CameraSystem } from '../systems/camera/CameraSystem'
import { ParallaxConfig } from '../systems/camera/types'

export function useCameraSystem(
  camera: Shape,
  focalPoint: FocalPoint | null,
  config: Partial<ParallaxConfig> = {}
) {
  const systemRef = useRef<CameraSystem | null>(null)

  useEffect(() => {
    if (!systemRef.current) {
      systemRef.current = new CameraSystem(
        camera,
        focalPoint,
        { width: 800, height: 600 },
        config
      )
    }

    systemRef.current.updateCamera(camera)
    systemRef.current.updateFocalPoint(focalPoint)
    systemRef.current.updateConfig(config)
  }, [camera, focalPoint, config])

  return systemRef.current
}