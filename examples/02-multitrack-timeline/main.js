/**
 * 02-multitrack-timeline — Multi-track timeline with colored block placeholders.
 *
 * Demonstrates @uploop/timeline's Timeline, Track, and Clip for multi-track
 * sequencing. 3 tracks (video, text, audio) rendered via html templates.
 */
import { html, component } from "@uploop/html";
import { Timeline, Track, Clip } from "@uploop/timeline";

const timeline = new Timeline({
  name: "Multitrack Demo",
  fps: 30,
  width: 1920,
  height: 1080,
});

const videoTrack = new Track({ id: "v1", type: "video" });
videoTrack.addClip(
  new Clip({
    id: "vc1",
    source: "scene-a",
    inPoint: 0,
    outPoint: 4,
    props: { label: "Scene A", color: "#3a6fc5" },
  }),
);
videoTrack.addClip(
  new Clip({
    id: "vc2",
    source: "scene-b",
    inPoint: 4,
    outPoint: 7,
    props: { label: "Scene B", color: "#5c8aee" },
  }),
);
videoTrack.addClip(
  new Clip({
    id: "vc3",
    source: "scene-c",
    inPoint: 7,
    outPoint: 10,
    props: { label: "Scene C", color: "#7aa4ff" },
  }),
);
timeline.addTrack(videoTrack);

const textTrack = new Track({ id: "t1", type: "text" });
textTrack.addClip(
  new Clip({
    id: "tx1",
    source: "title",
    inPoint: 0.5,
    outPoint: 3.5,
    props: { label: "Opening Title", color: "#c54f3a" },
  }),
);
textTrack.addClip(
  new Clip({
    id: "tx2",
    source: "subtitle",
    inPoint: 5,
    outPoint: 9,
    props: { label: "Lower Third", color: "#e07050" },
  }),
);
timeline.addTrack(textTrack);

const audioTrack = new Track({ id: "a1", type: "audio" });
audioTrack.addClip(
  new Clip({
    id: "ac1",
    source: "music-a",
    inPoint: 0,
    outPoint: 10,
    props: { label: "Background Music", color: "#3ac54f" },
  }),
);
audioTrack.addClip(
  new Clip({
    id: "ac2",
    source: "sfx-1",
    inPoint: 2,
    outPoint: 2.5,
    props: { label: "SFX Whoosh", color: "#5fe070" },
  }),
);
audioTrack.addClip(
  new Clip({
    id: "ac3",
    source: "sfx-2",
    inPoint: 6,
    outPoint: 6.8,
    props: { label: "SFX Impact", color: "#5fe070" },
  }),
);
timeline.addTrack(audioTrack);

const totalDuration = timeline.duration;
const trackLabels = ["Video", "Text", "Audio"];

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(2).padStart(5, "0");
  return `${String(m).padStart(2, "0")}:${sec}`;
}

const TimelineDemo = component("TimelineDemo", {
  state: {
    timeline,
    currentTime: 0,
    playing: false,
  },

  update: {
    togglePlay: (s) => {
      if (s.currentTime >= totalDuration)
        return { ...s, currentTime: 0, playing: true };
      return { ...s, playing: !s.playing };
    },
    stop: (s) => ({ ...s, playing: false, currentTime: 0 }),
    seek: (s, time) => ({
      ...s,
      currentTime: Math.max(0, Math.min(totalDuration, time)),
    }),
    tick: (s, dt) => {
      if (!s.playing) return s;
      const newTime = s.currentTime + dt;
      if (newTime >= totalDuration)
        return { ...s, currentTime: totalDuration, playing: false };
      return { ...s, currentTime: newTime };
    },
  },

  view: (state, { send }) => {
    const { currentTime, playing } = state;
    const active = timeline.getActiveClips(currentTime);
    const videoClips = active.filter((a) => a.track.type === "video");
    const textClips = active.filter((a) => a.track.type === "text");
    const playheadPct = (currentTime / totalDuration) * 100;

    return html`
      <div
        class="stage"
        style="
        width:min(800px,90vw);background:#151520;border-radius:12px;
        padding:20px;display:flex;flex-direction:column;gap:16px;
      "
      >
        <!-- Preview area -->
        <div
          class="preview"
          style="
          aspect-ratio:16/9;background:#0d0d18;border-radius:8px;
          position:relative;overflow:hidden;
        "
        >
          ${videoClips.map(
            ({ clip }) => html`
              <div
                style="
              position:absolute;inset:0;display:flex;
              align-items:center;justify-content:center;
              font-size:16px;font-weight:600;color:#fff;
              background:${clip.props.color};border-radius:6px;
              opacity:1;
            "
              >
                ${clip.props.label}
              </div>
            `,
          )}
          ${textClips.map(({ clip }) => {
            const progress =
              (currentTime - clip.inPoint) / (clip.outPoint - clip.inPoint);
            return html`
              <div
                style="
                position:absolute;left:10%;right:10%;bottom:12%;
                height:48px;background:rgba(0,0,0,0.7);color:#fff;
                font-size:18px;display:flex;align-items:center;
                justify-content:flex-start;padding-left:16px;
                border-left:3px solid ${clip.props.color};
                border-radius:6px;opacity:${Math.min(progress * 4, 1)};
              "
              >
                ${clip.props.label}
              </div>
            `;
          })}
        </div>

        <!-- Transport controls -->
        <div
          class="transport"
          style="display:flex;align-items:center;gap:12px;"
        >
          <button
            @click=${() => send("togglePlay")}
            style="
            background:${playing ? "#4f8" : "#2a2a3a"};color:${playing
              ? "#0a0a0f"
              : "#e0e0e0"};
            border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;
          "
          >
            ${playing ? "⏸ Pause" : "▶ Play"}
          </button>
          <button
            @click=${() => send("stop")}
            style="
            background:#2a2a3a;border:none;color:#e0e0e0;
            padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;
          "
          >
            ■ Stop
          </button>
          <span
            class="timecode"
            style="font-family:monospace;font-size:14px;color:#888;margin-left:auto;"
          >
            ${fmtTime(currentTime)} / ${fmtTime(totalDuration)}
          </span>
        </div>

        <!-- Timeline visualization -->
        <div
          class="timeline-viz"
          @click=${(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            send("seek", pct * totalDuration);
          }}
          style="
          position:relative;height:100px;background:#0d0d18;
          border-radius:8px;overflow:hidden;cursor:pointer;
        "
        >
          ${timeline.tracks.map(
            (track, i) => html`
              <div
                class="track-label"
                style="
              position:absolute;left:4px;top:${i * 32 + 4}px;
              height:28px;display:flex;align-items:center;
              font-size:11px;color:#888;padding:0 4px;
            "
              >
                ${trackLabels[i]}
              </div>
            `,
          )}
          ${timeline.tracks.map((track, i) =>
            track.clips.map(
              (clip) => html`
                <div
                  title="${clip.props.label} [${clip.inPoint.toFixed(
                    1,
                  )}s–${clip.outPoint.toFixed(1)}s]"
                  style="
                position:absolute;top:${i * 32 + 4}px;
                left:${(clip.inPoint / totalDuration) * 100}%;
                width:${((clip.outPoint - clip.inPoint) / totalDuration) *
                  100}%;
                height:20px;background:${clip.props.color};
                border-radius:4px;
              "
                ></div>
              `,
            ),
          )}
          <div
            class="playhead"
            style="
            position:absolute;top:0;bottom:0;width:2px;
            background:#f44;left:${playheadPct}%;z-index:2;
          "
          ></div>
        </div>

        <!-- Legend -->
        <div
          class="legend"
          style="display:flex;gap:16px;font-size:12px;color:#888;"
        >
          <span style="display:flex;align-items:center;gap:6px;">
            <span
              style="width:12px;height:12px;border-radius:3px;background:#3a6fc5;"
            ></span>
            Video
          </span>
          <span style="display:flex;align-items:center;gap:6px;">
            <span
              style="width:12px;height:12px;border-radius:3px;background:#c54f3a;"
            ></span>
            Text
          </span>
          <span style="display:flex;align-items:center;gap:6px;">
            <span
              style="width:12px;height:12px;border-radius:3px;background:#3ac54f;"
            ></span>
            Audio
          </span>
        </div>
      </div>
    `;
  },

  mount(el, ctx) {
    let lastTick = 0;
    let rafId;

    function loop(now) {
      if (lastTick === 0) lastTick = now;
      const dt = Math.min((now - lastTick) / 1000, 0.1);
      lastTick = now;
      ctx.send("tick", dt);
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    ctx.registerResource("timeline-loop", {
      save: () => ({ rafId }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  },
});

export { TimelineDemo };
export default TimelineDemo;

// Auto-mount
const stage = document.querySelector(".stage");
if (stage) stage.replaceWith(new TimelineDemo());
else document.body.appendChild(new TimelineDemo());
