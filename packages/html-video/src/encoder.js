/**
 * Encoder — ffmpeg-based video encoding.
 *
 * Takes a sequence of PNG frames and encodes them into MP4 (H.264) or
 * WebM (VP9) using ffmpeg. In Phase 1, ffmpeg is spawned as a child process.
 * In Phase 2, direct WebCodecs encoding will be added for browser-side export.
 *
 * ffmpeg command (H.264):
 *   ffmpeg -framerate 30 -i frame-%04d.png -c:v libx264 -pix_fmt yuv420p output.mp4
 *
 * ffmpeg command (VP9):
 *   ffmpeg -framerate 30 -i frame-%04d.png -c:v libvpx-vp9 output.webm
 */

import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

/**
 * Encode a directory of PNG frames to MP4 via ffmpeg.
 *
 * @param {object} opts
 * @param {string} opts.inputDir — directory containing frame-NNNN.png files
 * @param {string} opts.output — output file path (.mp4 or .webm)
 * @param {number} opts.fps
 * @param {string} [opts.codec='libx264'] — ffmpeg codec name
 * @param {string} [opts.preset='medium'] — x264 preset (ultrafast, fast, medium, slow)
 * @param {string} [opts.crf='23'] — quality (0-51, lower = better)
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 * @returns {Promise<string>} output file path
 */
export function encodeWithFFmpeg({
  inputDir,
  output,
  fps,
  codec = 'libx264',
  preset = 'medium',
  crf = '23',
  width,
  height,
}) {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',                    // overwrite output
      '-framerate', String(fps),
      '-i', path.join(inputDir, 'frame-%04d.png'),
      '-c:v', codec,
      '-pix_fmt', 'yuv420p',
      '-preset', preset,
      '-crf', crf,
    ]

    if (width && height) {
      args.push('-s', `${width}x${height}`)
    }

    // WebM needs different params
    if (output.endsWith('.webm')) {
      args.push('-b:v', '1M')  // VP9 bitrate
    }

    args.push(output)

    const ffmpeg = spawn('ffmpeg', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    let stderr = ''

    ffmpeg.stderr.on('data', (data) => {
      stderr += data.toString()
    })

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(output)
      } else {
        reject(new Error(`ffmpeg exited with code ${code}: ${stderr}`))
      }
    })

    ffmpeg.on('error', (err) => {
      reject(new Error(`ffmpeg not found or failed to start: ${err.message}`))
    })
  })
}

/**
 * High-level encode function with validation.
 *
 * @param {object} opts
 * @param {string[]} opts.frames — array of PNG file paths
 * @param {string} opts.output
 * @param {number} opts.fps
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 * @param {string} [opts.format='mp4']
 * @param {object} [opts.codecOpts] — passed to encodeWithFFmpeg
 * @returns {Promise<string>}
 */
export async function encodeVideo({
  frames,
  output,
  fps,
  width,
  height,
  format = 'mp4',
  codecOpts = {},
}) {
  // Ensure frames are numbered sequentially
  if (!frames || frames.length === 0) {
    throw new Error('No frames to encode')
  }

  // If frames are already in a directory with frame-0001.png naming, use directly
  const inputDir = path.dirname(frames[0])

  // Verify ffmpeg is available
  try {
    await new Promise((resolve, reject) => {
      const test = spawn('ffmpeg', ['-version'], { stdio: 'ignore' })
      test.on('close', (code) => code === 0 ? resolve() : reject(new Error('ffmpeg not found')))
      test.on('error', () => reject(new Error('ffmpeg not found')))
    })
  } catch {
    throw new Error('ffmpeg is not installed. Install ffmpeg: https://ffmpeg.org/download.html')
  }

  return encodeWithFFmpeg({
    inputDir,
    output,
    fps,
    width,
    height,
    ...codecOpts,
  })
}
