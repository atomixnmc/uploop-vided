/**
 * UploopPreview — canvas preview web component
 *
 * <uploop-preview width="640" height="360"></uploop-preview>
 */

import { Timeline, Track, Clip } from '@uploop/timeline'
import { Compositor, Layer, Effect, blendModes } from '@uploop/compositor'

const CSS = /* css */ `
:host {
  display: inline-block;
  background: #0a0a0f;
  border: 1px solid #222;
  border-radius: 6px;
  overflow: hidden;
}
canvas {
  display: block;
}
`

const OVERLAY_COLORS = {
  grid: '#1a1a2a',
  safe: '#ff334488',
}

export class UploopPreview extends HTMLElement {
  static get observedAttributes() {
    return ['width', 'height']
  }

  constructor() {
    super()
    this._overlay = null
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this._render()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.shadowRoot?.querySelector('canvas')) return
    const canvas = this.shadowRoot.querySelector('canvas')
    if (name === 'width') canvas.width = parseInt(newVal) || 640
    if (name === 'height') canvas.height = parseInt(newVal) || 360
  }

  _render() {
    const w = parseInt(this.getAttribute('width')) || 640
    const h = parseInt(this.getAttribute('height')) || 360

    this.shadowRoot.innerHTML = /* html */ `
      <style>${CSS}</style>
      <canvas width="${w}" height="${h}"></canvas>
    `
  }

  get canvas() {
    return this.shadowRoot?.querySelector('canvas') ?? null
  }

  /**
   * Render a Timeline or Compositor onto the canvas at a given time.
   * @param {Timeline|Compositor} tlOrComp
   * @param {number} time
   */
  async render(tlOrComp, time) {
    const canvas = this.canvas
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dark background
    ctx.fillStyle = '#0a0a0f'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    if (tlOrComp instanceof Compositor) {
      // Delegate to compositor's own render pipeline
      await tlOrComp.renderTo(ctx, time)
    } else if (tlOrComp instanceof Timeline) {
      // Simple clip-representation render when given a Timeline
      const active = tlOrComp.getActiveClips(time)
      for (const { clip } of active) {
        const src = clip.source
        ctx.fillStyle = '#44ff8833'
        ctx.strokeStyle = '#44ff88'
        ctx.lineWidth = 1
        ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20)
        ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)

        ctx.fillStyle = '#e0e0e0'
        ctx.font = '14px system-ui'
        ctx.textAlign = 'center'
        ctx.fillText(`Clip: ${src.slice(-30) || clip.id}`, canvas.width / 2, canvas.height / 2)
        ctx.fillText(
          `${clip.inPoint.toFixed(1)}s → ${clip.outPoint.toFixed(1)}s`,
          canvas.width / 2,
          canvas.height / 2 + 20,
        )
      }
    }

    // Draw overlay if active
    if (this._overlay) {
      this._drawOverlay(ctx, canvas.width, canvas.height)
    }
  }

  /**
   * Show an overlay: 'grid', 'safe-zone', or null to clear.
   * @param {'grid'|'safe-zone'|null} type
   */
  showOverlay(type) {
    this._overlay = type
    const canvas = this.canvas
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    this._drawOverlay(ctx, canvas.width, canvas.height)
  }

  _drawOverlay(ctx, w, h) {
    if (this._overlay === 'grid') {
      ctx.strokeStyle = OVERLAY_COLORS.grid
      ctx.lineWidth = 0.5
      const thirds = w / 3
      for (let i = 1; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(i * thirds, 0)
        ctx.lineTo(i * thirds, h)
        ctx.stroke()
        const hthirds = h / 3
        ctx.beginPath()
        ctx.moveTo(0, i * hthirds)
        ctx.lineTo(w, i * hthirds)
        ctx.stroke()
      }
    }

    if (this._overlay === 'safe-zone') {
      const margin = 0.05
      const sx = w * margin
      const sy = h * margin
      const sw = w * (1 - 2 * margin)
      const sh = h * (1 - 2 * margin)

      ctx.fillStyle = OVERLAY_COLORS.safe
      ctx.fillRect(0, 0, w, sy)
      ctx.fillRect(0, h - sy, w, sy)
      ctx.fillRect(0, sy, sx, sh)
      ctx.fillRect(w - sx, sy, sx, sh)

      ctx.strokeStyle = '#ff3344'
      ctx.lineWidth = 1
      ctx.strokeRect(sx, sy, sw, sh)
    }
  }

  disconnectedCallback() {
    // cleanup
  }
}

customElements.define('uploop-preview', UploopPreview)
