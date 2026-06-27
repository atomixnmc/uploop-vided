/**
 * @typedef {Object} ProjectPaths
 * @property {string} config — path to project.json
 * @property {string} assets — asset directory
 * @property {string} timelines — timeline JSON directory
 * @property {string} renders — render output root
 * @property {string} sequences — sequence JSON directory
 * @property {string} exports — export presets directory
 *
 * @typedef {Object} ProjectConfigData
 * @property {string} id — UUID
 * @property {string} name
 * @property {number} width
 * @property {number} height
 * @property {number} fps
 * @property {string} [description]
 * @property {string} [author]
 * @property {string} [version]
 *
 * @typedef {Object} RenderLayout
 * @property {string} renderDir — absolute path
 * @property {string} framesDir — frame PNG directory
 * @property {string} outputFile — output.mp4 path
 */

export default {}
