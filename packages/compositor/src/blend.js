/**
 * Blend modes — pixel-level blending functions + canvas mode map.
 *
 * In Phase 1, we delegate to Canvas globalCompositeOperation.
 * In Phase 2, these become GPU shader blend functions.
 */

/** @typedef {'normal'|'multiply'|'screen'|'overlay'|'darken'|'lighten'|'add'|'subtract'} BlendModeName */

/** All available blend modes */
export const blendModes = /** @type {const} */ ({
  normal: 'normal',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  add: 'add',
  subtract: 'subtract',
})

/** Map blend mode name → Canvas globalCompositeOperation */
export const blendModeToCanvas = {
  normal: 'source-over',
  multiply: 'multiply',
  screen: 'screen',
  overlay: 'overlay',
  darken: 'darken',
  lighten: 'lighten',
  add: 'lighter',
  subtract: 'difference',
}

/**
 * Blend two pixel values (0..255) using the named blend mode.
 * Used for CPU-side pixel compositing.
 * @param {number} src — source pixel (foreground)
 * @param {number} dst — destination pixel (background)
 * @param {BlendModeName} mode
 * @returns {number}
 */
export function blendPixel(src, dst, mode) {
  const s = src / 255
  const d = dst / 255
  let r
  switch (mode) {
    case 'multiply': r = s * d; break
    case 'screen': r = 1 - (1 - s) * (1 - d); break
    case 'overlay': r = d < 0.5 ? 2 * s * d : 1 - 2 * (1 - s) * (1 - d); break
    case 'darken': r = Math.min(s, d); break
    case 'lighten': r = Math.max(s, d); break
    case 'add': r = Math.min(1, s + d); break
    case 'subtract': r = Math.max(0, d - s); break
    default: r = s; break
  }
  return Math.round(r * 255)
}
