import { AnimationType } from '../../../types'

export function getEaseValue(t: number, type: AnimationType): number {
  switch (type) {
    case 'linear':
      return t
    case 'bounce': {
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
    case 'elastic-out': {
      if (t === 0 || t === 1) return t
      const period = 0.3
      const s = period / 4
      return Math.pow(2, -10 * t) * Math.sin((t - s) * (2 * Math.PI) / period) + 1
    }
    default:
      return t
  }
}