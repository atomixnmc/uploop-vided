/**
 * EditorApp — main editor orchestrator.
 *
 * Mounts the five UI panels (player, timeline-ui, preview, inspector, library)
 * into a container element. Manages project loading/saving, track/clip CRUD,
 * and render pipeline.
 */

import { Timeline, Track, Clip } from '@uploop/timeline'
import { Compositor } from '@uploop/compositor'
import { Project, ProjectConfig } from '@uploop/project'

// UI web components — each is a custom element registered by @uploop/vided-ui
import {
  UploopPlayer,
  UploopTimeline,
  UploopPreview,
  UploopInspector,
  UploopLibrary,
} from '@uploop/vided-ui'

export class EditorApp {
  /**
   * @param {object} opts
   * @param {import('@uploop/project').Project} [opts.project] — existing Project instance
   * @param {HTMLElement} opts.container — DOM element to mount the editor into
   */
  constructor({ project, container }) {
    if (!container || !(container instanceof HTMLElement)) {
      throw new Error('EditorApp requires a valid container HTMLElement')
    }

    /** @type {HTMLElement} */
    this.container = container

    /** @type {import('@uploop/project').Project|null} */
    this._project = project ?? null

    /** @type {import('@uploop/timeline').Timeline|null} */
    this._timeline = null

    /** @type {import('@uploop/compositor').Compositor|null} */
    this._compositor = null

    /** @type {{ player: any, timeline: any, preview: any, inspector: any, library: any }} */
    this.ui = {
      player: null,
      timeline: null,
      preview: null,
      inspector: null,
      library: null,
    }

    // If a project was passed in, build timeline + compositor immediately
    if (this._project) {
      this._buildFromProject()
    }

    this._mount()
  }

  /** @returns {import('@uploop/project').Project|null} */
  get project() {
    return this._project
  }

  /** @returns {import('@uploop/timeline').Timeline|null} */
  get timeline() {
    return this._timeline
  }

  /** @returns {import('@uploop/compositor').Compositor|null} */
  get compositor() {
    return this._compositor
  }

  // ── project lifecycle ────────────────────────────────────────

  /**
   * Load an existing project from disk and wire up editor state.
   * @param {string} projectDir
   */
  loadProject(projectDir) {
    this._project = Project.load(projectDir)
    this._buildFromProject()
    this._syncUI()
  }

  /**
   * Create a brand new project (in-memory) and initialize editor state.
   * The project is not persisted to disk until saveProject() is called.
   * @param {object} opts
   * @param {string} opts.name
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {number} opts.fps
   */
  newProject({ name, width, height, fps }) {
    const config = new ProjectConfig({ name, width, height, fps })
    this._project = new Project({ rootDir: '', config })
    this._timeline = new Timeline({ name, fps, width, height })
    this._compositor = new Compositor({ width, height })
    this._syncUI()
  }

  /**
   * Persist current project config to disk.
   * Requires rootDir to be set (i.e. project was loaded, not created in-memory).
   */
  saveProject() {
    if (!this._project) throw new Error('No project loaded')
    if (!this._project.rootDir) {
      throw new Error('Project has no rootDir — cannot save. Use loadProject() to open an existing project first.')
    }
    this._project.config.save(this._project.rootDir)
  }

  // ── timeline editing ─────────────────────────────────────────

  /**
   * Add a new track to the timeline.
   * @param {'video'|'audio'|'image'|'text'|'effect'} type
   * @param {string} [name]
   * @returns {import('@uploop/timeline').Track}
   */
  addTrack(type, name = '') {
    if (!this._timeline) throw new Error('No timeline loaded')
    const id = crypto.randomUUID?.() ?? `track-${Date.now()}`
    const track = new Track({ id, type, muted: false, volume: 1 })
    this._timeline.addTrack(track)
    return track
  }

  /**
   * Add a clip to a specific track.
   * @param {string} trackId
   * @param {object} clipData — { id, source, inPoint, outPoint, sourceStart, props }
   * @returns {import('@uploop/timeline').Clip}
   */
  addClip(trackId, clipData) {
    if (!this._timeline) throw new Error('No timeline loaded')
    const track = this._timeline.getTrack(trackId)
    if (!track) throw new Error(`Track ${trackId} not found`)

    const clip = new Clip({
      id: clipData.id ?? crypto.randomUUID?.() ?? `clip-${Date.now()}`,
      source: clipData.source ?? '',
      inPoint: clipData.inPoint ?? 0,
      outPoint: clipData.outPoint ?? 1,
      sourceStart: clipData.sourceStart ?? 0,
      props: clipData.props ?? {},
    })
    track.addClip(clip)
    return clip
  }

  // ── render ───────────────────────────────────────────────────

  /**
   * Render the current timeline — composites each frame.
   * @param {string} outputPath — where the output file will be written
   */
  async render(outputPath) {
    if (!this._compositor || !this._timeline) {
      throw new Error('No compositor or timeline available for rendering')
    }
    const duration = this._timeline.duration
    const fps = this._timeline.fps
    const totalFrames = Math.ceil(duration * fps)
    for (let f = 0; f < totalFrames; f++) {
      const time = f / fps
      await this._compositor.render(time)
    }
    // In the future: @uploop/output will handle encoding to outputPath
    return { outputPath, totalFrames, duration, fps }
  }

  // ── internals ────────────────────────────────────────────────

  _buildFromProject() {
    if (!this._project) return
    const cfg = this._project.config
    this._timeline = new Timeline({
      name: cfg.name,
      fps: cfg.fps,
      width: cfg.width,
      height: cfg.height,
    })
    this._compositor = new Compositor({
      width: cfg.width,
      height: cfg.height,
    })
  }

  /** Mount the five UI web components into the container. */
  _mount() {
    this.container.innerHTML = ''

    // Layout grid: toolbar on top, center row (preview | inspector), timeline bottom
    this.container.style.cssText = `
      display: grid;
      grid-template-rows: 60px 1fr 200px;
      grid-template-columns: 1fr 300px;
      grid-template-areas:
        "toolbar toolbar"
        "preview inspector"
        "timeline timeline";
      width: 100%;
      height: 100%;
      background: #1a1a2e;
      color: #eee;
      font-family: system-ui, sans-serif;
    `

    // ── Toolbar ─────────────────────────────────────────────
    const toolbar = document.createElement('div')
    toolbar.style.gridArea = 'toolbar'
    toolbar.style.cssText =
      'display:flex;align-items:center;padding:0 16px;gap:12px;border-bottom:1px solid #333;'
    toolbar.innerHTML = `
      <span id="editor-project-name" style="font-weight:600;font-size:14px;">Uploop Editor</span>
      <span style="flex:1"></span>
      <button id="editor-btn-save">Save</button>
      <button id="editor-btn-export">Export</button>
    `
    this.container.appendChild(toolbar)

    // ── Player (in toolbar) ────────────────────────────────
    const player = document.createElement('uploop-player')
    player.id = 'uploop-player'
    toolbar.appendChild(player)
    this.ui.player = player

    // ── Preview panel ──────────────────────────────────────
    const previewWrap = document.createElement('div')
    previewWrap.style.gridArea = 'preview'
    previewWrap.style.cssText =
      'display:flex;align-items:center;justify-content:center;background:#000;'
    const preview = document.createElement('uploop-preview')
    preview.id = 'uploop-preview'
    previewWrap.appendChild(preview)
    this.container.appendChild(previewWrap)
    this.ui.preview = preview

    // ── Inspector panel ────────────────────────────────────
    const inspectorWrap = document.createElement('div')
    inspectorWrap.style.gridArea = 'inspector'
    inspectorWrap.style.cssText = 'border-left:1px solid #333;overflow-y:auto;'
    const inspector = document.createElement('uploop-inspector')
    inspector.id = 'uploop-inspector'
    inspectorWrap.appendChild(inspector)
    this.container.appendChild(inspectorWrap)
    this.ui.inspector = inspector

    // ── Library panel (hidden by default) ──────────────────
    const library = document.createElement('uploop-library')
    library.id = 'uploop-library'
    library.style.display = 'none'
    this.container.appendChild(library)
    this.ui.library = library

    // ── Timeline panel (bottom strip) ──────────────────────
    const tlWrap = document.createElement('div')
    tlWrap.style.gridArea = 'timeline'
    tlWrap.style.cssText = 'border-top:1px solid #333;'
    const timelineEl = document.createElement('uploop-timeline')
    timelineEl.id = 'uploop-timeline'
    tlWrap.appendChild(timelineEl)
    this.container.appendChild(tlWrap)
    this.ui.timeline = timelineEl

    // Wire toolbar button events
    const btnSave = toolbar.querySelector('#editor-btn-save')
    const btnExport = toolbar.querySelector('#editor-btn-export')

    btnSave?.addEventListener('click', () => {
      try {
        this.saveProject()
      } catch (err) {
        console.error('[editor] Save failed:', err)
      }
    })

    btnExport?.addEventListener('click', () => {
      const outputPath = prompt('Output file path:', './output.mp4')
      if (outputPath) {
        this.render(outputPath).catch(err =>
          console.error('[editor] Render failed:', err),
        )
      }
    })
  }

  /** Sync UI component properties from project/timeline state. */
  _syncUI() {
    const nameEl = this.container.querySelector('#editor-project-name')
    if (nameEl && this._project) {
      nameEl.textContent = this._project.name
    }
    if (this.ui.timeline && this._timeline) {
      this.ui.timeline.setAttribute(
        'data-timeline',
        JSON.stringify(this._timeline.toJSON()),
      )
    }
  }
}

/**
 * Convenience factory — creates an EditorApp and returns it.
 * @param {object} opts
 * @param {HTMLElement} opts.container
 * @param {import('@uploop/project').Project} [opts.project]
 * @returns {EditorApp}
 */
export function createEditor({ container, project }) {
  return new EditorApp({ container, project })
}
