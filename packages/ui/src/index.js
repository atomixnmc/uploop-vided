/**
 * @uploop/vided-ui — Editor UI Web Components
 *
 * Custom elements for the uploop-vided editor and player. Built with Web
 * Components (customElements.define). Designed to work standalone or embedded
 * in any framework. Will integrate with @uploop/html for HyperGraph bindings.
 *
 * Components:
 *   <uploop-player>     — play/pause/scrub/volume
 *   <uploop-timeline>   — multi-track timeline editor
 *   <uploop-preview>    — canvas preview with overlays
 *   <uploop-inspector>  — clip/effect properties panel
 *   <uploop-library>    — media asset browser
 */

export { UploopPlayer } from './player.js'
export { UploopTimeline } from './timeline.js'
export { UploopPreview } from './preview.js'
export { UploopInspector } from './inspector.js'
export { UploopLibrary } from './library.js'
