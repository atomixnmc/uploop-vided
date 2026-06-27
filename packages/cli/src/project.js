/**
 * Project manager — handles project creation, loading, and listing.
 *
 * Provides a filesystem-backed project store and project model since
 * @uploop/project is not yet implemented. Each project is a directory
 * containing a `project.json` file.
 */

import fs from 'node:fs'
import path from 'node:path'
import { Timeline, Track, Clip } from '@uploop/timeline'

/** @param {string} dir */
function resolveDir(dir) {
  return path.resolve(dir)
}

/**
 * Create a new project.
 *
 * @param {string} dir — project directory path
 * @param {object} config
 * @param {string} config.name
 * @param {number} [config.width=1920]
 * @param {number} [config.height=1080]
 * @param {number} [config.fps=30]
 * @returns {{ dir: string, project: object, timeline: Timeline }}
 */
export function createProject(dir, config) {
  const absDir = resolveDir(dir)
  fs.mkdirSync(absDir, { recursive: true })

  const project = {
    name: config.name,
    width: config.width || 1920,
    height: config.height || 1080,
    fps: config.fps || 30,
    createdAt: new Date().toISOString(),
  }

  // Create default timeline with one video track
  const timeline = new Timeline({
    name: config.name,
    fps: project.fps,
    width: project.width,
    height: project.height,
  })

  const videoTrack = new Track({
    id: `track-${Date.now()}`,
    type: 'video',
  })

  timeline.addTrack(videoTrack)

  const projectData = {
    project,
    timeline: timeline.toJSON(),
  }

  fs.writeFileSync(
    path.join(absDir, 'project.json'),
    JSON.stringify(projectData, null, 2),
    'utf-8',
  )

  return { dir: absDir, project, timeline }
}

/**
 * Load a project from a directory.
 *
 * @param {string} dir — project directory
 * @returns {{ dir: string, project: object, timeline: Timeline }}
 */
export function loadProject(dir = '.') {
  const absDir = resolveDir(dir)
  const projectPath = path.join(absDir, 'project.json')

  if (!fs.existsSync(projectPath)) {
    throw new Error(`No project found in ${absDir}. Run "uploop-video init <name>" to create one.`)
  }

  const raw = JSON.parse(fs.readFileSync(projectPath, 'utf-8'))
  const { project, timeline: tlData } = raw

  // Reconstruct timeline
  const timeline = new Timeline({
    id: tlData.id,
    name: tlData.name,
    fps: tlData.fps,
    width: tlData.width,
    height: tlData.height,
  })

  if (tlData.tracks) {
    for (const td of tlData.tracks) {
      const track = new Track({
        id: td.id,
        type: td.type,
        muted: td.muted,
        volume: td.volume,
      })
      if (td.clips) {
        for (const cd of td.clips) {
          track.addClip(new Clip(cd))
        }
      }
      timeline.addTrack(track)
    }
  }

  return { dir: absDir, project, timeline }
}

/**
 * Save a project and timeline to disk.
 *
 * @param {string} dir
 * @param {object} project
 * @param {Timeline} timeline
 */
export function saveProject(dir, project, timeline) {
  const absDir = resolveDir(dir)
  const data = {
    project,
    timeline: timeline.toJSON(),
  }
  fs.writeFileSync(
    path.join(absDir, 'project.json'),
    JSON.stringify(data, null, 2),
    'utf-8',
  )
}

/**
 * List all projects in a root directory.
 *
 * @param {string} rootDir — directory to scan
 * @returns {Array<{ name: string, dir: string, project: object, timeline: Timeline }>}
 */
export function listProjects(rootDir) {
  const absRoot = resolveDir(rootDir)
  const results = []

  if (!fs.existsSync(absRoot)) return results

  const entries = fs.readdirSync(absRoot, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const projectPath = path.join(absRoot, entry.name, 'project.json')
    if (fs.existsSync(projectPath)) {
      try {
        const { project } = loadProject(path.join(absRoot, entry.name))
        results.push({
          name: project.name,
          dir: path.join(absRoot, entry.name),
          project,
        })
      } catch {
        // Skip invalid projects
      }
    }
  }

  return results
}
