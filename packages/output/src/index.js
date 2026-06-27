/**
 * @uploop/output — Encoding & Streaming
 *
 * Timeline renderer that composes frames via the compositor and encodes them
 * through WebCodecs. Supports file export (MP4, WebM) and real-time streaming
 * (WebRTC, RTMP, HLS). Export presets for common targets.
 */

export { MediaEncoder } from './encoder.js'
export { StreamOutput } from './stream.js'
export { ExportPresets } from './export.js'
export { RenderPipeline } from './renderer.js'
export { PreviewStream } from './preview.js'
