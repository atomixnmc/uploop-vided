/**
 * CLI commands — implementations for each uploop-video command.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createProject, loadProject, saveProject, listProjects } from './project.js'
import { createMCPServer } from './mcp-server.js'
import { renderVideo } from '@uploop/html-video'
import { Composition } from '@uploop/html-video'

// ---------------------------------------------------------------------------
// init — create a new project
// ---------------------------------------------------------------------------

/**
 * init <name> [--width 1920] [--height 1080] [--fps 30]
 */
async function init(args, opts) {
  const name = args[0]
  if (!name) {
    console.error('Usage: uploop-video init <name> [--width <w>] [--height <h>] [--fps <f>]')
    process.exit(1)
  }

  const width = parseInt(opts.width, 10) || 1920
  const height = parseInt(opts.height, 10) || 1080
  const fps = parseInt(opts.fps, 10) || 30

  const result = createProject(name, { name, width, height, fps })

  console.log(`\n✅ Project created: ${result.dir}`)
  console.log(`   Name:     ${result.project.name}`)
  console.log(`   Size:     ${result.project.width}x${result.project.height}`)
  console.log(`   FPS:      ${result.project.fps}`)
  console.log(`   Duration: ${result.timeline.duration}s`)
  console.log(`   Tracks:   ${result.timeline.tracks.length} (${result.timeline.tracks.map(t => t.type).join(', ') || 'none'})`)
  console.log(`\nNext: cd ${result.dir} && uploop-video dev`)
}

// ---------------------------------------------------------------------------
// dev — start the editor
// ---------------------------------------------------------------------------

/**
 * dev [dir] [--port 3004]
 */
async function dev(args, opts) {
  const dir = args[0] || '.'
  const port = parseInt(opts.port, 10) || 3004

  const { project, timeline } = loadProject(dir)

  console.log(`\n🎬 uploop-vided Editor`)
  console.log(`   Project:  ${project.name}`)
  console.log(`   Size:     ${project.width}x${project.height}`)
  console.log(`   FPS:      ${project.fps}`)
  console.log(`   Duration: ${timeline.duration}s`)
  console.log(`   Tracks:   ${timeline.tracks.length}`)

  let clipCount = 0
  for (const track of timeline.tracks) {
    clipCount += track.clips.length
  }
  console.log(`   Clips:    ${clipCount}`)
  console.log(`\nPhase 1: Open the editor UI at http://localhost:${port}`)
  console.log(`         (editor server coming in Phase 2)`)
}

// ---------------------------------------------------------------------------
// render — render project to MP4
// ---------------------------------------------------------------------------

/**
 * render <output> [--output <path>] [--temp <dir>] [--keep-frames]
 */
async function render(args, opts) {
  const output = args[0] || opts.output
  if (!output) {
    console.error('Usage: uploop-video render <output.mp4> [--temp <dir>] [--keep-frames]')
    process.exit(1)
  }

  const { project, timeline } = loadProject('.')

  const outputPath = path.resolve(output)
  console.log(`\n🎥 Rendering "${project.name}"...`)
  console.log(`   Resolution: ${project.width}x${project.height} @ ${project.fps}fps`)
  console.log(`   Duration:   ${timeline.duration}s (${timeline.frameCount} frames)`)
  console.log(`   Output:     ${outputPath}`)

  const composition = new Composition({
    id: timeline.id,
    width: timeline.width,
    height: timeline.height,
    fps: timeline.fps,
    duration: timeline.duration,
    timeline,
    render: (frame, time) => {
      const clips = timeline.getActiveClips(time)
      const layers = clips.map(({ track, clip }) => {
        const props = clip.getPropsAt(time)
        return { source: clip.source, type: track.type, ...props }
      })
      // Build a simple HTML representation of the composition
      let html = '<div style="display:flex;flex-direction:column;gap:8px;">'
      for (const l of layers) {
        html += `<div style="opacity:${l.opacity ?? 1};transform:scale(${l.scale ?? 1})">
          ${l.source.startsWith('<') ? l.source : `<div>${l.source}</div>`}
        </div>`
      }
      html += '</div>'
      return html
    },
  })

  console.log(`\nRendering frames...`)

  const result = await renderVideo({
    composition,
    output: outputPath,
    tempDir: opts.temp,
    keepFrames: opts['keep-frames'] === 'true' || opts['keep-frames'] === true,
    concurrency: 1,
    onProgress: ({ frame, total, percent }) => {
      process.stdout.write(`\r   Frame ${frame + 1}/${total} (${percent}%)`)
    },
  })

  console.log(`\n✅ Render complete: ${result}`)
}

// ---------------------------------------------------------------------------
// serve — start MCP server
// ---------------------------------------------------------------------------

/**
 * serve [--port 3004]
 */
async function serve(args, opts) {
  const port = parseInt(opts.port, 10) || 3004

  console.log(`\n🔧 Starting uploop-vided MCP server on port ${port}...`)
  console.log(`   Endpoint: http://localhost:${port}/mcp`)
  console.log(`   Tools:    project.create, timeline.addTrack, timeline.addClip,`)
  console.log(`            compositor.renderFrame, output.encode, project.info`)

  const server = createMCPServer({ port })

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down MCP server...')
    server.close()
    process.exit(0)
  })

  process.on('SIGTERM', () => {
    console.log('\nShutting down MCP server...')
    server.close()
    process.exit(0)
  })

  // Keep alive
  await new Promise(() => {})
}

// ---------------------------------------------------------------------------
// info — show project info
// ---------------------------------------------------------------------------

/**
 * info [dir]
 */
async function info(args) {
  const dir = args[0] || '.'
  const { project, timeline } = loadProject(dir)

  console.log(`\n📋 Project: ${project.name}`)
  console.log(`   Directory:  ${path.resolve(dir)}`)
  console.log(`   Resolution: ${project.width}x${project.height}`)
  console.log(`   FPS:        ${project.fps}`)
  console.log(`   Created:    ${project.createdAt}`)
  console.log(`\n   Timeline:`)
  console.log(`     Name:     ${timeline.name}`)
  console.log(`     Duration: ${timeline.duration}s (${timeline.frameCount} frames)`)

  if (timeline.tracks.length === 0) {
    console.log(`     Tracks:   (none)`)
  } else {
    for (const track of timeline.tracks) {
      console.log(`     Track: ${track.id} [${track.type}] ${track.muted ? '(muted)' : ''}`)
      if (track.clips.length > 0) {
        for (const clip of track.clips) {
          console.log(`       Clip: ${clip.id} — ${clip.source}`)
          console.log(`         in: ${clip.inPoint}s  out: ${clip.outPoint}s  duration: ${clip.duration}s`)
        }
      } else {
        console.log(`       (no clips)`)
      }
    }
  }
}

// ---------------------------------------------------------------------------
// list — list all projects
// ---------------------------------------------------------------------------

/**
 * list
 */
async function list() {
  const projectsDir = path.resolve('projects')
  const results = listProjects(projectsDir)

  if (results.length === 0) {
    console.log('\nNo projects found in ./projects/\n')
    console.log('Create one with: uploop-video init <name>')
    return
  }

  console.log(`\n📂 Projects (${results.length}):\n`)
  for (const p of results) {
    console.log(`   ${p.name}`)
    console.log(`     Dir:        ${p.dir}`)
    console.log(`     Resolution: ${p.project.width}x${p.project.height}`)
    console.log(`     FPS:        ${p.project.fps}`)
  }
}

// ---------------------------------------------------------------------------
// Command map
// ---------------------------------------------------------------------------

export const commands = {
  init,
  dev,
  render,
  serve,
  info,
  list,
}
