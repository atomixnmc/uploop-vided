/**
 * RenderPipeline — render timeline to file
 */

export class RenderPipeline {
  constructor() { throw new Error('@uploop/output: RenderPipeline not implemented') }
  async render(timeline) { throw new Error('not implemented') }
  async renderRange(timeline, start, end) { throw new Error('not implemented') }
  abort() { throw new Error('not implemented') }
  get progress() { return 0 }
}
