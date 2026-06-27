/**
 * Layer — single compositor layer.
 *
 * A layer has a source (media element, canvas, or nested compositor),
 * transform properties, blend mode, effects, and optional mask.
 */

export class Layer {
  /**
   * @param {object} opts
   * @param {string} opts.id
   * @param {string} opts.name
   * @param {HTMLImageElement|HTMLVideoElement|HTMLCanvasElement|ImageData|null} opts.source
   * @param {number} [opts.opacity=1]
   * @param {number} [opts.x=0]
   * @param {number} [opts.y=0]
   * @param {number} [opts.scaleX=1]
   * @param {number} [opts.scaleY=1]
   * @param {number} [opts.rotation=0]
   * @param {string} [opts.blendMode='normal']
   * @param {import('./effect.js').Effect[]} [opts.effects=[]]
   * @param {import('./mask.js').Mask|null} [opts.mask=null]
   * @param {boolean} [opts.visible=true]
   */
  constructor({
    id,
    name = '',
    source = null,
    opacity = 1,
    x = 0,
    y = 0,
    scaleX = 1,
    scaleY = 1,
    rotation = 0,
    blendMode = 'normal',
    effects = [],
    mask = null,
    visible = true,
  }) {
    this.id = id
    this.name = name
    this.source = source
    this.opacity = opacity
    this.x = x
    this.y = y
    this.scaleX = scaleX
    this.scaleY = scaleY
    this.rotation = rotation
    this.blendMode = blendMode
    this.effects = effects
    this.mask = mask
    this.visible = visible
  }

  /**
   * Draw the layer onto a canvas context.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} time — timeline time
   * @param {number} compW — compositor width
   * @param {number} compH — compositor height
   */
  async draw(ctx, time, compW, compH) {
    if (!this.source || !this.visible || this.opacity <= 0) return

    ctx.save()

    // Apply blend mode
    if (this.blendMode !== 'normal') {
      ctx.globalCompositeOperation = canvasBlendMode(this.blendMode)
    }

    ctx.globalAlpha = this.opacity

    // Apply transform
    ctx.translate(this.x + compW / 2, this.y + compH / 2)
    if (this.rotation) ctx.rotate(this.rotation)
    ctx.scale(this.scaleX, this.scaleY)
    ctx.translate(-compW / 2, -compH / 2)

    // Draw source
    if (this.source instanceof HTMLVideoElement) {
      ctx.drawImage(this.source, 0, 0, compW, compH)
    } else if (this.source instanceof HTMLImageElement || this.source instanceof HTMLCanvasElement) {
      ctx.drawImage(this.source, 0, 0, compW, compH)
    } else if (this.source instanceof ImageData) {
      ctx.putImageData(this.source, 0, 0)
    }

    ctx.restore()
  }
}

/** Map blend mode names to Canvas globalCompositeOperation values */
function canvasBlendMode(mode) {
  const map = {
    normal: 'source-over',
    multiply: 'multiply',
    screen: 'screen',
    overlay: 'overlay',
    darken: 'darken',
    lighten: 'lighten',
    add: 'lighter',
    subtract: 'difference',
  }
  return map[mode] || 'source-over'
}
