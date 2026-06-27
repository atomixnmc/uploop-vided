/**
 * @typedef {Object} Timeline
 * @property {string} id
 * @property {string} name
 * @property {Track[]} tracks
 * @property {number} duration — seconds, computed from longest track
 * @property {number} fps
 * @property {number} width
 * @property {number} height
 *
 * @typedef {Object} Track
 * @property {string} id
 * @property {'video'|'audio'|'image'|'text'|'effect'} type
 * @property {Clip[]} clips — ordered by inPoint
 * @property {boolean} muted
 * @property {number} volume — 0..1
 *
 * @typedef {Object} Clip
 * @property {string} id
 * @property {string} source — URL or asset ID
 * @property {number} inPoint — timeline start (seconds)
 * @property {number} outPoint — timeline end (seconds)
 * @property {number} sourceStart — source media start (seconds)
 * @property {number} [duration] — computed = outPoint - inPoint
 * @property {KeyframeTrack[]} [keyframes]
 * @property {Object} [props] — arbitrary clip properties
 *
 * @typedef {Object} Keyframe
 * @property {number} time — seconds within clip
 * @property {*} value
 * @property {string} [easing='linear']
 *
 * @typedef {Object} KeyframeTrack
 * @property {string} property — 'opacity'|'scale'|'position'|'rotation'|custom
 * @property {Keyframe[]} keyframes
 */

export default {}
