/**
 * 09-picture-in-picture — Draggable PiP overlay on main video.
 *
 * Demonstrates dynamic positioning, sizing, and opacity control
 * for a draggable picture-in-picture video overlay.
 */
import { html, component } from "@uploop/html";

const MAIN_SRC =
  "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4";
const PIP_SRC =
  "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4";

const sizeMap = {
  sm: { w: 120, h: 68 },
  md: { w: 200, h: 113 },
  lg: { w: 300, h: 169 },
};

const PictureInPicture = component("PictureInPicture", {
  state: {
    pipX: 520,
    pipY: 20,
    pipSize: "md",
    pipOpacity: 0.9,
    mainPlaying: false,
  },

  update: {
    movePiP(s, x, y) {
      const { w, h } = sizeMap[s.pipSize];
      return {
        ...s,
        pipX: Math.max(0, Math.min(800 - w, x)),
        pipY: Math.max(0, Math.min(450 - h, y)),
      };
    },
    setSize(s, size) {
      return { ...s, pipSize: size };
    },
    setOpacity(s, v) {
      return { ...s, pipOpacity: parseFloat(v) };
    },
    togglePlay(s) {
      return { ...s, mainPlaying: !s.mainPlaying };
    },
  },

  view: (state, { send }) => {
    const { w, h } = sizeMap[state.pipSize];

    return html`
      <a href=".." class="back">← Examples</a>
      <div
        class="stage"
        data-ref="stage"
        style="
        position:relative;width:min(800px,90vw);aspect-ratio:16/9;
        border-radius:12px;overflow:hidden;background:#000;
      "
      >
        <video
          data-ref="main-video"
          src="${MAIN_SRC}"
          muted
          loop
          playsinline
          style="display:block;width:100%;height:100%;object-fit:cover;"
        ></video>

        <!-- PiP overlay -->
        <div
          data-ref="pip"
          class="pip size-${state.pipSize}"
          @mousedown=${(e) => {
            e.preventDefault();
            const pipEl = e.currentTarget;
            const stageEl = pipEl.parentElement;
            const stageRect = stageEl.getBoundingClientRect();
            const scaleX = 800 / stageRect.width;
            const scaleY = 450 / stageRect.height;
            const startX = e.clientX;
            const startY = e.clientY;
            const startPipX = state.pipX;
            const startPipY = state.pipY;

            const onMove = (ev) => {
              const dx = (ev.clientX - startX) * scaleX;
              const dy = (ev.clientY - startY) * scaleY;
              send("movePiP", startPipX + dx, startPipY + dy);
            };
            const onUp = () => {
              window.removeEventListener("mousemove", onMove);
              window.removeEventListener("mouseup", onUp);
            };
            window.addEventListener("mousemove", onMove);
            window.addEventListener("mouseup", onUp);
          }}
          @touchstart=${(e) => {
            e.preventDefault();
            const pipEl = e.currentTarget;
            const stageEl = pipEl.parentElement;
            const stageRect = stageEl.getBoundingClientRect();
            const scaleX = 800 / stageRect.width;
            const scaleY = 450 / stageRect.height;
            const touch = e.touches[0];
            const startX = touch.clientX;
            const startY = touch.clientY;
            const startPipX = state.pipX;
            const startPipY = state.pipY;

            const onMove = (ev) => {
              const t = ev.touches[0];
              const dx = (t.clientX - startX) * scaleX;
              const dy = (t.clientY - startY) * scaleY;
              send("movePiP", startPipX + dx, startPipY + dy);
            };
            const onUp = () => {
              window.removeEventListener("touchmove", onMove);
              window.removeEventListener("touchend", onUp);
            };
            window.addEventListener("touchmove", onMove);
            window.addEventListener("touchend", onUp);
          }}
          style="
          position:absolute;border-radius:8px;overflow:hidden;
          border:2px solid rgba(255,255,255,0.3);
          cursor:grab;box-shadow:0 4px 20px rgba(0,0,0,0.5);
          left:${state.pipX}px;top:${state.pipY}px;
          width:${w}px;height:${h}px;
          opacity:${state.pipOpacity};
          transition:width 0.3s,height 0.3s;
        "
        >
          <video
            data-ref="pip-video"
            src="${PIP_SRC}"
            muted
            loop
            playsinline
            style="width:100%;height:100%;object-fit:cover;"
          ></video>
        </div>
      </div>

      <!-- Controls -->
      <div
        class="controls"
        style="
        display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;
        justify-content:center;align-items:center;
      "
      >
        <button
          @click=${() => send("togglePlay")}
          class=${state.mainPlaying ? "active" : ""}
          style="
          padding:8px 16px;
          background:${state.mainPlaying ? "#2a3a2a" : "#1a1a2e"};
          color:${state.mainPlaying ? "#4f8" : "#ccc"};
          border:1px solid ${state.mainPlaying ? "#4f8" : "#333"};
          border-radius:6px;cursor:pointer;font-size:13px;
          font-family:inherit;transition:all 0.2s;
        "
        >
          ${state.mainPlaying ? "⏸ Pause" : "▶ Play"}
        </button>
        ${Object.keys(sizeMap).map(
          (size) => html`
            <button
              @click=${() => send("setSize", size)}
              class=${state.pipSize === size ? "active" : ""}
              style="
              padding:8px 16px;
              background:${state.pipSize === size ? "#2a3a2a" : "#1a1a2e"};
              color:${state.pipSize === size ? "#4f8" : "#ccc"};
              border:1px solid ${state.pipSize === size ? "#4f8" : "#333"};
              border-radius:6px;cursor:pointer;font-size:13px;
              font-family:inherit;transition:all 0.2s;
            "
            >
              ${size === "sm" ? "Small" : size === "md" ? "Medium" : "Large"}
            </button>
          `,
        )}
        <label
          style="font-size:13px;color:#888;display:flex;align-items:center;gap:6px;"
        >
          Opacity
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value="${state.pipOpacity}"
            @input=${(e) => send("setOpacity", e.target.value)}
            style="accent-color:#4f8;width:100px;"
          />
        </label>
      </div>

      <div class="info" style="margin-top:12px;font-size:13px;color:#666;">
        Draggable PiP — drag the small video to reposition it
      </div>
    `;
  },

  mount(el, ctx) {
    const mainVideo = el.querySelector('[data-ref="main-video"]');
    const pipVideo = el.querySelector('[data-ref="pip-video"]');

    // Sync play state
    let rafId;
    function loop() {
      const s = ctx.get();
      if (s.mainPlaying) {
        if (mainVideo.paused) mainVideo.play().catch(() => {});
        if (pipVideo.paused) pipVideo.play().catch(() => {});
      } else {
        if (!mainVideo.paused) mainVideo.pause();
        if (!pipVideo.paused) pipVideo.pause();
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Keyboard
    const onKey = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        ctx.send("togglePlay");
      }
    };
    window.addEventListener("keydown", onKey);

    ctx.registerResource("pip", {
      save: () => ({ rafId, onKey }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
    };
  },
});

export { PictureInPicture };
export default PictureInPicture;

// Auto-mount
const el = document.querySelector(".stage") || document.body;
el.innerHTML = "";
PictureInPicture.mount(el);
