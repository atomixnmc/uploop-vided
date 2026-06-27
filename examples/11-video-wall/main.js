/**
 * 11-video-wall — Multi-video grid with canvas placeholder.
 *
 * Demonstrates simultaneous multi-video playback in a configurable
 * grid layout with canvas-fallback for non-video cells.
 */
import { html, component } from "@uploop/html";

const videoDefs = [
  {
    id: "bbb",
    label: "Big Buck Bunny",
    src: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/720/Big_Buck_Bunny_720_10s_2MB.mp4",
    type: "video",
  },
  {
    id: "jellyfish",
    label: "Jellyfish",
    src: "https://test-videos.co.uk/vids/jellyfish/mp4/h264/720/Jellyfish_720_10s_2MB.mp4",
    type: "video",
  },
  {
    id: "sintel",
    label: "Sintel",
    src: "https://test-videos.co.uk/vids/sintel/mp4/h264/720/Sintel_720_10s_2MB.mp4",
    type: "video",
  },
  {
    id: "placeholder",
    label: "Canvas Placeholder",
    src: null,
    type: "canvas",
  },
];

function drawCanvasPlaceholder(canvas) {
  const W = 400;
  const H = 225;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  let t = performance.now() / 1000;
  ctx.fillStyle = "#151520";
  ctx.fillRect(0, 0, W, H);

  // Animated circles
  for (let i = 0; i < 5; i++) {
    const x = W / 2 + Math.cos(t + i * 1.2) * 80;
    const y = H / 2 + Math.sin(t + i * 1.2) * 60;
    const r = 15 + Math.sin(t * 2 + i) * 8;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(t * 40 + i * 60) % 360}, 70%, 50%)`;
    ctx.fill();
  }

  ctx.fillStyle = "#fff";
  ctx.globalAlpha = 0.3;
  ctx.font = "14px system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Uploop", W / 2, H - 40);
  ctx.globalAlpha = 1;

  requestAnimationFrame(() => drawCanvasPlaceholder(canvas));
}

const VideoWall = component("VideoWall", {
  state: {
    columns: 2,
    rows: 2,
    allPlaying: false,
    videos: videoDefs,
  },

  update: {
    toggleAll(s) {
      return { ...s, allPlaying: !s.allPlaying };
    },
    setGrid(s, cols, rows) {
      return {
        ...s,
        columns: Math.max(1, Math.min(4, cols)),
        rows: Math.max(1, Math.min(3, rows)),
      };
    },
  },

  view: (state, { send }) => html`
    <a href=".." class="back">← Examples</a>
    <h2 style="font-size:1rem;font-weight:500;margin-bottom:12px;color:#aaa;">
      Video Wall — ${state.columns}×${state.rows} Grid
    </h2>
    <div
      class="grid"
      data-ref="grid"
      style="
      display:grid;
      grid-template-columns:${"1fr ".repeat(state.columns).trim()};
      grid-template-rows:${"1fr ".repeat(state.rows).trim()};
      gap:4px;width:min(800px,90vw);aspect-ratio:16/9;
      border-radius:12px;overflow:hidden;background:#000;
    "
    >
      ${state.videos.map(
        (v) => html`
          <div
            class="cell"
            style="background:#151520;overflow:hidden;position:relative;"
          >
            ${v.type === "video"
              ? html`<video
                  data-ref="vid-${v.id}"
                  src="${v.src}"
                  muted
                  loop
                  playsinline
                  style="
                  width:100%;height:100%;object-fit:cover;display:block;
                "
                ></video>`
              : html`<canvas
                  data-ref="placeholder-canvas"
                  style="
                  width:100%;height:100%;object-fit:cover;display:block;
                "
                ></canvas>`}
            <span
              class="label"
              style="
              position:absolute;bottom:6px;left:8px;font-size:11px;
              color:rgba(255,255,255,0.6);background:rgba(0,0,0,0.5);
              padding:2px 8px;border-radius:3px;pointer-events:none;
            "
            >
              ${v.label}
            </span>
          </div>
        `,
      )}
    </div>

    <!-- Controls -->
    <div
      class="controls"
      style="display:flex;gap:8px;margin-top:16px;align-items:center;flex-wrap:wrap;justify-content:center;"
    >
      <button
        @click=${() => send("toggleAll")}
        class=${state.allPlaying ? "active" : ""}
        style="
        padding:10px 24px;
        background:${state.allPlaying ? "#2a3a2a" : "#1a1a2e"};
        color:${state.allPlaying ? "#4f8" : "#ccc"};
        border:1px solid ${state.allPlaying ? "#4f8" : "#333"};
        border-radius:6px;cursor:pointer;font-size:14px;
        font-family:inherit;transition:all 0.2s;
      "
      >
        ${state.allPlaying ? "⏸ Pause All" : "▶ Play All"}
      </button>

      <label
        style="font-size:13px;color:#888;display:flex;align-items:center;gap:6px;margin-left:12px;"
      >
        Cols
        <select
          @change=${(e) =>
            send("setGrid", parseInt(e.target.value), state.rows)}
          style="
          background:#1a1a2e;color:#e0e0e0;border:1px solid #3a3a50;
          padding:6px 10px;border-radius:6px;font-size:13px;
          font-family:inherit;
        "
        >
          <option value="1" ?selected=${state.columns === 1}>1</option>
          <option value="2" ?selected=${state.columns === 2}>2</option>
          <option value="3" ?selected=${state.columns === 3}>3</option>
          <option value="4" ?selected=${state.columns === 4}>4</option>
        </select>
      </label>
      <label
        style="font-size:13px;color:#888;display:flex;align-items:center;gap:6px;"
      >
        Rows
        <select
          @change=${(e) =>
            send("setGrid", state.columns, parseInt(e.target.value))}
          style="
          background:#1a1a2e;color:#e0e0e0;border:1px solid #3a3a50;
          padding:6px 10px;border-radius:6px;font-size:13px;
          font-family:inherit;
        "
        >
          <option value="1" ?selected=${state.rows === 1}>1</option>
          <option value="2" ?selected=${state.rows === 2}>2</option>
          <option value="3" ?selected=${state.rows === 3}>3</option>
        </select>
      </label>
    </div>

    <div class="info" style="margin-top:12px;font-size:13px;color:#666;">
      Simultaneous multi-video playback with canvas placeholder
    </div>
  `,

  mount(el, ctx) {
    // Start canvas animation
    const placeholderCanvas = el.querySelector(
      '[data-ref="placeholder-canvas"]',
    );
    if (placeholderCanvas) {
      drawCanvasPlaceholder(placeholderCanvas);
    }

    // Sync video playback
    let rafId;
    function loop() {
      const s = ctx.get();
      const videos = el.querySelectorAll("video");
      if (s.allPlaying) {
        videos.forEach((v) => {
          if (v.paused) v.play().catch(() => {});
        });
      } else {
        videos.forEach((v) => {
          if (!v.paused) v.pause();
        });
      }
      rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);

    // Keyboard
    const onKey = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        ctx.send("toggleAll");
      }
    };
    window.addEventListener("keydown", onKey);

    ctx.registerResource("video-wall", {
      save: () => ({ rafId, onKey }),
      restore: () => {},
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKey);
    };
  },
});

export { VideoWall };
export default VideoWall;

// Auto-mount
const grid = document.querySelector("#grid");
if (grid) grid.replaceWith(new VideoWall());
else document.body.appendChild(new VideoWall());
