/**
 * StreamOutput — real-time streaming (WebRTC, RTMP, HLS)
 */

export class StreamOutput {
  /** @param {{ protocol: 'webrtc'|'rtmp'|'hls', endpoint: string }} opts */
  constructor(opts) { throw new Error('@uploop/output: StreamOutput not implemented') }
  start() { throw new Error('not implemented') }
  push(frame) { throw new Error('not implemented') }
  stop() { throw new Error('not implemented') }
}
