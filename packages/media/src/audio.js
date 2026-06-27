/**
 * Audio decode & analysis — WebCodecs AudioDecoder + Web Audio API
 */

/** @param {Blob|ArrayBuffer} src @returns {Promise<AudioTrack>} */
export async function decodeAudio(src) {
  throw new Error('@uploop/media: decodeAudio not implemented')
}

/** @param {AudioTrack} track @returns {Promise<Float32Array>} */
export async function waveform(track) {
  throw new Error('@uploop/media: waveform not implemented')
}

/** @param {AudioTrack} track @param {number} count - number of peak samples @returns {Float32Array} */
export function peaks(track, count) {
  throw new Error('@uploop/media: peaks not implemented')
}
