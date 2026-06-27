/**
 * 08-text-overlay — Animated text overlay on video with keyframe timing.
 *
 * Demonstrates @uploop/timeline's Keyframe & KeyframeTrack for driving
 * text opacity and position animations over a playing video.
 */
import { html, component } from "@uploop/html";
import { Keyframe, KeyframeTrack } from "@uploop/timeline";

const DURATION = 5;
const VIDEO_SRC =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4";

// Keyframe tracks for title and subtitle opacity
const titleTrack = new KeyframeTrack({
  property: "opacity",
  keyframes: [
    new Keyframe({ time: 0, value: 0 }),
    new Keyframe({ time: 1, value: 1, easing: "easeOutCubic" }),
    new Keyframe({ time: 3.5, value: 1 }),
    new Keyframe({ time: 4.5, value: 0, easing: "easeInCubic" }),
    new Keyframe({ time: 5, value: 0 }),
  ],
});

const subtitleTrack = new KeyframeTrack({
  property: "opacity",
  keyframes: [
    new Keyframe({ time: 0.5, value: 0 }),
    new Keyframe({ time: 1.5, value: 1, easing: "easeOutCubic" }),
    new Keyframe({ time: 3, value: 1 }),
    new Keyframe({ time: 4, value: 0, easing: "easeInCubic" }),
    new Keyframe({ time: 5, value: 0 }),
  ],
});

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, "0");
  return `${String(m).padStart(2, "0")}:${sec}`;
}

const TextOverlay = component("TextOverlay", {
  state: {
    time: 0,
    playing: false,
    title: "Big Buck Bunny",
    subtitle: "An Uploop Production",
    duration: DURATION,
  },

  update: {
    togglePlay(s) {
      if (s.time >= s.duration) return { ...s, time: 0, playing: true };
      return { ...s, playing: !s.playing };
    },
    tick(s, dt) {
      if (!s.playing) return s;
      const newTime = s.time + dt;
      if (newTime >= s.duration) {
        return { ...s, time: s.duration, playing: false };
      }
      return { ...s, time: newTime };
    },
    seek(s, t) {
      return { ...s, time: Math.max(0, Math.min(s.duration, t)) };
    },
    setTitle(s, t) {
      return { ...s, title: t };
    },
    setSubtitle(s, t) {
      return { ...s, subtitle: t };
    },
  },

  view: (state, { send }) => {
    const titleOpacity = titleTrack.getValueAt(state.time) ?? 0;
    const subtitleOpacity = subtitleTrack.getValueAt(state.time) ?? 0;
    const progressPct = (state.time / state.duration) * 100;

    return html`
      <a href=".." class="back">← Examples</a>
      <div
        class="stage"
        style="
        position:relative;width:min(800px,90vw);border-radius:12px;
        overflow:hidden;background:#000;
      "
      >
        <video
          data-ref="video"
          src="${VIDEO_SRC}"
          muted
          loop
          playsinline
          style="display:block;width:100%;border-radius:12px;"
        ></video>
        <div
          class="overlay"
          style="
          position:absolute;inset:0;display:flex;flex-direction:column;
          align-items:center;justify-content:center;
          pointer-events:none;padding:40px;
        "
        >
          <div
            data-ref="title-el"
            style="
            font-size:clamp(1.5rem,4vw,2.5rem);font-weight:700;color:#fff;
            text-shadow:0 2px 12px rgba(0,0,0,0.7);
            opacity:${titleOpacity};
          "
          >
            ${state.title}
          </div>
          <div
            data-ref="subtitle-el"
            style="
            font-size:clamp(1rem,2.5vw,1.4rem);font-weight:400;color:#ccc;
            text-shadow:0 1px 8px rgba(0,0,0,0.6);margin-top:8px;
            opacity:${subtitleOpacity};
          "
          >
            ${state.subtitle}
          </div>
        </div>
      </div>

      <!-- Timeline bar -->
      <div
        class="timeline-bar"
        @click=${(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const pct = (e.clientX - rect.left) / rect.width;
          send("seek", pct * state.duration);
        }}
        style="
        width:min(800px,90vw);height:4px;background:#1a1a2e;
        border-radius:2px;margin-top:16px;overflow:hidden;cursor:pointer;
      "
      >
        <div
          class="timeline-progress"
          style="
          height:100%;background:#4f8;border-radius:2px;
          width:${progressPct}%;
        "
        ></div>
      </div>

      <!-- Controls -->
      <div
        class="controls"
        style="display:flex;align-items:center;gap:12px;margin-top:12px;"
      >
        <button
          @click=${() => send("togglePlay")}
          style="
          background:${state.playing ? "#4f8" : "#2a2a3a"};
          color:${state.playing ? "#0a0a0f" : "#e0e0e0"};
          border:none;padding:8px 16px;border-radius:6px;
          cursor:pointer;font-size:14px;font-family:inherit;
        "
        >
          ${state.playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <span style="font-family:monospace;font-size:13px;color:#888;">
          ${fmtTime(state.time)} / ${fmtTime(state.duration)}
        </span>
      </div>

      <!-- Input fields -->
      <div
        style="display:flex;gap:12px;margin-top:12px;flex-wrap:wrap;justify-content:center;"
      >
        <label
          style="font-size:13px;color:#888;display:flex;align-items:center;gap:6px;"
        >
          Title
          <input
            value="${state.title}"
            @input=${(e) => send("setTitle", e.target.value)}
            style="
            background:#1a1a2e;color:#e0e0e0;border:1px solid #3a3a50;
            padding:6px 10px;border-radius:6px;font-size:13px;
            font-family:inherit;width:200px;
          "
          />
        </label>
        <label
          style="font-size:13px;color:#888;display:flex;align-items:center;gap:6px;"
        >
          Subtitle
          <input
            value="${state.subtitle}"
            @input=${(e) => send("setSubtitle", e.target.value)}
            style="
            background:#1a1a2e;color:#e0e0e0;border:1px solid #3a3a50;
            padding:6px 10px;border-radius:6px;font-size:13px;
            font-family:inherit;width:260px;
          "
          />
        </label>
      </div>

      <div class="info" style="margin-top:12px;font-size:13px;color:#666;">
        Using <code>KeyframeTrack</code> from <code>@uploop/timeline</code> for
        text animation timing
      </div>
    `;
  },

  mount(el, ctx) {
    const video = el.querySelector('[data-ref="video"]');
    let lastTick = 0;
    let rafId;

    function loop(now) {
      if (lastTick === 0) lastTick = now;
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;

      const s = ctx.get();
      if (s.playing) {
        // Sync video playback with state
        if (video.paused) {
          video.play().catch(() => {});
        }
        // Derive time from video if available
        if (video.currentTime && video.currentTime > 0) {
          const vidTime = video.currentTime % s.duration;
          if (Math.abs(vidTime - s.time) > 0.1) {
            ctx.send("tick", vidTime - s.time);
          }
        } else {
          ctx.send("tick", dt);
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    // Sync on video events
    const onPlay = () => {
      const s = ctx.get();
      if (!s.playing) ctx.send("togglePlay");
    };
    const onPause = () => {
      const s = ctx.get();
      if (s.playing) ctx.send("togglePlay");
    };
    const onEnded = () => {
      const s = ctx.get();
      if (s.time < s.duration) {
        ctx.send("seek", s.duration);
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("ended", onEnded);

    // Keyboard
    const onKey = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        ctx.send("togglePlay");
      }
    };
    window.addEventListener("keydown", onKey);

    ctx.registerResource("text-overlay", {
      save: () => ({ rafId, onKey }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("ended", onEnded);
      window.removeEventListener("keydown", onKey);
    };
  },
});

export { TextOverlay };
export default TextOverlay;

// Auto-mount
const stage = document.querySelector(".stage");
if (stage) stage.replaceWith(new TextOverlay());
else document.body.appendChild(new TextOverlay());
