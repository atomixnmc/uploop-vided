/**
 * @uploop/media — Media I/O
 *
 * Image/video/audio decoding, frame extraction, codec registry abstraction.
 * Uses browser-native APIs (ImageDecoder, VideoDecoder, AudioDecoder from
 * WebCodecs) with fallbacks where possible.
 */

export { decodeImage, resizeImage, cropImage, imageFormat } from './image.js'
export { decodeVideo, extractFrame, seekTo } from './video.js'
export { decodeAudio, waveform, peaks } from './audio.js'
export { CodecRegistry } from './codec.js'
export { VideoFrame } from './frame.js'
export { createCanvas, imageDataOps } from './canvas.js'
