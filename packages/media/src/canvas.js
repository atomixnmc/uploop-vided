/**
 * Canvas utilities
 */

/** @param {number} w @param {number} h @returns {{ canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D }} */
export function createCanvas(w, h) {
  throw new Error('@uploop/media: createCanvas not implemented')
}

export const imageDataOps = {
  flip: () => { throw new Error('not implemented') },
  rotate: () => { throw new Error('not implemented') },
  grayscale: () => { throw new Error('not implemented') },
}
