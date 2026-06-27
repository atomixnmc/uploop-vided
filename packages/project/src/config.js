/**
 * ProjectConfig — project-level settings serialized to project.json.
 *
 * Holds metadata about a project: resolution, framerate, name, author, etc.
 * Read/write to/from the project.json file in the project root.
 */

import fs from 'node:fs'
import path from 'node:path'

export class ProjectConfig {
  /** @type {{ width: number, height: number, fps: number, name: string }} */
  static defaults = {
    width: 1920,
    height: 1080,
    fps: 30,
    name: 'Untitled',
  }

  /**
   * @param {object} opts
   * @param {string} [opts.name='Untitled']
   * @param {number} [opts.width=1920]
   * @param {number} [opts.height=1080]
   * @param {number} [opts.fps=30]
   * @param {string} [opts.description='']
   * @param {string} [opts.author='']
   * @param {string} [opts.version='0.1.0']
   * @param {string} [opts.id]
   */
  constructor({
    name = ProjectConfig.defaults.name,
    width = ProjectConfig.defaults.width,
    height = ProjectConfig.defaults.height,
    fps = ProjectConfig.defaults.fps,
    description = '',
    author = '',
    version = '0.1.0',
    id,
  } = {}) {
    this.name = name
    this.width = width
    this.height = height
    this.fps = fps
    this.description = description
    this.author = author
    this.version = version
    this.id = id ?? crypto.randomUUID?.() ?? `proj-${Date.now()}`
  }

  /**
   * Write config to project.json in the given project directory.
   * @param {string} projectDir — absolute path to project root
   */
  save(projectDir) {
    const filePath = path.join(projectDir, 'project.json')
    const data = JSON.stringify(this.toJSON(), null, 2)
    fs.mkdirSync(projectDir, { recursive: true })
    fs.writeFileSync(filePath, data, 'utf-8')
  }

  /**
   * Read config from project.json in the given project directory.
   * @param {string} projectDir — absolute path to project root
   * @returns {ProjectConfig}
   */
  static load(projectDir) {
    const filePath = path.join(projectDir, 'project.json')
    if (!fs.existsSync(filePath)) {
      throw new Error(`project.json not found in ${projectDir}`)
    }
    const raw = fs.readFileSync(filePath, 'utf-8')
    const json = JSON.parse(raw)
    return ProjectConfig.fromJSON(json)
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      width: this.width,
      height: this.height,
      fps: this.fps,
      description: this.description,
      author: this.author,
      version: this.version,
    }
  }

  /**
   * Deserialize from a plain object.
   * @param {object} json
   * @returns {ProjectConfig}
   */
  static fromJSON(json) {
    return new ProjectConfig({
      id: json.id,
      name: json.name,
      width: json.width,
      height: json.height,
      fps: json.fps,
      description: json.description,
      author: json.author,
      version: json.version,
    })
  }
}
