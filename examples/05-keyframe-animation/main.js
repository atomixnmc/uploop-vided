/**
 * 05-keyframe-animation — Animated box with keyframe interpolation.
 *
 * Demonstrates @uploop/timeline's Keyframe, KeyframeTrack, and easing
 * for property interpolation. Animated box for x, y, opacity, scale.
 * Keyframe editor with draggable points per property track.
 */
import { html, component } from "@uploop/html";
import { Keyframe, KeyframeTrack, easing } from "@uploop/timeline";

const DURATION = 3;

const tracks = {
  x: new KeyframeTrack({
    property: "x",
    keyframes: [
      new Keyframe({ time: 0, value: 0, easing: "easeInOutCubic" }),
      new Keyframe({ time: 1, value: 300, easing: "easeInOutCubic" }),
      new Keyframe({ time: 2, value: 100, easing: "easeInOutCubic" }),
      new Keyframe({ time: 3, value: 200, easing: "linear" }),
    ],
  }),
  y: new KeyframeTrack({
    property: "y",
    keyframes: [
      new Keyframe({ time: 0, value: 0, easing: "easeInOutCubic" }),
      new Keyframe({ time: 1.5, value: 120, easing: "easeOutCubic" }),
      new Keyframe({ time: 3, value: 0, easing: "easeInCubic" }),
    ],
  }),
  opacity: new KeyframeTrack({
    property: "opacity",
    keyframes: [
      new Keyframe({ time: 0, value: 1 }),
      new Keyframe({ time: 0.3, value: 0.4, easing: "easeOut" }),
      new Keyframe({ time: 1.5, value: 1, easing: "easeIn" }),
      new Keyframe({ time: 2.5, value: 0.5, easing: "easeInOut" }),
      new Keyframe({ time: 3, value: 1 }),
    ],
  }),
  scale: new KeyframeTrack({
    property: "scale",
    keyframes: [
      new Keyframe({ time: 0, value: 1 }),
      new Keyframe({ time: 1, value: 1.5, easing: "easeOutCubic" }),
      new Keyframe({ time: 2, value: 0.8, easing: "easeInCubic" }),
      new Keyframe({ time: 3, value: 1, easing: "easeInOut" }),
    ],
  }),
};

const propColors = {
  x: "#ff6b6b",
  y: "#4ecdc4",
  opacity: "#ffe66d",
  scale: "#a29bfe",
};
const propNames = ["x", "y", "opacity", "scale"];

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(2).padStart(5, "0");
  return `${String(m).padStart(2, "0")}:${sec}`;
}

const KeyframeEditor = component("KeyframeEditor", {
  state: {
    tracks,
    time: 0,
    playing: false,
    loop: true,
    selectedKf: null,
    _key: 0, // force re-render on keyframe add/remove
  },

  update: {
    togglePlay: (s) => {
      if (s.time >= DURATION) return { ...s, time: 0, playing: true };
      return { ...s, playing: !s.playing };
    },
    stop: (s) => ({ ...s, playing: false, time: 0 }),
    toggleLoop: (s) => ({ ...s, loop: !s.loop }),
    seek: (s, time) => ({ ...s, time: Math.max(0, Math.min(DURATION, time)) }),
    tick: (s, dt) => {
      if (!s.playing) return s;
      const newTime = s.time + dt;
      if (newTime >= DURATION) {
        if (s.loop) return { ...s, time: 0 };
        return { ...s, time: DURATION, playing: false };
      }
      return { ...s, time: newTime };
    },
    addKeyframe: (s, prop, time) => {
      const track = s.tracks[prop];
      const val = track.getValueAt(time) ?? 0;
      track.addKeyframe(
        new Keyframe({ time, value: val, easing: "easeInOut" }),
      );
      return { ...s, _key: s._key + 1 };
    },
    moveKeyframe: (s, prop, idx, newTime) => {
      const track = s.tracks[prop];
      if (track.keyframes[idx]) {
        track.keyframes[idx].time = Math.max(0, Math.min(DURATION, newTime));
        track.keyframes.sort((a, b) => a.time - b.time);
      }
      return { ...s, _key: s._key + 1 };
    },
    selectKeyframe: (s, kf) => ({ ...s, selectedKf: kf }),
  },

  view: (state, { send }) => {
    const { time, playing, loop, _key } = state;

    const x = tracks.x.getValueAt(time) || 0;
    const y = tracks.y.getValueAt(time) || 0;
    const opacity = tracks.opacity.getValueAt(time) || 1;
    const scale = tracks.scale.getValueAt(time) || 1;

    return html`
      <div
        class="stage"
        style="
        width:min(800px,90vw);background:#151520;border-radius:12px;
        padding:20px;display:flex;flex-direction:column;gap:16px;
      "
      >
        <!-- Animation canvas area -->
        <div
          class="canvas-area"
          @click=${(e) => {
            if (e.target !== e.currentTarget) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = (e.clientX - rect.left) / rect.width;
            send("seek", pct * DURATION);
          }}
          style="
          aspect-ratio:16/9;background:#0d0d18;border-radius:8px;
          position:relative;overflow:hidden;
        "
        >
          <div
            class="animated-box"
            style="
            position:absolute;width:80px;height:80px;
            background:linear-gradient(135deg,#4f8,#2af);
            border-radius:10px;
            display:flex;align-items:center;justify-content:center;
            font-size:11px;font-weight:600;color:#0a0a0f;
            transform:translate(${x}px,${y}px) scale(${scale});
            opacity:${opacity};
            left:0;top:50%;margin-top:-40px;
          "
          >
            Uploop
          </div>
          <!-- Time indicator -->
          <div
            style="
            position:absolute;bottom:4px;left:4px;font-size:11px;
            color:#888;background:rgba(0,0,0,0.5);padding:2px 6px;border-radius:3px;
          "
          >
            ${fmtTime(time)}
          </div>
        </div>

        <!-- Transport -->
        <div
          class="transport"
          style="display:flex;align-items:center;gap:12px;"
        >
          <button
            @click=${() => send("togglePlay")}
            style="
            background:${playing ? "#4f8" : "#2a2a3a"};
            color:${playing ? "#0a0a0f" : "#e0e0e0"};
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
          <button
            @click=${() => send("toggleLoop")}
            style="
            background:${loop ? "#3a5c3a" : "#2a2a3a"};
            border:none;color:#e0e0e0;
            padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;
          "
          >
            🔁 Loop
          </button>
          <span
            class="timecode"
            style="font-family:monospace;font-size:14px;color:#888;margin-left:auto;"
          >
            ${fmtTime(time)} / ${fmtTime(DURATION)}
          </span>
        </div>

        <!-- Keyframe editor -->
        <div
          class="keyframe-editor"
          data-key="${_key}"
          style="background:#0d0d18;border-radius:8px;padding:12px 16px;"
        >
          <h3 style="font-size:13px;color:#888;margin:0 0 8px;">
            Keyframe Tracks
          </h3>
          ${propNames.map((prop) => {
            const track = tracks[prop];
            return html`
              <div
                class="prop-row"
                style="display:flex;align-items:center;gap:10px;margin-bottom:6px;font-size:12px;"
              >
                <span
                  class="prop-name"
                  style="width:70px;color:${propColors[prop]};"
                  >${prop}</span
                >
                <div
                  class="kf-bar"
                  @click=${(e) => {
                    if (e.target !== e.currentTarget) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = Math.max(
                      0,
                      Math.min(1, (e.clientX - rect.left) / rect.width),
                    );
                    send("addKeyframe", prop, pct * DURATION);
                  }}
                  style="
                  flex:1;height:24px;background:#151520;border-radius:4px;
                  position:relative;cursor:pointer;
                "
                >
                  <!-- Time scrub line -->
                  <div
                    style="
                    position:absolute;top:0;bottom:0;width:2px;
                    background:#4f8;opacity:0.4;
                    left:${(time / DURATION) * 100}%;z-index:1;
                  "
                  ></div>
                  ${track.keyframes.map(
                    (kf, i) => html`
                      <div
                        class="kf-point"
                        data-kf-idx="${i}"
                        data-kf-prop="${prop}"
                        @mousedown=${(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          send("selectKeyframe", {
                            prop,
                            idx: i,
                            time: kf.time,
                            value: kf.value,
                            easing: kf.easing,
                          });

                          const bar = e.currentTarget.parentElement;
                          const onMove = (ev) => {
                            const rect = bar.getBoundingClientRect();
                            const pct = Math.max(
                              0,
                              Math.min(
                                1,
                                (ev.clientX - rect.left) / rect.width,
                              ),
                            );
                            send("moveKeyframe", prop, i, pct * DURATION);
                          };
                          const onUp = () => {
                            window.removeEventListener("mousemove", onMove);
                            window.removeEventListener("mouseup", onUp);
                            send("selectKeyframe", null);
                          };
                          window.addEventListener("mousemove", onMove);
                          window.addEventListener("mouseup", onUp);
                        }}
                        title="${prop}: ${typeof kf.value === "number"
                          ? kf.value.toFixed(2)
                          : kf.value} @ ${kf.time.toFixed(2)}s (${kf.easing})"
                        style="
                        position:absolute;width:10px;height:10px;
                        background:${propColors[prop]};
                        border:2px solid #0a0a0f;
                        border-radius:50%;top:50%;
                        transform:translate(-50%,-50%);
                        left:${(kf.time / DURATION) * 100}%;
                        cursor:pointer;z-index:2;transition:transform 0.1s;
                        box-shadow:${Math.abs(kf.time - time) < 0.05
                          ? "0 0 8px #4f8"
                          : "none"};
                      "
                        onmouseover="this.style.transform='translate(-50%,-50%) scale(1.4)'"
                        onmouseout="this.style.transform='translate(-50%,-50%)'"
                      ></div>
                    `,
                  )}
                </div>
              </div>
            `;
          })}
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

    ctx.registerResource("keyframe-editor", {
      save: () => ({ rafId }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  },
});

export { KeyframeEditor };
export default KeyframeEditor;

// Auto-mount
const el = document.querySelector(".stage") || document.body;
el.innerHTML = "";
KeyframeEditor.mount(el);
