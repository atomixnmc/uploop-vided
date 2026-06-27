/**
 * Image decode & transform — WebCodecs ImageDecoder + canvas fallback
 */

/** @param {Blob|ArrayBuffer} src @returns {Promise<ImageData>} */
export async function decodeImage(src) {
  throw new Error('@uploop/media: decodeImage not implemented')
}

/** @param {ImageData} img @param {number} w @param {number} h @returns {ImageData} */
export function resizeImage(img, w, h) {
  throw new Error('@uploop/media: resizeImage not implemented')
}

/** @param {ImageData} img @param {number} x @param {number} y @param {number} w @param {number} h @returns {ImageData} */
export function cropImage(img, x, y, w, h) {
  throw new Error('@uploop/media: cropImage not implemented')
}

/** @param {Blob|ArrayBuffer} src @returns {string} 'png'|'jpeg'|'webp'|'avif'|'unknown' */
export function imageFormat(src) {
  return 'unknown'
}
