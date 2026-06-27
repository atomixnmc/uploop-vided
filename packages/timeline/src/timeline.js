/**
 * Timeline — multi-track sequencing container.
 *
 * Holds an ordered list of tracks. Computes overall duration from the longest
 * track. Serializable to/from JSON.
 */

export class Timeline {
  /**
   * @param {object} opts
   * @param {string} [opts.id]
   * @param {string} [opts.name='Untitled']
   * @param {number} [opts.fps=30]
   * @param {number} [opts.width=1920]
   * @param {number} [opts.height=1080]
   * @param {import('./track.js').Track[]} [opts.tracks=[]]
   */
  constructor({
    id = crypto.randomUUID?.() ?? `tl-${Date.now()}`,
    name = 'Untitled',
    fps = 30,
    width = 1920,
    height = 1080,
    tracks = [],
  } = {}) {
    this.id = id
    this.name = name
    this.fps = fps
    this.width = width
    this.height = height
    /** @type {import('./track.js').Track[]} */
    this.tracks = [...tracks]
  }

  addTrack(track) {
    this.tracks.push(track)
  }

  removeTrack(id) {
    this.tracks = this.tracks.filter(t => t.id !== id)
  }

  getTrack(id) {
    return this.tracks.find(t => t.id === id) || null
  }

  /** Overall timeline duration — the end of the longest track */
  get duration() {
    if (this.tracks.length === 0) return 0
    return Math.max(...this.tracks.map(t => t.duration), 0)
  }

  /** Get all active clips at a given time, across all tracks */
  getActiveClips(time) {
    /** @type {{ track: import('./track.js').Track, clip: import('./clip.js').Clip }[]} */
    const result = []
    for (const track of this.tracks) {
      if (track.muted) continue
      const clip = track.getClipAt(time)
      if (clip) result.push({ track, clip })
    }
    return result
  }

  /** Frame-accurate time for a given frame number */
  frameToTime(frame) {
    return frame / this.fps
  }

  /** Total frame count */
  get frameCount() {
    return Math.ceil(this.duration * this.fps)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      fps: this.fps,
      width: this.width,
      height: this.height,
      tracks: this.tracks.map(t => t.toJSON()),
    }
  }

  /** Deserialize from JSON */
  static fromJSON(json) {
    // Circular import avoidance — import Track and Clip here
    // For now we return a basic reconstruction
    const tl = new Timeline({
      id: json.id,
      name: json.name,
      fps: json.fps,
      width: json.width,
      height: json.height,
    })
    // Tracks and clips need reconstruction — handled by caller for now
    return tl
  }
}
