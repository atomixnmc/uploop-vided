# v0.1 — Foundation & Examples Sprint

> **Status:** ✅ Complete  
> **Date:** 2026-06-26  

## Deliverables

| Area | Count | Status |
|------|-------|--------|
| Packages implemented | 6 (timeline, compositor core done; media/output/toolset/ui stubs) | ✅ |
| Examples — Basic (engine features) | 20 (01–20) | ✅ |
| Examples — Advanced (education) | 10 (21–30) | ✅ |
| Transition types | 12 (fade, dissolve, 4 wipes, 4 slides, 2 zooms, none) | ✅ |
| Easing functions | 6 (linear, easeIn/Out/Cubic) | ✅ |
| Blend modes | 8 + Canvas mapping + pixel blend | ✅ |
| Docs | ARCHITECTURE, PLANNING, TODO, progress/v0.1 | ✅ |
| Tests | 4 easing tests | ✅ |

## Example Categories

### Basic (01–20) — Engine Features
01-slideshow → 20-final-composite: timeline, compositor, transitions, audio, video, blend modes

### Advanced (21–30) — Interactive Education
21-calculus-visualization → 30-history-timeline: math, physics, music, chemistry, history

## API Surface

```
@uploop/timeline
  Timeline, Track, Clip, Keyframe, KeyframeTrack, Sequence, easing

@uploop/compositor
  Compositor, Layer, Transition, createTransition, Effect,
  EffectPipeline, Mask, createMask, blendModes, blendModeToCanvas,
  blendPixel, transitionTypes
```
