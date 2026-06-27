/**
 * @typedef {object} RenderOptions
 * @property {import('./composition.js').Composition} composition
 * @property {string} output — output file path
 * @property {string} [tempDir]
 * @property {function} [onProgress] — ({ frame: number, total: number, percent: number }) => void
 * @property {boolean} [keepFrames=false]
 * @property {number} [concurrency=1]
 *
 * @typedef {object} EncodeOptions
 * @property {string[]} frames — PNG file paths
 * @property {string} output
 * @property {number} fps
 * @property {number} [width]
 * @property {number} [height]
 * @property {'mp4'|'webm'} [format='mp4']
 * @property {object} [codecOpts]
 *
 * @typedef {object} FFmpegOptions
 * @property {string} inputDir
 * @property {string} output
 * @property {number} fps
 * @property {string} [codec='libx264']
 * @property {string} [preset='medium']
 * @property {string} [crf='23']
 * @property {number} [width]
 * @property {number} [height]
 */

export default {}
