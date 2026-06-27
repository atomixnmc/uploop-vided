/**
 * Timeline API unit tests.
 */
import { describe, it, expect } from 'vitest'
import { Timeline, Track, Clip, Keyframe, KeyframeTrack, Sequence } from '@uploop/timeline'

describe('Timeline', () => {
  it('constructs with defaults', () => {
    const tl = new Timeline()
    expect(tl.id).toBeTruthy()
    expect(tl.name).toBe('Untitled')
    expect(tl.fps).toBe(30)
    expect(tl.width).toBe(1920)
    expect(tl.height).toBe(1080)
    expect(tl.tracks).toEqual([])
  })

  it('adds and removes tracks', () => {
    const tl = new Timeline()
    const t = new Track({ id: 't1', type: 'video' })
    tl.addTrack(t)
    expect(tl.tracks).toHaveLength(1)
    tl.removeTrack('t1')
    expect(tl.tracks).toHaveLength(0)
  })

  it('computes duration from longest track', () => {
    const tl = new Timeline()
    const t1 = new Track({
      id: 't1', type: 'video',
      clips: [new Clip({ id: 'c1', source: 'a.mp4', inPoint: 0, outPoint: 5 })],
    })
    const t2 = new Track({
      id: 't2', type: 'audio',
      clips: [new Clip({ id: 'c2', source: 'b.mp3', inPoint: 2, outPoint: 8 })],
    })
    tl.addTrack(t1)
    tl.addTrack(t2)
    expect(tl.duration).toBe(8)
  })

  it('returns empty array when no tracks', () => {
    const tl = new Timeline()
    expect(tl.duration).toBe(0)
    expect(tl.getActiveClips(0)).toEqual([])
  })
})

describe('Track', () => {
  it('adds clips in order', () => {
    const track = new Track({ id: 't1', type: 'video' })
    track.addClip(new Clip({ id: 'c2', source: 'b.mp4', inPoint: 5, outPoint: 10 }))
    track.addClip(new Clip({ id: 'c1', source: 'a.mp4', inPoint: 0, outPoint: 5 }))
    expect(track.clips[0].id).toBe('c1')
    expect(track.clips[1].id).toBe('c2')
  })

  it('finds clip at time', () => {
    const track = new Track({
      id: 't1', type: 'video',
      clips: [new Clip({ id: 'c1', source: 'a.mp4', inPoint: 0, outPoint: 5 })],
    })
    expect(track.getClipAt(2)).toBeTruthy()
    expect(track.getClipAt(2)?.id).toBe('c1')
    expect(track.getClipAt(10)).toBeNull()
  })

  it('muted track is still accessible', () => {
    const track = new Track({ id: 't1', type: 'audio', muted: true })
    expect(track.muted).toBe(true)
    expect(track.volume).toBe(1)
  })
})

describe('Clip', () => {
  it('computes duration from in/out points', () => {
    const clip = new Clip({ id: 'c1', source: 'a.mp4', inPoint: 2, outPoint: 7 })
    expect(clip.duration).toBe(5)
  })

  it('checks active at time', () => {
    const clip = new Clip({ id: 'c1', source: 'a.mp4', inPoint: 2, outPoint: 7 })
    expect(clip.isActiveAt(1)).toBe(false)
    expect(clip.isActiveAt(2)).toBe(true)
    expect(clip.isActiveAt(5)).toBe(true)
    expect(clip.isActiveAt(7)).toBe(false)
  })

  it('computes source time from timeline time', () => {
    const clip = new Clip({ id: 'c1', source: 'a.mp4', inPoint: 10, outPoint: 20, sourceStart: 5 })
    expect(clip.sourceTimeAt(10)).toBe(5)
    expect(clip.sourceTimeAt(15)).toBe(10)
  })

  it('serializes to JSON', () => {
    const clip = new Clip({ id: 'c1', source: 'a.mp4', inPoint: 0, outPoint: 5 })
    const json = clip.toJSON()
    expect(json.id).toBe('c1')
    expect(json.inPoint).toBe(0)
    expect(json.outPoint).toBe(5)
  })
})

describe('Keyframe & KeyframeTrack', () => {
  it('interpolates linear keyframes', () => {
    const kt = new KeyframeTrack({
      property: 'x',
      keyframes: [
        new Keyframe({ time: 0, value: 0 }),
        new Keyframe({ time: 1, value: 100 }),
      ],
    })
    expect(kt.getValueAt(0)).toBe(0)
    expect(kt.getValueAt(0.5)).toBe(50)
    expect(kt.getValueAt(1)).toBe(100)
  })

  it('interpolates with easing', () => {
    const kt = new KeyframeTrack({
      property: 'opacity',
      keyframes: [
        new Keyframe({ time: 0, value: 0, easing: 'easeOut' }),
        new Keyframe({ time: 1, value: 1 }),
      ],
    })
    // easeOut at t=0.5 gives ~0.75
    expect(kt.getValueAt(0.5)).toBeGreaterThan(0.5)
    expect(kt.getValueAt(0)).toBe(0)
    expect(kt.getValueAt(1)).toBe(1)
  })

  it('clamps before first and after last keyframe', () => {
    const kt = new KeyframeTrack({
      property: 'scale',
      keyframes: [
        new Keyframe({ time: 2, value: 1 }),
        new Keyframe({ time: 5, value: 3 }),
      ],
    })
    expect(kt.getValueAt(0)).toBe(1)
    expect(kt.getValueAt(10)).toBe(3)
  })

  it('returns null for empty keyframes', () => {
    const kt = new KeyframeTrack({ property: 'x' })
    expect(kt.getValueAt(5)).toBeNull()
  })

  it('interpolates array values', () => {
    const kt = new KeyframeTrack({
      property: 'position',
      keyframes: [
        new Keyframe({ time: 0, value: [0, 0] }),
        new Keyframe({ time: 1, value: [100, 200] }),
      ],
    })
    expect(kt.getValueAt(0.5)).toEqual([50, 100])
  })
})

describe('Sequence', () => {
  it('resolves time across multiple timelines', () => {
    const tl1 = new Timeline({ id: 'a', fps: 30 })
    tl1.addTrack(new Track({
      id: 't1', type: 'video',
      clips: [new Clip({ id: 'c1', source: 'a.mp4', inPoint: 0, outPoint: 3 })],
    }))

    const tl2 = new Timeline({ id: 'b', fps: 30 })
    tl2.addTrack(new Track({
      id: 't2', type: 'video',
      clips: [new Clip({ id: 'c2', source: 'b.mp4', inPoint: 0, outPoint: 4 })],
    }))

    const seq = new Sequence({ timelines: [tl1, tl2] })

    expect(seq.duration).toBe(7)

    const r1 = seq.resolveTime(0)
    expect(r1?.timeline.id).toBe('a')
    expect(r1?.localTime).toBe(0)

    const r2 = seq.resolveTime(2)
    expect(r2?.timeline.id).toBe('a')
    expect(r2?.localTime).toBe(2)

    const r3 = seq.resolveTime(3)
    expect(r3?.timeline.id).toBe('b')
    expect(r3?.localTime).toBe(0)

    const r4 = seq.resolveTime(5)
    expect(r4?.timeline.id).toBe('b')
    expect(r4?.localTime).toBe(2)

    expect(seq.resolveTime(10)).toBeNull()
  })
})
