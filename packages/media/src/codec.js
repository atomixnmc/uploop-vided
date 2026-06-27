/**
 * Codec registry — register, query, prefer codecs
 */

export class CodecRegistry {
  constructor() { throw new Error('@uploop/media: CodecRegistry not implemented') }
  register(codec) { throw new Error('not implemented') }
  supports(codec) { return false }
  prefer(order) { throw new Error('not implemented') }
}
