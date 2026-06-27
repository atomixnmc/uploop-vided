/**
 * 20-final-composite — Full pipeline: Timeline → Compositor → Preview.
 *
 * Creates a multi-track timeline with video clips, audio, text overlays,
 * and transitions. Renders a preview canvas at current timeline time.
 * Timeline scrubber, play/pause, current time display.
 *
 * @uses @uploop/html (html, component)
 * @uses @uploop/timeline (Timeline, Track, Clip)
 * @uses @uploop/compositor (Compositor, Layer)
 */

import { html, component } from "@uploop/html";
import { Timeline, Track, Clip } from "@uploop/timeline";
import { Compositor, Layer } from "@uploop/compositor";

// ── Build timeline data ───────────────────────────────────────────

const videoClips = [
  new Clip({
    id: "v1",
    source:
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
    inPoint: 0,
    outPoint: 8,
    props: { opacity: 1, scale: 1, x: 0, y: 0 },
  }),
  new Clip({
    id: "v2",
    source:
      "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",
    inPoint: 7,
    outPoint: 15,
    props: { opacity: 1, scale: 1, x: 0, y: 0 },
  }),
  new Clip({
    id: "v3",
    source:
      "https://test-videos.co.uk/vids/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4",
    inPoint: 14,
    outPoint: 22,
    props: { opacity: 1, scale: 1, x: 0, y: 0 },
  }),
];

const textClips = [
  new Clip({
    id: "t1",
    source: "text:Big Buck Bunny",
    inPoint: 0.5,
    outPoint: 7,
    props: { opacity: 0.9, x: 0, y: 0.35 },
  }),
  new Clip({
    id: "t2",
    source: "text:Jellyfish",
    inPoint: 7.5,
    outPoint: 14,
    props: { opacity: 0.9, x: 0, y: 0.35 },
  }),
  new Clip({
    id: "t3",
    source: "text:Sintel Trailer",
    inPoint: 14.5,
    outPoint: 22,
    props: { opacity: 0.9, x: 0, y: 0.35 },
  }),
];

const effectClips = [
  new Clip({
    id: "e1",
    source: "effect:vignette",
    inPoint: 0,
    outPoint: 8,
    props: { opacity: 0.15 },
  }),
  new Clip({
    id: "e2",
    source: "effect:gradient-warm",
    inPoint: 7,
    outPoint: 15,
    props: { opacity: 0.1 },
  }),
  new Clip({
    id: "e3",
    source: "effect:gradient-cool",
    inPoint: 14,
    outPoint: 22,
    props: { opacity: 0.1 },
  }),
];

const videoTrack = new Track({
  id: "track-video",
  type: "video",
  clips: videoClips,
});
const textTrack = new Track({
  id: "track-text",
  type: "text",
  clips: textClips,
});
const effectTrack = new Track({
  id: "track-fx",
  type: "effect",
  clips: effectClips,
});

const timeline = new Timeline({
  id: "demo-timeline",
  name: "Demo Composite",
  fps: 30,
  width: 640,
  height: 360,
  tracks: [videoTrack, textTrack, effectTrack],
});

const compositor = new Compositor({ width: 640, height: 360 });
const totalDuration = timeline.duration;

// ── Video pool ────────────────────────────────────────────────────

const videoPool = {};
function getVideo(src) {
  if (!videoPool[src]) {
    const v = document.createElement("video");
    v.src = src;
    v.muted = true;
    v.playsInline = true;
    v.crossOrigin = "anonymous";
    v.preload = "auto";
    videoPool[src] = v;
  }
  return videoPool[src];
}
for (const c of videoClips) getVideo(c.source);

// ── Helpers ───────────────────────────────────────────────────────

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${s.toFixed(2).padStart(5, "0")}`;
}

function renderPreviewFrame(ctx, cw, ch, time) {
  ctx.clearRect(0, 0, cw, ch);
  ctx.fillStyle = "#0a0a0f";
  ctx.fillRect(0, 0, cw, ch);

  // Video layer
  const activeVideo = videoTrack.getClipAt(time);
  if (activeVideo) {
    const props = activeVideo.getPropsAt(time);
    const video = getVideo(activeVideo.source);
    const srcTime = activeVideo.sourceTimeAt(time);
    if (Math.abs(video.currentTime - srcTime) > 0.3) {
      video.currentTime = srcTime;
    }
    if (video.readyState >= 2) {
      ctx.save();
      ctx.globalAlpha = props.opacity;
      ctx.drawImage(video, 0, 0, cw, ch);
      ctx.restore();
    } else {
      ctx.fillStyle = "#1a1a28";
      ctx.fillRect(0, 0, cw, ch);
      ctx.fillStyle = "#444";
      ctx.font = "14px system-ui";
      ctx.textAlign = "center";
      ctx.fillText("Loading...", cw / 2, ch / 2);
    }
  }

  // Effect overlay
  const activeFx = effectTrack.getClipAt(time);
  if (activeFx) {
    const props = activeFx.getPropsAt(time);
    const alpha = Math.min(1, props.opacity || 0);
    if (activeFx.source === "effect:vignette") {
      const grad = ctx.createRadialGradient(
        cw / 2,
        ch / 2,
        cw * 0.4,
        cw / 2,
        ch / 2,
        cw * 0.75,
      );
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, `rgba(0,0,0,${alpha})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, cw, ch);
    } else if (activeFx.source === "effect:gradient-warm") {
      ctx.fillStyle = `rgba(255,140,0,${alpha * 0.5})`;
      ctx.fillRect(0, 0, cw, ch);
    } else if (activeFx.source === "effect:gradient-cool") {
      ctx.fillStyle = `rgba(0,100,255,${alpha * 0.5})`;
      ctx.fillRect(0, 0, cw, ch);
    }
  }

  // Text overlay
  const activeText = textTrack.getClipAt(time);
  if (activeText && activeText.source.startsWith("text:")) {
    const text = activeText.source.replace("text:", "");
    const props = activeText.getPropsAt(time);
    ctx.save();
    ctx.globalAlpha = props.opacity || 0.9;
    ctx.font = "bold 22px system-ui";
    const tw = ctx.measureText(text).width;
    const th = 30;
    const tx = cw / 2 - tw / 2 - 16;
    const ty = ch * 0.75;
    ctx.fillStyle = "#00000088";
    ctx.fillRect(tx, ty, tw + 32, th + 16);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cw / 2, ty + th / 2 + 8);
    ctx.restore();
  }

  // Timecode
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(cw - 100, 8, 92, 22);
  ctx.fillStyle = "#4f8";
  ctx.font = "12px monospace";
  ctx.textAlign = "right";
  ctx.fillText(formatTime(time), cw - 14, 24);
}

// ── Component ─────────────────────────────────────────────────────

const FinalComposite = component("FinalComposite", {
  state: {
    timeline,
    compositor,
    currentTime: 0,
    playing: false,
    selectedClip: null,
    tracks: [videoTrack, textTrack, effectTrack],
  },

  update: {
    play: (s) => ({ ...s, playing: true }),
    pause: (s) => ({ ...s, playing: false }),
    seek: (s, time) => ({
      ...s,
      currentTime: Math.max(0, Math.min(totalDuration, time)),
    }),
    selectClip: (s, clip) => ({ ...s, selectedClip: clip }),
    addTrack: (s, type) => {
      const newTrack = new Track({
        id: `track-${type}-${Date.now()}`,
        type,
        clips: [],
      });
      s.timeline.addTrack(newTrack);
      return { ...s, tracks: [...s.timeline.tracks] };
    },
    addClip: (s, { trackId, clip }) => {
      const t = s.timeline.getTrack(trackId);
      if (t) t.addClip(clip);
      return { ...s, tracks: [...s.timeline.tracks] };
    },
    tick: (s, dt = 0.016) => {
      if (!s.playing) return s;
      const nextTime = s.currentTime + dt;
      if (nextTime >= totalDuration)
        return { ...s, currentTime: totalDuration, playing: false };
      return { ...s, currentTime: nextTime };
    },
  },

  view: (state, { send }) => {
    const { currentTime, playing, selectedClip, tracks } = state;
    const maxTime = totalDuration;
    const scrubValue = Math.round(currentTime * 100);
    const trackIcons = { video: "🎬", audio: "🔊", text: "📝", effect: "✨" };

    return html`
      <a href=".." class="back">← Examples</a>

      <div class="layout">
        <div class="preview-card">
          <canvas
            id="preview-canvas"
            ref="previewCanvas"
            width="640"
            height="360"
          ></canvas>
        </div>

        <div class="timeline-card">
          <h3>📊 Timeline</h3>
          <div class="time-display" id="time-display">
            ${formatTime(currentTime)}
          </div>

          <div class="scrubber-row">
            <input
              type="range"
              id="scrubber"
              min="0"
              max=${Math.round(maxTime * 100)}
              value=${scrubValue}
              step="1"
              @input=${(e) => send("seek", Number(e.target.value) / 100)}
            />
            <span id="duration-label">${formatTime(maxTime)}</span>
          </div>

          <div class="controls-row">
            <button
              id="btn-play"
              @click=${() => send(playing ? "pause" : "play")}
            >
              ${playing ? "⏸ Pause" : "▶ Play"}
            </button>
            <button
              id="btn-stop"
              @click=${() => {
                send("pause");
                send("seek", 0);
              }}
            >
              ⏹ Stop
            </button>
            <button
              id="btn-restart"
              @click=${() => {
                send("seek", 0);
                send("play");
              }}
            >
              ↺ Restart
            </button>
          </div>

          <div class="track-list" id="track-list">
            ${tracks.map((t) => {
              const activeClips = t.getClipsAt(currentTime);
              return html`<div class="track-item">
                <span class="track-icon ${t.type}"
                  >${trackIcons[t.type] || "📦"}</span
                >
                <div class="track-info">
                  <div class="track-name">${t.id}</div>
                  <div class="track-clips">
                    ${t.clips.length} clips · ${activeClips.length} active ·
                    ${t.type}
                  </div>
                </div>
              </div>`;
            })}
          </div>

          ${selectedClip
            ? html`<div
                class="clip-inspector"
                style="margin-top:12px;padding:10px;background:#1a1a28;border-radius:6px;font-size:12px;"
              >
                <div style="color:#4f8;margin-bottom:6px;">
                  📋 Clip: ${selectedClip.id}
                </div>
                <div style="color:#888;">Source: ${selectedClip.source}</div>
                <div style="color:#888;">
                  In: ${selectedClip.inPoint.toFixed(1)}s · Out:
                  ${selectedClip.outPoint.toFixed(1)}s
                </div>
              </div>`
            : ""}
        </div>
      </div>

      <div class="info">
        Full pipeline: <code>Timeline</code> + <code>Compositor</code> —
        multi-track, text overlays, preview canvas
      </div>
    `;
  },

  mount: (el, ctx) => {
    let rafId = null;
    let lastTime = 0;

    const loop = (now) => {
      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const s = ctx.getState();
      if (s.playing) ctx.send("tick", dt);

      const canvas = el.querySelector("canvas");
      if (canvas) {
        renderPreviewFrame(
          canvas.getContext("2d"),
          640,
          360,
          ctx.getState().currentTime,
        );
      }

      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    const handleKey = (e) => {
      const s = ctx.getState();
      switch (e.key) {
        case " ":
          e.preventDefault();
          ctx.send(s.playing ? "pause" : "play");
          break;
        case "ArrowLeft":
          ctx.send("seek", Math.max(0, s.currentTime - 1 / timeline.fps));
          break;
        case "ArrowRight":
          ctx.send(
            "seek",
            Math.min(totalDuration, s.currentTime + 1 / timeline.fps),
          );
          break;
        case "Home":
          ctx.send("seek", 0);
          break;
        case "End":
          ctx.send("seek", totalDuration);
          ctx.send("pause");
          break;
      }
    };
    window.addEventListener("keydown", handleKey);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", handleKey);
    };
  },
});

export { FinalComposite };
export default FinalComposite;

// ── Mount ─────────────────────────────────────────────────────────

while (document.body.firstChild) {
  document.body.removeChild(document.body.firstChild);
}
document.body.appendChild(new FinalComposite());

console.log(
  "%c🎬 Final Composite%c | %d tracks · %d clips · duration %ss",
  "color:#4f8",
  "",
  timeline.tracks.length,
  timeline.tracks.reduce((sum, t) => sum + t.clips.length, 0),
  totalDuration.toFixed(1),
);
console.log("  Timeline: video + text + fx tracks");
console.log("  Controls: ▶ play/pause | scrubber | ← → = frame step");
