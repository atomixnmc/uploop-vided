/**
 * UploopLibrary — media asset browser web component
 *
 * <uploop-library></uploop-library>
 */

const CSS = /* css */ `
:host {
  display: block;
  background: #0a0a0f;
  color: #e0e0e0;
  font-family: system-ui, sans-serif;
  border: 1px solid #222;
  border-radius: 6px;
  padding: 10px;
  overflow-y: auto;
}
#grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.card {
  background: #151520;
  border: 1px solid #222;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}
.card:hover {
  border-color: #4f8;
}
.card.selected {
  border-color: #4f8;
  box-shadow: 0 0 6px #4f844;
}
.thumb {
  width: 100%;
  height: 80px;
  object-fit: cover;
  background: #0a0a0f;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.info {
  padding: 6px 8px;
}
.info .name {
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.info .type-badge {
  font-size: 9px;
  color: #888;
  text-transform: uppercase;
}
`

const DEFAULT_ASSETS = Object.freeze([
  { id: 'video-bbb', type: 'video', name: 'Big Buck Bunny', src: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4', thumbnail: '🎬' },
  { id: 'video-jellyfish', type: 'video', name: 'Jellyfish', src: 'https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4', thumbnail: '🎬' },
  { id: 'video-sintel', type: 'video', name: 'Sintel', src: 'https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4', thumbnail: '🎬' },
  { id: 'audio-1', type: 'audio', name: 'Sample 1', src: 'https://www.samplelib.com/mp3/sample-3s.mp3', thumbnail: '🎵' },
  { id: 'audio-2', type: 'audio', name: 'Sample 2', src: 'https://www.samplelib.com/mp3/sample-6s.mp3', thumbnail: '🎵' },
  { id: 'audio-3', type: 'audio', name: 'Sample 3', src: 'https://www.samplelib.com/mp3/sample-9s.mp3', thumbnail: '🎵' },
  { id: 'audio-4', type: 'audio', name: 'Sample 4', src: 'https://www.samplelib.com/mp3/sample-12s.mp3', thumbnail: '🎵' },
  { id: 'audio-5', type: 'audio', name: 'Sample 5', src: 'https://www.samplelib.com/mp3/sample-15s.mp3', thumbnail: '🎵' },
  { id: 'img-1', type: 'image', name: 'Landscape 1', src: 'https://picsum.photos/seed/a/320/180', thumbnail: '🖼' },
  { id: 'img-2', type: 'image', name: 'Landscape 2', src: 'https://picsum.photos/seed/b/320/180', thumbnail: '🖼' },
  { id: 'img-3', type: 'image', name: 'Landscape 3', src: 'https://picsum.photos/seed/c/320/180', thumbnail: '🖼' },
  { id: 'img-4', type: 'image', name: 'Landscape 4', src: 'https://picsum.photos/seed/d/320/180', thumbnail: '🖼' },
])

const TYPE_ICONS = {
  video: '🎬',
  audio: '🎵',
  image: '🖼',
}

export class UploopLibrary extends HTMLElement {
  constructor() {
    super()
    /** @type {{ id: string, type: string, name: string, src: string, thumbnail?: string }[]} */
    this._assets = [...DEFAULT_ASSETS]
    this._selectedId = null
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    this._render()
  }

  _render() {
    this.shadowRoot.innerHTML = /* html */ `
      <style>${CSS}</style>
      <div id="grid"></div>
    `
    this._gridEl = this.shadowRoot.querySelector('#grid')
    this._renderGrid()
  }

  _renderGrid() {
    if (!this._gridEl) return
    this._gridEl.innerHTML = ''

    for (const asset of this._assets) {
      const card = document.createElement('div')
      card.className = 'card'
      if (asset.id === this._selectedId) card.classList.add('selected')
      card.dataset.id = asset.id

      const thumb = document.createElement('div')
      thumb.className = 'thumb'

      if (asset.type === 'image') {
        const img = document.createElement('img')
        img.src = asset.src
        img.alt = asset.name
        img.loading = 'lazy'
        thumb.appendChild(img)
      } else {
        thumb.textContent = TYPE_ICONS[asset.type] || '📁'
      }

      const info = document.createElement('div')
      info.className = 'info'

      const nameEl = document.createElement('div')
      nameEl.className = 'name'
      nameEl.textContent = asset.name
      nameEl.title = asset.name

      const typeBadge = document.createElement('div')
      typeBadge.className = 'type-badge'
      typeBadge.textContent = asset.type

      info.append(nameEl, typeBadge)
      card.append(thumb, info)

      card.addEventListener('click', () => {
        this._selectedId = asset.id
        this._renderGrid()
        this.dispatchEvent(new CustomEvent('uploop:asset-select', {
          bubbles: true, composed: true,
          detail: { asset: { ...asset } },
        }))
      })

      this._gridEl.appendChild(card)
    }
  }

  get assets() {
    return [...this._assets]
  }

  /**
   * Add an asset to the library.
   * @param {{ id: string, type: string, name: string, src: string, thumbnail?: string }} asset
   */
  addAsset(asset) {
    if (!asset.id || !asset.type || !asset.src) return
    const existing = this._assets.findIndex(a => a.id === asset.id)
    if (existing >= 0) {
      this._assets[existing] = { ...this._assets[existing], ...asset }
    } else {
      this._assets.push({ ...asset })
    }
    this._renderGrid()
  }

  /**
   * Remove an asset from the library by id.
   * @param {string} id
   */
  removeAsset(id) {
    this._assets = this._assets.filter(a => a.id !== id)
    if (this._selectedId === id) this._selectedId = null
    this._renderGrid()
  }

  disconnectedCallback() {
    // cleanup
  }
}

customElements.define('uploop-library', UploopLibrary)
