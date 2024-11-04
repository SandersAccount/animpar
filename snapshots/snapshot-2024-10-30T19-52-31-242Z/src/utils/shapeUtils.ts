import { Shape } from '../types'

export const isCamera = (shape: Shape): boolean => {
  return shape.type === 'camera'
}