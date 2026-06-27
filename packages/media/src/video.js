/**
 * Video decode & frame extraction — WebCodecs VideoDecoder
 */

/** @param {Blob|ArrayBuffer} src @returns {Promise<VideoTrack>} */
export async function decodeVideo(src) {
  throw new Error('@uploop/media: decodeVideo not implemented')
}

/** @param {VideoTrack} track @param {number} time - seconds @returns {Promise<VideoFrame>} */
export async function extractFrame(track, time) {
  throw new Error('@uploop/media: extractFrame not implemented')
}

/** @param {VideoTrack} track @param {number} time - seconds */
export async function seekTo(track, time) {
  throw new Error('@uploop/media: seekTo not implemented')
}
