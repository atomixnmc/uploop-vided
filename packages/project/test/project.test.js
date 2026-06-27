import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Project, createProject, loadProject } from '../src/project.js'
import { ProjectConfig } from '../src/config.js'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const testRoot = path.join(__dir, '..', '..', '..', '..', 'temp', 'projects')

describe('Project', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = path.join(testRoot, `test-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    fs.mkdirSync(tmpDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('creates folder structure and project.json', () => {
    const proj = Project.create(tmpDir, {
      name: 'Test Project',
      width: 1920,
      height: 1080,
      fps: 30,
    })

    // project.json exists and is parseable
    const configPath = path.join(tmpDir, 'project.json')
    expect(fs.existsSync(configPath)).toBe(true)

    const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
    expect(raw.name).toBe('Test Project')
    expect(raw.width).toBe(1920)

    // All subdirectories exist
    for (const sub of ['assets', 'timelines', 'sequences', 'renders', 'exports']) {
      expect(fs.existsSync(path.join(tmpDir, sub))).toBe(true)
    }

    expect(proj.name).toBe('Test Project')
    expect(proj.id).toBeTruthy()
  })

  it('loads an existing project', () => {
    const created = Project.create(tmpDir, {
      name: 'Reload Test',
      width: 1280,
      height: 720,
      fps: 24,
    })

    const loaded = Project.load(tmpDir)

    expect(loaded.name).toBe('Reload Test')
    expect(loaded.config.width).toBe(1280)
    expect(loaded.config.height).toBe(720)
    expect(loaded.config.fps).toBe(24)
    expect(loaded.id).toBe(created.id)
  })

  it('computes correct paths', () => {
    const proj = Project.create(tmpDir, {
      name: 'Paths Test',
      width: 640,
      height: 480,
      fps: 60,
    })

    expect(proj.paths.config).toBe(path.join(tmpDir, 'project.json'))
    expect(proj.paths.assets).toBe(path.join(tmpDir, 'assets'))
    expect(proj.paths.timelines).toBe(path.join(tmpDir, 'timelines'))
    expect(proj.paths.renders).toBe(path.join(tmpDir, 'renders'))
    expect(proj.paths.sequences).toBe(path.join(tmpDir, 'sequences'))
    expect(proj.paths.exports).toBe(path.join(tmpDir, 'exports'))
  })

  it('creates render directory with frames subdir', () => {
    const proj = Project.create(tmpDir, {
      name: 'Render Test',
      width: 1920,
      height: 1080,
      fps: 30,
    })

    const renderDir = proj.createRender('my-render')
    expect(fs.existsSync(renderDir)).toBe(true)
    expect(fs.existsSync(path.join(renderDir, 'frames'))).toBe(true)
    expect(path.basename(renderDir)).toBe('my-render')
  })

  it('lists all render directories', () => {
    const proj = Project.create(tmpDir, {
      name: 'List Test',
      width: 1920,
      height: 1080,
      fps: 30,
    })

    proj.createRender('render-a')
    proj.createRender('render-b')

    const renders = proj.listRenders()
    expect(renders).toContain('render-a')
    expect(renders).toContain('render-b')
    expect(renders.length).toBe(2)
  })

  it('toJSON and fromJSON roundtrip', () => {
    const proj = Project.create(tmpDir, {
      name: 'Roundtrip',
      width: 800,
      height: 600,
      fps: 25,
    })

    const json = proj.toJSON()
    const restored = Project.fromJSON(json)

    expect(restored.name).toBe('Roundtrip')
    expect(restored.id).toBe(proj.id)
    expect(restored.config.width).toBe(800)
    expect(restored.rootDir).toBe(proj.rootDir)
  })

  it('convenience exports (createProject, loadProject) work', () => {
    const p1 = createProject(tmpDir, { name: 'Conv', width: 100, height: 100, fps: 10 })
    expect(p1.name).toBe('Conv')

    const p2 = loadProject(tmpDir)
    expect(p2.id).toBe(p1.id)
  })
})

describe('ProjectConfig', () => {
  let tmpDir

  beforeEach(() => {
    tmpDir = path.join(testRoot, `config-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)
    fs.mkdirSync(tmpDir, { recursive: true })
  })

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true })
  })

  it('uses defaults when no options given', () => {
    const c = new ProjectConfig()
    expect(c.name).toBe('Untitled')
    expect(c.width).toBe(1920)
    expect(c.height).toBe(1080)
    expect(c.fps).toBe(30)
    expect(c.id).toBeTruthy()
  })

  it('accepts overrides', () => {
    const c = new ProjectConfig({
      name: 'Custom',
      width: 640,
      height: 480,
      fps: 60,
      description: 'A test',
      author: 'Tester',
      version: '2.0.0',
      id: 'fixed-id',
    })
    expect(c.name).toBe('Custom')
    expect(c.width).toBe(640)
    expect(c.fps).toBe(60)
    expect(c.description).toBe('A test')
    expect(c.author).toBe('Tester')
    expect(c.version).toBe('2.0.0')
    expect(c.id).toBe('fixed-id')
  })

  it('save/load roundtrip', () => {
    const c1 = new ProjectConfig({
      name: 'SaveTest',
      width: 320,
      height: 240,
      fps: 15,
      description: 'roundtrip',
    })
    c1.save(tmpDir)

    const configPath = path.join(tmpDir, 'project.json')
    expect(fs.existsSync(configPath)).toBe(true)

    const c2 = ProjectConfig.load(tmpDir)
    expect(c2.name).toBe('SaveTest')
    expect(c2.width).toBe(320)
    expect(c2.height).toBe(240)
    expect(c2.fps).toBe(15)
    expect(c2.description).toBe('roundtrip')
    expect(c2.id).toBe(c1.id)
  })

  it('throws when loading from nonexistent dir', () => {
    expect(() => ProjectConfig.load(path.join(tmpDir, 'nope'))).toThrow()
  })
})
