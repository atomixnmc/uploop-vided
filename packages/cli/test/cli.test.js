/**
 * CLI tests — basic validation of command dispatch, project creation, and help text.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { commands } from '../src/commands.js'
import { createProject, loadProject } from '../src/project.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const tmpRoot = path.join(os.tmpdir(), `uploop-cli-test-${Date.now()}`)

beforeAll(() => {
  fs.mkdirSync(tmpRoot, { recursive: true })
})

afterAll(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true })
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('command dispatch', () => {
  it('exposes all six commands', () => {
    const names = Object.keys(commands)
    expect(names).toContain('init')
    expect(names).toContain('dev')
    expect(names).toContain('render')
    expect(names).toContain('serve')
    expect(names).toContain('info')
    expect(names).toContain('list')
  })

  it('each command is a function', () => {
    for (const [name, fn] of Object.entries(commands)) {
      expect(typeof fn).toBe('function')
    }
  })
})

describe('init creates project directory structure', () => {
  const projectDir = path.join(tmpRoot, 'test-project')

  it('creates project directory with project.json', () => {
    const result = createProject(projectDir, {
      name: 'Test Project',
      width: 1920,
      height: 1080,
      fps: 30,
    })

    expect(fs.existsSync(projectDir)).toBe(true)
    expect(fs.existsSync(path.join(projectDir, 'project.json'))).toBe(true)
    expect(result.project.name).toBe('Test Project')
    expect(result.project.width).toBe(1920)
    expect(result.project.height).toBe(1080)
    expect(result.project.fps).toBe(30)
  })

  it('project.json is valid JSON with expected structure', () => {
    const raw = fs.readFileSync(path.join(projectDir, 'project.json'), 'utf-8')
    const data = JSON.parse(raw)

    expect(data.project).toBeDefined()
    expect(data.project.name).toBe('Test Project')
    expect(data.timeline).toBeDefined()
    expect(data.timeline.tracks).toBeInstanceOf(Array)
  })

  it('creates a default video track', () => {
    const result = createProject(projectDir, {
      name: 'Test Project',
      width: 1920,
      height: 1080,
      fps: 30,
    })
    expect(result.timeline.tracks.length).toBeGreaterThanOrEqual(1)
    expect(result.timeline.tracks[0].type).toBe('video')
  })
})

describe('load project', () => {
  it('loads a previously created project', () => {
    const dir = path.join(tmpRoot, 'load-test')
    createProject(dir, { name: 'Load Test', width: 1280, height: 720, fps: 24 })

    const { project, timeline } = loadProject(dir)

    expect(project.name).toBe('Load Test')
    expect(project.width).toBe(1280)
    expect(project.height).toBe(720)
    expect(project.fps).toBe(24)
    expect(timeline).toBeDefined()
    expect(timeline.tracks.length).toBeGreaterThanOrEqual(1)
  })

  it('throws when project.json does not exist', () => {
    const emptyDir = path.join(tmpRoot, 'no-project')
    fs.mkdirSync(emptyDir, { recursive: true })

    expect(() => loadProject(emptyDir)).toThrow()
  })
})

describe('help text', () => {
  it('contains all command names', () => {
    // Simulate help output by checking command keys exist
    const names = Object.keys(commands)
    const required = ['init', 'dev', 'render', 'serve', 'info', 'list']
    for (const cmd of required) {
      expect(names).toContain(cmd)
    }
  })
})

describe('create with custom config', () => {
  it('respects custom width, height, fps', () => {
    const dir = path.join(tmpRoot, 'custom-config')
    const result = createProject(dir, {
      name: 'Custom',
      width: 3840,
      height: 2160,
      fps: 60,
    })

    expect(result.project.width).toBe(3840)
    expect(result.project.height).toBe(2160)
    expect(result.project.fps).toBe(60)
  })

  it('uses defaults when options are omitted', () => {
    const dir = path.join(tmpRoot, 'default-config')
    const result = createProject(dir, { name: 'Default' })

    expect(result.project.width).toBe(1920)
    expect(result.project.height).toBe(1080)
    expect(result.project.fps).toBe(30)
  })
})
