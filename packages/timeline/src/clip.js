/**
 * Clip — media clip within a track.
 *
 * A clip references a media source and defines its position on the timeline.
 * Clips can have keyframe tracks for animated properties.
 */

export class Clip {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {string} opts.source — URL or asset ID
   * @param {number} opts.inPoint — timeline start (seconds)
   * @param {number} opts.outPoint — timeline end (seconds)
   * @param {number} [opts.sourceStart=0] — source media start (seconds)
   * @param {import('./keyframe.js').KeyframeTrack[]} [opts.keyframes]
   * @param {object} [opts.props] — arbitrary clip properties (opacity, scale, etc.)
   */
  constructor({ id, source, inPoint, outPoint, sourceStart = 0, keyframes = [], props = {} }) {
    this.id = id
    this.source = source
    this.inPoint = inPoint
    this.outPoint = outPoint
    this.sourceStart = sourceStart
    this.keyframes = keyframes
    this.props = { opacity: 1, scale: 1, rotation: 0, x: 0, y: 0, ...props }
  }

  /** Duration of the clip on the timeline (seconds) */
  get duration() {
    return this.outPoint - this.inPoint
  }

  /** Whether the clip is active at a given timeline time */
  isActiveAt(time) {
    return time >= this.inPoint && time < this.outPoint
  }

  /** Get the source time for a given timeline time */
  sourceTimeAt(timelineTime) {
    return this.sourceStart + (timelineTime - this.inPoint)
  }

  /** Get interpolated property at timeline time using keyframes */
  getPropAt(prop, timelineTime) {
    const kt = this.keyframes.find(k => k.property === prop)
    if (!kt) return this.props[prop]
    return kt.getValueAt(this.sourceTimeAt(timelineTime))
  }

  /** Get all interpolated props at a timeline time */
  getPropsAt(timelineTime) {
    const result = { ...this.props }
    for (const kt of this.keyframes) {
      result[kt.property] = kt.getValueAt(this.sourceTimeAt(timelineTime))
    }
    return result
  }

  toJSON() {
    return {
      id: this.id,
      source: this.source,
      inPoint: this.inPoint,
      outPoint: this.outPoint,
      sourceStart: this.sourceStart,
      keyframes: this.keyframes.map(k => k.toJSON()),
      props: { ...this.props },
    }
  }
}
