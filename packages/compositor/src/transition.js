/**
 * Transitions — animate between clip states.
 *
 * Each transition is a function that takes a progress value (0..1) and
 * returns transform parameters (opacity, offset, scale) for the outgoing
 * and incoming clips.
 *
 * Usage:
 *   const fade = createTransition('fade', { duration: 0.5 })
 *   const { outgoing, incoming } = fade.render(0.3)
 *   // Apply outgoing.opacity / incoming.opacity to DOM/canvas
 */

/**
 * @typedef {object} TransitionResult
 * @property {{ opacity: number, x: number, y: number, scale: number }} outgoing
 * @property {{ opacity: number, x: number, y: number, scale: number }} incoming
 */

/**
 * @typedef {'fade'|'wipeLeft'|'wipeRight'|'wipeUp'|'wipeDown'|'slideLeft'|'slideRight'|'slideUp'|'slideDown'|'dissolve'|'zoomIn'|'zoomOut'|'none'} TransitionType
 */

import { easing } from '@uploop/timeline'

export class Transition {
  /**
   * @param {object} opts
   * @param {TransitionType} opts.type
   * @param {number} opts.duration — seconds
   * @param {object} [opts.params]
   * @param {string} [opts.easing='easeInOut']
   */
  constructor({ type, duration, params = {}, easing: easeFn = 'easeInOut' }) {
    this.type = type
    this.duration = duration
    this.params = params
    this.easing = easeFn
  }

  /**
   * Render the transition at a given progress (0..1).
   * @param {number} progress — 0..1, where 0 = outgoing fully visible, 1 = incoming fully visible
   * @returns {TransitionResult}
   */
  render(progress) {
    const fn = easing[this.easing] || easing.easeInOut
    const t = fn(Math.max(0, Math.min(1, progress)))
    return transitionFunctions[this.type](t, this.params)
  }
}

/**
 * Create a transition (functional alias).
 * @param {TransitionType} type
 * @param {object} [opts]
 * @param {number} [opts.duration=0.5]
 * @param {object} [opts.params]
 * @param {string} [opts.easing='easeInOut']
 * @returns {Transition}
 */
export function createTransition(type, { duration = 0.5, params = {}, easing: easeFn = 'easeInOut' } = {}) {
  return new Transition({ type, duration, params, easing: easeFn })
}

// ── Transition implementations ──────────────────────────────────

/**
 * Collection of transition functions. Each takes a eased progress (0..1)
 * and optional params. Returns out/in transforms.
 */
const transitionFunctions = {
  /** Simple crossfade */
  fade(t) {
    return {
      outgoing: { opacity: 1 - t, x: 0, y: 0, scale: 1 },
      incoming: { opacity: t, x: 0, y: 0, scale: 1 },
    }
  },

  /** Dissolve — fade with slight scale */
  dissolve(t) {
    return {
      outgoing: { opacity: 1 - t, x: 0, y: 0, scale: 1 + t * 0.05 },
      incoming: { opacity: t, x: 0, y: 0, scale: 1.05 - t * 0.05 },
    }
  },

  /** Wipe left → right */
  wipeLeft(t, p = {}) {
    const clip = p.clipWidth || 1
    return {
      outgoing: { opacity: 1, x: -t * clip, y: 0, scale: 1 },
      incoming: { opacity: 1, x: (1 - t) * clip, y: 0, scale: 1 },
    }
  },

  /** Wipe right → left */
  wipeRight(t, p = {}) {
    const clip = p.clipWidth || 1
    return {
      outgoing: { opacity: 1, x: t * clip, y: 0, scale: 1 },
      incoming: { opacity: 1, x: -(1 - t) * clip, y: 0, scale: 1 },
    }
  },

  /** Wipe bottom → top */
  wipeUp(t, p = {}) {
    const clip = p.clipHeight || 1
    return {
      outgoing: { opacity: 1, x: 0, y: -t * clip, scale: 1 },
      incoming: { opacity: 1, x: 0, y: (1 - t) * clip, scale: 1 },
    }
  },

  /** Wipe top → bottom */
  wipeDown(t, p = {}) {
    const clip = p.clipHeight || 1
    return {
      outgoing: { opacity: 1, x: 0, y: t * clip, scale: 1 },
      incoming: { opacity: 1, x: 0, y: -(1 - t) * clip, scale: 1 },
    }
  },

  /** Slide left (outgoing goes left, incoming from right) */
  slideLeft(t, p = {}) {
    const clip = p.clipWidth || 1
    return {
      outgoing: { opacity: 1, x: -t * clip, y: 0, scale: 1 },
      incoming: { opacity: 1, x: (1 - t) * clip, y: 0, scale: 1 },
    }
  },

  /** Slide right */
  slideRight(t, p = {}) {
    const clip = p.clipWidth || 1
    return {
      outgoing: { opacity: 1, x: t * clip, y: 0, scale: 1 },
      incoming: { opacity: 1, x: -(1 - t) * clip, y: 0, scale: 1 },
    }
  },

  /** Slide up */
  slideUp(t, p = {}) {
    const clip = p.clipHeight || 1
    return {
      outgoing: { opacity: 1, x: 0, y: -t * clip, scale: 1 },
      incoming: { opacity: 1, x: 0, y: (1 - t) * clip, scale: 1 },
    }
  },

  /** Slide down */
  slideDown(t, p = {}) {
    const clip = p.clipHeight || 1
    return {
      outgoing: { opacity: 1, x: 0, y: t * clip, scale: 1 },
      incoming: { opacity: 1, x: 0, y: -(1 - t) * clip, scale: 1 },
    }
  },

  /** Zoom in — incoming scales up */
  zoomIn(t) {
    return {
      outgoing: { opacity: 1 - t * 0.5, x: 0, y: 0, scale: 1 + t * 0.5 },
      incoming: { opacity: t, x: 0, y: 0, scale: 0.5 + t * 0.5 },
    }
  },

  /** Zoom out — outgoing scales down */
  zoomOut(t) {
    return {
      outgoing: { opacity: 1 - t * 0.5, x: 0, y: 0, scale: 1 - t * 0.5 },
      incoming: { opacity: t, x: 0, y: 0, scale: 1 },
    }
  },

  /** No transition — instant cut */
  none(t) {
    return {
      outgoing: { opacity: t < 1 ? 1 : 0, x: 0, y: 0, scale: 1 },
      incoming: { opacity: t >= 1 ? 1 : 0, x: 0, y: 0, scale: 1 },
    }
  },
}

/** List of available transition types */
export const transitionTypes = Object.keys(transitionFunctions)
