/**
 * Project — top-level orchestrator for an uploop-vided project.
 *
 * Manages folder structure, project config, render output directories,
 * and asset paths. Creates the canonical directory layout on disk:
 *
 *   <rootDir>/
 *     project.json
 *     assets/
 *     timelines/
 *     sequences/
 *     renders/<renderId>/frames/
 *     exports/
 */

import fs from 'node:fs'
import path from 'node:path'
import { ProjectConfig } from './config.js'

const SUBDIRS = ['assets', 'timelines', 'sequences', 'renders', 'exports']

export class Project {
  /**
   * @param {object} opts
   * @param {string} opts.rootDir — absolute path to project root
   * @param {ProjectConfig} [opts.config] — pre-built config (avoids loading from disk)
   */
  constructor({ rootDir, config }) {
    /** @type {string} */
    this.rootDir = path.resolve(rootDir)

    /** @type {ProjectConfig} */
    this.config = config ?? Project._tryLoadConfig(this.rootDir)
  }

  // ── computed paths ──────────────────────────────────────────

  /** @returns {{ config: string, assets: string, timelines: string, renders: string, sequences: string, exports: string }} */
  get paths() {
    const r = this.rootDir
    return {
      config: path.join(r, 'project.json'),
      assets: path.join(r, 'assets'),
      timelines: path.join(r, 'timelines'),
      renders: path.join(r, 'renders'),
      sequences: path.join(r, 'sequences'),
      exports: path.join(r, 'exports'),
    }
  }

  /** @returns {string} */
  get id() {
    return this.config.id
  }

  /** @returns {string} */
  get name() {
    return this.config.name
  }

  // ── static factories ─────────────────────────────────────────

  /**
   * Create a new project on disk — writes folder structure and project.json.
   * @param {string} rootDir — absolute path
   * @param {object} opts
   * @param {string} opts.name
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {number} opts.fps
   * @returns {Project}
   */
  static create(rootDir, { name, width, height, fps }) {
    const abs = path.resolve(rootDir)

    // Build folder tree
    fs.mkdirSync(abs, { recursive: true })
    for (const sub of SUBDIRS) {
      fs.mkdirSync(path.join(abs, sub), { recursive: true })
    }

    const config = new ProjectConfig({ name, width, height, fps })
    config.save(abs)

    return new Project({ rootDir: abs, config })
  }

  /**
   * Load an existing project from disk.
   * @param {string} rootDir — absolute path
   * @returns {Project}
   */
  static load(rootDir) {
    const abs = path.resolve(rootDir)
    const config = ProjectConfig.load(abs)
    // Ensure subdirs exist (may have been created by a different tool)
    for (const sub of SUBDIRS) {
      const p = path.join(abs, sub)
      if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true })
    }
    return new Project({ rootDir: abs, config })
  }

  // ── renders ──────────────────────────────────────────────────

  /**
   * Create a render output directory and return its full path.
   * @param {string} renderId
   * @returns {string} absolute path to the render directory
   */
  createRender(renderId) {
    const renderDir = path.join(this.paths.renders, renderId)
    const framesDir = path.join(renderDir, 'frames')
    fs.mkdirSync(framesDir, { recursive: true })
    return renderDir
  }

  /**
   * List all render subdirectories.
   * @returns {string[]} render directory names
   */
  listRenders() {
    const rendersDir = this.paths.renders
    if (!fs.existsSync(rendersDir)) return []
    return fs.readdirSync(rendersDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
  }

  // ── serialization ────────────────────────────────────────────

  toJSON() {
    return {
      rootDir: this.rootDir,
      config: this.config.toJSON(),
      renders: this.listRenders(),
    }
  }

  /**
   * Reconstitute from JSON (no disk side-effects).
   * @param {object} json
   * @returns {Project}
   */
  static fromJSON(json) {
    return new Project({
      rootDir: json.rootDir,
      config: ProjectConfig.fromJSON(json.config),
    })
  }

  // ── internal helpers ─────────────────────────────────────────

  /**
   * Try loading config; fall back to defaults if project.json missing.
   * @param {string} dir
   * @returns {ProjectConfig}
   */
  static _tryLoadConfig(dir) {
    try {
      return ProjectConfig.load(dir)
    } catch {
      return new ProjectConfig()
    }
  }
}

/**
 * Convenience alias for Project.create.
 * @param {string} rootDir
 * @param {object} opts
 * @returns {Project}
 */
export function createProject(rootDir, opts) {
  return Project.create(rootDir, opts)
}

/**
 * Convenience alias for Project.load.
 * @param {string} rootDir
 * @returns {Project}
 */
export function loadProject(rootDir) {
  return Project.load(rootDir)
}
