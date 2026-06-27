/**
 * UploopPlayer — media player web component
 *
 * <uploop-player src="..." width="640" height="360"></uploop-player>
 */

const DEFAULT_SRCS = Object.freeze([
  'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4',
  'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4',
])

const CSS = /* css */ `
:host {
  display: inline-block;
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  border: 1px solid #222;
  border-radius: 6px;
  overflow: hidden;
}
#container {
  display: flex;
  flex-direction: column;
}
video {
  display: block;
  width: 100%;
  background: #000;
}
#controls {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  background: #151520;
  border-top: 1px solid #222;
}
button {
  background: none;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  font-size: 16px;
  padding: 2px 6px;
  border-radius: 3px;
}
button:hover { background: #222; }
#play-btn { min-width: 28px; }
#time {
  font-variant-numeric: tabular-nums;
  font-size: 12px;
  white-space: nowrap;
  min-width: 80px;
  text-align: center;
}
#progress-bar {
  flex: 1;
  height: 6px;
  background: #222;
  border-radius: 3px;
  cursor: pointer;
  position: relative;
}
#progress-fill {
  height: 100%;
  background: #4f8;
  border-radius: 3px;
  width: 0%;
  pointer-events: none;
}
#volume-container {
  display: flex;
  align-items: center;
  gap: 4px;
}
#volume-slider {
  width: 60px;
  accent-color: #4f8;
  cursor: pointer;
}
`

export class UploopPlayer extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'width', 'height']
  }

  constructor() {
    super()
    this._currentSrc = 0
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this._render()
    this._bind()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.shadowRoot?.querySelector('video')) return
    if (name === 'src') {
      this.shadowRoot.querySelector('video').src = newVal || this._getDefaultSrc()
    }
    if (name === 'width') {
      this.shadowRoot.querySelector('video').width = parseInt(newVal) || 640
    }
    if (name === 'height') {
      this.shadowRoot.querySelector('video').height = parseInt(newVal) || 360
    }
  }

  _getDefaultSrc() {
    const idx = this._currentSrc % DEFAULT_SRCS.length
    return DEFAULT_SRCS[idx]
  }

  _render() {
    const w = this.getAttribute('width') || '640'
    const h = this.getAttribute('height') || '360'
    const src = this.getAttribute('src') || this._getDefaultSrc()

    this.shadowRoot.innerHTML = /* html */ `
      <style>${CSS}</style>
      <div id="container">
        <video src="${src}" width="${w}" height="${h}" preload="metadata"></video>
        <div id="controls">
          <button id="play-btn" title="Play / Pause">▶</button>
          <span id="time">0:00 / 0:00</span>
          <div id="progress-bar">
            <div id="progress-fill"></div>
          </div>
          <div id="volume-container">
            <span>🔊</span>
            <input type="range" id="volume-slider" min="0" max="1" step="0.05" value="1" />
          </div>
        </div>
      </div>
    `
    this._video = this.shadowRoot.querySelector('video')
    this._playBtn = this.shadowRoot.querySelector('#play-btn')
    this._timeDisplay = this.shadowRoot.querySelector('#time')
    this._progressBar = this.shadowRoot.querySelector('#progress-bar')
    this._progressFill = this.shadowRoot.querySelector('#progress-fill')
    this._volumeSlider = this.shadowRoot.querySelector('#volume-slider')
  }

  _bind() {
    this._video.addEventListener('timeupdate', () => {
      this._updateProgress()
      this._dispatch('uploop:timeupdate', {
        currentTime: this._video.currentTime,
        duration: this._video.duration,
      })
    })
    this._video.addEventListener('ended', () => {
      this._playBtn.textContent = '▶'
      this._dispatch('uploop:ended')
    })
    this._video.addEventListener('play', () => {
      this._playBtn.textContent = '⏸'
      this._dispatch('uploop:play')
    })
    this._video.addEventListener('pause', () => {
      this._playBtn.textContent = '▶'
      this._dispatch('uploop:pause')
    })
    this._video.addEventListener('loadedmetadata', () => {
      this._updateTimeDisplay()
    })

    this._playBtn.addEventListener('click', () => {
      if (this._video.paused) this._video.play()
      else this._video.pause()
    })

    this._volumeSlider.addEventListener('input', () => {
      this._video.volume = parseFloat(this._volumeSlider.value)
    })

    this._progressBar.addEventListener('click', (e) => {
      const rect = this._progressBar.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      this._video.currentTime = ratio * this._video.duration
    })
  }

  _updateProgress() {
    if (!this._video.duration) return
    const pct = (this._video.currentTime / this._video.duration) * 100
    this._progressFill.style.width = pct + '%'
    this._updateTimeDisplay()
  }

  _updateTimeDisplay() {
    const cur = this._fmt(this._video.currentTime)
    const dur = this._fmt(this._video.duration) || '0:00'
    this._timeDisplay.textContent = `${cur} / ${dur}`
  }

  _fmt(secs) {
    if (!isFinite(secs)) return '0:00'
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  _dispatch(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }))
  }

  // --- Public API ---

  play() {
    this._video?.play()
  }

  pause() {
    this._video?.pause()
  }

  seek(time) {
    if (this._video) this._video.currentTime = time
  }

  setVolume(v) {
    const vol = Math.max(0, Math.min(1, v))
    if (this._video) this._video.volume = vol
    if (this._volumeSlider) this._volumeSlider.value = vol
  }

  get currentTime() {
    return this._video?.currentTime ?? 0
  }

  get duration() {
    return this._video?.duration ?? 0
  }

  get playing() {
    return this._video ? !this._video.paused : false
  }
}

customElements.define('uploop-player', UploopPlayer)
