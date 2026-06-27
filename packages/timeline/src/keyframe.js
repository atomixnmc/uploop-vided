/**
 * Keyframe — single keyframe at a specific time with a value and easing.
 */

import { easing } from './easing.js'

export class Keyframe {
  /**
   * @param {object} opts
   * @param {number} opts.time — seconds
   * @param {*} opts.value
   * @param {string} [opts.easing='linear']
   */
  constructor({ time, value, easing: ease = 'linear' }) {
    this.time = time
    this.value = value
    this.easing = ease
  }

  toJSON() {
    return { time: this.time, value: this.value, easing: this.easing }
  }
}

/**
 * KeyframeTrack — animated property over time.
 *
 * A KeyframeTrack holds keyframes for a single property (opacity, scale, etc.)
 * and interpolates between them using the specified easing functions.
 */
export class KeyframeTrack {
  /**
   * @param {object} opts
   * @param {string} opts.property — 'opacity'|'scale'|'position'|'rotation'|custom
   * @param {Keyframe[]} [opts.keyframes=[]]
   */
  constructor({ property, keyframes = [] }) {
    this.property = property
    this.keyframes = [...keyframes].sort((a, b) => a.time - b.time)
  }

  addKeyframe(kf) {
    this.keyframes.push(kf)
    this.keyframes.sort((a, b) => a.time - b.time)
  }

  /** Get interpolated value at a given time */
  getValueAt(time) {
    if (this.keyframes.length === 0) return null
    if (this.keyframes.length === 1) return this.keyframes[0].value

    // Find surrounding keyframes
    let i = 0
    while (i < this.keyframes.length && this.keyframes[i].time <= time) i++

    if (i === 0) return this.keyframes[0].value // before first
    if (i >= this.keyframes.length) return this.keyframes[this.keyframes.length - 1].value // after last

    const prev = this.keyframes[i - 1]
    const next = this.keyframes[i]
    const range = next.time - prev.time
    if (range === 0) return next.value

    const t = (time - prev.time) / range
    const fn = easing[prev.easing] || easing.linear
    const eased = fn(Math.max(0, Math.min(1, t)))

    return interpolateValue(prev.value, next.value, eased)
  }

  toJSON() {
    return {
      property: this.property,
      keyframes: this.keyframes.map(k => k.toJSON()),
    }
  }
}

/** Interpolate between two values (number, array, or object) */
function interpolateValue(a, b, t) {
  if (typeof a === 'number' && typeof b === 'number') {
    return a + (b - a) * t
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.map((v, i) => interpolateValue(v, b[i], t))
  }
  if (typeof a === 'object' && typeof b === 'object' && a !== null && b !== null) {
    const result = {}
    for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
      result[key] = interpolateValue(a[key] ?? 0, b[key] ?? 0, t)
    }
    return result
  }
  // Fallback: just return b at t >= 0.5
  return t < 0.5 ? a : b
}
