/**
 * @uploop/compositor — GPU Layer Compositor
 *
 * Multi-layer compositor with GPU acceleration via uploop-ge. Layers are
 * stacked with blend modes, masks, and effect pipelines. Transitions animate
 * between clip states.
 *
 * @depends uploop-ge (@uploop/math, @uploop/renderer) for GPU pipeline
 */

export { Compositor } from './compositor.js'
export { Layer } from './layer.js'
export { Effect, EffectPipeline } from './effect.js'
export { Transition, createTransition, transitionTypes } from './transition.js'
export { blendModes, blendModeToCanvas, blendPixel } from './blend.js'
export { Mask, createMask } from './mask.js'
