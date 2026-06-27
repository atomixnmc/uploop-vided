/**
 * @typedef {Object} ImageData
 * @property {number} width
 * @property {number} height
 * @property {Uint8ClampedArray} pixels — RGBA
 * @property {string} [format] — 'png'|'jpeg'|'webp'|'avif'
 *
 * @typedef {Object} VideoTrack
 * @property {number} width
 * @property {number} height
 * @property {number} duration — seconds
 * @property {number} fps
 * @property {string} codec — 'avc1'|'vp9'|'av1'
 * @property {number} [bitrate]
 *
 * @typedef {Object} AudioTrack
 * @property {number} duration
 * @property {number} sampleRate
 * @property {number} channels
 * @property {string} codec — 'mp4a'|'opus'|'flac'
 *
 * @typedef {Object} VideoFrame
 * @property {number} timestamp — seconds
 * @property {ImageData} data
 * @property {number} [duration] — frame duration
 *
 * @typedef {Object} CodecRegistry
 * @property {Function} register — add codec support
 * @property {Function} supports — check if codec is available
 * @property {Function} prefer — set preferred codec order
 */

export default {}
