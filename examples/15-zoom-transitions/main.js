/**
 * 15-zoom-transitions — Zoom transition showcase.
 *
 * Demonstrates zoomIn and zoomOut transitions using createTransition
 * from @uploop/compositor. One panel zooms out while the other zooms in.
 * Displays live zoom percentages.
 */

import { html, component } from "@uploop/html";
import { createTransition } from "@uploop/compositor";

const zoomTransitions = {
  zoomIn: createTransition("zoomIn", {
    duration: 0.8,
    easing: "easeInOutCubic",
  }),
  zoomOut: createTransition("zoomOut", {
    duration: 0.8,
    easing: "easeInOutCubic",
  }),
};

const ZoomTransitions = component("ZoomTransitions", {
  state: {
    progress: 0,
    playing: false,
    mode: "zoomIn",
    currentPanel: "a",
  },

  update: {
    play: (s, m) => {
      if (s.playing) return s;
      return { ...s, playing: true, progress: 0, mode: m };
    },
    reset: (s) => ({
      ...s,
      progress: 0,
      playing: false,
      currentPanel: "a",
      mode: "zoomIn",
    }),
    setMode: (s, m) => {
      if (s.playing) return s;
      return { ...s, mode: m };
    },
    tick: (s, dt) => {
      if (!s.playing) return s;
      const next = s.progress + dt / 0.8;
      if (next >= 1) {
        return {
          ...s,
          progress: 1,
          playing: false,
          currentPanel: s.currentPanel === "a" ? "b" : "a",
        };
      }
      return { ...s, progress: next };
    },
  },

  view: (s, { send }) => {
    const transition = zoomTransitions[s.mode];
    const tf = transition ? transition.render(s.progress) : null;

    const outScale = tf ? tf.outgoing.scale : 1;
    const inScale = tf ? tf.incoming.scale : 1;
    const outOp = tf ? tf.outgoing.opacity : 1;
    const inOp = tf ? tf.incoming.opacity : 1;

    const panelAStyle = [
      "background:linear-gradient(135deg,#1a5c3a,#2a8c5a)",
      s.currentPanel === "a"
        ? `opacity:${outOp};transform:scale(${outScale})`
        : `opacity:${inOp};transform:scale(${inScale})`,
      `z-index:${s.currentPanel === "a" ? "1" : "0"}`,
    ].join(";");

    const panelBStyle = [
      "background:linear-gradient(135deg,#5c3a1a,#8c5a2a)",
      s.currentPanel === "b"
        ? `opacity:${outOp};transform:scale(${outScale})`
        : `opacity:${inOp};transform:scale(${inScale})`,
      `z-index:${s.currentPanel === "b" ? "1" : "0"}`,
    ].join(";");

    const scaleA = s.currentPanel === "a" ? outScale : inScale;
    const scaleB = s.currentPanel === "b" ? outScale : inScale;

    return html`
      <a href=".." class="back">← Examples</a>
      <div class="stage">
        <div class="panel panel-a" style="${panelAStyle}">🌿 Panel A</div>
        <div class="panel panel-b" style="${panelBStyle}">🌅 Panel B</div>
      </div>
      <div class="controls">
        <button
          class="${s.mode === "zoomIn" && !s.playing ? "active" : ""}"
          @click=${() => {
            send("setMode", "zoomIn");
            send("play", "zoomIn");
          }}
        >
          🔍 Zoom In
        </button>
        <button
          class="${s.mode === "zoomOut" && !s.playing ? "active" : ""}"
          @click=${() => {
            send("setMode", "zoomOut");
            send("play", "zoomOut");
          }}
        >
          🔎 Zoom Out
        </button>
      </div>
      <div
        class="zoom-display"
        style="font-size:14px;color:#888;background:#151520;padding:8px 16px;border-radius:8px;min-width:180px;text-align:center"
      >
        A scale:
        <span style="color:#4f8;font-weight:700;font-size:18px"
          >${scaleA.toFixed(2)}</span
        >
        | B scale:
        <span style="color:#4f8;font-weight:700;font-size:18px"
          >${scaleB.toFixed(2)}</span
        >
      </div>
      <div class="info" style="font-size:13px;color:#666">
        Using <code>createTransition</code> from <code>@uploop/compositor</code>
      </div>
    `;
  },

  mount: (el, ctx) => {
    let rafId = null;
    let lastTime = 0;

    function loop(now) {
      if (lastTime === 0) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;
      ctx.send("tick", dt);
      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);

    function onKeydown(e) {
      if (e.key === "1") {
        ctx.send("setMode", "zoomIn");
        ctx.send("play", "zoomIn");
      }
      if (e.key === "2") {
        ctx.send("setMode", "zoomOut");
        ctx.send("play", "zoomOut");
      }
    }
    window.addEventListener("keydown", onKeydown);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("keydown", onKeydown);
    };
  },
});

export { ZoomTransitions };
export default ZoomTransitions;

// Auto-mount
const el = document.querySelector(".stage") || document.body;
el.innerHTML = "";
ZoomTransitions.mount(el);
