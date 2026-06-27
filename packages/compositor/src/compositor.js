/**
 * Compositor — GPU-accelerated layer stack.
 *
 * Multi-layer compositor. Layers are stacked bottom-to-top with blend modes,
 * effects, and masks. In Phase 1, compositing is CPU/Canvas2D. GPU pipeline
 * (WebGL/WebGPU via uploop-ge) comes in Phase 2.
 */

export class Compositor {
  /**
   * @param {object} opts
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {import('./layer.js').Layer[]} [opts.layers=[]]
   */
  constructor({ width, height, layers = [] }) {
    this.width = width
    this.height = height
    /** @type {import('./layer.js').Layer[]} */
    this.layers = [...layers]
    this._canvas = null
    this._ctx = null
  }

  addLayer(layer) {
    this.layers.push(layer)
  }

  removeLayer(id) {
    this.layers = this.layers.filter(l => l.id !== id)
  }

  getLayer(id) {
    return this.layers.find(l => l.id === id) || null
  }

  /** Reorder layer by index */
  reorder(fromIndex, toIndex) {
    const [moved] = this.layers.splice(fromIndex, 1)
    this.layers.splice(toIndex, 0, moved)
  }

  /** Get or create the offscreen canvas */
  _getCanvas() {
    if (!this._canvas) {
      if (typeof OffscreenCanvas !== 'undefined') {
        this._canvas = new OffscreenCanvas(this.width, this.height)
        this._ctx = this._canvas.getContext('2d')
      }
    }
    return { canvas: this._canvas, ctx: this._ctx }
  }

  /**
   * Composite all visible layers and return an ImageData.
   * CPU-based compositing — for GPU see Phase 2.
   * @param {number} time — timeline time
   * @returns {Promise<ImageData|null>}
   */
  async render(time) {
    const { canvas, ctx } = this._getCanvas()
    if (!canvas || !ctx) return null

    ctx.clearRect(0, 0, this.width, this.height)

    // Draw layers bottom to top
    for (const layer of this.layers) {
      if (!layer.visible) continue
      await layer.draw(ctx, time, this.width, this.height)
    }

    return ctx.getImageData(0, 0, this.width, this.height)
  }

  /**
   * Render to an existing canvas context.
   * @param {CanvasRenderingContext2D} targetCtx
   * @param {number} time
   */
  async renderTo(targetCtx, time) {
    const imgData = await this.render(time)
    if (imgData) {
      targetCtx.putImageData(imgData, 0, 0)
    }
  }

  dispose() {
    this._canvas = null
    this._ctx = null
    this.layers = []
  }
}
