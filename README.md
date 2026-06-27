<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/atomixnmc/uploop-vided/main/docs/uploop-vided-dark.svg">
    <img alt="Uploop Vided" src="https://raw.githubusercontent.com/atomixnmc/uploop-vided/main/docs/uploop-vided-light.svg" width="480">
  </picture>
</p>

<p align="center">
  <strong>Generative AI-driven composition &amp; VFX engine — the AI is the director.</strong>
</p>

<p align="center">
  <a href="https://github.com/atomixnmc/uploop-vided/actions/workflows/ci.yml"><img src="https://github.com/atomixnmc/uploop-vided/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://github.com/atomixnmc/uploop-vided/actions/workflows/release.yml"><img src="https://github.com/atomixnmc/uploop-vided/actions/workflows/release.yml/badge.svg" alt="Release"></a>
  <a href="#"><img src="https://img.shields.io/badge/tests-152%20passed-brightgreen" alt="Tests"></a>
  <a href="#"><img src="https://img.shields.io/badge/examples-31%20interactive-blue" alt="Examples"></a>
  <a href="#"><img src="https://img.shields.io/badge/packages-10%20total-orange" alt="Packages"></a>
  <a href="#"><img src="https://img.shields.io/badge/version-v0.2.0-blueviolet" alt="Version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-purple" alt="License"></a>
</p>

<p align="center">
  <a href="https://github.com/atomixnmc/uploopjs"><img src="https://img.shields.io/badge/powered_by-uploopjs-818cf8" alt="Powered by uploopjs"></a>
  <a href="https://github.com/atomixnmc/uploop-ge"><img src="https://img.shields.io/badge/GPU-uploop--ge-4ade80" alt="GPU: uploop-ge"></a>
</p>

---

**Uploop Vided** is an AI-native video composition and VFX engine. Built on
[`uploop-ge`](https://github.com/atomixnmc/uploop-ge) for GPU rendering and
[`uploopjs`](https://github.com/atomixnmc/uploopjs) for HyperGraph
orchestration. Exposes its engine as AI-callable tools (MCP) — the AI acts as
the director, uploop-vided is the VFX engine.

```js
import { Timeline, Track, Clip } from '@uploop/timeline'
import { Compositor, Layer, createTransition } from '@uploop/compositor'
import { renderVideo } from '@uploop/html-video'

// Build a timeline
const timeline = new Timeline({ fps: 30, width: 1920, height: 1080 })
timeline.addTrack(new Track({ id: 'main', type: 'video', clips: [
  new Clip({ id: 'intro', source: 'intro.mp4', inPoint: 0, outPoint: 5 }),
  new Clip({ id: 'body',  source: 'body.mp4',  inPoint: 3, outPoint: 10 }),
]}))

// Add transitions
const fade = createTransition('fade', { duration: 1 })

// Render to MP4 (headless Chromium + ffmpeg)
await renderVideo({ composition: createTimelineComposition({ timeline }), output: 'output.mp4' })
```

## Why Uploop Vided?

| | Remotion | Uploop Vided |
|---|---|---|
| **Framework** | React | **Any HTML/JS** (via uploopjs HyperGraph) |
| **License** | Source-available, paid ≥5 devs | **MIT — always free** |
| **GPU** | Via Three.js/Pixi (external) | **Native WebGL2 + WebGPU** (uploop-ge) |
| **AI-native** | Manual API calls | **MCP server + tool registry + advisor** |
| **Timeline** | Built-in `<Sequence>` | **Multi-track Timeline/Track/Clip API** |
| **Transitions** | CSS/JS | **12 GPU-ready transition types** |
| **Compositor** | React component stacking | **Layers with blend modes, masks, effects** |
| **Output** | ffmpeg (Chromium) | **WebCodecs + ffmpeg + streaming (WebRTC/RTMP)** |
| **Editor UI** | Remotion Studio (React) | **5 Custom Elements (player, timeline, inspector, etc.)** |
| **CLI** | `npx remotion` | **`uploop-video init/dev/render/serve`** |
| **AI Toolset** | ❌ | **MCP JSON-RPC server with 6 tools** |
| **HyperGraph** | ❌ | **Typed graph of nodes — inspectable by AI** |
| **Data classification** | ❌ | **hot/warm/cold/frozen/critical** |

Compare all frameworks in depth: [`docs/reports/report-v0.2-compare-frameworks.md`](docs/reports/report-v0.2-compare-frameworks.md)

## Packages

| Package | Description | Status |
|---------|-------------|--------|
| `@uploop/media` | Image/video/audio decode, frame extraction, codec registry | ✅ |
| `@uploop/timeline` | Multi-track timeline, clips, keyframes, easing, sequence | ✅ |
| `@uploop/compositor` | GPU-accelerated layer compositing, 12 transitions, 8 blend modes, effects | ✅ |
| `@uploop/toolset` | AI-callable tool registry + OpenAI-compatible advisor + MCP server | 🟡 |
| `@uploop/output` | WebCodecs encoder, stream output, export presets | 🟡 |
| `@uploop/vided-ui` | 5 Web Components: player, timeline editor, preview, inspector, library | ✅ |
| `@uploop/html-video` | Remotion-style HTML → MP4 via Puppeteer + ffmpeg | ✅ |
| `@uploop/cli` | CLI: `uploop-video init/dev/render/serve/info/list` | ✅ |
| `@uploop/project` | Project management: folders, config, assets, renders | ✅ |
| `@uploop/editor` | Standalone editor workspace (launch via CLI) | ✅ |

**10 packages** — 5 core engine + 3 tooling + 2 UI — all MIT licensed, pure ESM.

## Quick Start

```bash
git clone https://github.com/atomixnmc/uploop-vided.git
cd uploop-vided
pnpm install
pnpm dev
```

Open `http://localhost:3002` — you'll see the examples gallery.

🌐 **Live demo:** [atomixnmc.github.io/uploop-vided](https://atomixnmc.github.io/uploop-vided/)

- **31 interactive examples** (20 basic + 10 advanced education + 1 editor)
- **Editor workspace** at `/editor/` — full video editor with timeline, preview, inspector

## AI-Native: The AI is the Director

Uploop Vided doesn't just let you make videos — it lets **AI make videos** on
your behalf. The `@uploop/toolset` package exposes every engine capability as a
JSON Schema-defined tool:

```bash
# Start the MCP server
pnpm uploop-video serve --port 3004
```

```json
// POST /mcp → { "method": "tools/list" }
// Response:
[
  { "name": "timeline.addTrack",    "parameters": { "type": "object", "properties": { "type": { "enum": ["video","audio","image","text"] } } } },
  { "name": "timeline.addClip",     "parameters": { /* inPoint, outPoint, source, props */ } },
  { "name": "compositor.renderFrame","parameters": { /* time, width, height */ } },
  { "name": "output.encode",        "parameters": { /* format, codec, bitrate */ } },
  { "name": "project.create",       "parameters": { /* name, width, height, fps */ } },
  { "name": "project.info",         "parameters": {} }
]
```

An AI agent (GPT, Claude, local LLM) reads this tool list and composes videos
programmatically — no human developer needed.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    uploopjs (UI Layer)                    │
│  @uploop/html — declarative component model             │
├─────────────────────────────────────────────────────────┤
│                  uploop-vided (VFX Layer)                 │
│  media → timeline → compositor → output → html-video     │
│  project → cli → editor → toolset → vided-ui             │
├─────────────────────────────────────────────────────────┤
│                   uploop-ge (GPU Layer)                   │
│  math → geometry → shader → renderer → scene → physics   │
│  WebGL 2.0 + WebGPU engine from scratch                  │
└─────────────────────────────────────────────────────────┘
```

HyperGraph connects everything — every node is typed, every edge is traceable,
every state change is auditable by AI.

## Ecosystem

| Project | Description | Link |
|---------|-------------|------|
| **uploopjs** | HyperGraph UI framework — data shapes, stores, flows, streaming | [github.com/atomixnmc/uploopjs](https://github.com/atomixnmc/uploopjs) |
| **uploop-ge** | WebGL/WebGPU graphics engine — math, shaders, renderer, physics | [github.com/atomixnmc/uploop-ge](https://github.com/atomixnmc/uploop-ge) |
| **uploop-vided** | AI-native video composition & VFX engine (this repo) | — |

## Docs

| Document | Description |
|---|---|
| [PLANNING.md](./docs/PLANNING.md) | Package map, dependency graph, AI toolset design |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Composition pipeline, protocols |
| [TODO.md](./docs/TODO.md) | Living task list — phases, status |
| [progress/v0.1.md](./docs/progress/progress-v0.1.md) | v0.1 completion report |
| [progress/v0.2.md](./docs/progress/progress-v0.2.md) | v0.2 completion report |
| [reports/report-v0.2-compare-frameworks.md](./docs/reports/report-v0.2-compare-frameworks.md) | Cross-framework comparison (Remotion, Processing, Motion Canvas, etc.) |

## Test Suite

| Suite | Tests | Command |
|-------|-------|---------|
| Unit (vitest) | 55 | `pnpm test` |
| E2E (Playwright) | 97 | `pnpm test:e2e` |
| **Total** | **152** | — |

## License

MIT
