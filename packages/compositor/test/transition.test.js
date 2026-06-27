/**
 * Compositor API unit tests.
 */
import { describe, it, expect } from 'vitest'
import { createTransition, blendModes, blendModeToCanvas, blendPixel } from '@uploop/compositor'

describe('createTransition', () => {
  it('creates a fade transition', () => {
    const fade = createTransition('fade', { duration: 1 })
    expect(fade.type).toBe('fade')
    expect(fade.duration).toBe(1)
  })

  it('fade at progress 0 shows only outgoing', () => {
    const t = createTransition('fade')
    const r = t.render(0)
    expect(r.outgoing.opacity).toBe(1)
    expect(r.incoming.opacity).toBe(0)
  })

  it('fade at progress 0.5 shows both at half', () => {
    const t = createTransition('fade')
    const r = t.render(0.5)
    expect(r.outgoing.opacity).toBeCloseTo(0.5, 1)
    expect(r.incoming.opacity).toBeCloseTo(0.5, 1)
  })

  it('fade at progress 1 shows only incoming', () => {
    const t = createTransition('fade')
    const r = t.render(1)
    expect(r.outgoing.opacity).toBe(0)
    expect(r.incoming.opacity).toBe(1)
  })

  it('slide transition offsets positions', () => {
    const t = createTransition('slideLeft', { params: { clipWidth: 1 } })
    const r = t.render(0.5)
    expect(r.outgoing.x).toBeLessThan(0)
    expect(r.incoming.x).toBeGreaterThan(0)
  })

  it('all 13 transition types render without error', () => {
    const types = [
      'fade', 'dissolve',
      'wipeLeft', 'wipeRight', 'wipeUp', 'wipeDown',
      'slideLeft', 'slideRight', 'slideUp', 'slideDown',
      'zoomIn', 'zoomOut', 'none',
    ]
    for (const type of types) {
      const t = createTransition(type)
      const r = t.render(0.5)
      expect(r.outgoing).toBeDefined()
      expect(r.incoming).toBeDefined()
    }
  })

  it('clamps progress to 0-1', () => {
    const t = createTransition('fade')
    const below = t.render(-0.5)
    const above = t.render(1.5)
    expect(below.outgoing.opacity).toBe(1)
    expect(above.incoming.opacity).toBe(1)
  })
})

describe('blendModes', () => {
  it('has 8 modes', () => {
    expect(Object.keys(blendModes)).toHaveLength(8)
  })

  it('maps to canvas operations', () => {
    expect(blendModeToCanvas.normal).toBe('source-over')
    expect(blendModeToCanvas.multiply).toBe('multiply')
    expect(blendModeToCanvas.screen).toBe('screen')
    expect(blendModeToCanvas.add).toBe('lighter')
  })
})

describe('blendPixel', () => {
  it('multiply darkens', () => {
    // 128 * 64 / 255 ≈ 32
    expect(blendPixel(128, 64, 'multiply')).toBe(32)
  })

  it('screen lightens', () => {
    const result = blendPixel(128, 64, 'screen')
    expect(result).toBeGreaterThan(64)
  })

  it('normal returns source', () => {
    expect(blendPixel(100, 50, 'normal')).toBe(100)
  })

  it('add clamps at 255', () => {
    expect(blendPixel(200, 100, 'add')).toBeCloseTo(255, -1)
  })
})
