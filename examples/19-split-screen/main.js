/**
 * 19-split-screen — Split-screen compositing.
 *
 * Two videos side by side (BBB left, Jellyfish right). Adjustable split
 * position via draggable divider. Toggle between horizontal and vertical split.
 */

import { html, component } from "@uploop/html";

const SplitScreen = component("SplitScreen", {
  state: {
    split: 50,
    orientation: "horizontal",
    playing: false,
    leftSrc:
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
    rightSrc:
      "https://test-videos.co.uk/vids/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4",
  },

  update: {
    setSplit: (s, v) => ({ ...s, split: Math.max(10, Math.min(90, v)) }),
    toggleOrientation: (s) => ({
      ...s,
      orientation: s.orientation === "horizontal" ? "vertical" : "horizontal",
    }),
    togglePlay: (s) => ({ ...s, playing: !s.playing }),
    resetSplit: (s) => ({ ...s, split: 50 }),
  },

  view: (s, { send }) => {
    const isH = s.orientation === "horizontal";
    const aPct = s.split;
    const bPct = 100 - s.split;

    const stageStyle = isH
      ? "display:flex;flex-direction:row"
      : "display:flex;flex-direction:column";

    const leftStyle = isH
      ? `flex:0 0 ${aPct}%;overflow:hidden;position:relative;height:100%`
      : `flex:0 0 ${aPct}%;overflow:hidden;position:relative;width:100%`;

    const rightStyle = isH
      ? `flex:0 0 ${bPct}%;overflow:hidden;position:relative;height:100%`
      : `flex:0 0 ${bPct}%;overflow:hidden;position:relative;width:100%`;

    const dividerStyle = isH
      ? "width:4px;background:#4f8;cursor:col-resize;flex-shrink:0;position:relative;z-index:2;height:100%"
      : "height:4px;background:#4f8;cursor:row-resize;flex-shrink:0;position:relative;z-index:2;width:100%";

    return html`
      <a href=".." class="back">← Examples</a>
      <div
        class="stage"
        id="stage"
        style="${stageStyle};width:min(720px,90vw);height:min(420px,55vh);background:#151520;border-radius:12px;overflow:hidden"
      >
        <div class="split-half left" id="split-left" style="${leftStyle}">
          <video
            src="${s.leftSrc}"
            muted
            loop
            playsinline
            style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;object-position:left center"
          ></video>
        </div>
        <div class="divider" id="divider" style="${dividerStyle}">
          <div
            class="divider-handle"
            style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;background:#4f8;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#0a0a0f;pointer-events:none"
          >
            ⟷
          </div>
        </div>
        <div class="split-half right" id="split-right" style="${rightStyle}">
          <video
            src="${s.rightSrc}"
            muted
            loop
            playsinline
            style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;object-position:right center"
          ></video>
        </div>
      </div>
      <div class="controls" style="display:flex;gap:8px;align-items:center">
        <button
          id="btn-play"
          style="background:#151520;color:#e0e0e0;border:1px solid #333;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px${s.playing
            ? ";background:#2a3a2a;border-color:#4f8;color:#4f8"
            : ""}"
          @click=${() => send("togglePlay")}
        >
          ${s.playing ? "⏸ Pause" : "▶ Play"}
        </button>
        <button
          id="btn-orient"
          style="background:#151520;color:#e0e0e0;border:1px solid #333;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px${isH
            ? ";background:#2a3a2a;border-color:#4f8;color:#4f8"
            : ""}"
          @click=${() => send("toggleOrientation")}
        >
          ${isH ? "⬌ Horizontal" : "⬍ Vertical"}
        </button>
        <button
          id="btn-reset"
          style="background:#151520;color:#e0e0e0;border:1px solid #333;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:13px"
          @click=${() => send("resetSplit")}
        >
          ↺ Reset 50/50
        </button>
      </div>
      <div class="split-pct" style="font-size:14px;color:#888">
        Split:
        <span style="color:#4f8;font-weight:600">${Math.round(aPct)}%</span> /
        <span style="color:#4f8;font-weight:600">${Math.round(bPct)}%</span>
      </div>
      <div class="info" style="font-size:13px;color:#666">
        Split-screen compositing — draggable divider, toggle orientation
      </div>
    `;
  },

  mount: (el, ctx) => {
    let dragging = false;
    let pointerId = null;

    const stage = el.querySelector("#stage");
    const dividerEl = el.querySelector("#divider");
    const videoLeft = el.querySelector("#split-left video");
    const videoRight = el.querySelector("#split-right video");

    function getStageSize() {
      const rect = stage.getBoundingClientRect();
      return ctx.state.orientation === "horizontal" ? rect.width : rect.height;
    }

    function onPointerDown(e) {
      dragging = true;
      pointerId = e.pointerId;
      dividerEl.setPointerCapture(e.pointerId);
      e.preventDefault();
    }

    function onPointerMove(e) {
      if (!dragging || e.pointerId !== pointerId) return;
      const rect = stage.getBoundingClientRect();
      const isH = ctx.state.orientation === "horizontal";
      const total = isH ? rect.width : rect.height;
      const pos = isH ? e.clientX - rect.left : e.clientY - rect.top;
      const pct = Math.max(10, Math.min(90, (pos / total) * 100));
      ctx.send("setSplit", pct);
    }

    function onPointerUp(e) {
      if (e.pointerId !== pointerId) return;
      dragging = false;
      dividerEl.releasePointerCapture(e.pointerId);
      pointerId = null;
    }

    dividerEl.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // Playback handling
    function playVideos() {
      videoLeft.play().catch(() => {});
      videoRight.play().catch(() => {});
    }

    function pauseVideos() {
      videoLeft.pause();
      videoRight.pause();
    }

    // Sync playback with state
    let prevPlaying = ctx.state.playing;
    const playInterval = setInterval(() => {
      if (ctx.state.playing !== prevPlaying) {
        prevPlaying = ctx.state.playing;
        if (ctx.state.playing) playVideos();
        else pauseVideos();
      }
    }, 100);

    // Keyboard
    function onKeydown(e) {
      switch (e.key) {
        case " ":
          e.preventDefault();
          ctx.send("togglePlay");
          break;
        case "ArrowLeft":
          if (ctx.state.orientation === "horizontal")
            ctx.send("setSplit", ctx.state.split - 2);
          break;
        case "ArrowRight":
          if (ctx.state.orientation === "horizontal")
            ctx.send("setSplit", ctx.state.split + 2);
          break;
        case "ArrowUp":
          if (ctx.state.orientation === "vertical")
            ctx.send("setSplit", ctx.state.split - 2);
          break;
        case "ArrowDown":
          if (ctx.state.orientation === "vertical")
            ctx.send("setSplit", ctx.state.split + 2);
          break;
        case "t":
          ctx.send("toggleOrientation");
          break;
      }
    }
    window.addEventListener("keydown", onKeydown);

    return () => {
      dividerEl.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeydown);
      clearInterval(playInterval);
      pauseVideos();
    };
  },
});

export { SplitScreen };
export default SplitScreen;

// Auto-mount
const el = document.querySelector(".stage") || document.body;
el.innerHTML = "";
SplitScreen.mount(el);
