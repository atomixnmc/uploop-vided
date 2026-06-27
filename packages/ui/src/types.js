/**
 * @typedef {Object} UploopPlayer
 * @property {Function} play
 * @property {Function} pause
 * @property {Function} seek — seek to time (seconds)
 * @property {Function} setVolume — 0..1
 * @property {number} currentTime
 * @property {number} duration
 * @property {boolean} playing
 *
 * @typedef {Object} UploopTimeline
 * @property {Timeline} timeline — bound timeline model
 * @property {Function} addTrack
 * @property {Function} removeTrack
 * @property {Function} addClip
 * @property {Function} moveClip
 * @property {number} zoom — horizontal zoom level
 * @property {number} scrollLeft
 *
 * @typedef {Object} UploopPreview
 * @property {HTMLCanvasElement} canvas
 * @property {Function} render — render current frame
 * @property {Function} showOverlay — show guides/safe zones
 *
 * @typedef {Object} UploopInspector
 * @property {Object} target — currently inspected item
 * @property {Function} inspect — inspect a clip, layer, or effect
 *
 * @typedef {Object} UploopLibrary
 * @property {Function} addAsset — add media to library
 * @property {Function} removeAsset
 * @property {Object[]} assets — library contents
 */

export default {}
