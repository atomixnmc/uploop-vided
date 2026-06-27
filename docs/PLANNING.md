# uploop-vided — Planning

## Package Map

```
uploop-vided/packages/
├── media           ← Image/video/audio decode, frame extraction, codec registry
├── timeline        ← Multi-track timeline, clips, keyframes, easing
├── compositor      ← GPU-accelerated layer compositing, effects, transitions
├── toolset         ← AI-callable tool registry + OpenAI-compatible advisor
├── output          ← WebCodecs encoder, stream output, export presets
└── ui              ← Web components — player, timeline editor, inspector
```

## Dependency Graph

```
@uploop/media             ← no deps
@uploop/timeline          ← @uploop/media
@uploop/compositor        ← @uploop/media, @uploop/timeline, uploop-ge
@uploop/toolset           ← @uploop/compositor, @uploop/timeline, @uploop/output
@uploop/output            ← @uploop/compositor, @uploop/media
@uploop/vided-ui          ← @uploop/timeline, @uploop/compositor, @uploop/output
```

## Cross-Project Dependencies

```
uploop-ge (@uploop/math, @uploop/renderer)  ← GPU compositing
uploopjs (@uploop/core, @uploop/html)       ← HyperGraph runtime, UI components
```

## AI Toolset Design

`@uploop/toolset` is the key differentiator. Instead of embedding AI inside the
engine, uploop-vided **exposes its engine as tools** for external AI to call.

```
User: "Create a 30-second product teaser with 3 scenes"
  → AI (GPT/Claude) plans the composition
  → AI calls toolset tools: addTrack, addClip, addEffect, render
  → Toolset dispatches to timeline/compositor/output
  → Result: rendered video file
```

The engine doesn't generate content — it's a composable VFX/composition runtime.

### Advisor Resource

The toolset includes an OpenAI-compatible advisor as an **uploop resource node**
with caching:

```js
const toolset = createToolset({
  advisor: {
    endpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o',
    system: 'You are a video composition expert...',
    cache: { ttl: 60000, swr: true }
  }
})

// AI suggests tool calls
const plan = await toolset.ask('Create a product teaser')
// → [{ tool: 'timeline.addTrack', params: {...} }, ...]

// Execute suggested plan
for (const call of plan) {
  await toolset.call(call.tool, call.params)
}
```

## Implementation Phases

| Phase | Scope | Status |
|---|---|---|
| P0 | Scaffolding, @uploop/media, docs | 🟡 scaffolding done |
| P1 | @uploop/timeline (tracks, clips, keyframes) | ⬜ |
| P2 | @uploop/compositor + uploop-ge GPU integration | ⬜ |
| P3 | @uploop/toolset (tool registry, schema, advisor) | ⬜ |
| P4 | @uploop/output (WebCodecs encoder, export presets) | ⬜ |
| P5 | @uploop/vided-ui (player, timeline editor components) | ⬜ |
| P6 | Advanced VFX (LUTs, keying, particles) | ⬜ |
| P7 | Real-time streaming (WebRTC/RTMP), MCP adapter | ⬜ |
| P8 | Examples (slideshow → video composite → AI-directed) | ⬜ |

## Key Design Decisions

1. **Engine exposes tools, AI calls them** — engine doesn't generate content
2. **OpenAI-compatible advisor** — works with any compatible API
3. **GPU compositing from Phase 1** — depends on uploop-ge renderer
4. **Timeline as data structure** — serializable, seekable, composable
5. **Output via WebCodecs** — browser-native encoding, no server required
6. **UI is Web Component-native** — standalone custom elements
7. **Pure ESM, no build** — just like uploopjs
