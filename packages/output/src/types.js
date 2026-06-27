/**
 * @typedef {Object} MediaEncoder
 * @property {Function} configure — set codec, bitrate, resolution
 * @property {Function} encode — encode single frame
 * @property {Function} flush — finalize and get encoded data
 * @property {Function} dispose
 *
 * @typedef {Object} StreamOutput
 * @property {Function} start — begin streaming to endpoint
 * @property {Function} push — push frame to stream
 * @property {Function} stop
 * @property {'webrtc'|'rtmp'|'hls'} protocol
 *
 * @typedef {Object} ExportPreset
 * @property {string} name — 'hd'|'4k'|'social'|'stream'
 * @property {number} width
 * @property {number} height
 * @property {number} fps
 * @property {string} codec — 'avc1'|'vp9'|'av1'
 * @property {number} bitrate
 *
 * @typedef {Object} RenderPipeline
 * @property {Function} render — render entire timeline → file
 * @property {Function} renderRange — render time range
 * @property {Function} abort — cancel rendering
 * @property {Function} progress — get progress 0..1
 *
 * @typedef {Object} PreviewStream
 * @property {Function} start — start low-res preview
 * @property {Function} stop
 * @property {HTMLCanvasElement} canvas — preview output
 */

export default {}
