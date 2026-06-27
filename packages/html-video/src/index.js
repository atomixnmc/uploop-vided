/**
 * @uploop/html-video — HTML → MP4 Rendering
 *
 * Renders HTML/CSS/Canvas compositions to real MP4 video files using
 * headless Chromium (Puppeteer) for frame capture and ffmpeg for encoding.
 *
 * Inspired by Remotion, but framework-agnostic. Works with any HTML content,
 * uploop timelines, or custom Canvas compositions.
 *
 * Architecture:
 *   Composition (HTML/JS) → Headless Chromium (screenshot per frame) → ffmpeg (encode MP4)
 *
 * Usage:
 *   import { renderVideo } from '@uploop/html-video'
 *   await renderVideo({
 *     composition: myComposition,
 *     output: 'output.mp4',
 *     fps: 30,
 *     duration: 10,
 *     width: 1920,
 *     height: 1080,
 *   })
 */

export { renderVideo, renderFrame, renderFrames } from './renderer.js'
export { encodeVideo, encodeWithFFmpeg } from './encoder.js'
export { Composition } from './composition.js'
