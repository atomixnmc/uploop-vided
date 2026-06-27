# v0.2 — HTML → MP4 + Editor UI

> **Status:** ✅ Complete  
> **Date:** 2026-06-26  
> **Target:** Headless rendering + editor web components

## Overview

Two major deliverables:

1. **`@uploop/html-video`** — Remotion-style HTML → MP4 rendering via headless
   Chromium (Puppeteer) + ffmpeg. Framework-agnostic, MIT licensed.

2. **`@uploop/vided-ui`** — 5 Web Components for the editor workspace: player,
   timeline editor, preview canvas, inspector panel, media library.

---

## @uploop/html-video ✅

### Comparison with Remotion

| Feature | Remotion | @uploop/html-video |
|---------|----------|-------------------|
| Framework | React | Any HTML/JS |
| License | Source-available, paid above 4 devs | MIT |
| Rendering | Chromium + ffmpeg | Chromium + ffmpeg |
| Timeline | Built-in | @uploop/timeline |
| Compositor | React components | @uploop/compositor |
| AI integration | Manual | @uploop/toolset (native) |
| Browser preview | Yes | ✅ via UI components |

### Architecture

```
Composition (HTML/JS)
    │
    ▼
Headless Chromium (Puppeteer)
    │  screenshot per frame
    ▼
frame-0001.png, frame-0002.png, ...
    │
    ▼
ffmpeg
    │  encode H.264 / VP9
    ▼
output.mp4
```

### Implemented

- [x] `src/composition.js` — Composition class, createTimelineComposition, frame/time model
- [x] `src/renderer.js` — renderFrame (single), renderFrames (batch, bounded concurrency), renderVideo (end-to-end)
- [x] `src/encoder.js` — encodeWithFFmpeg (spawns ffmpeg), encodeVideo (validates + encodes)
- [x] `src/types.js` — JSDoc types
- [x] Puppeteer integration — dynamic import, launch headless, setViewport, setContent, screenshot
- [x] Bounded concurrency — consumer workers pulling from shared cursor
- [x] Cleanup — finally blocks, temp dir management, keepFrames option

### API

```js
import { Composition, renderVideo, renderFrame } from '@uploop/html-video'

const comp = new Composition({
  id: 'hello', width: 1920, height: 1080, fps: 30, duration: 5,
  render: (frame, time) => `<div>Frame ${frame}</div>`,
})

// Single frame
const png = await renderFrame({ composition: comp, frame: 42 })

// Full video
await renderVideo({ composition: comp, output: 'output.mp4' })

// From timeline
import { createTimelineComposition } from '@uploop/html-video'
const comp = createTimelineComposition({ timeline: myTimeline })
await renderVideo({ composition: comp, output: 'timeline.mp4' })
```

---

## @uploop/vided-ui ✅

### 5 Web Components (all self-registering custom elements)

| Component | Tag | What it does |
|-----------|-----|-------------|
| UploopPlayer | `<uploop-player>` | Video player with play/pause, progress bar, volume, time display |
| UploopTimeline | `<uploop-timeline>` | Canvas-rendered multi-track timeline editor with zoom, scroll, clip selection |
| UploopPreview | `<uploop-preview>` | Canvas preview with grid/safe-zone overlays, renders Timeline or Compositor |
| UploopInspector | `<uploop-inspector>` | Properties panel for clips/layers/effects with live editing |
| UploopLibrary | `<uploop-library>` | Media asset browser with 12 pre-loaded samples (video/audio/image) |

### Design

- All use `attachShadow({ mode: 'open' })` for encapsulated styles
- Dark theme: `#0a0a0f` bg, `#e0e0e0` text, `#4f8` accent, `#151520` cards
- Dispatch custom events: `uploop:timeupdate`, `uploop:clip-select`, `uploop:asset-select`, `uploop:property-change`
- Imports from `@uploop/timeline` and `@uploop/compositor` for data models

---

## Editor Workspace (examples/editor/)

Full video editor demo combining all 5 UI components:

```
┌──────────────────────────────────────────────────────┐
│ ⬡ uploop-vided v0.2-dev     ▶ Play  ⏹ Stop  ⬇ Export│
├────────┬──────────────────────────┬──────────────────┤
│Library │                          │                  │
│ 🎬 BBB │      Preview Canvas      │   Inspector      │
│ 🎬 Jelly│     (with grid overlay) │   ────────       │
│ 🎵 Synth│                          │   clip-bbb       │
│ 🎵 Drum │                          │   inPoint: 0     │
│ ...     │                          │   outPoint: 10   │
│────────│                          │   opacity: 1     │
│Examples│                          │   ...            │
│ 01-20  │                          │                  │
│ 21-30  ├──────────────────────────┤                  │
│        │   Timeline Editor        │                  │
│        │ ▬▬▬▬▬▬▬▬ Video Track    │                  │
│        │     ▬▬▬▬ Text Track     │                  │
│        │ ▬▬▬▬▬▬▬▬▬ Audio Track   │                  │
└────────┴──────────────────────────┴──────────────────┘
```

- 3 tracks: video (BBB + Jellyfish), text overlay, audio (samplelib)
- Play/pause/stop with keyboard shortcuts (Space, ← →, Home/End)
- Click clips in timeline → inspector shows properties
- Click assets in library → select for timeline
- Status bar shows time, FPS, resolution, track count
