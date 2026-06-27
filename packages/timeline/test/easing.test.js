/**
 * Smoke tests for timeline/easing — pure functions, no stubs needed.
 */
import { describe, it, expect } from 'vitest'
import { easing } from '@uploop/timeline'

describe('easing', () => {
  it('linear returns identity', () => {
    expect(easing.linear(0)).toBe(0)
    expect(easing.linear(0.5)).toBe(0.5)
    expect(easing.linear(1)).toBe(1)
  })

  it('easeIn is quadratic', () => {
    expect(easing.easeIn(0)).toBe(0)
    expect(easing.easeIn(0.5)).toBe(0.25)  // 0.5²
    expect(easing.easeIn(1)).toBe(1)
  })

  it('easeOut flips quadratic', () => {
    expect(easing.easeOut(0)).toBe(0)
    expect(easing.easeOut(0.5)).toBe(0.75)  // 1 - (0.5)²
    expect(easing.easeOut(1)).toBe(1)
  })

  it('easeInOut is symmetric', () => {
    expect(easing.easeInOut(0)).toBe(0)
    expect(easing.easeInOut(0.25)).toBe(0.125) // 2 * 0.25²
    expect(easing.easeInOut(0.5)).toBe(0.5)
    expect(easing.easeInOut(0.75)).toBe(0.875)
    expect(easing.easeInOut(1)).toBe(1)
  })
})
