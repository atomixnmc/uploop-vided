/**
 * Composition — defines what to render and how.
 *
 * A composition is a self-contained unit of video content. It has a duration,
 * resolution, frame rate, and a render function that produces frames.
 *
 * Usage:
 *   const comp = new Composition({
 *     width: 1920, height: 1080, fps: 30, duration: 10,
 *     render: (frame, time) => `<div style="...">Frame ${frame}</div>`,
 *   })
 */

export class Composition {
  /**
   * @param {object} opts
   * @param {string} opts.id — unique identifier
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {number} opts.fps — frames per second
   * @param {number} opts.duration — total duration in seconds
   * @param {function} opts.render — (frame: number, time: number) => html string
   * @param {function} [opts.setup] — optional setup before rendering (injects styles, scripts)
   * @param {import('@uploop/timeline').Timeline} [opts.timeline] — optional uploop timeline
   */
  constructor({ id, width, height, fps, duration, render, setup, timeline }) {
    this.id = id
    this.width = width
    this.height = height
    this.fps = fps
    this.duration = duration
    this.render = render
    this.setup = setup
    this.timeline = timeline
  }

  /** Total number of frames */
  get frameCount() {
    return Math.ceil(this.duration * this.fps)
  }

  /** Get time (seconds) for a given frame number */
  frameToTime(frame) {
    return frame / this.fps
  }

  /** Get frame number for a given time */
  timeToFrame(time) {
    return Math.floor(time * this.fps)
  }
}

/**
 * Create a composition from a timeline.
 * @param {object} opts
 * @param {import('@uploop/timeline').Timeline} opts.timeline
 * @param {number} [opts.width]
 * @param {number} [opts.height]
 * @returns {Composition}
 */
export function createTimelineComposition({ timeline, width, height }) {
  return new Composition({
    id: timeline.id,
    width: width || timeline.width,
    height: height || timeline.height,
    fps: timeline.fps,
    duration: timeline.duration,
    timeline,
    render: (frame, time) => {
      const clips = timeline.getActiveClips(time)
      // Build HTML from active clips
      const layers = clips.map(({ track, clip }) => {
        const props = clip.getPropsAt(time)
        return {
          source: clip.source,
          type: track.type,
          ...props,
        }
      })
      return JSON.stringify({ time, frame, layers })
    },
  })
}
