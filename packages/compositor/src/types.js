/**
 * @typedef {Object} Compositor
 * @property {Layer[]} layers — bottom to top
 * @property {number} width
 * @property {number} height
 * @property {Function} render — composite at given time → ImageData/Texture
 * @property {Function} addLayer
 * @property {Function} removeLayer
 * @property {Function} reorder — change layer z-order
 *
 * @typedef {Object} Layer
 * @property {string} id
 * @property {string} name
 * @property {*} source — clip, image, text, or nested compositor
 * @property {Vec2} position
 * @property {Vec2} scale
 * @property {number} rotation
 * @property {number} opacity — 0..1
 * @property {BlendMode} blendMode
 * @property {Effect[]} effects
 * @property {Mask|null} mask
 * @property {boolean} visible
 *
 * @typedef {Object} Effect
 * @property {string} id
 * @property {'blur'|'colorGrade'|'chromaKey'|'lumaKey'|'sharpen'|'noise'|'custom'} type
 * @property {Object} params
 *
 * @typedef {Object} Transition
 * @property {string} id
 * @property {'fade'|'wipe'|'slide'|'dissolve'|'zoom'|'custom'} type
 * @property {number} duration — seconds
 * @property {Object} params
 * @property {string} [easing='easeInOut']
 *
 * @typedef {'normal'|'multiply'|'screen'|'overlay'|'darken'|'lighten'|'add'|'subtract'} BlendMode
 *
 * @typedef {Object} Mask
 * @property {'alpha'|'luma'|'shape'} type
 * @property {ImageData|Shape} source
 * @property {boolean} invert
 */

export default {}
