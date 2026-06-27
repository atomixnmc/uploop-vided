/**
 * Sequence — ordered list of timelines that play in sequence.
 *
 * A sequence holds multiple timelines and plays them one after another.
 * Useful for scene-based video composition.
 */

export class Sequence {
  /**
   * @param {object} [opts]
   * @param {string} [opts.id]
   * @param {string} [opts.name='Untitled Sequence']
   * @param {import('./timeline.js').Timeline[]} [opts.timelines=[]]
   */
  constructor({
    id = crypto.randomUUID?.() ?? `seq-${Date.now()}`,
    name = 'Untitled Sequence',
    timelines = [],
  } = {}) {
    this.id = id
    this.name = name
    /** @type {import('./timeline.js').Timeline[]} */
    this.timelines = [...timelines]
  }

  addTimeline(tl) {
    this.timelines.push(tl)
  }

  removeTimeline(id) {
    this.timelines = this.timelines.filter(t => t.id !== id)
  }

  /** Total duration of the entire sequence */
  get duration() {
    return this.timelines.reduce((sum, tl) => sum + tl.duration, 0)
  }

  /**
   * Get the timeline and local time for a sequence-global time.
   * @param {number} time — global time in seconds
   * @returns {{ timeline: import('./timeline.js').Timeline, localTime: number } | null}
   */
  resolveTime(time) {
    let offset = 0
    for (const tl of this.timelines) {
      if (time < offset + tl.duration) {
        return { timeline: tl, localTime: time - offset }
      }
      offset += tl.duration
    }
    return null
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      timelines: this.timelines.map(t => t.toJSON()),
    }
  }
}
