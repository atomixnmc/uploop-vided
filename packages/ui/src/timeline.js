/**
 * UploopTimeline — timeline editor web component
 *
 * <uploop-timeline></uploop-timeline>
 */

import { Timeline, Track, Clip } from '@uploop/timeline'

const CSS = /* css */ `
:host {
  display: block;
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  border: 1px solid #222;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
#toolbar {
  display: flex;
  gap: 6px;
  padding: 6px 10px;
  background: #151520;
  border-bottom: 1px solid #222;
}
#toolbar button {
  background: #151520;
  border: 1px solid #222;
  color: #e0e0e0;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 3px;
  font-size: 12px;
}
#toolbar button:hover { background: #222; }
#canvas-wrap {
  overflow-x: auto;
  overflow-y: auto;
  position: relative;
  flex: 1;
}
canvas {
  display: block;
}
`

const TRACK_HEIGHT = 48
const TRACK_HEADER_W = 120
const RULER_HEIGHT = 28
const PIXELS_PER_SECOND = 80
const CLIP_MIN_W = 4
const COLORS = ['#44ff88', '#44aaff', '#ff8844', '#ff44aa', '#aaff44', '#8844ff', '#ffaa44', '#44ffcc']

export class UploopTimeline extends HTMLElement {
  constructor() {
    super()
    this._timeline = null
    this._zoom = 1
    this._scrollLeft = 0
    this._currentTime = 0
    this._selectedClipId = null
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this._render()
    this._bind()
  }

  _render() {
    this.shadowRoot.innerHTML = /* html */ `
      <style>${CSS}</style>
      <div id="toolbar">
        <button id="btn-add-track" title="Add video track">+ Video</button>
        <button id="btn-add-audio" title="Add audio track">+ Audio</button>
        <span style="margin-left:auto;font-size:12px;color:#888">
          Scroll to zoom &amp; pan
        </span>
      </div>
      <div id="canvas-wrap">
        <canvas id="canvas"></canvas>
      </div>
    `
    this._canvas = this.shadowRoot.querySelector('#canvas')
    this._wrap = this.shadowRoot.querySelector('#canvas-wrap')
    this._ctx = this._canvas.getContext('2d')

    this.shadowRoot.querySelector('#btn-add-track').addEventListener('click', () => {
      this.addTrack('video')
    })
    this.shadowRoot.querySelector('#btn-add-audio').addEventListener('click', () => {
      this.addTrack('audio')
    })
  }

  _bind() {
    this._wrap.addEventListener('wheel', (e) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        this._zoom = Math.max(0.2, Math.min(5, this._zoom + e.deltaY * -0.001))
      } else {
        this._scrollLeft = Math.max(0, this._scrollLeft + e.deltaY)
      }
      this._draw()
    }, { passive: false })

    this._canvas.addEventListener('click', (e) => {
      const rect = this._canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left + this._scrollLeft
      const my = e.clientY - rect.top

      if (!this._timeline) return

      // Check ruler area click → seek
      if (my < RULER_HEIGHT) {
        const time = mx / (PIXELS_PER_SECOND * this._zoom)
        this._currentTime = Math.max(0, time)
        this._draw()
        return
      }

      // Check track clicks → select clip
      const trackY = my - RULER_HEIGHT
      const trackIdx = Math.floor(trackY / TRACK_HEIGHT)
      const track = this._timeline.tracks[trackIdx]
      if (!track) return

      for (const clip of track.clips) {
        const cx = clip.inPoint * PIXELS_PER_SECOND * this._zoom
        const cw = Math.max(CLIP_MIN_W, (clip.outPoint - clip.inPoint) * PIXELS_PER_SECOND * this._zoom)
        if (mx >= cx && mx <= cx + cw) {
          this._selectedClipId = clip.id
          this._draw()
          this.dispatchEvent(new CustomEvent('uploop:clip-select', {
            bubbles: true, composed: true,
            detail: { clip, trackId: track.id, trackType: track.type },
          }))
          return
        }
      }

      this._selectedClipId = null
      this._draw()
    })
  }

  /** @param {Timeline} timeline */
  set timeline(tl) {
    this._timeline = tl
    this._draw()
  }

  get timeline() { return this._timeline }

  set zoom(z) { this._zoom = Math.max(0.2, Math.min(5, z)); this._draw() }
  get zoom() { return this._zoom }

  set scrollLeft(s) { this._scrollLeft = Math.max(0, s); this._draw() }
  get scrollLeft() { return this._scrollLeft }

  set currentTime(t) { this._currentTime = Math.max(0, t); this._draw() }
  get currentTime() { return this._currentTime }

  _draw() {
    if (!this._canvas || !this._ctx) return

    const tl = this._timeline
    if (!tl) {
      this._canvas.width = 400
      this._canvas.height = 100
      this._ctx.fillStyle = '#e0e0e0'
      this._ctx.font = '14px system-ui'
      this._ctx.textAlign = 'center'
      this._ctx.fillText('No timeline set', 200, 50)
      return
    }

    const trackCount = Math.max(1, tl.tracks.length)
    const totalW = Math.max(600, (tl.duration || 30) * PIXELS_PER_SECOND * this._zoom + 200)
    const totalH = RULER_HEIGHT + trackCount * TRACK_HEIGHT

    this._canvas.width = totalW
    this._canvas.height = totalH

    const ctx = this._ctx
    ctx.clearRect(0, 0, totalW, totalH)

    // Scroll transform
    ctx.save()
    ctx.translate(-this._scrollLeft, 0)

    const pxSec = PIXELS_PER_SECOND * this._zoom
    const duration = tl.duration || 30

    // --- Ruler ---
    ctx.fillStyle = '#151520'
    ctx.fillRect(0, 0, Math.max(totalW + this._scrollLeft, duration * pxSec + 200), RULER_HEIGHT)

    const tickInterval = this._zoom > 2 ? 0.5 : this._zoom > 1 ? 1 : this._zoom > 0.5 ? 2 : 5
    ctx.fillStyle = '#888'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    for (let t = 0; t <= duration; t += tickInterval) {
      const x = t * pxSec
      ctx.beginPath()
      ctx.moveTo(x, RULER_HEIGHT - 8)
      ctx.lineTo(x, RULER_HEIGHT)
      ctx.strokeStyle = '#444'
      ctx.stroke()
      ctx.fillText(t.toFixed(tickInterval < 1 ? 1 : 0) + 's', x, 12)
    }

    // --- Playhead ---
    const px = this._currentTime * pxSec
    ctx.beginPath()
    ctx.moveTo(px, 0)
    ctx.lineTo(px, totalH)
    ctx.strokeStyle = '#ff3344'
    ctx.lineWidth = 1.5
    ctx.stroke()
    // Playhead triangle
    ctx.fillStyle = '#ff3344'
    ctx.beginPath()
    ctx.moveTo(px - 5, 0)
    ctx.lineTo(px + 5, 0)
    ctx.lineTo(px, 8)
    ctx.fill()

    // --- Tracks ---
    for (let i = 0; i < tl.tracks.length; i++) {
      const track = tl.tracks[i]
      const y = RULER_HEIGHT + i * TRACK_HEIGHT

      // Track header
      ctx.fillStyle = '#151520'
      ctx.fillRect(0, y, TRACK_HEADER_W, TRACK_HEIGHT)
      ctx.fillStyle = '#666'
      ctx.font = '11px system-ui'
      ctx.textAlign = 'left'
      ctx.fillText(track.type.toUpperCase(), 8, y + 18)
      ctx.fillText('#' + (i + 1), 8, y + 34)

      // Track lane
      ctx.fillStyle = '#0d0d18'
      ctx.fillRect(TRACK_HEADER_W, y, Math.max(totalW + this._scrollLeft, duration * pxSec + 200), TRACK_HEIGHT - 1)
      ctx.strokeStyle = '#1a1a2a'
      ctx.beginPath()
      ctx.moveTo(TRACK_HEADER_W, y + TRACK_HEIGHT - 1)
      ctx.lineTo(Math.max(totalW + this._scrollLeft, duration * pxSec + 200), y + TRACK_HEIGHT - 1)
      ctx.stroke()

      // Clips
      for (const clip of track.clips) {
        const cx = TRACK_HEADER_W + clip.inPoint * pxSec
        const cw = Math.max(CLIP_MIN_W, (clip.outPoint - clip.inPoint) * pxSec)
        const colorIdx = [...track.clips].indexOf(clip) % COLORS.length

        // Clip body
        ctx.fillStyle = clip.id === this._selectedClipId ? COLORS[colorIdx] : COLORS[colorIdx] + '88'
        ctx.strokeStyle = clip.id === this._selectedClipId ? '#fff' : COLORS[colorIdx]
        ctx.lineWidth = clip.id === this._selectedClipId ? 2 : 1
        const cy = y + 4
        const ch = TRACK_HEIGHT - 8
        const radius = 4
        this._roundRect(ctx, cx, cy, cw, ch, radius)
        ctx.fill()
        ctx.stroke()

        // Clip label
        if (cw > 30) {
          ctx.fillStyle = '#0a0a0f'
          ctx.font = '10px system-ui'
          ctx.textAlign = 'left'
          const label = (clip.source || clip.id).slice(-20)
          ctx.fillText(label, cx + 6, cy + ch / 2 + 4)
        }
      }
    }

    ctx.restore()
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  // --- Public API ---

  addTrack(type) {
    if (!this._timeline) {
      this._timeline = new Timeline()
    }
    const track = new Track({
      id: crypto.randomUUID?.() ?? `trk-${Date.now()}`,
      type: type || 'video',
    })
    this._timeline.addTrack(track)
    this._draw()
    return track
  }

  removeTrack(id) {
    if (this._timeline) {
      this._timeline.removeTrack(id)
      this._draw()
    }
  }

  addClip(trackId, clipData) {
    if (!this._timeline) return null
    const track = this._timeline.getTrack(trackId)
    if (!track) return null
    const clip = new Clip({
      id: clipData.id ?? crypto.randomUUID?.() ?? `clip-${Date.now()}`,
      source: clipData.source ?? '',
      inPoint: clipData.inPoint ?? 0,
      outPoint: clipData.outPoint ?? 5,
      sourceStart: clipData.sourceStart ?? 0,
      props: clipData.props ?? {},
    })
    track.addClip(clip)
    this._draw()
    return clip
  }

  moveClip(clipId, newInPoint) {
    if (!this._timeline) return
    for (const track of this._timeline.tracks) {
      const clip = track.clips.find(c => c.id === clipId)
      if (clip) {
        const dur = clip.duration
        clip.inPoint = newInPoint
        clip.outPoint = newInPoint + dur
        this._draw()
        return
      }
    }
  }

  disconnectedCallback() {
    // cleanup
  }
}

customElements.define('uploop-timeline', UploopTimeline)
