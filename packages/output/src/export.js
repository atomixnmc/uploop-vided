/**
 * Export presets
 */

export const ExportPresets = {
  hd: { name: 'hd', width: 1920, height: 1080, fps: 30, codec: 'avc1', bitrate: 8_000_000 },
  '4k': { name: '4k', width: 3840, height: 2160, fps: 30, codec: 'avc1', bitrate: 35_000_000 },
  social: { name: 'social', width: 1080, height: 1920, fps: 30, codec: 'avc1', bitrate: 6_000_000 },
  stream: { name: 'stream', width: 1280, height: 720, fps: 30, codec: 'vp9', bitrate: 2_500_000 },
}
