/**
 * Track — single timeline track containing ordered clips.
 */

export class Track {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {'video'|'audio'|'image'|'text'|'effect'} opts.type
   * @param {boolean} [opts.muted=false]
   * @param {number} [opts.volume=1] — 0..1
   * @param {import('./clip.js').Clip[]} [opts.clips=[]]
   */
  constructor({ id, type, muted = false, volume = 1, clips = [] }) {
    this.id = id
    this.type = type
    this.muted = muted
    this.volume = volume
    /** @type {import('./clip.js').Clip[]} */
    this.clips = [...clips]
  }

  /** Add a clip, maintaining inPoint order */
  addClip(clip) {
    this.clips.push(clip)
    this.clips.sort((a, b) => a.inPoint - b.inPoint)
  }

  /** Remove a clip by id */
  removeClip(id) {
    this.clips = this.clips.filter(c => c.id !== id)
  }

  /** Get clip at timeline time */
  getClipAt(time) {
    return this.clips.find(c => c.isActiveAt(time)) || null
  }

  /** Get all clips active at timeline time */
  getClipsAt(time) {
    return this.clips.filter(c => c.isActiveAt(time))
  }

  /** Track duration — end of the last clip */
  get duration() {
    if (this.clips.length === 0) return 0
    return Math.max(...this.clips.map(c => c.outPoint))
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      muted: this.muted,
      volume: this.volume,
      clips: this.clips.map(c => c.toJSON()),
    }
  }
}
