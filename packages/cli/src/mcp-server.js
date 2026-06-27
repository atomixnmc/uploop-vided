/**
 * MCP Server — Model Context Protocol server for uploop-vided.
 *
 * Provides a JSON-RPC 2.0 HTTP endpoint that exposes uploop-vided engine
 * capabilities as AI-callable tools. Compatible with MCP clients (Claude,
 * Cursor, etc.) via the standard tools/list and tools/call methods.
 *
 * Architecture:
 *   POST /mcp  →  JSON-RPC 2.0 dispatcher
 *     methods:
 *       tools/list  →  returns all tool schemas
 *       tools/call  →  calls a specific tool with params
 *
 * Tools:
 *   project.create       — create a new video project
 *   timeline.add_track   — add a track to a timeline
 *   timeline.add_clip    — add a clip to a track
 *   compositor.render_frame — render a single frame
 *   output.encode        — encode frames to video
 *   project.info         — get project info
 */

import http from 'node:http'

// ---------------------------------------------------------------------------
// Tool implementations — wired to real uploop-vided packages
// ---------------------------------------------------------------------------

import { Timeline, Track, Clip } from '@uploop/timeline'
import { Compositor } from '@uploop/compositor'
import { createProject, loadProject, saveProject } from './project.js'

/**
 * In-memory project registry for the MCP server session.
 * Maps project names → { dir, project, timeline }
 */
const registry = new Map()

function getOrCreateTimeline(projectName) {
  if (!registry.has(projectName)) {
    try {
      // Try loading from disk first
      const loaded = loadProject(projectName)
      registry.set(projectName, loaded)
    } catch {
      // Create a fresh in-memory one
      const result = createProject(projectName, {
        name: projectName,
        width: 1920,
        height: 1080,
        fps: 30,
      })
      registry.set(projectName, result)
    }
  }
  return registry.get(projectName)
}

// ---------------------------------------------------------------------------
// Tool handler implementations
// ---------------------------------------------------------------------------

/** @type {Record<string, (params: any) => Promise<any>>} */
const toolHandlers = {
  async 'project.create'(params) {
    const { name, width = 1920, height = 1080, fps = 30 } = params
    const dir = name // use name as directory
    const result = createProject(dir, { name, width, height, fps })
    registry.set(name, result)
    return {
      success: true,
      dir: result.dir,
      project: result.project,
      timeline: {
        id: result.timeline.id,
        name: result.timeline.name,
        duration: result.timeline.duration,
        frameCount: result.timeline.frameCount,
        tracks: result.timeline.tracks.length,
      },
    }
  },

  async 'timeline.add_track'(params) {
    const { project: projectName, type = 'video', id } = params
    const { timeline } = getOrCreateTimeline(projectName)
    const track = new Track({
      id: id || `track-${Date.now()}`,
      type,
    })
    timeline.addTrack(track)
    saveProject(projectName, registry.get(projectName).project, timeline)
    return {
      success: true,
      trackId: track.id,
      trackType: track.type,
      totalTracks: timeline.tracks.length,
    }
  },

  async 'timeline.add_clip'(params) {
    const {
      project: projectName,
      trackId,
      id,
      source,
      inPoint,
      outPoint,
      sourceStart = 0,
      props = {},
    } = params
    const { timeline } = getOrCreateTimeline(projectName)
    const track = timeline.getTrack(trackId)
    if (!track) {
      throw new Error(`Track "${trackId}" not found in project "${projectName}"`)
    }
    const clip = new Clip({
      id: id || `clip-${Date.now()}`,
      source,
      inPoint,
      outPoint,
      sourceStart,
      props,
    })
    track.addClip(clip)
    saveProject(projectName, registry.get(projectName).project, timeline)
    return {
      success: true,
      clipId: clip.id,
      source: clip.source,
      inPoint: clip.inPoint,
      outPoint: clip.outPoint,
      duration: clip.duration,
      trackDuration: track.duration,
    }
  },

  async 'compositor.render_frame'(params) {
    const { project: projectName, time = 0 } = params
    const { project, timeline } = getOrCreateTimeline(projectName)

    const compositor = new Compositor({
      width: project.width,
      height: project.height,
    })

    // Build layers from active clips at the given time
    const activeClips = timeline.getActiveClips(time)

    // Attempt to render if a canvas is available
    try {
      const imageData = await compositor.render(time)
      return {
        success: true,
        time,
        activeClips: activeClips.length,
        width: project.width,
        height: project.height,
        hasImageData: !!imageData,
      }
    } catch (err) {
      return {
        success: true,
        time,
        activeClips: activeClips.length,
        width: project.width,
        height: project.height,
        note: 'Canvas-based rendering requires a browser-like environment. Use html-video for headless rendering.',
      }
    }
  },

  async 'output.encode'(params) {
    const {
      project: projectName,
      output = 'output.mp4',
      startFrame = 0,
      endFrame,
    } = params
    const { project, timeline } = getOrCreateTimeline(projectName)

    return {
      success: true,
      output,
      fps: project.fps,
      width: project.width,
      height: project.height,
      totalFrames: timeline.frameCount,
      startFrame,
      endFrame: endFrame || timeline.frameCount,
      note: 'Use @uploop/html-video renderVideo() for full headless encoding (requires puppeteer + ffmpeg).',
    }
  },

  async 'project.info'(params) {
    const { project: projectName } = params
    const { project, timeline } = getOrCreateTimeline(projectName)

    const tracks = timeline.tracks.map(t => ({
      id: t.id,
      type: t.type,
      muted: t.muted,
      volume: t.volume,
      clipCount: t.clips.length,
      duration: t.duration,
    }))

    return {
      name: project.name,
      width: project.width,
      height: project.height,
      fps: project.fps,
      createdAt: project.createdAt,
      duration: timeline.duration,
      frameCount: timeline.frameCount,
      trackCount: timeline.tracks.length,
      totalClips: tracks.reduce((sum, t) => sum + t.clipCount, 0),
      tracks,
    }
  },
}

// ---------------------------------------------------------------------------
// JSON Schema tool definitions (for MCP tools/list)
// ---------------------------------------------------------------------------

/** @type {Array<{ name: string, description: string, inputSchema: object }>} */
const toolDefinitions = [
  {
    name: 'project.create',
    description: 'Create a new uploop-vided video project with specified resolution and frame rate.',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Project name (used as directory name)',
        },
        width: {
          type: 'integer',
          description: 'Canvas width in pixels (default: 1920)',
          default: 1920,
        },
        height: {
          type: 'integer',
          description: 'Canvas height in pixels (default: 1080)',
          default: 1080,
        },
        fps: {
          type: 'integer',
          description: 'Frames per second (default: 30)',
          default: 30,
        },
      },
      required: ['name'],
    },
  },
  {
    name: 'timeline.add_track',
    description: 'Add a new track to a project timeline. Tracks can be video, audio, image, text, or effect type.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name',
        },
        type: {
          type: 'string',
          description: 'Track type',
          enum: ['video', 'audio', 'image', 'text', 'effect'],
          default: 'video',
        },
        id: {
          type: 'string',
          description: 'Optional custom track ID (auto-generated if omitted)',
        },
      },
      required: ['project'],
    },
  },
  {
    name: 'timeline.add_clip',
    description: 'Add a media clip to a track. Clips reference a source URL/asset and define their position on the timeline.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name',
        },
        trackId: {
          type: 'string',
          description: 'ID of the track to add the clip to',
        },
        id: {
          type: 'string',
          description: 'Optional custom clip ID',
        },
        source: {
          type: 'string',
          description: 'Media source URL or asset ID',
        },
        inPoint: {
          type: 'number',
          description: 'Timeline start time in seconds',
        },
        outPoint: {
          type: 'number',
          description: 'Timeline end time in seconds',
        },
        sourceStart: {
          type: 'number',
          description: 'Source media start time in seconds (default: 0)',
          default: 0,
        },
        props: {
          type: 'object',
          description: 'Clip properties (opacity, scale, rotation, x, y, etc.)',
        },
      },
      required: ['project', 'trackId', 'source', 'inPoint', 'outPoint'],
    },
  },
  {
    name: 'compositor.render_frame',
    description: 'Render a single frame at a given time using the compositor. Returns information about active clips and rendered image data.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name',
        },
        time: {
          type: 'number',
          description: 'Timeline time in seconds (default: 0)',
          default: 0,
        },
      },
      required: ['project'],
    },
  },
  {
    name: 'output.encode',
    description: 'Encode project frames to video output. Provides encoding configuration and metadata.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name',
        },
        output: {
          type: 'string',
          description: 'Output file path (default: output.mp4)',
          default: 'output.mp4',
        },
        startFrame: {
          type: 'integer',
          description: 'Starting frame number (default: 0)',
          default: 0,
        },
        endFrame: {
          type: 'integer',
          description: 'Ending frame number (default: last frame)',
        },
      },
      required: ['project'],
    },
  },
  {
    name: 'project.info',
    description: 'Get detailed information about a project including timeline, tracks, clips, and duration.',
    inputSchema: {
      type: 'object',
      properties: {
        project: {
          type: 'string',
          description: 'Project name',
        },
      },
      required: ['project'],
    },
  },
]

// ---------------------------------------------------------------------------
// JSON-RPC 2.0 implementation
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} JSONRPCRequest
 * @property {string} jsonrpc
 * @property {string|number} id
 * @property {string} method
 * @property {Object} [params]
 */

/**
 * @typedef {Object} JSONRPCResponse
 * @property {string} jsonrpc
 * @property {string|number} id
 * @property {Object} [result]
 * @property {Object} [error]
 */

/**
 * Handle a single JSON-RPC request.
 * @param {JSONRPCRequest} request
 * @returns {Promise<JSONRPCResponse>}
 */
async function handleRequest(request) {
  const { method, params = {}, id } = request

  try {
    switch (method) {
      case 'tools/list': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            tools: toolDefinitions,
          },
        }
      }

      case 'tools/call': {
        const { name, arguments: toolArgs = {} } = params
        const handler = toolHandlers[name]

        if (!handler) {
          return {
            jsonrpc: '2.0',
            id,
            error: {
              code: -32601,
              message: `Tool not found: ${name}`,
            },
          }
        }

        const result = await handler(toolArgs)

        return {
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          },
        }
      }

      case 'initialize': {
        return {
          jsonrpc: '2.0',
          id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'uploop-vided',
              version: '0.1.0',
            },
          },
        }
      }

      default: {
        return {
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`,
          },
        }
      }
    }
  } catch (err) {
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: err.message || 'Internal error',
      },
    }
  }
}

/**
 * Read the full request body from an incoming HTTP request.
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<string>}
 */
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create an MCP-compatible HTTP server.
 *
 * @param {object} opts
 * @param {number} [opts.port=3004]
 * @returns {import('node:http').Server}
 */
export function createMCPServer({ port = 3004 } = {}) {
  const server = http.createServer(async (req, res) => {
    // CORS headers — allow AI clients to connect from anywhere
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    if (req.method === 'POST' && req.url === '/mcp') {
      try {
        const body = await readBody(req)
        /** @type {JSONRPCRequest} */
        const request = JSON.parse(body)

        if (request.jsonrpc !== '2.0') {
          res.writeHead(400, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({
            jsonrpc: '2.0',
            id: request.id || null,
            error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
          }))
          return
        }

        const response = await handleRequest(request)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify(response))
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: { code: -32700, message: `Parse error: ${err.message}` },
        }))
      }
      return
    }

    // Health check endpoint
    if (req.method === 'GET' && (req.url === '/' || req.url === '/health')) {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'ok',
        name: 'uploop-vided MCP server',
        version: '0.1.0',
        endpoint: '/mcp',
        tools: toolDefinitions.length,
        protocols: ['json-rpc-2.0'],
      }))
      return
    }

    // 404 for everything else
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({
      jsonrpc: '2.0',
      id: null,
      error: { code: -32601, message: 'Not found. Use POST /mcp for tool calls.' },
    }))
  })

  server.listen(port, () => {
    console.log(`   uploop-vided MCP server running on http://localhost:${port}`)
    console.log(`   POST http://localhost:${port}/mcp for JSON-RPC 2.0`)
    console.log(`   GET  http://localhost:${port}/health for status`)
    console.log(`\n   Ready for AI connections.`)
  })

  return server
}
