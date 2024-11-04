import { AnimationType } from '../../../types'

export function getEaseValue(t: number, type: AnimationType, easing: string = 'linear'): number {
  // First check custom easing types
  switch (easing) {
    case 'ease-in':
      return t * t
    case 'ease-out':
      return t * (2 - t)
    case 'ease-in-out':
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    case 'bounce':
      return getBounceEasing(t)
    case 'elastic':
      return getElasticEasing(t)
  }

  // Then fall back to animation types
  switch (type) {
    case 'linear':
      return t
    case 'bounce':
      return getBounceEasing(t)
    case 'elastic-out':
      return getElasticEasing(t)
    default:
      return t
  }
}

function getBounceEasing(t: number): number {
  if (t < 1) {
    const n1 = 7.5625
    const d1 = 2.75
    
    if (t < 1 / d1) {
      return n1 * t * t
    } else if (t < 2 / d1) {
      t -= 1.5 / d1
      return n1 * t * t + 0.75
    } else if (t < 2.5 / d1) {
      t -= 2.25 / d1
      return n1 * t * t + 0.9375
    } else {
      t -= 2.625 / d1
      return n1 * t * t + 0.984375
    }
  }
  return t
}

function getElasticEasing(t: number): number {
  if (t === 0 || t === 1) return t
  const period = 0.3
  const s = period / 4
  return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / period) + 1
}