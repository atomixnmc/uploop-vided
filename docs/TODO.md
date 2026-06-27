# uploop-vided — TODO

## Phase 0 — Scaffolding ✅

- [x] Directory structure
- [x] Root package.json + pnpm-workspace.yaml
- [x] Vite + Vitest configs
- [x] Package stubs (6 packages)
- [x] README

## Phase 1 — @uploop/media 🟡

- [x] Image decode — load, resize, crop, format conversion (stubs)
- [x] Video decode — open, extract frames, seek (stubs)
- [x] Audio decode — waveform, peak detection (stubs)
- [x] Codec registry — register, support check, prefer order (stubs)
- [x] VideoFrame wrapper — timestamp, pixel data, duration (stubs)
- [x] OffscreenCanvas helpers (stubs)
- [ ] Unit tests

## Phase 2 — @uploop/timeline ✅

- [x] Timeline — ordered tracks, duration, fps
- [x] Track — video/audio/image/text/effect types, clips
- [x] Clip — source, inPoint, outPoint, sourceStart
- [x] Keyframe — time, value, easing
- [x] KeyframeTrack — property animation over time
- [x] Easing functions — linear, easeIn/Out, spring, bounce
- [x] Sequence — clip sequence with transitions
- [x] Serialize/deserialize timeline
- [x] Unit tests (easing: 4 tests)

## Phase 3 — @uploop/compositor ✅

- [x] Compositor — layer stack, render at time T
- [x] Layer — source, transform, opacity, blend mode, effects
- [x] Blend modes — normal, multiply, screen, overlay, add
- [x] Effect pipeline — blur, color grade, chroma key, sharpen, noise (stubs)
- [x] Transitions — fade, wipe, slide, dissolve, zoom (12 transition types)
- [x] Mask — alpha, luma, shape with inversion (stubs)
- [ ] GPU pipeline via uploop-ge (@uploop/renderer, @uploop/math)
- [ ] Unit tests

## Phase 4 — @uploop/toolset ⬜

- [ ] Tool registry — register, call, describe (JSON Schema)
- [ ] Schema generation — tool params → JSON Schema
- [ ] Advisor — OpenAI-compatible chat, tool call extraction
- [ ] Advisor as uploop resource node (cache TTL + SWR)
- [ ] Tool result caching
- [ ] MCP server protocol adapter (optional)
- [ ] Unit tests

## Phase 5 — @uploop/output ⬜

- [ ] MediaEncoder — WebCodecs configure, encode, flush
- [ ] RenderPipeline — timeline → frames → encoder
- [ ] ExportPresets — HD, 4K, social, stream configs
- [ ] PreviewStream — low-res preview canvas
- [ ] StreamOutput — WebRTC/RTMP/HLS scaffold
- [ ] Unit tests

## Phase 6 — @uploop/vided-ui ✅

- [x] <uploop-player> — play, pause, seek, volume, progress bar
- [x] <uploop-timeline> — multi-track editor with zoom/scroll, clip selection
- [x] <uploop-preview> — canvas preview with grid/safe-zone overlays
- [x] <uploop-inspector> — clip/effect properties panel, dynamic fields
- [x] <uploop-library> — media asset browser with 12 sample assets
- [x] Editor workspace — integrated demo combining all 5 components
- [ ] Unit tests

## Phase 7 — @uploop/html-video ✅ (v0.2)

- [x] Package scaffold — package.json, src/index.js, types
- [x] Composition — frame/time model, render function, createTimelineComposition
- [x] Encoder — ffmpeg child process, encodeWithFFmpeg, encodeVideo
- [x] Renderer — puppeteer headless Chromium frame capture (renderFrame, renderFrames, renderVideo)
- [x] Bounded concurrency — consumer workers, shared cursor
- [ ] CLI tool — command-line render interface
- [ ] Integration test — render sample composition → MP4
