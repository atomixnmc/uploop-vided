/**
 * Mask — alpha/luma/shape masking for layers.
 *
 * Phase 1: stubs. Phase 2: GPU mask pipeline.
 */

export class Mask {
  /**
   * @param {object} opts
   * @param {'alpha'|'luma'|'shape'} opts.type
   * @param {ImageData|object} opts.source
   * @param {boolean} [opts.invert=false]
   */
  constructor({ type, source, invert = false }) {
    this.type = type
    this.source = source
    this.invert = invert
  }
}

/** @param {{ type: string, source: any }} opts @returns {Mask} */
export function createMask(opts) {
  return new Mask(opts)
}
