/**
 * Effects — per-layer effect pipeline.
 *
 * Effects are applied in order before blending. Phase 1 provides stubs
 * for the effect registry; implementations come in Phase 2 (GPU).
 */

export class Effect {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {'blur'|'colorGrade'|'chromaKey'|'lumaKey'|'sharpen'|'noise'|'custom'} opts.type
   * @param {object} opts.params — effect-specific parameters
   */
  constructor({ id, type, params = {} }) {
    this.id = id
    this.type = type
    this.params = params
  }
}

export class EffectPipeline {
  constructor() {
    /** @type {Effect[]} */
    this.effects = []
  }

  add(effect) {
    this.effects.push(effect)
  }

  remove(id) {
    this.effects = this.effects.filter(e => e.id !== id)
  }

  /**
   * Apply all effects to image data.
   * Phase 1: no-op. Phase 2: GPU shader pipeline.
   * @param {ImageData} imageData
   * @returns {ImageData}
   */
  apply(imageData) {
    // Phase 2 — apply effects in order
    return imageData
  }
}
